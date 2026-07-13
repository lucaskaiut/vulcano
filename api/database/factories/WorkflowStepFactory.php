<?php

namespace Database\Factories;

use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WorkflowStep> */
class WorkflowStepFactory extends Factory
{
    protected $model = WorkflowStep::class;

    public function definition(): array
    {
        return [
            'workflow_type' => WorkflowType::VacationRequest->value,
            'name' => fake()->jobTitle(),
            'order' => 1,
            'visibility_rules' => null,
            'approval_rules' => null,
        ];
    }

    public function forType(WorkflowType $type): static
    {
        return $this->state(fn () => ['workflow_type' => $type->value]);
    }
}
