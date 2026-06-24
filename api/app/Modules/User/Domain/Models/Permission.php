<?php

namespace App\Modules\User\Domain\Models;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'description'])]
class Permission extends Model
{
    /** @param  Builder<Permission>  $query */
    public function scopeSystem(Builder $query): Builder
    {
        return $query->whereIn('slug', PermissionEnum::values());
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
