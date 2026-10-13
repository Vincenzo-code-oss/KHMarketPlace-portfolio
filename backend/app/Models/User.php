<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password', 'phone', 'province', 'district',
        'bio', 'avatar', 'role', 'membership', 'premium_status', 'status', 'notes',
        'premium_start_date', 'premium_end_date', 'is_verified',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'premium_start_date' => 'datetime',
            'premium_end_date' => 'datetime',
            'is_verified' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function conversationsAsBuyer(): HasMany
    {
        return $this->hasMany(Conversation::class, 'buyer_id');
    }

    public function conversationsAsSeller(): HasMany
    {
        return $this->hasMany(Conversation::class, 'seller_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function soldOrderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'seller_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function hasActivePremium(): bool
    {
        return $this->membership === 'PREMIUM'
            && $this->premium_status === 'ACTIVE'
            && ($this->premium_end_date === null || $this->premium_end_date->isFuture());
    }
}
