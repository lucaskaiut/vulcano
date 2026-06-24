<?php

namespace App\Modules\Workflow\Domain\Enums;

enum WorkflowHistoryAction: string
{
    case Started = 'started';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Started => 'iniciou',
            self::Approved => 'aprovou',
            self::Rejected => 'reprovou',
            self::Cancelled => 'cancelou',
        };
    }
}
