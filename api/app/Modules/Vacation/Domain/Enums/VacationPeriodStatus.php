<?php

namespace App\Modules\Vacation\Domain\Enums;

enum VacationPeriodStatus: string
{
    case Open = 'open';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Em andamento',
            self::Closed => 'Encerrado',
        };
    }
}
