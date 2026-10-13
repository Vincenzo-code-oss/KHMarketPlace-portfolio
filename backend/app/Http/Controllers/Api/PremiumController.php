<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PremiumCheckoutRequest;
use Illuminate\Http\JsonResponse;

class PremiumController extends Controller
{
    public function checkout(PremiumCheckoutRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_if($user->hasActivePremium(), 409, 'Your Premium membership is already active.');

        $startedAt = now();
        $endsAt = $startedAt->copy()->addMonthNoOverflow();
        $user->forceFill([
            'membership' => 'PREMIUM',
            'premium_status' => 'ACTIVE',
            'premium_start_date' => $startedAt,
            'premium_end_date' => $endsAt,
        ])->save();

        return response()->json([
            'success' => true,
            'simulated' => true,
            'payment_method' => $request->validated('payment_method'),
            'user' => $user->fresh(),
            'message' => 'Demo membership activated. No real payment was processed.',
        ]);
    }
}
