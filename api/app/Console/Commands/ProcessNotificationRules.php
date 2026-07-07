<?php

namespace App\Console\Commands;

use App\Modules\Notification\Domain\Services\RuleProcessorService;
use Illuminate\Console\Command;

class ProcessNotificationRules extends Command
{
    protected $signature = 'vulcano:process-notification-rules';
    protected $description = 'Process all due notification rules and dispatch notifications';

    public function handle(RuleProcessorService $processor): int
    {
        $count = $processor->processDueRules();

        $this->info("Processed notification rules. {$count} notifications created.");

        return self::SUCCESS;
    }
}
