<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            ...$request->validated(),
            'email' => strtolower($request->validated('email')),
            'username' => strtolower($request->validated('username')),
            'password' => Hash::make($request->validated('password')),
            'role' => 'USER',
            'membership' => 'FREE',
            'premium_status' => 'NONE',
        ]);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $identifier = strtolower($request->validated('email'));
        $user = User::query()
            ->where('email', $identifier)
            ->orWhere('username', $identifier)
            ->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return response()->json(['error' => 'Invalid email or password.'], 401);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->membership === 'PREMIUM'
            && $user->premium_status === 'ACTIVE'
            && $user->premium_end_date?->isPast()) {
            $user->forceFill(['premium_status' => 'EXPIRED'])->save();
            $user->refresh();
        }

        return response()->json(['user' => $user]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email:rfc', 'max:254']]);
        $status = Password::sendResetLink(['email' => strtolower($validated['email'])]);

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json(['error' => __($status)], 422);
        }

        return response()->json(['message' => __($status)]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email:rfc'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['error' => __($status)], 422);
        }

        return response()->json(['message' => __($status)]);
    }
}
