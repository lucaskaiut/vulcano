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
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MedicalExamController extends Controller
{
    public function __construct(private readonly MedicalExamService $medicalExamService) {}

    public function index(User $user): JsonResponse
    {
        return response()->json([
            'data' => MedicalExamResource::collection($this->medicalExamService->listByUser($user->id)),
        ]);
    }

    public function store(StoreMedicalExamRequest $request, User $user): JsonResponse
    {
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
}
