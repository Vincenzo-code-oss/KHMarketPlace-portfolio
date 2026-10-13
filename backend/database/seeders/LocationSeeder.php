<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $provinces = [
            'Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang',
            'Kampong Speu', 'Kampong Thom', 'Kampot', 'Kandal', 'Kep', 'Koh Kong',
            'Kratie', 'Mondulkiri', 'Oddar Meanchey', 'Pailin', 'Phnom Penh',
            'Preah Sihanouk', 'Preah Vihear', 'Prey Veng', 'Pursat', 'Ratanakiri',
            'Siem Reap', 'Stung Treng', 'Svay Rieng', 'Takeo', 'Tbong Khmum',
        ];

        foreach ($provinces as $province) {
            Location::updateOrCreate(
                ['slug' => Str::slug($province)],
                ['name' => $province, 'type' => 'province', 'parent_id' => null],
            );
        }
    }
}
