<?php

namespace App\Modules\Invoice\Domain\Models;

use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'competence', 'invoice_number', 'amount', 'issue_date', 'status', 'original_name', 'stored_name', 'mime_type', 'size', 'workflow_instance_id'])]
class Invoice extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workflowInstance(): BelongsTo
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'amount' => 'decimal:2',
            'size' => 'integer',
        ];
    }
}
