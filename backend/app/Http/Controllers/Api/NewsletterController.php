<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email:rfc', 'max:254']]);
        $subscription = NewsletterSubscription::updateOrCreate(
            ['email' => strtolower($data['email'])],
            ['is_active' => true],
        );

        return response()->json(['message' => 'You are subscribed to KHMarket updates.', 'subscription_id' => $subscription->id], 201);
    }
}
