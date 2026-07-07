<?php

namespace App\Modules\Vacation\Domain\Services;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationGrant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VacationGrantService
{
    public function __construct(private readonly VacationBalanceService $vacationBalanceService) {}

    /** @return Collection<int, VacationGrant> */
    public function listForUser(int $userId): Collection
    {
        return VacationGrant::query()
            ->where('user_id', $userId)
            ->orderByDesc('start_date')
            ->get();
    }

    /** @return Collection<int, VacationGrant> */
    public function listAll(User $user): Collection
    {
        $query = VacationGrant::query()
            ->with('user')
            ->orderByDesc('start_date');

        if (! $user->hasPermission(PermissionEnum::VacationGrantsViewAll->value)) {
            $subordinateIds = User::query()->where('manager_id', $user->id)->pluck('id');
            $ids = $subordinateIds->push($user->id)->unique();
            $query->whereIn('user_id', $ids);
        }

        return $query->get();
    }

    /** @param  array{user_id: int, start_date: string, end_date: string, days_used: int, reason?: string|null}  $data */
    public function create(array $data): VacationGrant
    {
        if ($data['days_used'] <= 0 || floor($data['days_used']) !== (float) $data['days_used']) {
            throw ValidationException::withMessages([
                'days_used' => 'A quantidade de dias deve ser um número inteiro positivo.',
            ]);
        }

        return DB::transaction(function () use ($data) {
            $balance = VacationBalance::query()
                ->where('user_id', $data['user_id'])
                ->firstOrFail();

            $this->vacationBalanceService->debitUsedDays($balance, $data['days_used']);

            return VacationGrant::query()->create([
                'user_id' => $data['user_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'days_used' => $data['days_used'],
                'reason' => $data['reason'] ?? null,
            ]);
        });
    }

    /** @param  array{start_date?: string, end_date?: string, days_used?: int, reason?: string|null}  $data */
    public function update(VacationGrant $grant, array $data): VacationGrant
    {
        return DB::transaction(function () use ($grant, $data) {
            $oldDays = $grant->days_used;

            $grant->update([
                'start_date' => $data['start_date'] ?? $grant->start_date,
                'end_date' => $data['end_date'] ?? $grant->end_date,
                'days_used' => $data['days_used'] ?? $grant->days_used,
                'reason' => array_key_exists('reason', $data) ? $data['reason'] : $grant->reason,
            ]);

            $newDays = $data['days_used'] ?? $oldDays;

            if ($newDays !== $oldDays) {
                $balance = VacationBalance::query()
                    ->where('user_id', $grant->user_id)
                    ->firstOrFail();

                $diff = $newDays - $oldDays;

                if ($diff > 0) {
                    $this->vacationBalanceService->debitUsedDays($balance, $diff);
                } else {
                    $balance->used_days += $diff;
                    $this->vacationBalanceService->syncAvailableDays($balance);
                    $balance->save();
                }
            }

            return $grant->fresh();
        });
    }

    public function delete(VacationGrant $grant): void
    {
        DB::transaction(function () use ($grant) {
            $balance = VacationBalance::query()
                ->where('user_id', $grant->user_id)
                ->firstOrFail();

            $balance->used_days -= $grant->days_used;
            $this->vacationBalanceService->syncAvailableDays($balance);
            $balance->save();

            $grant->delete();
        });
    }
}
