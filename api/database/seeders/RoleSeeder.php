<?php

namespace Database\Seeders;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
use App\Modules\User\Domain\Models\Permission;
use App\Modules\User\Domain\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /** @return list<array{name: string, description: string, permission_slugs?: list<string>}> */
    public static function definitions(): array
    {
        return [
            [
                'name' => 'Administrador',
                'description' => 'Acesso total ao sistema',
                'permission_slugs' => ['*'],
            ],
            [
                'name' => 'RH',
                'description' => 'Recursos Humanos',
                'permission_slugs' => [
                    PermissionEnum::UsersView->value,
                    PermissionEnum::UsersCreate->value,
                    PermissionEnum::UsersUpdate->value,
                    PermissionEnum::VacationBalancesView->value,
                    PermissionEnum::VacationBalancesCreate->value,
                    PermissionEnum::VacationBalancesUpdate->value,
                    PermissionEnum::VacationGrantsView->value,
                    PermissionEnum::VacationGrantsCreate->value,
                    PermissionEnum::VacationPeriodsView->value,
                    PermissionEnum::VacationPeriodsCreate->value,
                    PermissionEnum::VacationPeriodsClose->value,
                ],
            ],
            [
                'name' => 'Financeiro',
                'description' => 'Equipe financeira',
            ],
            [
                'name' => 'Gestor',
                'description' => 'Gestão de equipe',
            ],
            [
                'name' => 'Controlador',
                'description' => 'Controle operacional',
            ],
            [
                'name' => 'Colaborador',
                'description' => 'Colaborador PJ',
            ],
        ];
    }

    public function run(): void
    {
        $allPermissions = Permission::query()->pluck('id', 'slug');

        foreach (self::definitions() as $definition) {
            $role = Role::query()->updateOrCreate(
                ['name' => $definition['name']],
                [
                    'description' => $definition['description'],
                ],
            );

            $permissionSlugs = $definition['permission_slugs'] ?? [];

            if ($permissionSlugs === ['*']) {
                $role->permissions()->sync($allPermissions->values());
                continue;
            }

            $permissionIds = collect($permissionSlugs)
                ->filter(fn (string $slug) => $allPermissions->has($slug))
                ->map(fn (string $slug) => $allPermissions->get($slug))
                ->values()
                ->all();

            $role->permissions()->sync($permissionIds);
        }
    }
}
