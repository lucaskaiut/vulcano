<?php

namespace App\Modules\Vacation\Domain\Models;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationPeriodStatus;
use Database\Factories\VacationPeriodFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'start_date',
    'end_date',
    'entitled_days',
    'status',
])]
class VacationPeriod extends Model
{
    /** @use HasFactory<VacationPeriodFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => VacationPeriodStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function newFactory(): VacationPeriodFactory
    {
        return VacationPeriodFactory::new();
    }
}
