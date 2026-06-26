<?php

namespace App\Modules\Cost\Domain\Services;

use App\Modules\Cost\Domain\Models\CollaboratorCost;
use App\Modules\Cost\Domain\Models\CostCategory;
use Illuminate\Database\Eloquent\Collection;

class CostService
{
    /** @return Collection<int, CostCategory> */
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

    /** @return Collection<int, CollaboratorCost> */
    public function listCosts(?int $userId = null): Collection
    {
        $query = CollaboratorCost::query()
            ->with(['user', 'category'])
            ->orderBy('created_at', 'desc');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->get();
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

    /** @return array<int, array{user_id: int, user_name: string, total: float, categories: array}> */
    public function monthlyReport(?string $month = null): array
    {
        $month ??= now()->format('Y-m');

        $costs = CollaboratorCost::query()
            ->with(['user', 'category'])
            ->where(function ($query) use ($month) {
                $query->where('recurring', true)
                    ->orWhere('reference_month', $month);
            })
            ->get();

        $report = [];

        foreach ($costs as $cost) {
            $userId = $cost->user_id;

            if (! isset($report[$userId])) {
                $report[$userId] = [
                    'user_id' => $userId,
                    'user_name' => $cost->user?->name ?? '—',
                    'total' => 0,
                    'categories' => [],
                ];
            }

            $catName = $cost->category?->name ?? '—';

            if (! isset($report[$userId]['categories'][$catName])) {
                $report[$userId]['categories'][$catName] = 0;
            }

            $amount = (float) $cost->amount;
            $report[$userId]['categories'][$catName] += $amount;
            $report[$userId]['total'] += $amount;
        }

        return array_values($report);
    }
}
