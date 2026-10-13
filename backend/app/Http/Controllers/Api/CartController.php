<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CartItemRequest;
use App\Http\Requests\Api\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $cart->load('items.product.category', 'items.product.seller', 'items.product.images');
        $items = $cart->items->map(fn (CartItem $item) => [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'product' => $item->product,
            'subtotal' => round((float) $item->product->price * $item->quantity, 2),
        ]);
        $subtotal = round($items->sum('subtotal'), 2);

        return response()->json(['items' => $items, 'subtotal' => $subtotal, 'delivery' => 0, 'total' => $subtotal]);
    }

    public function store(CartItemRequest $request): JsonResponse
    {
        $product = Product::query()->whereKey($request->validated('product_id'))->where('status', 'active')->firstOrFail();
        abort_if($product->seller_id === $request->user()->id, 422, 'You cannot add your own listing to your cart.');
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $item = $cart->items()->firstOrNew(['product_id' => $product->id]);
        $item->quantity = min(99, $item->exists ? $item->quantity + $request->integer('quantity', 1) : $request->integer('quantity', 1));
        $item->save();

        return response()->json(['item' => $item->load('product.category', 'product.images')], 201);
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): JsonResponse
    {
        abort_unless($item->cart()->where('user_id', $request->user()->id)->exists(), 404);
        $item->update(['quantity' => $request->validated('quantity', 1)]);

        return response()->json(['item' => $item->load('product')]);
    }

    public function destroy(Request $request, CartItem $item): JsonResponse
    {
        abort_unless($item->cart()->where('user_id', $request->user()->id)->exists(), 404);
        $item->delete();

        return response()->json(['deleted' => true]);
    }
}
