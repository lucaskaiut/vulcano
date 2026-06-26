<?php

namespace Database\Seeders;

use App\Modules\User\Domain\Enums\Permission as PermissionEnum;
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
                'permission_slugs' => PermissionEnum::values(),
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
                    PermissionEnum::VacationRequestsView->value,
                    PermissionEnum::VacationRequestsCreate->value,
                    PermissionEnum::VacationRequestsCancel->value,
                    PermissionEnum::VacationRequestsViewAll->value,
                    PermissionEnum::VacationRequestsApprove->value,
                    PermissionEnum::VacationRequestsReject->value,
                    PermissionEnum::WorkflowStepsView->value,
                    PermissionEnum::WorkflowStepsCreate->value,
                    PermissionEnum::WorkflowStepsUpdate->value,
                    PermissionEnum::WorkflowStepsDelete->value,
                    PermissionEnum::WorkflowInstancesView->value,
                    PermissionEnum::WorkflowInstancesViewAll->value,
                    PermissionEnum::WorkflowInstancesApprove->value,
                    PermissionEnum::WorkflowInstancesReject->value,
                    PermissionEnum::CostsView->value,
                    PermissionEnum::CostsCreate->value,
                    PermissionEnum::CostsUpdate->value,
                    PermissionEnum::CostsDelete->value,
                    PermissionEnum::DocumentsView->value,
                    PermissionEnum::DocumentsCreate->value,
                    PermissionEnum::DocumentsDelete->value,
                    PermissionEnum::InvoicesView->value,
                    PermissionEnum::InvoicesCreate->value,
                    PermissionEnum::InvoicesViewAll->value,
                    PermissionEnum::InvoicesApprove->value,
                    PermissionEnum::InvoicesReject->value,
                    PermissionEnum::MedicalExamsView->value,
                    PermissionEnum::MedicalExamsCreate->value,
                    PermissionEnum::MedicalExamsUpdate->value,
                    PermissionEnum::MedicalExamsDelete->value,
                    PermissionEnum::NotificationsView->value,
                    PermissionEnum::AuditView->value,
                ],
            ],
            [
                'name' => 'Financeiro',
                'description' => 'Equipe financeira',
                'permission_slugs' => [
                    PermissionEnum::CommissionsView->value,
                    PermissionEnum::CommissionsPay->value,
                    PermissionEnum::CommissionsViewAll->value,
                    PermissionEnum::CommissionsApprove->value,
                    PermissionEnum::CommissionsReject->value,
                    PermissionEnum::WorkflowInstancesView->value,
                    PermissionEnum::CostsView->value,
                    PermissionEnum::CostsCreate->value,
                    PermissionEnum::CostsUpdate->value,
                    PermissionEnum::CostsDelete->value,
                ],
            ],
            [
                'name' => 'Gestor',
                'description' => 'Gestão de equipe',
                'permission_slugs' => [
                    PermissionEnum::WorkflowStepsView->value,
                    PermissionEnum::WorkflowInstancesView->value,
                    PermissionEnum::VacationRequestsView->value,
                    PermissionEnum::VacationRequestsApprove->value,
                    PermissionEnum::VacationRequestsReject->value,
                ],
            ],
            [
                'name' => 'Controlador',
                'description' => 'Controle operacional',
            ],
            [
                'name' => 'Colaborador',
                'description' => 'Colaborador PJ',
                'permission_slugs' => [
                    PermissionEnum::WorkflowStepsView->value,
                    PermissionEnum::VacationRequestsView->value,
                    PermissionEnum::VacationRequestsCreate->value,
                    PermissionEnum::VacationRequestsCancel->value,
                    PermissionEnum::DocumentsView->value,
                    PermissionEnum::InvoicesView->value,
                    PermissionEnum::InvoicesCreate->value,
                    PermissionEnum::MedicalExamsView->value,
                    PermissionEnum::NotificationsView->value,
                ],
            ],
        ];
    }

    public function run(): void
    {
        foreach (self::definitions() as $definition) {
            Role::query()->updateOrCreate(
                ['name' => $definition['name']],
                [
                    'description' => $definition['description'],
                    'permissions' => $definition['permission_slugs'] ?? null,
                ],
            );
        }
    }
}
