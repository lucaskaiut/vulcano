<?php

namespace App\Modules\Commission\Domain\Models;

use App\Modules\Commission\Domain\Enums\CommissionStatus;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'sale_id',
    'percentage',
    'commission_amount',
    'status',
    'workflow_instance_id',
    'paid_at',
    'paid_by_user_id',
])]
class Commission extends Model
{
    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'status' => CommissionStatus::class,
            'paid_at' => 'datetime',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by_user_id');
    }
}
