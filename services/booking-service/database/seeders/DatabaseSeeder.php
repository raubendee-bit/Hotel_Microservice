<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'room_number' => '101',
                'style' => 'Standard',
                'status' => 'Available',
                'price_per_night' => 100.00,
                'room_key' => 'KEY-LF-101'
            ],
            [
                'room_number' => '102',
                'style' => 'Standard',
                'status' => 'Available',
                'price_per_night' => 100.00,
                'room_key' => 'KEY-LF-102'
            ],
            [
                'room_number' => '201',
                'style' => 'Deluxe',
                'status' => 'Available',
                'price_per_night' => 180.00,
                'room_key' => 'KEY-LF-201'
            ],
            [
                'room_number' => '202',
                'style' => 'Deluxe',
                'status' => 'Available',
                'price_per_night' => 180.00,
                'room_key' => 'KEY-LF-202'
            ],
            [
                'room_number' => '301',
                'style' => 'Family',
                'status' => 'Available',
                'price_per_night' => 250.00,
                'room_key' => 'KEY-LF-301'
            ],
            [
                'room_number' => '302',
                'style' => 'Family',
                'status' => 'Available',
                'price_per_night' => 250.00,
                'room_key' => 'KEY-LF-302'
            ],
            [
                'room_number' => '401',
                'style' => 'Business Suite',
                'status' => 'Available',
                'price_per_night' => 450.00,
                'room_key' => 'KEY-LF-401'
            ],
            [
                'room_number' => '402',
                'style' => 'Business Suite',
                'status' => 'Available',
                'price_per_night' => 450.00,
                'room_key' => 'KEY-LF-402'
            ],
        ];

        foreach ($rooms as $room) {
            Room::updateOrCreate(
                ['room_number' => $room['room_number']],
                $room
            );
        }
    }
}
