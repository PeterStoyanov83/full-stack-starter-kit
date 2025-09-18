<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreateAdminSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Check if admin user already exists
        if (User::where('email', 'admin@example.com')->exists()) {
            echo "ℹ️ Admin user already exists, skipping creation.\n";
            return;
        }

        // Create default admin account
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        echo "✅ Default admin account created successfully!\n";
        echo "📧 Email: admin@example.com\n";
        echo "🔐 Password: password\n";
        echo "👑 Role: owner\n";
    }
}