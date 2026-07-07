<?php

namespace App\Modules\Notification\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Notification\Domain\Models\NotificationRule */
class NotificationRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'event' => $this->event,
            'channel' => $this->channel,
            'schedule_type' => $this->schedule_type,
            'schedule_config' => $this->schedule_config,
            'template_id' => $this->template_id,
            'template' => new NotificationTemplateResource($this->whenLoaded('template')),
            'active' => $this->active,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
