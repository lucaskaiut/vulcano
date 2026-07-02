<?php

namespace App\Modules\User\Domain\Models;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Notifications\ResetPasswordNotification;
use App\Modules\Audit\Domain\Traits\Auditable;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;

#[Fillable(['name', 'job_title', 'hired_at', 'manager_id', 'sector_id', 'salary', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, Auditable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'hired_at' => 'date',
            'salary' => 'decimal:2',
            'password' => 'hashed',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function preference(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function salaryHistories(): HasMany
    {
        return $this->hasMany(SalaryHistory::class);
    }

    /** @return array<string, mixed> */
    public function getPreferences(): array
    {
        return $this->preference?->data ?? [];
    }

    public function hasPermission(string $slug): bool
    {
        return $this->roles()
            ->whereJsonContains('permissions', $slug)
            ->exists();
    }

    /** @param  list<string>  $slugs */
    public function hasAnyPermission(array $slugs): bool
    {
        foreach ($slugs as $slug) {
            if ($this->hasPermission($slug)) {
                return true;
            }
        }

        return false;
    }

    /** @return Collection<int, array{name: string, slug: string}> */
    public function getAllPermissionSlugs(): Collection
    {
        $this->loadMissing('roles');

        return $this->roles
            ->filter(fn (Role $role) => is_array($role->permissions))
            ->flatMap(fn (Role $role) => $role->permissions)
            ->filter(fn (string $slug) => in_array($slug, PermissionEnum::values(), true))
            ->unique()
            ->values();
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }
}
