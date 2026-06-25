<?php

namespace Database\Factories;

use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Domain\Enums\WorkflowInstanceStatus;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<WorkflowInstance> */
class WorkflowInstanceFactory extends Factory
{
    protected $model = WorkflowInstance::class;

    public function definition(): array
    {
        return [
            'workflow_type' => WorkflowType::VacationRequest->value,
            'title' => fake()->sentence(3),
            'status' => WorkflowInstanceStatus::InProgress,
            'current_step_id' => null,
            'initiated_by_user_id' => User::factory(),
        ];
    }

    public function forType(WorkflowType $type): static
    {
        return $this->state(fn () => ['workflow_type' => $type->value]);
    }
}
