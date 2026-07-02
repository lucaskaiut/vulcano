<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Models\Sector;
use App\Modules\User\Domain\Services\SectorService;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Requests\StoreSectorRequest;
use App\Modules\User\Http\Requests\UpdateSectorRequest;
use App\Modules\User\Http\Resources\SectorResource;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectorController extends Controller
{
    public function __construct(private readonly SectorService $sectorService) {}

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, SectorService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $sectors = $this->sectorService->paginate($sort, $pagination);

        return response()->json([
            'data' => SectorResource::collection($sectors->items()),
            'meta' => PaginationMeta::build($sectors, $sort),
        ]);
    }

    public function list(): JsonResponse
    {
        return response()->json([
            'data' => SectorResource::collection($this->sectorService->list()),
        ]);
    }

    public function show(Sector $sector): JsonResponse
    {
        return response()->json([
            'data' => new SectorResource($sector),
        ]);
    }

    public function store(StoreSectorRequest $request): JsonResponse
    {
        $sector = $this->sectorService->create($request->validated());

        return response()->json([
            'data' => new SectorResource($sector),
            'message' => 'Setor criado com sucesso.',
        ], 201);
    }

    public function update(UpdateSectorRequest $request, Sector $sector): JsonResponse
    {
        $sector = $this->sectorService->update($sector, $request->validated());

        return response()->json([
            'data' => new SectorResource($sector),
            'message' => 'Setor atualizado com sucesso.',
        ]);
    }
}
