<?php

namespace App\Modules\User\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Models\User;
use App\Modules\User\Domain\Support\FilterQuery;
use App\Modules\User\Domain\Support\UserFilterRegistry;
use App\Modules\User\Domain\Services\UserService;
use App\Modules\User\Domain\Support\PaginationQuery;
use App\Modules\User\Domain\Support\SortQuery;
use App\Modules\User\Http\Requests\IndexUserRequest;
use App\Modules\User\Http\Requests\StoreUserRequest;
use App\Modules\User\Http\Requests\UpdateUserRequest;
use App\Modules\User\Http\Resources\UserResource;
use App\Modules\User\Http\Support\PaginationMeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private readonly UserService $userService) {}

    public function index(IndexUserRequest $request): JsonResponse
    {
        $sort = SortQuery::fromRequest($request, UserService::SORTABLE_COLUMNS);
        $pagination = PaginationQuery::fromRequest($request);
        $filters = FilterQuery::fromValues($request->validated(), UserFilterRegistry::definitions());
        $users = $this->userService->paginate($sort, $pagination, $filters);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => PaginationMeta::build($users, $sort, $filters),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated(), $request->user());

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Colaborador criado com sucesso.',
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($this->userService->find($user->id)),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $updatedUser = $this->userService->update($user, $request->validated());

        return response()->json([
            'data' => new UserResource($updatedUser),
            'message' => 'Colaborador atualizado com sucesso.',
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->userService->delete($user, $request->user());

        return response()->json([
            'message' => 'Colaborador excluído com sucesso.',
        ]);
    }
}
