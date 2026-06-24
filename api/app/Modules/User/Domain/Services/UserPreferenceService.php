<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Models\UserPreference;

class UserPreferenceService
{
    /** @return array<string, mixed> */
    public function get(User $user): array
    {
        return $user->preference?->data ?? [];
    }

    /** @param  array<string, mixed>  $partial */
    public function merge(User $user, array $partial): array
    {
        $preference = UserPreference::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['data' => []],
        );

        $merged = array_replace_recursive($preference->data ?? [], $partial);

        if (isset($partial['tables']) && is_array($partial['tables'])) {
            foreach ($partial['tables'] as $tableKey => $tablePartial) {
                if (! is_array($tablePartial) || ! array_key_exists('filters', $tablePartial)) {
                    continue;
                }

                $filters = $tablePartial['filters'];

                if (! is_array($filters)) {
                    $filters = [];
                }

                if (! isset($merged['tables'][$tableKey]) || ! is_array($merged['tables'][$tableKey])) {
                    $merged['tables'][$tableKey] = [];
                }

                $merged['tables'][$tableKey]['filters'] = $filters;
            }
        }

        $preference->update(['data' => $merged]);

        return $merged;
    }
}
