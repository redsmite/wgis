<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'user_type',
        'position',
        'division_id',
        'external_user_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /**
     * Computed full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        $full = trim("{$this->first_name} {$this->last_name}");
        return $full ?: $this->name;
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }
}
