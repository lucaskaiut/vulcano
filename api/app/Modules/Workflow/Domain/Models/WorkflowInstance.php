<?php

namespace App\Modules\Workflow\Domain\Models;

use App\Modules\User\Domain\Models\User;
use App\Modules\Commission\Domain\Enums\CommissionStatus;
use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Vacation\Domain\Enums\VacationRequestStatus;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use Database\Factories\WorkflowInstanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'workflow_type',
    'title',
    'status',
    'current_step_id',
    'initiated_by_user_id',
    'subject_type',
    'subject_id',
])]
class WorkflowInstance extends Model
{
    /** @use HasFactory<WorkflowInstanceFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => WorkflowInstanceStatus::class,
        ];
    }

    public function currentStep(): BelongsTo
    {
        return $this->belongsTo(WorkflowStep::class, 'current_step_id');
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by_user_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(WorkflowInstanceHistory::class, 'workflow_instance_id')->orderBy('created_at');
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    protected static function newFactory(): WorkflowInstanceFactory
    {
        return WorkflowInstanceFactory::new();
    }

    protected static function booted(): void
    {
        static::updated(function (WorkflowInstance $instance) {
            if (! $instance->wasChanged('status')) {
                return;
            }

            if ($instance->subject_type === VacationRequest::class && $instance->subject_id) {
                $status = match ($instance->status) {
                    WorkflowInstanceStatus::Approved => VacationRequestStatus::Approved,
                    WorkflowInstanceStatus::Rejected => VacationRequestStatus::Rejected,
                    WorkflowInstanceStatus::Cancelled => VacationRequestStatus::Cancelled,
                    default => null,
                };

                if ($status) {
                    VacationRequest::query()
                        ->where('id', $instance->subject_id)
                        ->update(['status' => $status]);
                }
            }

            if ($instance->subject_type === Commission::class && $instance->subject_id) {
                $status = match ($instance->status) {
                    WorkflowInstanceStatus::Approved => CommissionStatus::Approved,
                    WorkflowInstanceStatus::Rejected => CommissionStatus::Rejected,
                    default => null,
                };

                if ($status) {
                    Commission::query()
                        ->where('id', $instance->subject_id)
                        ->update(['status' => $status]);
                }
            }
        });
    }
}
