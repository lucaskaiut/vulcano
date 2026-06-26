<?php

namespace App\Modules\MedicalExam\Domain\Models;

use App\Modules\User\Domain\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'exam_type', 'execution_date', 'expiration_date', 'notes'])]
class MedicalExam extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'execution_date' => 'date',
            'expiration_date' => 'date',
        ];
    }
}
