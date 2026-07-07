<?php

namespace App\Modules\Vacation\Domain\Services;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Enums\VacationPeriodStatus;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationPeriod;
use App\Modules\Vacation\Domain\Support\VacationEntitlementCalculator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VacationPeriodService
{
    public function __construct(private readonly VacationBalanceService $vacationBalanceService) {}

    /** @return Collection<int, VacationPeriod> */
    public function list(User $user, ?int $userId = null): Collection
    {
        $query = VacationPeriod::query()
            ->with('user')
            ->orderByDesc('start_date');

        if ($userId !== null) {
            if (! $user->hasPermission(PermissionEnum::VacationPeriodsViewAll->value)) {
                $subordinateIds = User::query()->where('manager_id', $user->id)->pluck('id')->push($user->id)->unique();
                abort_unless($subordinateIds->contains($userId), 403, 'Acesso negado.');
            }

            $query->where('user_id', $userId);
        } elseif (! $user->hasPermission(PermissionEnum::VacationPeriodsViewAll->value)) {
            $subordinateIds = User::query()->where('manager_id', $user->id)->pluck('id');
            $ids = $subordinateIds->push($user->id)->unique();
            $query->whereIn('user_id', $ids);
        }

        return $query->get();
    }

    /** @param  array{user_id: int, start_date: string}  $data */
    public function create(array $data): VacationPeriod
    {
        $hasOpenPeriod = VacationPeriod::query()
            ->where('user_id', $data['user_id'])
            ->where('status', VacationPeriodStatus::Open)
            ->exists();

        if ($hasOpenPeriod) {
            throw ValidationException::withMessages([
                'user_id' => 'Já existe um período aquisitivo em andamento para este colaborador.',
            ]);
        }

        VacationBalance::query()->firstOrCreate(
            ['user_id' => $data['user_id']],
            [
                'available_days' => 0,
                'accrued_days' => 0,
                'used_days' => 0,
                'additional_days' => 0,
            ],
        );

        return VacationPeriod::query()->create([
            'user_id' => $data['user_id'],
            'start_date' => $data['start_date'],
            'status' => VacationPeriodStatus::Open,
        ])->load('user');
    }

    /** @param  array{end_date: string}  $data */
    public function close(VacationPeriod $period, array $data): VacationPeriod
    {
        if ($period->status === VacationPeriodStatus::Closed) {
            throw ValidationException::withMessages([
                'status' => 'Este período aquisitivo já está encerrado.',
            ]);
        }

        $endDate = $data['end_date'];

        if ($endDate < $period->start_date->toDateString()) {
            throw ValidationException::withMessages([
                'end_date' => 'A data de encerramento deve ser posterior à data de início.',
            ]);
        }

        return DB::transaction(function () use ($period, $endDate) {
            $entitledDays = VacationEntitlementCalculator::calculateEntitledDays(
                $period->start_date,
                \Carbon\Carbon::parse($endDate),
            );

            $period->update([
                'end_date' => $endDate,
                'entitled_days' => $entitledDays,
                'status' => VacationPeriodStatus::Closed,
            ]);

            $balance = VacationBalance::query()
                ->where('user_id', $period->user_id)
                ->firstOrFail();

            $this->vacationBalanceService->creditAccruedDays($balance, $entitledDays);

            return $period->fresh(['user']);
        });
    }
}
