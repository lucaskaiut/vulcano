<?php

namespace App\Modules\User\Domain\Enums;

enum Permission: string
{
    case UsersView = 'users.view';
    case UsersCreate = 'users.create';
    case UsersUpdate = 'users.update';
    case UsersDelete = 'users.delete';
    case RolesView = 'roles.view';
    case RolesCreate = 'roles.create';
    case RolesUpdate = 'roles.update';
    case RolesDelete = 'roles.delete';
    case WorkflowsView = 'workflows.view';
    case WorkflowsCreate = 'workflows.create';
    case WorkflowsUpdate = 'workflows.update';
    case WorkflowInstancesView = 'workflow_instances.view';
    case WorkflowInstancesCreate = 'workflow_instances.create';
    case WorkflowInstancesApprove = 'workflow_instances.approve';
    case WorkflowInstancesReject = 'workflow_instances.reject';
    case WorkflowInstancesCancel = 'workflow_instances.cancel';

    public function label(): string
    {
        return match ($this) {
            self::UsersView => 'Visualizar Colaboradores',
            self::UsersCreate => 'Criar Colaboradores',
            self::UsersUpdate => 'Atualizar Colaboradores',
            self::UsersDelete => 'Excluir Colaboradores',
            self::RolesView => 'Visualizar Perfis',
            self::RolesCreate => 'Criar Perfis',
            self::RolesUpdate => 'Atualizar Perfis',
            self::RolesDelete => 'Excluir Perfis',
            self::WorkflowsView => 'Visualizar Fluxos',
            self::WorkflowsCreate => 'Criar Fluxos',
            self::WorkflowsUpdate => 'Atualizar Fluxos',
            self::WorkflowInstancesView => 'Visualizar Processos',
            self::WorkflowInstancesCreate => 'Iniciar Processos',
            self::WorkflowInstancesApprove => 'Aprovar Processos',
            self::WorkflowInstancesReject => 'Reprovar Processos',
            self::WorkflowInstancesCancel => 'Cancelar Processos',
        };
    }

    public function description(): string
    {
        return $this->label();
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** @return list<array{name: string, slug: string, description: string}> */
    public static function seedDefinitions(): array
    {
        return array_map(
            fn (self $permission) => [
                'name' => $permission->label(),
                'slug' => $permission->value,
                'description' => $permission->description(),
            ],
            self::cases(),
        );
    }
}
