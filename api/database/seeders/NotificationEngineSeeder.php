<?php

namespace Database\Seeders;

use App\Modules\Notification\Domain\Enums\NotificationEventEnum;
use App\Modules\Notification\Domain\Models\NotificationRule;
use App\Modules\Notification\Domain\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationEngineSeeder extends Seeder
{
    public function run(): void
    {
        // --- Templates ---
        $invoiceTemplate = NotificationTemplate::query()->firstOrCreate(
            ['name' => 'Lembrete mensal de NF'],
            [
                'subject' => 'Lembrete de emissão de nota fiscal',
                'body' => "Olá {{prestador.nome}},\n\nLembramos que você deve emitir sua nota fiscal referente ao período {{periodo.atual}}.\n\nPrazo: {{data.limite_nf}}\n\nAtenciosamente,\nEquipe Vulcano",
                'available_variables' => ['prestador.nome', 'prestador.email', 'periodo.atual', 'data.limite_nf'],
            ],
        );

        $documentTemplate = NotificationTemplate::query()->firstOrCreate(
            ['name' => 'Documento próximo do vencimento'],
            [
                'subject' => 'Documento próximo do vencimento',
                'body' => "Olá {{prestador.nome}},\n\nSeu documento está próximo da data de vencimento. Por favor, providencie a renovação.\n\nAtenciosamente,\nEquipe Vulcano",
                'available_variables' => ['prestador.nome'],
            ],
        );

        $examTemplate = NotificationTemplate::query()->firstOrCreate(
            ['name' => 'Exame próximo do vencimento'],
            [
                'subject' => 'Exame médico próximo do vencimento',
                'body' => "Olá {{prestador.nome}},\n\nSeu exame médico está próximo da data de vencimento. Por favor, agende a renovação.\n\nAtenciosamente,\nEquipe Vulcano",
                'available_variables' => ['prestador.nome'],
            ],
        );

        // --- Rules ---
        NotificationRule::query()->firstOrCreate(
            ['name' => 'Lembrete mensal de emissão de NF'],
            [
                'description' => 'Envia lembrete mensal no dia 1 às 08:00',
                'event' => NotificationEventEnum::MonthlyInvoiceReminder->value,
                'channel' => 'email',
                'schedule_type' => 'monthly',
                'schedule_config' => ['day' => 1, 'time' => '08:00'],
                'template_id' => $invoiceTemplate->id,
                'active' => true,
            ],
        );

        NotificationRule::query()->firstOrCreate(
            ['name' => 'Documentos vencendo'],
            [
                'description' => 'Verifica diariamente documentos próximos do vencimento',
                'event' => NotificationEventEnum::DocumentExpiring->value,
                'channel' => 'email',
                'schedule_type' => 'daily',
                'schedule_config' => ['time' => '08:00'],
                'template_id' => $documentTemplate->id,
                'active' => true,
            ],
        );

        NotificationRule::query()->firstOrCreate(
            ['name' => 'Exames vencendo'],
            [
                'description' => 'Verifica diariamente exames próximos do vencimento',
                'event' => NotificationEventEnum::ExamExpiring->value,
                'channel' => 'email',
                'schedule_type' => 'daily',
                'schedule_config' => ['time' => '08:00'],
                'template_id' => $examTemplate->id,
                'active' => true,
            ],
        );
    }
}
