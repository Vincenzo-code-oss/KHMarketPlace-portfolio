<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'buyer_id', 'status', 'subtotal', 'delivery_fee', 'total', 'name', 'phone',
        'province', 'district', 'address', 'payment_method', 'payment_status',
    ];

    protected function casts(): array
    {
        return ['subtotal' => 'decimal:2', 'delivery_fee' => 'decimal:2', 'total' => 'decimal:2'];
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
