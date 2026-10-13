<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user()->notifications()->latest()->paginate(30));
    }

    public function markRead(Request $request, int $notification): JsonResponse
    {
        $item = $request->user()->notifications()->findOrFail($notification);
        $item->update(['read_at' => now()]);

        return response()->json(['notification' => $item]);
    }
}
