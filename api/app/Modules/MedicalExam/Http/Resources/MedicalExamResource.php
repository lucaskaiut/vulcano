<?php

namespace App\Modules\MedicalExam\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\MedicalExam\Domain\Models\MedicalExam */
class MedicalExamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'exam_type' => $this->exam_type,
            'execution_date' => $this->execution_date->format('Y-m-d'),
            'expiration_date' => $this->expiration_date->format('Y-m-d'),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
