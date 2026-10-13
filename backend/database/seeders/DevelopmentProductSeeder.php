<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class DevelopmentProductSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('email', 'seller@khmarket.com')->firstOrFail();
        $products = [
            [
                'title' => 'iPhone 15 Pro Max 256GB',
                'slug' => 'iphone-15-pro-max-256gb',
                'category' => 'phones-tablets',
                'description' => 'Brand new iPhone 15 Pro Max with original box, warranty, and accessories.',
                'price' => 1199,
                'condition' => 'New',
                'province' => 'Phnom Penh',
                'district' => 'Daun Penh',
                'image' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
                'featured' => true,
            ],
            [
                'title' => 'Samsung Galaxy S25',
                'slug' => 'samsung-galaxy-s25',
                'category' => 'phones-tablets',
                'description' => 'Samsung flagship smartphone with AMOLED display and an excellent camera.',
                'price' => 999,
                'condition' => 'Like New',
                'province' => 'Siem Reap',
                'district' => 'Siem Reap City',
                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
                'featured' => true,
            ],
            [
                'title' => 'MacBook Air M2 13-inch',
                'slug' => 'macbook-air-m2-13-inch',
                'category' => 'computers-laptops',
                'description' => 'Lightweight MacBook Air with M2 chip, 16GB memory, and 512GB storage.',
                'price' => 850,
                'condition' => 'Good',
                'province' => 'Phnom Penh',
                'district' => 'Chamkar Mon',
                'image' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
                'featured' => false,
            ],
        ];

        foreach ($products as $item) {
            $product = Product::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'seller_id' => $seller->id,
                    'category_id' => Category::where('slug', $item['category'])->value('id'),
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'price' => $item['price'],
                    'currency' => 'USD',
                    'condition' => $item['condition'],
                    'province' => $item['province'],
                    'district' => $item['district'],
                    'status' => 'active',
                    'is_featured' => $item['featured'],
                ],
            );
            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'url' => $item['image']],
                ['path' => 'seed/'.$item['slug'].'.jpg', 'sort_order' => 0],
            );
        }
    }
}
