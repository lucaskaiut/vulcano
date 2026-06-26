<?php

namespace App\Modules\Notification\Domain\Contracts;

use App\Modules\Notification\Domain\Models\Notification;

interface NotificationChannelContract
{
    public function send(Notification $notification): void;
}
