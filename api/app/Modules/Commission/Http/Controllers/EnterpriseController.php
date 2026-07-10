<?php

namespace App\Modules\Commission\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Commission\Domain\Models\Enterprise;
use App\Modules\Commission\Domain\Services\EnterpriseService;
use App\Modules\Commission\Http\Requests\StoreEnterpriseRequest;
use App\Modules\Commission\Http\Requests\UpdateEnterpriseRequest;
use App\Modules\Commission\Http\Resources\EnterpriseResource;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnterpriseController extends Controller
{
    public function __construct(private readonly EnterpriseService $enterpriseService) {}

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, EnterpriseService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $enterprises = $this->enterpriseService->paginate($sort, $pagination);

        return response()->json([
            'data' => EnterpriseResource::collection($enterprises->items()),
            'meta' => PaginationMeta::build($enterprises, $sort),
        ]);
    }

    public function list(): JsonResponse
    {
        return response()->json([
            'data' => EnterpriseResource::collection($this->enterpriseService->list()),
        ]);
    }

    public function show(Enterprise $enterprise): JsonResponse
    {
        return response()->json([
            'data' => new EnterpriseResource($enterprise),
        ]);
    }

    public function store(StoreEnterpriseRequest $request): JsonResponse
    {
        $enterprise = $this->enterpriseService->create($request->validated());

        return response()->json([
            'data' => new EnterpriseResource($enterprise),
            'message' => 'Empreendimento criado com sucesso.',
        ], 201);
    }

    public function update(UpdateEnterpriseRequest $request, Enterprise $enterprise): JsonResponse
    {
        $enterprise = $this->enterpriseService->update($enterprise, $request->validated());

        return response()->json([
            'data' => new EnterpriseResource($enterprise),
            'message' => 'Empreendimento atualizado com sucesso.',
        ]);
    }

    public function destroy(Enterprise $enterprise): JsonResponse
    {
        $this->enterpriseService->delete($enterprise);

        return response()->json([
            'message' => 'Empreendimento excluído com sucesso.',
        ]);
    }
}
