<?php

namespace App\Modules\Workflow\Domain\Models;

use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\User;
use Database\Factories\WorkflowStepFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'workflow_type',
    'name',
    'order',
    'responsible_role_id',
    'responsible_user_id',
])]
class WorkflowStep extends Model
{
    /** @use HasFactory<WorkflowStepFactory> */
    use HasFactory;

    public function responsibleRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'responsible_role_id');
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    protected static function newFactory(): WorkflowStepFactory
    {
        return WorkflowStepFactory::new();
    }
}
