<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    protected $fillable = [
        'division',
        'abbr',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'division_id');
    }
}
