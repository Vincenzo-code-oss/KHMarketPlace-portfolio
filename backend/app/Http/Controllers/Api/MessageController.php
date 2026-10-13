<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SendMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = Message::query()
            ->whereHas('conversation', fn ($query) => $query->where('buyer_id', $request->user()->id)->orWhere('seller_id', $request->user()->id))
            ->with(['sender:id,name,username,avatar', 'conversation.product:id,title,slug'])
            ->latest()
            ->paginate(50);

        return response()->json($messages);
    }

    public function store(SendMessageRequest $request): JsonResponse
    {
        $sender = $request->user();
        $receiverId = (int) $request->validated('receiver_id');
        abort_if($sender->id === $receiverId, 422, 'You cannot message yourself.');
        $product = $request->filled('product_id') ? Product::findOrFail($request->validated('product_id')) : null;

        if ($product) {
            abort_unless($receiverId === $product->seller_id || $sender->id === $product->seller_id, 422, 'Messages about this product must involve its seller.');
            $sellerId = $product->seller_id;
            $buyerId = $sender->id === $sellerId ? $receiverId : $sender->id;
        } else {
            $buyerId = $sender->id;
            $sellerId = $receiverId;
        }

        $conversation = Conversation::query()->firstOrCreate([
            'buyer_id' => $buyerId,
            'seller_id' => $sellerId,
            'product_id' => $product?->id,
        ]);
        $message = $conversation->messages()->create([
            'sender_id' => $sender->id,
            'content' => $request->validated('content'),
        ]);
        $conversation->touch();
        $receiverId = $sender->id === $sellerId ? $buyerId : $sellerId;
        $receiver = User::findOrFail($receiverId);
        $receiver->notifications()->create([
            'type' => 'message',
            'text' => 'You received a new message.',
            'data' => ['conversation_id' => $conversation->id, 'message_id' => $message->id],
        ]);

        return response()->json(['message' => $message->load('sender:id,name,username,avatar'), 'conversation_id' => $conversation->id], 201);
    }
}
