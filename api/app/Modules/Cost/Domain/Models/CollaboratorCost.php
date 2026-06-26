<?php

namespace App\Modules\Cost\Domain\Models;

use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'cost_category_id',
    'amount',
    'recurring',
    'reference_month',
])]
class CollaboratorCost extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'recurring' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CostCategory::class, 'cost_category_id');
    }
}
