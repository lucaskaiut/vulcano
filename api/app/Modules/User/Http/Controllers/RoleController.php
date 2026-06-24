<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Services\RoleService;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Requests\StoreRoleRequest;
use App\Modules\User\Http\Requests\UpdateRoleRequest;
use App\Modules\User\Http\Resources\RoleResource;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(private readonly RoleService $roleService) {}

    public function index(Request $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, RoleService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $roles = $this->roleService->paginate($sort, $pagination);

        return response()->json([
            'data' => RoleResource::collection($roles->items()),
            'meta' => PaginationMeta::build($roles, $sort),
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return response()->json([
            'data' => new RoleResource($role),
            'message' => 'Perfil criado com sucesso.',
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'data' => new RoleResource($this->roleService->find($role->id)),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $updatedRole = $this->roleService->update($role, $request->validated());

        return response()->json([
            'data' => new RoleResource($updatedRole),
            'message' => 'Perfil atualizado com sucesso.',
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->roleService->delete($role);

        return response()->json([
            'message' => 'Perfil excluído com sucesso.',
        ]);
    }
}
