<?php

namespace App\Modules\Document\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\Audit\Domain\Traits\Auditable;

#[Fillable(['name', 'expiration_required'])]
class DocumentType extends Model
{
    use Auditable;
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    protected function casts(): array
    {
        return [
            'expiration_required' => 'boolean',
        ];
    }
}
