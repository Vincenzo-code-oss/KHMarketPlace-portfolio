<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new \RuntimeException('Development sample accounts and listings must not be seeded in production.');
        }

        $this->call([
            CategorySeeder::class,
            LocationSeeder::class,
            DevelopmentUserSeeder::class,
            DevelopmentProductSeeder::class,
        ]);
    }
}
