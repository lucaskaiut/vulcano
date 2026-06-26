<?php

namespace App\Modules\Commission\Domain\Enums;

enum CommissionStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Paid = 'paid';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::Approved => 'Aprovada',
            self::Rejected => 'Reprovada',
            self::Paid => 'Paga',
        };
    }
}
