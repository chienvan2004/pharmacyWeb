<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SocialAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class FacebookController extends Controller
{
    protected $socialAuthService;

    public function __construct(SocialAuthService $socialAuthService)
    {
        $this->socialAuthService = $socialAuthService;
    }

    public function redirectToFacebook()
    {
        $url = Socialite::driver('facebook')
            ->stateless()
            ->scopes(['public_profile', 'email'])
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    public function handleFacebookCallback()
    {
        try {
            // Add debugging to see what we're getting
            Log::info('Facebook callback initiated');

            $facebookUser = Socialite::driver('facebook')->user();

            // Debug the Facebook user data
            Log::info('Facebook user data:', [
                'id' => $facebookUser->getId(),
                'name' => $facebookUser->getName(),
                'email' => $facebookUser->getEmail(),
                'avatar' => $facebookUser->getAvatar(),
            ]);

            // Validate required data
            if (!$facebookUser->getId()) {
                throw new \Exception('Facebook user ID not found');
            }

            $user = $this->socialAuthService->findOrCreateUser($facebookUser, 'facebook');
            $token = $user->createToken('Facebook Login')->accessToken;

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
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            Log::error('Facebook OAuth state mismatch:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'OAuth state mismatch. Please try again.',
                'error' => $e->getMessage()
            ], 400);
        } catch (\Exception $e) {
            Log::error('Facebook authentication error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Facebook authentication failed',
                'error' => $e->getMessage(),
                'data' => dd($user->id)
            ], 400);
        }
    }
}
