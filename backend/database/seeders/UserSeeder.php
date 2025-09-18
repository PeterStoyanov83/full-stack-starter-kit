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
        // Create diverse users with different roles for comprehensive testing
        $users = [
            [
                'name' => 'Peter',
                'email' => 'peterstoyanov83@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Елена Георгиева',
                'email' => 'elena@frontend.dev',
                'password' => Hash::make('password'),
                'role' => 'frontend',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Марин Стоянов',
                'email' => 'marin@backend.dev',
                'password' => Hash::make('password'),
                'role' => 'backend',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Ива Петкова',
                'email' => 'iva@design.studio',
                'password' => Hash::make('password'),
                'role' => 'designer',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Стефан Николов',
                'email' => 'stefan@qa.test',
                'password' => Hash::make('password'),
                'role' => 'qa',
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
