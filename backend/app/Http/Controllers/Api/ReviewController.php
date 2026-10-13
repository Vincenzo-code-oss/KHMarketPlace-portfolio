<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReviewRequest;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function store(ReviewRequest $request): JsonResponse
    {
        $productId = $request->validated('product_id');
        $completedPurchase = $request->user()->orders()
            ->where('status', 'COMPLETED')
            ->whereHas('items', fn ($query) => $query->where('product_id', $productId))
            ->exists();
        abort_unless($completedPurchase, 403, 'A completed purchase is required to review this product.');

        $review = Review::updateOrCreate(
            ['product_id' => $productId, 'user_id' => $request->user()->id],
            ['rating' => $request->validated('rating'), 'comment' => $request->validated('comment')],
        );

        return response()->json(['review' => $review->load('user:id,name,username')], 201);
    }
}
