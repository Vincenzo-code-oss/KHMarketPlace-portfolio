<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Phones & Tablets', 'phones-tablets', '📱'],
            ['Computers & Laptops', 'computers-laptops', '💻'],
            ['Fashion', 'fashion', '👕'],
            ['Cars', 'cars', '🚗'],
            ['Motorcycles', 'motorcycles', '🏍️'],
            ['Gaming', 'gaming', '🎮'],
            ['Home & Living', 'home-living', '🏠'],
            ['Cameras', 'cameras', '📷'],
            ['Shoes', 'shoes', '👟'],
            ['Beauty', 'beauty', '💄'],
            ['Books', 'books', '📚'],
            ['Other', 'other', '📦'],
            ['Electronics', 'electronics', '🎧'],
            ['Tools', 'tools', '🔧'],
            ['Pets', 'pets', '🐶'],
        ];

        foreach ($categories as [$name, $slug, $icon]) {
            Category::updateOrCreate(['slug' => $slug], ['name' => $name, 'icon' => $icon]);
        }
    }
}
