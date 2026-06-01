<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HousekeepingLog extends Model
{
    protected $table = 'housekeeping_logs';

    protected $fillable = [
        'room_id',
        'room_number',
        'housekeeper_id',
        'housekeeper_name',
        'task_description',
        'status' // Pending Cleanup, Cleaned, Maintenance
    ];
}
