<?php

namespace App\Console\Commands;

use App\Modules\Notification\Domain\Models\Notification;
use App\Modules\Notification\Domain\Services\NotificationService;
use Illuminate\Console\Command;

class RetryFailedNotifications extends Command
{
    protected $signature = 'vulcano:retry-failed-notifications';
    protected $description = 'Retry sending failed notifications';

    public function handle(NotificationService $notificationService): int
    {
        $failed = Notification::query()
            ->with(['user', 'channel'])
            ->where('status', 'failed')
            ->whereNull('sent_at')
            ->get();

        if ($failed->isEmpty()) {
            $this->info('Nenhuma notificação falha para reprocessar.');

            return self::SUCCESS;
        }

        $this->info("Reprocessando {$failed->count()} notificações...");
        $retried = 0;
        $stillFailed = 0;

        foreach ($failed as $notification) {
            try {
                $notificationService->dispatch(
                    $notification->type,
                    $notification->user,
                    $notification->title,
                    $notification->body,
                    $notification->data ?? [],
                );
                $notification->delete(); // Remove old failed, new one created with sent status
                $retried++;
            } catch (\Exception $e) {
                $notification->update(['error' => $e->getMessage()]);
                $stillFailed++;
            }
        }

        $this->info("{$retried} reenviadas, {$stillFailed} continuam falhando.");

        return self::SUCCESS;
    }
}
