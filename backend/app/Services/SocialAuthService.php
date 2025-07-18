<?php

namespace App\Services;

use App\Models\SocialAccounts;
use App\Models\User;
use Illuminate\Support\Str;

class SocialAuthService
{
    public function findOrCreateUser($providerUser, $provider)
    {
        // Validate provider user data
        if (!$providerUser || !$providerUser->getId()) {
            throw new \Exception('Invalid provider user data');
        }

        // 1. Check if social account exists
        $socialAccount = SocialAccounts::where('provider', $provider)
            ->where('provider_id', $providerUser->getId())
            ->first();

        if ($socialAccount) {
            // Update existing social account 
            $socialAccount->update([
                'provider_token' => $providerUser->token ?? null,
                'provider_data' => [
                    'name' => $providerUser->getName() ?? null,
                    'avatar' => $providerUser->getAvatar() ?? null,
                    'raw' => $providerUser->getRaw() ?? [],
                ],
            ]);
            return $socialAccount->user;
        }

        // 2. Check if user exists by email 
        $email = $providerUser->getEmail();
        if ($email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                // Add new provider to existing user 
                $user->addProvider($provider, $providerUser, $providerUser->token ?? null);
                // Update account type if it was email-only 
                if ($user->account_type === 'email') {
                    $user->update(['account_type' => 'hybrid']);
                }
                return $user;
            }
        }

        // 3. Create new user with social account 
        $user = User::create([
            'name' => $providerUser->getName() ?? 'Unknown User',
            'email' => $email ?? null,
            'avatar' => $providerUser->getAvatar() ?? null,
            'account_type' => 'social',
            'email_verified_at' => now(),
            'password' => bcrypt(Str::random(16)), 
        ]);

        // Add social accounts 
        $user->addProvider($provider, $providerUser, $providerUser->token ?? null);
        return $user;
    }

    public function linkProvider($user, $providerUser, $provider)
    {
        // Validate provider user data
        if (!$providerUser || !$providerUser->getId()) {
            throw new \Exception('Invalid provider user data');
        }

        // Check if provider is already linked to another user 
        $existingAccount = SocialAccounts::where('provider', $provider)
            ->where('provider_id', $providerUser->getId())
            ->where('user_id', '!=', $user->id)
            ->first();

        if ($existingAccount) {
            throw new \Exception("This {$provider} account is already linked to another user.");
        }

        // Link provider to current user 
        $user->addProvider($provider, $providerUser, $providerUser->token ?? null);

        // Update account type 
        if ($user->account_type === 'email') {
            $user->update(['account_type' => 'hybrid']);
        }

        return $user;
    }

    public function unlinkProvider($user, $provider)
    {
        $socialAccount = $user->socialAccounts()->where('provider', $provider)->first();
        if (!$socialAccount) {
            throw new \Exception("No {$provider} account found.");
        }

        // Ensure user has password or another provider 
        if (!$user->password && $user->socialAccounts()->count() <= 1) {
            throw new \Exception("Cannot unlink last authentication method. Please set a password first.");
        }

        $socialAccount->delete();

        // Update account type 
        if ($user->socialAccounts()->count() === 0) {
            $user->update(['account_type' => 'email']);
        }

        return $user;
    }
}
