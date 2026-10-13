<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $seller = $request->user();
        $products = $seller->products();

        return response()->json([
            'total_products' => (clone $products)->count(),
            'active_listings' => (clone $products)->where('status', 'active')->count(),
            'sold_products' => (clone $products)->where('status', 'sold')->count(),
            'views' => (int) (clone $products)->sum('views'),
            'favorites' => $seller->products()->withCount('favorites')->get()->sum('favorites_count'),
            'orders' => $seller->soldOrderItems()->distinct('order_id')->count('order_id'),
            'revenue' => (float) $seller->soldOrderItems()->whereHas('order', fn ($query) => $query->whereIn('status', ['DELIVERED', 'COMPLETED']))->sum('price'),
        ]);
    }

    public function products(Request $request)
    {
        $products = $request->user()->products()
            ->with(['category', 'seller', 'images'])
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return ProductResource::collection($products);
    }
}
