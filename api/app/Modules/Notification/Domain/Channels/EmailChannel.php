<?php

namespace App\Modules\Notification\Domain\Channels;

use App\Modules\Notification\Domain\Contracts\NotificationChannelContract;
use App\Modules\Notification\Domain\Mail\NotificationMail;
use App\Modules\Notification\Domain\Models\Notification;
use Illuminate\Support\Facades\Mail;

class EmailChannel implements NotificationChannelContract
{
    public function send(Notification $notification): void
    {
        $notification->loadMissing('user');

        Mail::to($notification->user->email)->send(new NotificationMail($notification));
    }
}
