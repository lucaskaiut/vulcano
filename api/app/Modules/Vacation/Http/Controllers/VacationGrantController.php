<?php

namespace App\Modules\Vacation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\Vacation\Domain\Models\VacationGrant;
use App\Modules\Vacation\Domain\Services\VacationGrantService;
use App\Modules\Vacation\Http\Requests\StoreVacationGrantRequest;
use App\Modules\Vacation\Http\Requests\UpdateVacationGrantRequest;
use App\Modules\Vacation\Http\Resources\VacationGrantResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VacationGrantController extends Controller
{
    public function __construct(private readonly VacationGrantService $vacationGrantService) {}

    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');

        if ($userId) {
            if (! $request->user()->hasPermission(PermissionEnum::VacationGrantsViewAll->value)) {
                $subordinateIds = \App\Modules\User\Domain\Models\User::query()
                    ->where('manager_id', $request->user()->id)
                    ->pluck('id')
                    ->push($request->user()->id)
                    ->unique();

                abort_unless($subordinateIds->contains((int) $userId), 403, 'Acesso negado.');
            }

            return response()->json([
                'data' => VacationGrantResource::collection(
                    $this->vacationGrantService->listForUser((int) $userId),
                ),
            ]);
        }

        return response()->json([
            'data' => VacationGrantResource::collection(
                $this->vacationGrantService->listAll($request->user()),
            ),
        ]);
    }

    public function store(StoreVacationGrantRequest $request): JsonResponse
    {
        $grant = $this->vacationGrantService->create($request->validated());

        return response()->json([
            'data' => new VacationGrantResource($grant),
            'message' => 'Férias concedidas registradas com sucesso.',
        ], 201);
    }

    public function update(UpdateVacationGrantRequest $request, VacationGrant $vacationGrant): JsonResponse
    {
        $grant = $this->vacationGrantService->update($vacationGrant, $request->validated());

        return response()->json([
            'data' => new VacationGrantResource($grant),
            'message' => 'Férias concedidas atualizadas com sucesso.',
        ]);
    }

    public function destroy(VacationGrant $vacationGrant): JsonResponse
    {
        $this->vacationGrantService->delete($vacationGrant);

        return response()->json(['message' => 'Férias concedidas removidas com sucesso.']);
    }
}
