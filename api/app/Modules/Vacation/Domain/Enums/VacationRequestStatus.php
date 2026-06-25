<?php

namespace App\Modules\Vacation\Domain\Enums;

enum VacationRequestStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::Approved => 'Aprovado',
            self::Rejected => 'Reprovado',
            self::Cancelled => 'Cancelado',
        };
    }
}
