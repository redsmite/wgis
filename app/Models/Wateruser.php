<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaterUser extends Model
{
    protected $table = 'water_users';
    protected $primaryKey = 'id';

    // No created_at / updated_at — only a 'timestamp' column
    public $timestamps = false;

    protected $fillable = [
        'fire_id',
        'owner',
        'street',
        'barangay',
        'city',
        'representative',
        'designation',
        'phone',
        'latitude',
        'longitude',
        'type',
        'status',
        'remarks',
        'isWaterSource',
        'date_inspected',
        'year_conducted',
        'timestamp',
        'geotaggedUrl',
        'signUrl',
    ];

    protected function casts(): array
    {
        return [
            'latitude'      => 'decimal:6',
            'longitude'     => 'decimal:6',
            'isWaterSource' => 'boolean',
            'date_inspected'=> 'date',
            'timestamp'     => 'datetime',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────────────────

    public function scopeOperational($query)
    {
        return $query->where('status', 'OPERATIONAL');
    }

    public function scopeWaterSources($query)
    {
        return $query->where('isWaterSource', true);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->where('city', $city);
    }
}