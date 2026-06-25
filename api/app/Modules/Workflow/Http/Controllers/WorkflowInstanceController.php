<?php

namespace App\Modules\Workflow\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Services\WorkflowInstanceService;
use App\Modules\Workflow\Http\Requests\StoreWorkflowInstanceRequest;
use App\Modules\Workflow\Http\Requests\WorkflowActionRequest;
use App\Modules\Workflow\Http\Resources\WorkflowInstanceResource;
use Illuminate\Http\JsonResponse;

class WorkflowInstanceController extends Controller
{
    public function __construct(private readonly WorkflowInstanceService $workflowInstanceService) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => WorkflowInstanceResource::collection(
                $this->workflowInstanceService->list(request()->user()),
            ),
        ]);
    }

    public function store(StoreWorkflowInstanceRequest $request): JsonResponse
    {
        $instance = $this->workflowInstanceService->start(
            $request->user(),
            $request->validated(),
        );

        return response()->json([
            'data' => new WorkflowInstanceResource($instance),
            'message' => 'Processo iniciado com sucesso.',
        ], 201);
    }

    public function show(WorkflowInstance $workflowInstance): JsonResponse
    {
        return response()->json([
            'data' => new WorkflowInstanceResource(
                $this->workflowInstanceService->find($workflowInstance->id),
            ),
        ]);
    }

    public function approve(WorkflowActionRequest $request, WorkflowInstance $workflowInstance): JsonResponse
    {
        $instance = $this->workflowInstanceService->approve(
            $workflowInstance,
            $request->user(),
            $request->validated('notes'),
        );

        return response()->json([
            'data' => new WorkflowInstanceResource($instance),
            'message' => 'Etapa aprovada com sucesso.',
        ]);
    }

    public function reject(WorkflowActionRequest $request, WorkflowInstance $workflowInstance): JsonResponse
    {
        $instance = $this->workflowInstanceService->reject(
            $workflowInstance,
            $request->user(),
            $request->validated('notes'),
        );

        return response()->json([
            'data' => new WorkflowInstanceResource($instance),
            'message' => 'Processo reprovado.',
        ]);
    }

    public function cancel(WorkflowActionRequest $request, WorkflowInstance $workflowInstance): JsonResponse
    {
        $instance = $this->workflowInstanceService->cancel(
            $workflowInstance,
            $request->user(),
            $request->validated('notes'),
        );

        return response()->json([
            'data' => new WorkflowInstanceResource($instance),
            'message' => 'Processo cancelado.',
        ]);
    }
}
