<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Manager Account
        User::updateOrCreate(
            ['email' => 'manager@fisherel.com'],
            [
                'name' => 'Fisher El Manager',
                'password' => Hash::make('password'),
                'role' => 'manager'
            ]
        );

        // 2. Receptionist Account
        User::updateOrCreate(
            ['email' => 'receptionist@fisherel.com'],
            [
                'name' => 'Fisher El Receptionist',
                'password' => Hash::make('password'),
                'role' => 'receptionist'
            ]
        );

        // 3. Housekeeper Account
        User::updateOrCreate(
            ['email' => 'housekeeper@fisherel.com'],
            [
                'name' => 'Fisher El Housekeeper',
                'password' => Hash::make('password'),
                'role' => 'housekeeper'
            ]
        );

        // 4. Guest Account
        User::updateOrCreate(
            ['email' => 'guest@fisherel.com'],
            [
                'name' => 'Fisher El VIP Guest',
                'password' => Hash::make('password'),
                'role' => 'guest'
            ]
        );
    }
}
