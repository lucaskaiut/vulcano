<?php

namespace App\Modules\Notification\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'label', 'enabled'])]
class NotificationChannel extends Model
{
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }
}
