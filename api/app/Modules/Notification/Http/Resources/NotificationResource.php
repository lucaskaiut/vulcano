<?php

namespace App\Modules\Notification\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Notification\Domain\Models\Notification */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'body' => $this->body,
            'sent_at' => $this->sent_at?->toIso8601String(),
            'channel' => $this->whenLoaded('channel', fn () => $this->channel->label),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
