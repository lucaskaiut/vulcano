<?php

namespace App\Modules\Vacation\Domain\Services;

use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Support\VacationEntitlementCalculator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class VacationBalanceService
{
    /** @var list<string> */
    public const SORTABLE_COLUMNS = ['available_days', 'accrued_days', 'used_days', 'created_at'];

    /** @return LengthAwarePaginator<int, VacationBalance> */
    public function paginate(SortQuery $sort, PaginationQuery $pagination, ?int $userId = null): LengthAwarePaginator
    {
        $query = VacationBalance::query()->with('user');

        if ($userId !== null) {
            $query->where('user_id', $userId);

            if (! VacationBalance::query()->where('user_id', $userId)->exists()) {
                VacationBalance::query()->create([
                    'user_id' => $userId,
                    'available_days' => 0,
                    'accrued_days' => 0,
                    'used_days' => 0,
                    'additional_days' => 0,
                ]);
            }
        }

        $sort->apply($query);

        return $query->paginate(
            $pagination->perPage,
            ['*'],
            'page',
            $pagination->page,
        );
    }

    public function find(int $id): VacationBalance
    {
        return VacationBalance::query()
            ->with(['user', 'grants', 'periods'])
            ->findOrFail($id);
    }

    public function findForUser(User $user): VacationBalance
    {
        return VacationBalance::query()
            ->with(['grants', 'periods'])
            ->where('user_id', $user->id)
            ->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'available_days' => 0,
                    'accrued_days' => 0,
                    'used_days' => 0,
                    'additional_days' => 0,
                ],
            );
    }

    /** @param  array{user_id: int, additional_days?: int}  $data */
    public function createInitial(array $data): VacationBalance
    {
        $existing = VacationBalance::query()->where('user_id', $data['user_id'])->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'user_id' => 'Este colaborador já possui saldo de férias cadastrado.',
            ]);
        }

        $additionalDays = $data['additional_days'] ?? 0;

        $balance = VacationBalance::query()->create([
            'user_id' => $data['user_id'],
            'available_days' => $additionalDays,
            'accrued_days' => 0,
            'used_days' => 0,
            'additional_days' => $additionalDays,
        ])->load('user');

        $this->syncAvailableDays($balance);
        $balance->save();

        return $balance->fresh('user');
    }

    /** @param  array{additional_days?: int, additional_days_entries?: list<array{description: string, days: int}>}  $data */
    public function update(VacationBalance $balance, array $data): VacationBalance
    {
        $shouldSync = false;

        if (array_key_exists('additional_days', $data)) {
            $balance->additional_days = $data['additional_days'];
            $shouldSync = true;
        }

        if (array_key_exists('additional_days_entries', $data)) {
            $balance->additional_days_entries = $data['additional_days_entries'];
            $balance->additional_days = collect($data['additional_days_entries'])->sum('days');
            $shouldSync = true;
        }

        if ($shouldSync) {
            $this->syncAvailableDays($balance);
            $balance->save();
        }

        return $balance->fresh(['user', 'grants', 'periods']);
    }

    public function creditAccruedDays(VacationBalance $balance, int $days): void
    {
        $balance->accrued_days += $days;
        $this->syncAvailableDays($balance);
        $balance->save();
    }

    public function debitUsedDays(VacationBalance $balance, int $days): void
    {
        $this->syncAvailableDays($balance);

        if ($balance->available_days < $days) {
            throw ValidationException::withMessages([
                'days_used' => 'Saldo de férias insuficiente para esta concessão.',
            ]);
        }

        $balance->used_days += $days;
        $this->syncAvailableDays($balance);
        $balance->save();
    }

    public function syncAvailableDays(VacationBalance $balance): void
    {
        $balance->loadMissing('user');

        $accrued = VacationEntitlementCalculator::calculateAccruedDays(
            $balance->user->hired_at,
        );

        $balance->available_days = max(
            0,
            $accrued + $balance->additional_days - $balance->used_days,
        );
    }
}
