<?php

namespace App\Modules\Workflow\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Workflow\Domain\Models\Workflow;
use App\Modules\Workflow\Domain\Services\WorkflowService;
use App\Modules\Workflow\Http\Requests\StoreWorkflowRequest;
use App\Modules\Workflow\Http\Requests\UpdateWorkflowRequest;
use App\Modules\Workflow\Http\Resources\WorkflowResource;
use Illuminate\Http\JsonResponse;

class WorkflowController extends Controller
{
    public function __construct(private readonly WorkflowService $workflowService) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => WorkflowResource::collection($this->workflowService->list()),
        ]);
    }

    public function store(StoreWorkflowRequest $request): JsonResponse
    {
        $workflow = $this->workflowService->create($request->validated());

        return response()->json([
            'data' => new WorkflowResource($workflow),
            'message' => 'Fluxo criado com sucesso.',
        ], 201);
    }

    public function show(Workflow $workflow): JsonResponse
    {
        return response()->json([
            'data' => new WorkflowResource(
                $this->workflowService->find($workflow->id),
            ),
        ]);
    }

    public function update(UpdateWorkflowRequest $request, Workflow $workflow): JsonResponse
    {
        $workflow = $this->workflowService->update($workflow, $request->validated());

        return response()->json([
            'data' => new WorkflowResource($workflow),
            'message' => 'Fluxo atualizado com sucesso.',
        ]);
    }
}
