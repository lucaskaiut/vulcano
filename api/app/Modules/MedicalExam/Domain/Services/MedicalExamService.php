<?php

namespace App\Modules\MedicalExam\Domain\Services;

use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

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
    public function create(int $userId, array $data, ?UploadedFile $file = null): MedicalExam
    {
        $attributes = [
            'user_id' => $userId,
            'exam_type' => $data['exam_type'],
            'execution_date' => $data['execution_date'],
            'expiration_date' => $data['expiration_date'],
            'notes' => $data['notes'] ?? null,
        ];

        if ($file) {
            $attributes['original_name'] = $file->getClientOriginalName();
            $attributes['stored_name'] = $file->store('medical-exams', 'local');
            $attributes['mime_type'] = $file->getMimeType();
            $attributes['size'] = $file->getSize();
        }

        return MedicalExam::query()->create($attributes);
    }

    /** @param  array{exam_type?: string, execution_date?: string, expiration_date?: string, notes?: string|null}  $data */
    public function update(MedicalExam $exam, array $data, ?UploadedFile $file = null): MedicalExam
    {
        $exam->update(array_intersect_key($data, array_flip(['exam_type', 'execution_date', 'expiration_date', 'notes'])));

        if ($file) {
            if ($exam->stored_name) {
                Storage::disk('local')->delete($exam->stored_name);
            }

            $exam->update([
                'original_name' => $file->getClientOriginalName(),
                'stored_name' => $file->store('medical-exams', 'local'),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);
        }

        return $exam->fresh();
    }

    public function delete(MedicalExam $exam): void
    {
        if ($exam->stored_name) {
            Storage::disk('local')->delete($exam->stored_name);
        }

        $exam->delete();
    }

    public function getDownloadPath(MedicalExam $exam): string
    {
        return Storage::disk('local')->path($exam->stored_name);
    }
}
