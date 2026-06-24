<?php

namespace App\Modules\User\Domain\Services;

use App\Modules\User\Domain\Models\SalaryHistory;
use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Collection;

class SalaryHistoryService
{
    /** @return Collection<int, SalaryHistory> */
    public function listForUser(User $user): Collection
    {
        return SalaryHistory::query()
            ->where('user_id', $user->id)
            ->with('changedBy')
            ->orderByDesc('effective_date')
            ->orderByDesc('id')
            ->get();
    }

    public function findForUser(User $user, int $salaryHistoryId): SalaryHistory
    {
        return SalaryHistory::query()
            ->where('user_id', $user->id)
            ->with('changedBy')
            ->findOrFail($salaryHistoryId);
    }

    /** @param  array{new_salary: string|float|int, effective_date: string, notes?: string|null}  $data */
    public function create(User $user, User $actor, array $data): SalaryHistory
    {
        $history = SalaryHistory::query()->create([
            'user_id' => $user->id,
            'previous_salary' => $user->salary,
            'new_salary' => $data['new_salary'],
            'effective_date' => $data['effective_date'],
            'notes' => $data['notes'] ?? null,
            'changed_by_user_id' => $actor->id,
        ]);

        $this->syncCurrentSalary($user);

        return $history->load('changedBy');
    }

    /** @param  array{new_salary?: string|float|int, effective_date?: string, notes?: string|null}  $data */
    public function update(SalaryHistory $history, array $data): SalaryHistory
    {
        $attributes = [];

        foreach (['new_salary', 'effective_date', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $attributes[$field] = $data[$field];
            }
        }

        if ($attributes !== []) {
            $history->update($attributes);
        }

        $this->syncCurrentSalary($history->user);

        return $history->fresh(['changedBy']);
    }

    /** @param  array{new_salary: string|float|int, effective_date: string, notes?: string|null}  $data */
    public function recordInitial(User $user, User $actor, array $data): SalaryHistory
    {
        return SalaryHistory::query()->create([
            'user_id' => $user->id,
            'previous_salary' => null,
            'new_salary' => $data['new_salary'],
            'effective_date' => $data['effective_date'],
            'notes' => $data['notes'] ?? 'Salário inicial',
            'changed_by_user_id' => $actor->id,
        ]);
    }

    public function syncCurrentSalary(User $user): void
    {
        $latest = SalaryHistory::query()
            ->where('user_id', $user->id)
            ->orderByDesc('effective_date')
            ->orderByDesc('id')
            ->first();

        if (! $latest) {
            return;
        }

        $user->update(['salary' => $latest->new_salary]);
    }
}
