<?php

namespace App\Modules\Vacation\Domain\Services;

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

    /** @param  array{user_id: int, start_date: string, end_date: string, days_used: int}  $data */
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
            ]);
        });
    }
}
