<?php

namespace App\Console\Commands;

use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use App\Modules\Notification\Domain\Services\NotificationService;
use Illuminate\Console\Command;

class CheckExpiringExams extends Command
{
    protected $signature = 'vulcano:check-expiring-exams';
    protected $description = 'Notify users about exams expiring within 30 days';

    public function handle(NotificationService $notificationService): void
    {
        $exams = MedicalExam::query()
            ->with('user')
            ->whereDate('expiration_date', '>=', now())
            ->whereDate('expiration_date', '<=', now()->addDays(30))
            ->get();

        foreach ($exams as $exam) {
            if (! $exam->user) continue;

            $days = (int) now()->diffInDays($exam->expiration_date, false) + 1;
            $notificationService->dispatch(
                'exam_expiring',
                $exam->user,
                "Exame próximo do vencimento: {$exam->exam_type}",
                "Seu exame \"{$exam->exam_type}\" vence em {$days} dia(s) ({$exam->expiration_date->format('d/m/Y')}).",
            );
        }

        $this->info("Notificados {$exams->count()} exames próximos do vencimento.");
    }
}
