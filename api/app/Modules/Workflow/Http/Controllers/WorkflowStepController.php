<?php

namespace App\Modules\Workflow\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Workflow\Domain\Enums\WorkflowType;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use App\Modules\Workflow\Domain\Services\WorkflowStepService;
use App\Modules\Workflow\Http\Requests\ReorderWorkflowStepRequest;
use App\Modules\Workflow\Http\Requests\StoreWorkflowStepRequest;
use App\Modules\Workflow\Http\Requests\UpdateWorkflowStepRequest;
use App\Modules\Workflow\Http\Resources\WorkflowStepResource;
use Illuminate\Http\JsonResponse;

class WorkflowStepController extends Controller
{
    public function __construct(private readonly WorkflowStepService $workflowStepService) {}

    public function index(string $type): JsonResponse
    {
        return response()->json([
            'data' => WorkflowStepResource::collection(
                $this->workflowStepService->listByType(WorkflowType::from($type)),
            ),
        ]);
    }

    public function store(StoreWorkflowStepRequest $request, string $type): JsonResponse
    {
        $step = $this->workflowStepService->create(
            WorkflowType::from($type),
            $request->validated(),
        );

        return response()->json([
            'data' => new WorkflowStepResource($step),
            'message' => 'Etapa adicionada com sucesso.',
        ], 201);
    }

    public function update(UpdateWorkflowStepRequest $request, WorkflowStep $workflowStep): JsonResponse
    {
        $step = $this->workflowStepService->update($workflowStep, $request->validated());

        return response()->json([
            'data' => new WorkflowStepResource($step),
            'message' => 'Etapa atualizada com sucesso.',
        ]);
    }

    public function destroy(WorkflowStep $workflowStep): JsonResponse
    {
        $this->workflowStepService->delete($workflowStep);

        return response()->json([
            'message' => 'Etapa removida com sucesso.',
        ]);
    }

    public function reorder(ReorderWorkflowStepRequest $request, WorkflowStep $workflowStep): JsonResponse
    {
        $step = $this->workflowStepService->reorder(
            $workflowStep,
            $request->validated('order'),
        );

        return response()->json([
            'data' => new WorkflowStepResource($workflowStep->fresh(['responsibleRole', 'responsibleUser'])),
            'message' => 'Etapa reordenada com sucesso.',
        ]);
    }
}
