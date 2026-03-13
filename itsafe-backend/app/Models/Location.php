<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'name',
        'desc',
        'status',
        'icon',
        'count',
        'lat',
        'lng',
        'gmaps',
        'photo',
    ];
}
