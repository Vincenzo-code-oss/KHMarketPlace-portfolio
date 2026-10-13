<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProfileUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except('avatar');
        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_starts_with($user->avatar, 'profiles/')) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->storePublicly('profiles/'.$user->id, 'public');
        }

        $user->update($data);

        return response()->json(['user' => $user->fresh()]);
    }
}
