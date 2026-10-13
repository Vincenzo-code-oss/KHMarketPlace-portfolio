<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreFavoriteRequest;
use App\Http\Resources\ProductResource;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()->favorites()->with('product.category', 'product.seller', 'product.images')->latest()->paginate(30);

        return response()->json([
            'data' => $favorites->getCollection()->map(fn (Favorite $favorite) => [
                'id' => $favorite->id,
                'product' => (new ProductResource($favorite->product))->resolve(),
            ]),
            'links' => $favorites->linkCollection(),
            'meta' => ['current_page' => $favorites->currentPage(), 'last_page' => $favorites->lastPage(), 'total' => $favorites->total()],
        ]);
    }

    public function store(StoreFavoriteRequest $request): JsonResponse
    {
        $productId = $request->validated('product_id');
        $favorite = Favorite::query()->where('user_id', $request->user()->id)->where('product_id', $productId)->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json(['favorited' => false]);
        }

        $favorite = Favorite::create(['user_id' => $request->user()->id, 'product_id' => $productId]);

        return response()->json(['favorited' => true, 'favorite' => $favorite], 201);
    }

    public function destroy(Request $request, Favorite $favorite): JsonResponse
    {
        abort_unless($favorite->user_id === $request->user()->id, 403);
        $favorite->delete();

        return response()->json(['deleted' => true]);
    }
}
