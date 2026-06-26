<?php

namespace App\Modules\Cost\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Cost\Domain\Models\CollaboratorCost;
use App\Modules\Cost\Domain\Models\CostCategory;
use App\Modules\Cost\Domain\Services\CostService;
use App\Modules\Cost\Http\Requests\StoreCostCategoryRequest;
use App\Modules\Cost\Http\Requests\StoreCostRequest;
use App\Modules\Cost\Http\Requests\UpdateCostCategoryRequest;
use App\Modules\Cost\Http\Requests\UpdateCostRequest;
use App\Modules\Cost\Http\Resources\CollaboratorCostResource;
use App\Modules\Cost\Http\Resources\CostCategoryResource;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CostController extends Controller
{
    public function __construct(private readonly CostService $costService) {}

    public function categories(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, CostService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $categories = $this->costService->paginateCategories($sort, $pagination);

        return response()->json([
            'data' => CostCategoryResource::collection($categories->items()),
            'meta' => PaginationMeta::build($categories, $sort),
        ]);
    }

    public function listCategories(): JsonResponse
    {
        return response()->json([
            'data' => CostCategoryResource::collection($this->costService->listCategories()),
        ]);
    }

    public function showCategory(CostCategory $costCategory): JsonResponse
    {
        return response()->json([
            'data' => new CostCategoryResource($costCategory),
        ]);
    }

    public function storeCategory(StoreCostCategoryRequest $request): JsonResponse
    {
        $category = $this->costService->createCategory($request->validated());

        return response()->json([
            'data' => new CostCategoryResource($category),
            'message' => 'Categoria criada com sucesso.',
        ], 201);
    }

    public function updateCategory(UpdateCostCategoryRequest $request, CostCategory $costCategory): JsonResponse
    {
        $category = $this->costService->updateCategory($costCategory, $request->validated());

        return response()->json([
            'data' => new CostCategoryResource($category),
            'message' => 'Categoria atualizada com sucesso.',
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, CostService::COST_SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $userId = $request->query('user_id');
        $costs = $this->costService->paginateCosts($sort, $pagination, $userId ? (int) $userId : null);

        return response()->json([
            'data' => CollaboratorCostResource::collection($costs->items()),
            'meta' => PaginationMeta::build($costs, $sort),
        ]);
    }

    public function show(CollaboratorCost $collaboratorCost): JsonResponse
    {
        return response()->json([
            'data' => new CollaboratorCostResource($this->costService->findCost($collaboratorCost->id)),
        ]);
    }

    public function store(StoreCostRequest $request): JsonResponse
    {
        $cost = $this->costService->createCost($request->validated());

        return response()->json([
            'data' => new CollaboratorCostResource($cost),
            'message' => 'Custo vinculado com sucesso.',
        ], 201);
    }

    public function update(UpdateCostRequest $request, CollaboratorCost $collaboratorCost): JsonResponse
    {
        $cost = $this->costService->updateCost($collaboratorCost, $request->validated());

        return response()->json([
            'data' => new CollaboratorCostResource($cost),
            'message' => 'Custo atualizado com sucesso.',
        ]);
    }

    public function destroy(CollaboratorCost $collaboratorCost): JsonResponse
    {
        $this->costService->deleteCost($collaboratorCost);

        return response()->json(['message' => 'Custo removido com sucesso.']);
    }

    public function report(Request $request): JsonResponse
    {
        $month = $request->query('month');

        return response()->json([
            'data' => $this->costService->monthlyReport($month),
        ]);
    }
}
