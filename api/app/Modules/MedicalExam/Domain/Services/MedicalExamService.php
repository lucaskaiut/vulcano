<?php

namespace App\Modules\MedicalExam\Domain\Services;

use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use Illuminate\Database\Eloquent\Collection;

class MedicalExamService
{
    /** @return Collection<int, MedicalExam> */
    public function listByUser(int $userId): Collection
    {
        return MedicalExam::query()
            ->where('user_id', $userId)
            ->orderBy('expiration_date', 'desc')
            ->get();
    }

    /** @param  array{exam_type: string, execution_date: string, expiration_date: string, notes?: string|null}  $data */
    public function create(int $userId, array $data): MedicalExam
    {
        return MedicalExam::query()->create([
            'user_id' => $userId,
            'exam_type' => $data['exam_type'],
            'execution_date' => $data['execution_date'],
            'expiration_date' => $data['expiration_date'],
            'notes' => $data['notes'] ?? null,
        ]);
    }

    /** @param  array{exam_type?: string, execution_date?: string, expiration_date?: string, notes?: string|null}  $data */
    public function update(MedicalExam $exam, array $data): MedicalExam
    {
        $exam->update(array_intersect_key($data, array_flip(['exam_type', 'execution_date', 'expiration_date', 'notes'])));

        return $exam->fresh();
    }

    public function delete(MedicalExam $exam): void
    {
        $exam->delete();
    }
}
