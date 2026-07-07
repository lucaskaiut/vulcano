<?php

namespace App\Modules\Dashboard\Domain\Services;

use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use App\Modules\Vacation\Domain\Models\VacationBalance;

class DashboardService
{
    /** @return array<string, mixed> */
    public function summary(User $user): array
    {
        $ownAndSubordinates = $this->getOwnAndSubordinateIds($user);

        return [
            'total_collaborators' => $this->getTotalCollaborators($user),
            'total_cost' => $this->getTotalCost($user, $ownAndSubordinates),
            'pending_vacation_requests' => $this->getPendingVacationRequests($user, $ownAndSubordinates),
            'pending_commissions' => $this->scopeQuery(
                Commission::query()->where('status', 'pending'),
                $user, $ownAndSubordinates, PermissionEnum::CommissionsViewAll->value, 'user_id',
            )->count(),
            'pending_invoices' => $this->scopeQuery(
                Invoice::query()->where('status', 'pending'),
                $user, $ownAndSubordinates, PermissionEnum::InvoicesViewAll->value, 'user_id',
            )->count(),
            'expired_exams' => $this->scopeQuery(
                MedicalExam::query()->whereDate('expiration_date', '<', now()),
                $user, $ownAndSubordinates, PermissionEnum::MedicalExamsViewAll->value, 'user_id',
            )->count(),
            'expiring_exams' => $this->scopeQuery(
                MedicalExam::query()
                    ->whereDate('expiration_date', '>=', now())
                    ->whereDate('expiration_date', '<=', now()->addDays(30)),
                $user, $ownAndSubordinates, PermissionEnum::MedicalExamsViewAll->value, 'user_id',
            )->count(),
        ];
    }

    /** @param  \Illuminate\Database\Eloquent\Builder  $query */
    private function scopeQuery($query, User $user, \Illuminate\Support\Collection $ownAndSubordinates, string $permission, string $column)
    {
        if ($user->hasPermission($permission)) {
            return $query;
        }

        return $query->whereIn($column, $ownAndSubordinates);
    }

    /** @return \Illuminate\Support\Collection<int, int> */
    private function getOwnAndSubordinateIds(User $user): \Illuminate\Support\Collection
    {
        return User::query()->where('manager_id', $user->id)->pluck('id')->push($user->id)->unique();
    }

    private function getTotalCollaborators(User $user): int
    {
        if ($user->hasPermission(PermissionEnum::UsersView->value)) {
            return User::query()->count();
        }

        return 1; // only themselves
    }

    private function getTotalCost(User $user, \Illuminate\Support\Collection $ownAndSubordinates): float
    {
        $ids = $user->hasPermission(PermissionEnum::CostsViewAll->value)
            ? null
            : $ownAndSubordinates;

        $salaryQuery = User::query();
        if ($ids) {
            $salaryQuery->whereIn('id', $ids);
        }
        $users = (float) $salaryQuery->sum('salary');

        // Provisions (13º + férias + 1/3 férias) = salary / 12 * 2.333...
        $provisions = $users * 2.333 / 12;

        // Recurring manual costs
        $costQuery = \App\Modules\Cost\Domain\Models\CollaboratorCost::query()->where('recurring', true);
        if ($ids) {
            $costQuery->whereIn('user_id', $ids);
        }
        $manualCosts = (float) $costQuery->sum('amount');

        return round($users + $provisions + $manualCosts, 2);
    }

    private function getPendingVacationRequests(User $user, \Illuminate\Support\Collection $ownAndSubordinates): int
    {
        return $this->scopeQuery(
            \App\Modules\Vacation\Domain\Models\VacationRequest::query()->where('status', 'pending'),
            $user, $ownAndSubordinates, PermissionEnum::VacationRequestsViewAll->value, 'user_id',
        )->count();
    }
}
