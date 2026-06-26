<?php

namespace App\Modules\Notification\Domain\Services;

use App\Modules\Notification\Domain\Channels\EmailChannel;
use App\Modules\Notification\Domain\Contracts\NotificationChannelContract;
use App\Modules\Notification\Domain\Models\Notification;
use App\Modules\Notification\Domain\Models\NotificationChannel;
use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    /** @var array<string, NotificationChannelContract> */
    private array $channels = [];

    public function __construct()
    {
        $this->registerChannels();
    }

    private function registerChannels(): void
    {
        // Future: resolve channels dynamically from enabled NotificationChannel records
        $this->channels['email'] = app(EmailChannel::class);
    }

    /** @param  array<string, mixed>  $data */
    public function dispatch(string $type, User $user, string $title, string $body, array $data = []): void
    {
        $enabledChannels = NotificationChannel::query()
            ->where('enabled', true)
            ->get();

        foreach ($enabledChannels as $channel) {
            if (! isset($this->channels[$channel->name])) {
                continue;
            }

            $notification = Notification::query()->create([
                'user_id' => $user->id,
                'notification_channel_id' => $channel->id,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'data' => $data,
            ]);

            try {
                $this->channels[$channel->name]->send($notification);
                $notification->update(['sent_at' => now()]);
            } catch (\Exception $e) {
                report($e);
            }
        }
    }

    /** @return Collection<int, Notification> */
    public function listByUser(int $userId): Collection
    {
        return Notification::query()
            ->with('channel')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
    }
}
