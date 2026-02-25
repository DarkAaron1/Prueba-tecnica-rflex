<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = ['area_id', 'name', 'serial_number', 'type', 'last_sync_at'];

    protected $casts = [
        'last_sync_at' => 'datetime',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function attendanceMarks()
    {
        return $this->hasMany(AttendanceMark::class);
    }
}
