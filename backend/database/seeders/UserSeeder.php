<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users matching README documentation
        $users = [
            [
                'name' => 'Иван Иванов',
                'email' => 'ivan@admin.local',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Елена Петрова',
                'email' => 'elena@frontend.local',
                'password' => Hash::make('password'),
                'role' => 'frontend',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Петър Георгиев',
                'email' => 'petar@backend.local',
                'password' => Hash::make('password'),
                'role' => 'backend',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Мария Димитрова',
                'email' => 'maria@design.local',
                'password' => Hash::make('password'),
                'role' => 'designer',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Стефан Николов',
                'email' => 'stefan@qa.local',
                'password' => Hash::make('password'),
                'role' => 'qa',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Анна Петкова',
                'email' => 'anna@pm.local',
                'password' => Hash::make('password'),
                'role' => 'pm',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
