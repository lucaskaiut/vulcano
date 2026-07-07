<?php

namespace App\Modules\Notification\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'subject', 'body', 'available_variables', 'active'])]
class NotificationTemplate extends Model
{
    protected $table = 'notification_templates';

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'available_variables' => 'array',
        ];
    }

    public function rules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(NotificationRule::class, 'template_id');
    }
}
