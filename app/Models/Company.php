<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = ['holding_id', 'name', 'rut'];

    public function holding()
    {
        return $this->belongsTo(Holding::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }
}
