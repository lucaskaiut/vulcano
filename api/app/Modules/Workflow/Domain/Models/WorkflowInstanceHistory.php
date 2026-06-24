<?php

namespace App\Modules\Workflow\Domain\Models;

use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowHistoryAction;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'workflow_instance_id',
    'user_id',
    'workflow_step_id',
    'action',
    'notes',
])]
class WorkflowInstanceHistory extends Model
{
    protected function casts(): array
    {
        return [
            'action' => WorkflowHistoryAction::class,
        ];
    }

    public function instance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class, 'workflow_instance_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function step(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'workflow_step_id');
    }
}
