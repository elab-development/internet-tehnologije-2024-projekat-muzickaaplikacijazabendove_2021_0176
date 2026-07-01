<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::query()->updateOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
            ]
        );
        $artists = [
            [
                'name' => 'Arctic Monkeys',
                'email' => 'contact@arcticmonkeys.test'
            ],
            [
                'name' => 'Dua Lipa',
                'email' => 'team@dualipa.test'
            ],
            [
                'name' => 'Billie Eilish',
                'email' => 'hello@billieeilish.test'
            ],
        ];

        foreach ($artists as $a) {
            User::query()->updateOrCreate(
                ['email' => $a['email']],
                [
                    'name' => $a['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_ARTIST,
                ]
            );
        }

        User::factory()->count(5)->create();
    }
}
