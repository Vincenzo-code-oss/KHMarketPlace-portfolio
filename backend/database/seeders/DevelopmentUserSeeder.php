<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DevelopmentUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');
        $premiumStart = now();

        $users = [
            [
                'name' => 'Phan Sokha',
                'username' => 'sokha88',
                'email' => 'seller@khmarket.com',
                'phone' => '012345678',
                'province' => 'Phnom Penh',
                'district' => 'Daun Penh',
                'bio' => 'Trusted local seller in Phnom Penh',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
                'role' => 'SELLER',
                'membership' => 'PREMIUM',
                'premium_status' => 'ACTIVE',
                'premium_start_date' => $premiumStart,
                'premium_end_date' => $premiumStart->copy()->addMonthNoOverflow(),
                'is_verified' => true,
            ],
            [
                'name' => 'Demo Buyer',
                'username' => 'demo_buyer',
                'email' => 'demo@khmarket.com',
                'province' => 'Siem Reap',
                'district' => 'Siem Reap City',
                'role' => 'USER',
                'membership' => 'FREE',
                'premium_status' => 'NONE',
            ],
            [
                'name' => 'Admin User',
                'username' => 'admin01',
                'email' => 'admin@khmarket.com',
                'role' => 'ADMIN',
                'membership' => 'FREE',
                'premium_status' => 'NONE',
                'is_verified' => true,
            ],
        ];

        foreach ($users as $attributes) {
            User::updateOrCreate(
                ['email' => $attributes['email']],
                [...$attributes, 'password' => $password],
            );
        }
    }
}
