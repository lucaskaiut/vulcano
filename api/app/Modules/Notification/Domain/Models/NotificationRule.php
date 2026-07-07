<?php

namespace App\Modules\Notification\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'description', 'event', 'channel', 'schedule_type', 'schedule_config', 'template_id', 'active'])]
class NotificationRule extends Model
{
    protected $table = 'notification_rules';

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'schedule_config' => 'array',
        ];
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }
}
