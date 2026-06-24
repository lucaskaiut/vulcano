<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Services\PermissionService;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Resources\PermissionResource;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function __construct(private readonly PermissionService $permissionService) {}

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, PermissionService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $permissions = $this->permissionService->paginate($sort, $pagination);

        return response()->json([
            'data' => PermissionResource::collection($permissions->items()),
            'meta' => PaginationMeta::build($permissions, $sort),
        ]);
    }
}
