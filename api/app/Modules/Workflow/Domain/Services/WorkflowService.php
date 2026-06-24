<?php

namespace App\Modules\Workflow\Domain\Services;

use App\Modules\Workflow\Domain\Models\Workflow;
use Illuminate\Database\Eloquent\Collection;

class WorkflowService
{
    /** @return Collection<int, Workflow> */
    public function list(): Collection
    {
        return Workflow::query()
            ->with(['steps.responsibleRole', 'steps.responsibleUser'])
            ->orderBy('name')
            ->get();
    }

    public function find(int $id): Workflow
    {
        return Workflow::query()
            ->with(['steps.responsibleRole', 'steps.responsibleUser'])
            ->findOrFail($id);
    }

    /** @param  array{name: string, description?: string|null, is_active?: bool}  $data */
    public function create(array $data): Workflow
    {
        return Workflow::query()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ])->load(['steps.responsibleRole', 'steps.responsibleUser']);
    }

    /** @param  array{name?: string, description?: string|null, is_active?: bool}  $data */
    public function update(Workflow $workflow, array $data): Workflow
    {
        $attributes = [];

        foreach (['name', 'description', 'is_active'] as $field) {
            if (array_key_exists($field, $data)) {
                $attributes[$field] = $data[$field];
            }
        }

        if ($attributes !== []) {
            $workflow->update($attributes);
        }

        return $workflow->fresh(['steps.responsibleRole', 'steps.responsibleUser']);
    }
}
