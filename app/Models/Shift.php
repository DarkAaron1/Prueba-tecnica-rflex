<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
        'employee_id',
        'scheduled_in',
        'scheduled_out',
        'actual_in_id',
        'actual_out_id',
        'status',
        'delay_minutes',
        'overtime_minutes',
        'undone_minutes'
    ];

    protected $casts = [
        'scheduled_in' => 'datetime',
        'scheduled_out' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function actualIn()
    {
        return $this->belongsTo(AttendanceMark::class, 'actual_in_id');
    }

    public function actualOut()
    {
        return $this->belongsTo(AttendanceMark::class, 'actual_out_id');
    }
}
