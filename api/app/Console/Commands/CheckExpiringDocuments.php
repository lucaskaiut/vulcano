<?php

namespace App\Console\Commands;

use App\Modules\Document\Domain\Models\Document;
use App\Modules\Notification\Domain\Services\NotificationService;
use Illuminate\Console\Command;

class CheckExpiringDocuments extends Command
{
    protected $signature = 'vulcano:check-expiring-documents';
    protected $description = 'Notify users about documents expiring within 30 days';

    public function handle(NotificationService $notificationService): void
    {
        $documents = Document::query()
            ->with('user')
            ->whereNotNull('expiration_date')
            ->whereDate('expiration_date', '>=', now())
            ->whereDate('expiration_date', '<=', now()->addDays(30))
            ->get();

        foreach ($documents as $document) {
            if (! $document->user) continue;

            $days = (int) now()->diffInDays($document->expiration_date, false) + 1;
            $notificationService->dispatch(
                'document_expiring',
                $document->user,
                "Documento próximo do vencimento: {$document->original_name}",
                "O documento \"{$document->original_name}\" vence em {$days} dia(s) ({$document->expiration_date->format('d/m/Y')}).",
            );
        }

        $this->info("Notificados {$documents->count()} documentos próximos do vencimento.");
    }
}
