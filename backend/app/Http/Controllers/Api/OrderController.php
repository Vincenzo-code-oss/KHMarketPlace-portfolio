<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreateOrderRequest;
use App\Http\Requests\Api\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $orders = Order::query()
            ->when($user->role !== 'ADMIN', function ($query) use ($user): void {
                $query->where(fn ($scope) => $scope->where('buyer_id', $user->id)
                    ->orWhereHas('items', fn ($items) => $items->where('seller_id', $user->id)));
            })
            ->with(['buyer:id,name,email', 'items.product.category', 'items.product.images', 'items.seller:id,name,username'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return response()->json($orders);
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $order = DB::transaction(function () use ($request): Order {
            $products = Product::query()
                ->whereIn('id', collect($request->validated('items'))->pluck('product_id'))
                ->where('status', 'active')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            abort_if($products->count() !== count($request->validated('items')), 422, 'One or more products are no longer available.');
            foreach ($request->validated('items') as $line) {
                abort_if($products[$line['product_id']]->seller_id === $request->user()->id, 422, 'You cannot order your own product.');
            }

            $subtotal = 0.0;
            foreach ($request->validated('items') as $line) {
                $subtotal += (float) $products[$line['product_id']]->price * $line['quantity'];
            }
            $subtotal = round($subtotal, 2);

            $order = Order::create([
                'buyer_id' => $request->user()->id,
                'status' => 'PENDING',
                'subtotal' => $subtotal,
                'delivery_fee' => 0,
                'total' => $subtotal,
                'name' => $request->validated('name'),
                'phone' => $request->validated('phone'),
                'province' => $request->validated('province'),
                'district' => $request->validated('district'),
                'address' => $request->validated('address'),
                'payment_method' => $request->validated('payment_method'),
                'payment_status' => 'PENDING',
            ]);

            foreach ($request->validated('items') as $line) {
                $product = $products[$line['product_id']];
                $order->items()->create([
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'quantity' => $line['quantity'],
                    'price' => $product->price,
                ]);
            }

            $order->payments()->create([
                'provider' => $request->validated('payment_method'),
                'amount' => $subtotal,
                'status' => 'PENDING',
            ]);

            $request->user()->cart?->items()->delete();

            return $order;
        });

        return response()->json(['order' => $order->load('items.product.images')], 201);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $user = $request->user();
        $nextStatus = $request->validated('status');
        $sellerOwnsItem = $order->items()->where('seller_id', $user->id)->exists();
        $sellerOwnsEveryItem = $sellerOwnsItem && ! $order->items()->where('seller_id', '!=', $user->id)->exists();
        $buyerCanCancel = $order->buyer_id === $user->id && $order->status === 'PENDING' && $nextStatus === 'CANCELLED';
        $buyerCanComplete = $order->buyer_id === $user->id && $order->status === 'DELIVERED' && $nextStatus === 'COMPLETED';

        abort_unless($user->role === 'ADMIN' || $sellerOwnsEveryItem || $buyerCanCancel || $buyerCanComplete, 403);

        $allowed = match ($order->status) {
            'PENDING' => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['PREPARING', 'CANCELLED'],
            'PREPARING' => ['SHIPPED', 'CANCELLED'],
            'SHIPPED' => ['DELIVERED'],
            'DELIVERED' => [],
            default => [],
        };
        abort_unless(
            $user->role === 'ADMIN'
                || $buyerCanCancel
                || ($buyerCanComplete)
                || ($sellerOwnsEveryItem && in_array($nextStatus, $allowed, true)),
            422,
            'That order status transition is not allowed.',
        );

        $order->update(['status' => $nextStatus]);

        return response()->json(['order' => $order->load('items.product.images', 'items.seller')]);
    }
}
