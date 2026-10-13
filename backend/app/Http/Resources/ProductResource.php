<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sellerId' => $this->seller_id,
            'sellerName' => $this->seller?->name,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'condition' => $this->condition,
            'province' => $this->province,
            'district' => $this->district,
            'phone' => $this->phone,
            'status' => $this->status,
            'isActive' => $this->status === 'active',
            'isFeatured' => $this->is_featured,
            'views' => $this->views,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'icon' => $this->category->icon,
            ]),
            'seller' => $this->whenLoaded('seller', fn () => [
                'id' => $this->seller->id,
                'name' => $this->seller->name,
                'username' => $this->seller->username,
                'avatar' => $this->seller->avatar,
                'isVerified' => $this->seller->is_verified,
                'membership' => $this->seller->membership,
                'premiumStatus' => $this->seller->premium_status,
                'premiumEndDate' => $this->seller->premium_end_date,
            ]),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($image) => [
                'id' => $image->id,
                'url' => $image->url,
                'path' => $image->path,
            ])),
        ];
    }
}
