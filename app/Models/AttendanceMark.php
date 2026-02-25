<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceMark extends Model
{
    protected $table = 'attendance_marks';

    protected $fillable = ['employee_rut', 'device_id', 'source', 'type', 'timestamp', 'duplicate_hash', 'metadata'];

    protected $casts = [
        'timestamp' => 'datetime',
        'metadata' => 'array',
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function actualInShifts()
    {
        return $this->hasMany(Shift::class, 'actual_in_id');
    }

    public function actualOutShifts()
    {
        return $this->hasMany(Shift::class, 'actual_out_id');
    }
}
