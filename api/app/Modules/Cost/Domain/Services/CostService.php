<?php

namespace App\Modules\Cost\Domain\Services;

use App\Modules\Cost\Domain\Models\CollaboratorCost;
use App\Modules\Cost\Domain\Models\CostCategory;
use App\Modules\Cost\Domain\Models\ProvisionRule;
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
     * Inclui: salário base, provisões configuráveis, benefícios dos colaboradores
     * e comissões pagas no mês.
     *
     * @return array{data: array<int, array{user_id: int, user_name: string, total: float, categories: array<string, float>}>, groups: array<string, string>}
     */
    public function monthlyReport(?string $month = null): array
    {
        $month ??= now()->format('Y-m');
        $startOfMonth = \Carbon\Carbon::createFromFormat('Y-m-d', $month . '-01')->startOfDay();
        $endOfMonth = $startOfMonth->copy()->endOfMonth()->endOfDay();

        $report = [];
        $groups = [];

        // 1. Base salary + provisions for all users
        $users = User::query()->with('benefits')->get();
        $provisionRules = ProvisionRule::query()->where('active', true)->get();

        $groups['Salário'] = 'salary';
        foreach ($provisionRules as $rule) {
            $groups[$rule->name] = 'provision';
        }

        foreach ($users as $user) {
            $salary = (float) $user->salary;

            $report[$user->id] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'total' => 0,
                'categories' => [],
            ];

            $this->addToReport($report, $user->id, 'Salário', $salary);

            foreach ($provisionRules as $rule) {
                $value = round($salary * (float) $rule->percentage / 100, 2);
                $this->addToReport($report, $user->id, $rule->name, $value);
            }
        }

        // 2. Benefits (from benefits table)
        foreach ($users as $user) {
            if ($user->benefits->isEmpty()) {
                continue;
            }

            foreach ($user->benefits as $benefit) {
                $groups[$benefit->name] = 'benefit';
                $this->addToReport($report, $user->id, $benefit->name, (float) $benefit->price);
            }
        }

        // 3. Commissions paid this month
        $paidCommissions = \App\Modules\Commission\Domain\Models\Commission::query()
            ->with('sale.user')
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->get();

        $groups['Comissão'] = 'commission';

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

        // Round totals
        foreach ($report as &$row) {
            $row['total'] = round($row['total'], 2);

            foreach ($row['categories'] as $cat => $val) {
                $row['categories'][$cat] = round($val, 2);
            }
        }

        return [
            'data' => array_values($report),
            'groups' => $groups,
        ];
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
