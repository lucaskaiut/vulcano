<?php

namespace App\Modules\Vacation\Domain\Models;

use App\Modules\User\Domain\Models\User;
use Database\Factories\VacationGrantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'start_date',
    'end_date',
    'days_used',
])]
class VacationGrant extends Model
{
    /** @use HasFactory<VacationGrantFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function newFactory(): VacationGrantFactory
    {
        return VacationGrantFactory::new();
    }
}
