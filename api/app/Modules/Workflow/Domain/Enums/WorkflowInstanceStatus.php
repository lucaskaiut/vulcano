<?php

namespace App\Modules\Workflow\Domain\Enums;

enum WorkflowInstanceStatus: string
{
    case InProgress = 'in_progress';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::InProgress => 'Em andamento',
            self::Approved => 'Aprovado',
            self::Rejected => 'Reprovado',
            self::Cancelled => 'Cancelado',
        };
    }
}
