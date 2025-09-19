<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders in proper order
        $this->call([
            CreateAdminSeeder::class,  // Create default admin first
            UserSeeder::class,         // Create test users
            CategorySeeder::class,
            TagSeeder::class,
            ToolSeeder::class,
        ]);
    }
}
