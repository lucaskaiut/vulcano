<?php

namespace App\Modules\Notification\Domain\Mail;

use App\Modules\Notification\Domain\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NotificationMail extends Mailable
{
    use Queueable;

    public function __construct(public readonly Notification $notification) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->notification->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
            with: [
                'title' => $this->notification->title,
                'body' => $this->notification->body,
            ],
        );
    }
}
