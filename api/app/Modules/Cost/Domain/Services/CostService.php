<?php

namespace App\Modules\Cost\Domain\Services;

use App\Modules\Cost\Domain\Models\CollaboratorCost;
use App\Modules\Cost\Domain\Models\CostCategory;
use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CostService
{
    public const SORTABLE_COLUMNS = ['name', 'type', 'created_at'];
    public const COST_SORTABLE_COLUMNS = ['amount', 'created_at'];

    /** @return LengthAwarePaginator<int, CostCategory> */
    public function paginateCategories(SortQuery $sort, PaginationQuery $pagination): LengthAwarePaginator
    {
        $query = CostCategory::query();
        $sort->apply($query);

        return $query->paginate($pagination->perPage, ['*'], 'page', $pagination->page);
    }

    public function findCategory(int $id): CostCategory
    {
        return CostCategory::query()->findOrFail($id);
    }

    public function listCategories(): Collection
    {
        return CostCategory::query()->orderBy('name')->get();
    }

    /** @param  array{name: string, type: string, active?: bool}  $data */
    public function createCategory(array $data): CostCategory
    {
        return CostCategory::query()->create([
            'name' => $data['name'],
            'type' => $data['type'],
            'active' => $data['active'] ?? true,
        ]);
    }

    /** @param  array{name?: string, type?: string, active?: bool}  $data */
    public function updateCategory(CostCategory $category, array $data): CostCategory
    {
        $category->update(array_intersect_key($data, array_flip(['name', 'type', 'active'])));

        return $category->fresh();
    }

    /** @return LengthAwarePaginator<int, CollaboratorCost> */
    public function paginateCosts(SortQuery $sort, PaginationQuery $pagination, ?int $userId = null): LengthAwarePaginator
    {
        $query = CollaboratorCost::query()->with(['user', 'category']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $sort->apply($query);

        return $query->paginate($pagination->perPage, ['*'], 'page', $pagination->page);
    }

    public function findCost(int $id): CollaboratorCost
    {
        return CollaboratorCost::query()->with(['user', 'category'])->findOrFail($id);
    }

    /** @param  array{user_id: int, cost_category_id: int, amount: float|string, recurring?: bool, reference_month?: string|null}  $data */
    public function createCost(array $data): CollaboratorCost
    {
        return CollaboratorCost::query()->create([
            'user_id' => $data['user_id'],
            'cost_category_id' => $data['cost_category_id'],
            'amount' => $data['amount'],
            'recurring' => $data['recurring'] ?? true,
            'reference_month' => $data['reference_month'] ?? null,
        ])->load(['user', 'category']);
    }

    /** @param  array{amount?: float|string, recurring?: bool}  $data */
    public function updateCost(CollaboratorCost $cost, array $data): CollaboratorCost
    {
        $cost->update(array_intersect_key($data, array_flip(['amount', 'recurring'])));

        return $cost->fresh(['user', 'category']);
    }

    public function deleteCost(CollaboratorCost $cost): void
    {
        $cost->delete();
    }

    /**
     * Relatório mensal consolidado.
     * Inclui: salário base, provisões (13º e férias), benefícios dos colaboradores,
     * comissões pagas no mês e férias concedidas no mês.
     *
     * @return array<int, array{user_id: int, user_name: string, total: float, categories: array<string, float>}>
     */
    public function monthlyReport(?string $month = null): array
    {
        $month ??= now()->format('Y-m');
        $startOfMonth = \Carbon\Carbon::createFromFormat('Y-m-d', $month . '-01')->startOfDay();
        $endOfMonth = $startOfMonth->copy()->endOfMonth()->endOfDay();

        $report = [];

        // 1. Base salary + provisions for all active users
        $users = User::query()->with('benefits')->get();

        foreach ($users as $user) {
            $salary = (float) $user->salary;
            $thirteenth = $salary / 12;
            $vacationProvision = $salary / 12;
            $vacationBonus = ($salary / 12) / 3;

            $report[$user->id] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'total' => 0,
                'categories' => [],
            ];

            $this->addToReport($report, $user->id, 'Salário', $salary);
            $this->addToReport($report, $user->id, 'Provisão 13º', round($thirteenth, 2));
            $this->addToReport($report, $user->id, 'Provisão Férias', round($vacationProvision, 2));
            $this->addToReport($report, $user->id, 'Provisão 1/3 Férias', round($vacationBonus, 2));
        }

        // 2. Benefits (from benefits table)
        foreach ($users as $user) {
            if ($user->benefits->isEmpty()) {
                continue;
            }

            foreach ($user->benefits as $benefit) {
                $this->addToReport($report, $user->id, $benefit->name, (float) $benefit->price);
            }
        }

        // 3. Commissions paid this month
        $paidCommissions = \App\Modules\Commission\Domain\Models\Commission::query()
            ->with('sale.user')
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->get();

        foreach ($paidCommissions as $commission) {
            $userId = $commission->sale->user_id;

            if (! isset($report[$userId])) {
                $report[$userId] = [
                    'user_id' => $userId,
                    'user_name' => $commission->sale->user?->name ?? '—',
                    'total' => 0,
                    'categories' => [],
                ];
            }

            $this->addToReport($report, $userId, 'Comissão', (float) $commission->commission_amount);
        }

        // 4. Vacation grants this month (additional vacation cost: 1/3 of salary over vacation days)
        $grants = \App\Modules\Vacation\Domain\Models\VacationGrant::query()
            ->with('user')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->get();

        foreach ($grants as $grant) {
            $userId = $grant->user_id;

            if (! isset($report[$userId])) {
                $report[$userId] = [
                    'user_id' => $userId,
                    'user_name' => $grant->user?->name ?? '—',
                    'total' => 0,
                    'categories' => [],
                ];
            }

            $this->addToReport($report, $userId, 'Férias concedidas', (float) $grant->days_used);
        }

        // Round totals
        foreach ($report as &$row) {
            $row['total'] = round($row['total'], 2);

            foreach ($row['categories'] as $cat => $val) {
                $row['categories'][$cat] = round($val, 2);
            }
        }

        return array_values($report);
    }

    /** @param  array<int, array<string, mixed>>  $report */
    private function addToReport(array &$report, int $userId, string $category, float $amount): void
    {
        if (! isset($report[$userId]['categories'][$category])) {
            $report[$userId]['categories'][$category] = 0;
        }

        $report[$userId]['categories'][$category] += $amount;
        $report[$userId]['total'] += $amount;
    }
}
