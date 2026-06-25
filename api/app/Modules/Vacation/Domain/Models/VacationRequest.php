<?php

namespace App\Modules\Vacation\Domain\Models;

use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'start_date',
    'end_date',
    'requested_days',
    'justification',
    'status',
    'workflow_instance_id',
])]
class VacationRequest extends Model
{
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'status' => VacationRequestStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }
}
