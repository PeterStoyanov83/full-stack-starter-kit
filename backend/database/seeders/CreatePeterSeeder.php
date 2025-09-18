<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreatePeterSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Delete all existing users first
        User::truncate();

        // Create Peter's owner account
        User::create([
            'name' => 'Peter',
            'email' => 'peterstoyanov83@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        echo "✅ Peter's owner account created successfully!\n";
        echo "📧 Email: peterstoyanov83@gmail.com\n";
        echo "🔐 Password: password\n";
        echo "👑 Role: owner\n";
    }
}