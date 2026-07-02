<?php

namespace App\Modules\Cost\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Cost\Domain\Models\ProvisionRule;
use App\Modules\Cost\Domain\Services\ProvisionRuleService;
use App\Modules\Cost\Http\Requests\StoreProvisionRuleRequest;
use App\Modules\Cost\Http\Requests\UpdateProvisionRuleRequest;
use App\Modules\Cost\Http\Resources\ProvisionRuleResource;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProvisionRuleController extends Controller
{
    public function __construct(private readonly ProvisionRuleService $provisionRuleService) {}

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, ProvisionRuleService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $rules = $this->provisionRuleService->paginate($sort, $pagination);

        return response()->json([
            'data' => ProvisionRuleResource::collection($rules->items()),
            'meta' => PaginationMeta::build($rules, $sort),
        ]);
    }

    public function list(): JsonResponse
    {
        return response()->json([
            'data' => ProvisionRuleResource::collection($this->provisionRuleService->list()),
        ]);
    }

    public function show(ProvisionRule $provisionRule): JsonResponse
    {
        return response()->json([
            'data' => new ProvisionRuleResource($provisionRule),
        ]);
    }

    public function store(StoreProvisionRuleRequest $request): JsonResponse
    {
        $rule = $this->provisionRuleService->create($request->validated());

        return response()->json([
            'data' => new ProvisionRuleResource($rule),
            'message' => 'Provisão criada com sucesso.',
        ], 201);
    }

    public function update(UpdateProvisionRuleRequest $request, ProvisionRule $provisionRule): JsonResponse
    {
        $rule = $this->provisionRuleService->update($provisionRule, $request->validated());

        return response()->json([
            'data' => new ProvisionRuleResource($rule),
            'message' => 'Provisão atualizada com sucesso.',
        ]);
    }
}
