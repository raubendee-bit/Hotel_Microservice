<?php

namespace App\Http\Controllers;

use App\Models\HousekeepingLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HousekeepingController extends Controller
{
    public function getLogs(Request $request)
    {
        return response()->json(HousekeepingLog::orderBy('created_at', 'desc')->get());
    }

    public function createLog(Request $request)
    {
        $role = $request->attributes->get('user_role');
        if ($role !== 'housekeeper' && $role !== 'manager' && $role !== 'receptionist') {
            return response()->json(['error' => 'Unauthorized operation. Only staff can modify room housekeeping status.'], 403);
        }

        $request->validate([
            'room_id' => 'required|integer',
            'room_number' => 'required|string',
            'task_description' => 'required|string',
            'status' => 'required|in:Cleaned,Maintenance'
        ]);

        $log = HousekeepingLog::create([
            'room_id' => $request->room_id,
            'room_number' => $request->room_number,
            'housekeeper_id' => $request->attributes->get('user_id'),
            'housekeeper_name' => $request->attributes->get('user_name') ?? 'Housekeeper Staff',
            'task_description' => $request->task_description,
            'status' => $request->status
        ]);

        // Cross-service call: Update Room Status in Booking Service
        $bookingUrl = env('BOOKING_SERVICE_URL', 'http://lf-booking-service');
        $targetStatus = ($request->status === 'Cleaned') ? 'Available' : 'Maintenance';

        try {
            Http::withHeaders([
                'Authorization' => $request->header('Authorization')
            ])->put($bookingUrl . '/api/rooms/' . $request->room_id . '/status', [
                'status' => $targetStatus
            ]);
        } catch (\Exception $e) {
            // Log connection warning but continue flow
        }

        return response()->json([
            'message' => 'Housekeeping log recorded and room status synced to booking pool.',
            'log' => $log
        ], 201);
    }
}
