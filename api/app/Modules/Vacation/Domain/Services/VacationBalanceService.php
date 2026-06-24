<?php

namespace App\Modules\Vacation\Domain\Services;

use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\Vacation\Domain\Models\VacationBalance;
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
            ->firstOrFail();
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

        return VacationBalance::query()->create([
            'user_id' => $data['user_id'],
            'available_days' => $additionalDays,
            'accrued_days' => 0,
            'used_days' => 0,
            'additional_days' => $additionalDays,
        ])->load('user');
    }

    /** @param  array{additional_days?: int}  $data */
    public function update(VacationBalance $balance, array $data): VacationBalance
    {
        if (array_key_exists('additional_days', $data)) {
            $balance->additional_days = $data['additional_days'];
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
        $balance->available_days = max(
            0,
            $balance->accrued_days + $balance->additional_days - $balance->used_days,
        );
    }
}
