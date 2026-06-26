<?php

namespace App\Modules\Audit\Domain\Services;

use App\Modules\Audit\Domain\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuditService
{
    /** @param  array{entity?: string, user_id?: int, action?: string, from?: string, to?: string}  $filters */
    public function paginate(int $perPage = 20, array $filters = []): LengthAwarePaginator
    {
        $query = AuditLog::query()
            ->with('user')
            ->when($filters['entity'] ?? null, fn ($q, $v) => $q->where('entity', 'like', "%{$v}%"))
            ->when($filters['user_id'] ?? null, fn ($q, $v) => $q->where('user_id', (int) $v))
            ->when($filters['action'] ?? null, fn ($q, $v) => $q->where('action', $v))
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->where('created_at', '>=', $v . ' 00:00:00'))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->where('created_at', '<=', $v . ' 23:59:59'))
            ->orderByDesc('created_at');

        return $query->paginate($perPage)->withQueryString();
    }
}
