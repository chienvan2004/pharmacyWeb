<?php

namespace App\Http\Controllers;

use App\Services\SocialAuthService;
use Laravel\Socialite\Facades\Socialite;

use Illuminate\Http\Request;

class GoogleController extends Controller
{
    protected $socialAuthService;

    public function __construct(SocialAuthService $socialAuthService)
    {
        $this->socialAuthService = $socialAuthService;
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['email', 'profile'])
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $user = $this->socialAuthService->findOrCreateUser($googleUser, 'google');

            $token = $user->createToken('Google Login')->accessToken;

            return response()->json([
                'success' => true,
                'user' => $user->load('socialAccounts'),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function loginWithGoogleToken(Request $request)
    {
        $request->validate([
            'access_token' => 'required|string',
        ]);

        try {
            $googleUser = Socialite::driver('google')
                ->userFromToken($request->access_token);

            $user = $this->socialAuthService->findOrCreateUser($googleUser, 'google');
            $token = $user->createToken('Mobile Google Login')->accessToken;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'account_type' => $user->account_type,
                    'providers' => $user->socialAccounts->pluck('provider'),
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Google access token',
                'error' => $e->getMessage()
            ], 401);
        }
    }
}
