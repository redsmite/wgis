<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PermitPhoto extends Model
{
    protected $table = 'permit_photos';

    protected $fillable = [
        'permit_id',
        'filename',
        'original_name',
        'path',
        'type',
        'size',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function permit(): BelongsTo
    {
        return $this->belongsTo(Permit::class, 'permit_id', 'ID');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    public function isPdf(): bool
    {
        return $this->type === 'pdf';
    }

    public function isPhoto(): bool
    {
        return $this->type === 'photo';
    }
}