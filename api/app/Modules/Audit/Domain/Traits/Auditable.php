<?php

namespace App\Modules\Audit\Domain\Traits;

use App\Modules\Audit\Domain\Models\AuditLog;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->writeAuditLog('created');
        });

        static::updated(function ($model) {
            $model->writeAuditLog('updated');
        });

        static::deleted(function ($model) {
            $model->writeAuditLog('deleted');
        });
    }

    private function writeAuditLog(string $action): void
    {
        $oldData = null;
        $newData = null;

        if ($action === 'updated') {
            $oldData = array_intersect_key($this->getOriginal(), $this->getChanges());
            $newData = $this->getChanges();
        } elseif ($action === 'deleted') {
            $oldData = $this->getOriginal();
        } else {
            $newData = $this->getAttributes();
        }

        // Remove sensitive/irrelevant fields
        $exclude = ['password', 'remember_token', 'created_at', 'updated_at'];

        if ($oldData) {
            $oldData = array_diff_key($oldData, array_flip($exclude));
        }
        if ($newData) {
            $newData = array_diff_key($newData, array_flip($exclude));
        }

        $userId = auth()->check() ? auth()->id() : null;

        AuditLog::query()->create([
            'user_id' => $userId,
            'action' => $action,
            'entity' => static::class,
            'entity_id' => $this->getKey(),
            'old_data' => $oldData ?: null,
            'new_data' => $newData ?: null,
        ]);
    }
}
