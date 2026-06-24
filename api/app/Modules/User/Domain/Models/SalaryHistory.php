<?php

namespace App\Modules\User\Domain\Models;

use Database\Factories\SalaryHistoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'previous_salary',
    'new_salary',
    'effective_date',
    'notes',
    'changed_by_user_id',
])]
class SalaryHistory extends Model
{
    /** @use HasFactory<SalaryHistoryFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'previous_salary' => 'decimal:2',
            'new_salary' => 'decimal:2',
            'effective_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }

    protected static function newFactory(): SalaryHistoryFactory
    {
        return SalaryHistoryFactory::new();
    }
}
