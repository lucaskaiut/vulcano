<?php

namespace App\Modules\Dashboard\Domain\Services;

use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;

class DashboardService
{
    /** @return array<string, mixed> */
    public function summary(): array
    {
        return [
            'total_collaborators' => User::query()->count(),
            'total_cost' => $this->getTotalCost(),
            'pending_vacation_requests' => $this->getPendingVacationRequests(),
            'pending_commissions' => Commission::query()->where('status', 'pending')->count(),
            'pending_invoices' => Invoice::query()->where('status', 'pending')->count(),
            'expired_exams' => MedicalExam::query()->whereDate('expiration_date', '<', now())->count(),
            'expiring_exams' => MedicalExam::query()
                ->whereDate('expiration_date', '>=', now())
                ->whereDate('expiration_date', '<=', now()->addDays(30))
                ->count(),
        ];
    }

    private function getTotalCost(): float
    {
        $users = User::query()->sum('salary');

        // Provisions (13º + férias + 1/3 férias) = salary / 12 * 2.333...
        $provisions = $users * 2.333 / 12;

        // Recurring manual costs
        $manualCosts = (float) \App\Modules\Cost\Domain\Models\CollaboratorCost::query()
            ->where('recurring', true)
            ->sum('amount');

        return round((float) $users + $provisions + $manualCosts, 2);
    }

    private function getPendingVacationRequests(): int
    {
        return \App\Modules\Vacation\Domain\Models\VacationRequest::query()
            ->where('status', 'pending')
            ->count();
    }
}
