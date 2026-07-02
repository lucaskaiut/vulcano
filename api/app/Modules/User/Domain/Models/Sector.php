<?php

namespace App\Modules\User\Domain\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Sector extends Model
{
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
