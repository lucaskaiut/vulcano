<?php

namespace App\Modules\Notification\Domain\Enums;

enum NotificationEventEnum: string
{
    case MonthlyInvoiceReminder = 'monthly_invoice_reminder';
    case DocumentExpiring = 'document_expiring';
    case ExamExpiring = 'exam_expiring';

    public function label(): string
    {
        return match ($this) {
            self::MonthlyInvoiceReminder => 'Lembrete mensal de NF',
            self::DocumentExpiring => 'Documento próximo do vencimento',
            self::ExamExpiring => 'Exame próximo do vencimento',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::MonthlyInvoiceReminder => 'Lembrete mensal para emissão de nota fiscal',
            self::DocumentExpiring => 'Alerta quando um documento está a 30 dias do vencimento',
            self::ExamExpiring => 'Alerta quando um exame médico está a 30 dias do vencimento',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
