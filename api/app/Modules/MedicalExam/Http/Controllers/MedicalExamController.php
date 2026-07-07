<?php

namespace App\Modules\MedicalExam\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use App\Modules\MedicalExam\Domain\Services\MedicalExamService;
use App\Modules\MedicalExam\Http\Requests\StoreMedicalExamRequest;
use App\Modules\MedicalExam\Http\Requests\UpdateMedicalExamRequest;
use App\Modules\MedicalExam\Http\Resources\MedicalExamResource;
use App\Modules\User\Domain\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\User;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MedicalExamController extends Controller
{
    public function __construct(private readonly MedicalExamService $medicalExamService) {}

    public function index(Request $request, User $user): JsonResponse
    {
        $this->ensureCanAccessUser($request->user(), $user, PermissionEnum::MedicalExamsViewAll->value);

        return response()->json([
            'data' => MedicalExamResource::collection($this->medicalExamService->listByUser($user->id)),
        ]);
    }

    public function indexAll(Request $request): JsonResponse
    {
        return response()->json([
            'data' => MedicalExamResource::collection($this->medicalExamService->listAll($request->user())),
        ]);
    }

    public function store(StoreMedicalExamRequest $request, User $user): JsonResponse
    {
        $this->ensureCanAccessUser($request->user(), $user, PermissionEnum::MedicalExamsViewAll->value);

        $exam = $this->medicalExamService->create($user->id, $request->validated(), $request->file('file'));

        return response()->json([
            'data' => new MedicalExamResource($exam),
            'message' => 'Exame registrado com sucesso.',
        ], 201);
    }

    public function update(UpdateMedicalExamRequest $request, MedicalExam $medicalExam): JsonResponse
    {
        $exam = $this->medicalExamService->update($medicalExam, $request->validated(), $request->file('file'));

        return response()->json([
            'data' => new MedicalExamResource($exam),
            'message' => 'Exame atualizado com sucesso.',
        ]);
    }

    public function destroy(MedicalExam $medicalExam): JsonResponse
    {
        $this->medicalExamService->delete($medicalExam);

        return response()->json(['message' => 'Exame removido com sucesso.']);
    }

    public function download(MedicalExam $medicalExam): BinaryFileResponse
    {
        return response()->download(
            $this->medicalExamService->getDownloadPath($medicalExam),
            $medicalExam->original_name,
        );
    }

    private function ensureCanAccessUser(User $authUser, User $targetUser, string $viewAllPermission): void
    {
        if ($authUser->id === $targetUser->id) {
            return;
        }

        if ($authUser->hasPermission($viewAllPermission)) {
            return;
        }

        $isSubordinate = User::query()
            ->where('id', $targetUser->id)
            ->where('manager_id', $authUser->id)
            ->exists();

        abort_unless($isSubordinate, 403, 'Acesso negado.');
    }
}
