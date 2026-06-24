<?php

namespace App\Modules\Vacation\Domain\Models;

use App\Modules\User\Domain\Models\User;
use Database\Factories\VacationBalanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'available_days',
    'accrued_days',
    'used_days',
    'additional_days',
])]
class VacationBalance extends Model
{
    /** @use HasFactory<VacationBalanceFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(VacationPeriod::class, 'user_id', 'user_id');
    }

    public function grants(): HasMany
    {
        return $this->hasMany(VacationGrant::class, 'user_id', 'user_id');
    }

    protected static function newFactory(): VacationBalanceFactory
    {
        return VacationBalanceFactory::new();
    }
}
