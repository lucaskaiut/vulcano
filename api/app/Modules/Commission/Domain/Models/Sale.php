<?php

namespace App\Modules\Commission\Domain\Models;

use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Modules\Audit\Domain\Traits\Auditable;

#[Fillable([
    'user_id',
    'enterprise_id',
    'unit',
    'sale_date',
    'sale_amount',
    'percentage',
    'commission_amount',
    'notes',
])]
class Sale extends Model
{
    use Auditable;
    protected function casts(): array
    {
        return [
            'sale_date' => 'date',
            'sale_amount' => 'decimal:2',
            'percentage' => 'decimal:2',
            'commission_amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function commission(): HasOne
    {
        return $this->hasOne(Commission::class);
    }

    public function enterprise(): BelongsTo
    {
        return $this->belongsTo(Enterprise::class);
    }
}
