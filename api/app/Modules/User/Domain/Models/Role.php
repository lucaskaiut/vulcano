<?php

namespace App\Modules\User\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Modules\Audit\Domain\Traits\Auditable;

#[Fillable(['name', 'description', 'permissions'])]
class Role extends Model
{
    use Auditable;
    protected function casts(): array
    {
        return [
            'permissions' => 'array',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
