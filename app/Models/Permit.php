<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permit extends Model
{
    protected $table = 'permits';
    protected $primaryKey = 'ID';

    // No created_at / updated_at in the original table
    public $timestamps = false;

    protected $fillable = [
        'region',
        'province',
        'municipality',
        'permit',
        'grantee',
        'location',
        'source',
        'type',
        'latitude',
        'longitude',
        'charges',
        'granted',
        'purpose',
        'date_app',
        'remarks',
        'filepath',
    ];

    protected function casts(): array
    {
        return [
            'charges' => 'decimal:2',
            'granted' => 'decimal:2',
        ];
    }
}
