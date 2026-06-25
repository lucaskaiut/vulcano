<?php

namespace App\Modules\Workflow\Domain\Enums;

enum WorkflowType: string
{
    case VacationRequest = 'vacation_request';
    case Commission = 'commission';
    case Document = 'document';

    public function label(): string
    {
        return match ($this) {
            self::VacationRequest => 'Aprovação de Férias',
            self::Commission => 'Aprovação de Comissão',
            self::Document => 'Aprovação de Documentos',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
