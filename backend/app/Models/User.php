<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use  HasFactory, Notifiable,HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'active',
        'role_id',
        'avatar',
        'account_type',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function socialAccounts()
    {
        return $this->hasMany(SocialAccounts::class);
    }

    public function facebookAccount()
    {
        return $this->hasOne(SocialAccounts::class)->where('provider', 'facebook');
    }

    public function googleAccount()
    {
        return $this->hasOne(SocialAccounts::class)->where('provider', 'google');
    }

    // Helper Methods
    public function hasProvider($provider)
    {
        return $this->socialAccounts()->where('provider', $provider)->exists();
    }

    public function getProviderAccount($provider)
    {
        return $this->socialAccounts()->where('provider', $provider)->first();
    }

    public function addProvider($provider, $providerUser, $token = null)
    {
        // Validate provider user data
        if (!$providerUser || !$providerUser->getId()) {
            throw new \Exception('Invalid provider user data');
        }

        return $this->socialAccounts()->create([
            'provider' => $provider,
            'provider_id' => $providerUser->getId(),
            'provider_token' => $token,
            'provider_data' => [
                'name' => $providerUser->getName() ?? null,
                'email' => $providerUser->getEmail() ?? null,
                'avatar' => $providerUser->getAvatar() ?? null,
                'raw' => $providerUser->getRaw() ?? [],
            ],
        ]);
    }


    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'account_id');
    }

    public function cards(): HasMany
    {
        return $this->hasMany(Card::class, 'customer_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

}
