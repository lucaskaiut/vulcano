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
    case WorkflowStepsView = 'workflow_steps.view';
    case WorkflowStepsCreate = 'workflow_steps.create';
    case WorkflowStepsUpdate = 'workflow_steps.update';
    case WorkflowStepsDelete = 'workflow_steps.delete';
    case WorkflowInstancesView = 'workflow_instances.view';
    case WorkflowInstancesViewAll = 'workflow_instances.view_all';
    case WorkflowInstancesCreate = 'workflow_instances.create';
    case WorkflowInstancesApprove = 'workflow_instances.approve';
    case WorkflowInstancesReject = 'workflow_instances.reject';
    case WorkflowInstancesCancel = 'workflow_instances.cancel';
    case VacationBalancesView = 'vacation_balances.view';
    case VacationBalancesCreate = 'vacation_balances.create';
    case VacationBalancesUpdate = 'vacation_balances.update';
    case VacationGrantsView = 'vacation_grants.view';
    case VacationGrantsCreate = 'vacation_grants.create';
    case VacationPeriodsView = 'vacation_periods.view';
    case VacationPeriodsCreate = 'vacation_periods.create';
    case VacationPeriodsClose = 'vacation_periods.close';
    case VacationRequestsView = 'vacation_requests.view';
    case VacationRequestsCreate = 'vacation_requests.create';
    case VacationRequestsCancel = 'vacation_requests.cancel';
    case VacationRequestsViewAll = 'vacation_requests.view_all';
    case VacationRequestsApprove = 'vacation_requests.approve';
    case VacationRequestsReject = 'vacation_requests.reject';
    case CommissionsView = 'commissions.view';
    case CommissionsCreate = 'commissions.create';
    case CommissionsPay = 'commissions.pay';
    case CommissionsViewAll = 'commissions.view_all';
    case CommissionsApprove = 'commissions.approve';
    case CommissionsReject = 'commissions.reject';
    case CostsView = 'costs.view';
    case CostsCreate = 'costs.create';
    case CostsUpdate = 'costs.update';
    case CostsDelete = 'costs.delete';
    case DocumentsView = 'documents.view';
    case DocumentsCreate = 'documents.create';
    case DocumentsDelete = 'documents.delete';
    case InvoicesView = 'invoices.view';
    case InvoicesCreate = 'invoices.create';
    case InvoicesViewAll = 'invoices.view_all';
    case InvoicesApprove = 'invoices.approve';
    case InvoicesReject = 'invoices.reject';
    case MedicalExamsView = 'medical_exams.view';
    case MedicalExamsCreate = 'medical_exams.create';
    case MedicalExamsUpdate = 'medical_exams.update';
    case MedicalExamsDelete = 'medical_exams.delete';
    case NotificationsView = 'notifications.view';
    case AuditView = 'audit.view';

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
            self::WorkflowStepsView => 'Visualizar Etapas de Workflow',
            self::WorkflowStepsCreate => 'Criar Etapas de Workflow',
            self::WorkflowStepsUpdate => 'Atualizar Etapas de Workflow',
            self::WorkflowStepsDelete => 'Excluir Etapas de Workflow',
            self::WorkflowInstancesView => 'Visualizar Processos',
            self::WorkflowInstancesViewAll => 'Visualizar Todos os Processos',
            self::WorkflowInstancesCreate => 'Iniciar Processos',
            self::WorkflowInstancesApprove => 'Aprovar Processos',
            self::WorkflowInstancesReject => 'Reprovar Processos',
            self::WorkflowInstancesCancel => 'Cancelar Processos',
            self::VacationBalancesView => 'Visualizar Saldos de Férias',
            self::VacationBalancesCreate => 'Criar Saldos de Férias',
            self::VacationBalancesUpdate => 'Atualizar Saldos de Férias',
            self::VacationGrantsView => 'Visualizar Férias Concedidas',
            self::VacationGrantsCreate => 'Registrar Férias Concedidas',
            self::VacationPeriodsView => 'Visualizar Períodos Aquisitivos',
            self::VacationPeriodsCreate => 'Criar Períodos Aquisitivos',
            self::VacationPeriodsClose => 'Encerrar Períodos Aquisitivos',
            self::VacationRequestsView => 'Visualizar Solicitações de Férias',
            self::VacationRequestsCreate => 'Criar Solicitações de Férias',
            self::VacationRequestsCancel => 'Cancelar Solicitações de Férias',
            self::VacationRequestsViewAll => 'Visualizar Todas as Solicitações de Férias',
            self::VacationRequestsApprove => 'Aprovar Solicitações de Férias',
            self::VacationRequestsReject => 'Reprovar Solicitações de Férias',
            self::CommissionsView => 'Visualizar Comissões',
            self::CommissionsCreate => 'Criar Comissões',
            self::CommissionsPay => 'Pagar Comissões',
            self::CommissionsViewAll => 'Visualizar Todas as Comissões',
            self::CommissionsApprove => 'Aprovar Comissões',
            self::CommissionsReject => 'Reprovar Comissões',
            self::CostsView => 'Visualizar Custos',
            self::CostsCreate => 'Criar Custos',
            self::CostsUpdate => 'Atualizar Custos',
            self::CostsDelete => 'Excluir Custos',
            self::DocumentsView => 'Visualizar Documentos',
            self::DocumentsCreate => 'Criar Documentos',
            self::DocumentsDelete => 'Excluir Documentos',
            self::InvoicesView => 'Visualizar Notas Fiscais',
            self::InvoicesCreate => 'Criar Notas Fiscais',
            self::InvoicesViewAll => 'Visualizar Todas as Notas Fiscais',
            self::InvoicesApprove => 'Aprovar Notas Fiscais',
            self::InvoicesReject => 'Reprovar Notas Fiscais',
            self::MedicalExamsView => 'Visualizar Exames',
            self::MedicalExamsCreate => 'Criar Exames',
            self::MedicalExamsUpdate => 'Atualizar Exames',
            self::MedicalExamsDelete => 'Excluir Exames',
            self::NotificationsView => 'Visualizar Notificações',
            self::AuditView => 'Visualizar Auditoria',
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
