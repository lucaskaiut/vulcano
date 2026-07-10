<?php

use App\Modules\User\Http\Controllers\AuthController;
use App\Modules\User\Http\Controllers\PermissionController;
use App\Modules\User\Http\Controllers\RoleController;
use App\Modules\User\Http\Controllers\SalaryHistoryController;
use App\Modules\User\Http\Controllers\UserController;
use App\Modules\User\Http\Controllers\UserPreferenceController;
use App\Modules\User\Http\Controllers\SectorController;
use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\Sector;
use App\Modules\User\Domain\Models\SalaryHistory;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Http\Controllers\WorkflowInstanceController;
use App\Modules\Workflow\Http\Controllers\WorkflowStepController;
use App\Modules\Commission\Http\Controllers\CommissionController;
use App\Modules\Commission\Http\Controllers\EnterpriseController;
use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Commission\Domain\Models\Enterprise;
use App\Modules\Cost\Http\Controllers\CostController;
use App\Modules\Cost\Http\Controllers\ProvisionRuleController;
use App\Modules\Cost\Domain\Models\CollaboratorCost;
use App\Modules\Cost\Domain\Models\CostCategory;
use App\Modules\Cost\Domain\Models\ProvisionRule;
use App\Modules\Audit\Http\Controllers\AuditController;
use App\Modules\Dashboard\Http\Controllers\DocController;
use App\Modules\Dashboard\Http\Controllers\DashboardController;
use App\Modules\Report\Http\Controllers\ReportController;
use App\Modules\Document\Http\Controllers\DocumentController;
use App\Modules\Document\Domain\Models\Document;
use App\Modules\Document\Domain\Models\DocumentType;
use App\Modules\Invoice\Http\Controllers\InvoiceController;
use App\Modules\Invoice\Domain\Models\Invoice;
use App\Modules\MedicalExam\Http\Controllers\MedicalExamController;
use App\Modules\MedicalExam\Domain\Models\MedicalExam;
use App\Modules\Notification\Http\Controllers\NotificationController;
use App\Modules\Notification\Http\Controllers\NotificationRuleController;
use App\Modules\Notification\Http\Controllers\NotificationTemplateController;
use App\Modules\Notification\Domain\Models\NotificationRule as NotificationRuleModel;
use App\Modules\Notification\Domain\Models\NotificationTemplate as NotificationTemplateModel;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use App\Modules\Vacation\Http\Controllers\VacationBalanceController;
use App\Modules\Vacation\Http\Controllers\VacationGrantController;
use App\Modules\Vacation\Http\Controllers\VacationPeriodController;
use App\Modules\Vacation\Http\Controllers\VacationRequestController;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationGrant;
use App\Modules\Vacation\Domain\Models\VacationPeriod;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use Illuminate\Support\Facades\Route;

Route::bind('user', fn (string $value) => User::query()->findOrFail($value));
Route::bind('role', fn (string $value) => Role::query()->findOrFail($value));
Route::bind('workflow_step', fn (string $value) => WorkflowStep::query()->findOrFail($value));
Route::bind('workflow_instance', fn (string $value) => WorkflowInstance::query()->findOrFail($value));
Route::bind('vacation_balance', fn (string $value) => VacationBalance::query()->findOrFail($value));
Route::bind('vacation_grant', fn (string $value) => VacationGrant::query()->findOrFail($value));
Route::bind('vacation_period', fn (string $value) => VacationPeriod::query()->findOrFail($value));
Route::bind('vacation_request', fn (string $value) => VacationRequest::query()->findOrFail($value));
Route::bind('commission', fn (string $value) => Commission::query()->findOrFail($value));
Route::bind('cost_category', fn (string $value) => CostCategory::query()->findOrFail($value));
Route::bind('provision_rule', fn (string $value) => ProvisionRule::query()->findOrFail($value));
Route::bind('collaborator_cost', fn (string $value) => CollaboratorCost::query()->findOrFail($value));
Route::bind('document', fn (string $value) => Document::query()->findOrFail($value));
Route::bind('document_type', fn (string $value) => DocumentType::query()->findOrFail($value));
Route::bind('invoice', fn (string $value) => Invoice::query()->findOrFail($value));
Route::bind('medical_exam', fn (string $value) => MedicalExam::query()->findOrFail($value));
Route::bind('sector', fn (string $value) => Sector::query()->findOrFail($value));
Route::bind('enterprise', fn (string $value) => Enterprise::query()->findOrFail($value));
Route::bind('sale', fn (string $value) => \App\Modules\Commission\Domain\Models\Sale::query()->findOrFail($value));
Route::bind('notification_rule', fn (string $value) => NotificationRuleModel::query()->findOrFail($value));
Route::bind('notification_template', fn (string $value) => NotificationTemplateModel::query()->findOrFail($value));
Route::bind('notification', fn (string $value) => \App\Modules\Notification\Domain\Models\Notification::query()->findOrFail($value));

Route::bind('salary_history', function (string $value, $route) {
    $user = $route->parameter('user');

    return SalaryHistory::query()
        ->where('user_id', $user->id)
        ->findOrFail($value);
});

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:6,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('throttle:3,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me/preferences', [UserPreferenceController::class, 'show']);
    Route::patch('/me/preferences', [UserPreferenceController::class, 'update']);

    Route::get('sectors/list', [SectorController::class, 'list'])
        ->middleware('permission:users.view');
    Route::apiResource('sectors', SectorController::class)->middleware([
        'index' => 'permission:users.view',
        'store' => 'permission:users.create',
        'show' => 'permission:users.view',
        'update' => 'permission:users.update',
    ])->except(['destroy']);

    Route::apiResource('users', UserController::class)->middleware([
        'index' => 'permission:users.view',
        'store' => 'permission:users.create',
        'show' => 'permission:users.view',
        'update' => 'permission:users.update',
        'destroy' => 'permission:users.delete',
    ]);

    Route::get('users/{user}/salary-histories', [SalaryHistoryController::class, 'index'])
        ->middleware('permission:users.view');
    Route::post('users/{user}/salary-histories', [SalaryHistoryController::class, 'store'])
        ->middleware('permission:users.update');
    Route::put('users/{user}/salary-histories/{salary_history}', [SalaryHistoryController::class, 'update'])
        ->middleware('permission:users.update');

    Route::apiResource('roles', RoleController::class)->middleware([
        'index' => 'permission:roles.view',
        'store' => 'permission:roles.create',
        'show' => 'permission:roles.view',
        'update' => 'permission:roles.update',
        'destroy' => 'permission:roles.delete',
    ]);

    Route::get('permissions', [PermissionController::class, 'index'])
        ->middleware('permission:roles.view');

    Route::get('workflow-types/{type}/steps', [WorkflowStepController::class, 'index'])
        ->middleware('permission:workflow_steps.view');
    Route::post('workflow-types/{type}/steps', [WorkflowStepController::class, 'store'])
        ->middleware('permission:workflow_steps.create');
    Route::put('workflow-steps/{workflow_step}', [WorkflowStepController::class, 'update'])
        ->middleware('permission:workflow_steps.update');
    Route::delete('workflow-steps/{workflow_step}', [WorkflowStepController::class, 'destroy'])
        ->middleware('permission:workflow_steps.delete');
    Route::put('workflow-steps/{workflow_step}/reorder', [WorkflowStepController::class, 'reorder'])
        ->middleware('permission:workflow_steps.update');

    Route::get('workflow-instances', [WorkflowInstanceController::class, 'index'])
        ->middleware('permission:workflow_instances.view');
    Route::post('workflow-instances', [WorkflowInstanceController::class, 'store'])
        ->middleware('permission:workflow_instances.create');
    Route::get('workflow-instances/{workflow_instance}', [WorkflowInstanceController::class, 'show'])
        ->middleware('permission:workflow_instances.view');
    Route::post('workflow-instances/{workflow_instance}/approve', [WorkflowInstanceController::class, 'approve'])
        ->middleware('permission:workflow_instances.approve');
    Route::post('workflow-instances/{workflow_instance}/reject', [WorkflowInstanceController::class, 'reject'])
        ->middleware('permission:workflow_instances.reject');
    Route::post('workflow-instances/{workflow_instance}/cancel', [WorkflowInstanceController::class, 'cancel'])
        ->middleware('permission:workflow_instances.cancel');

    Route::get('vacation-balances', [VacationBalanceController::class, 'index'])
        ->middleware('permission:vacation_balances.view');
    Route::post('vacation-balances', [VacationBalanceController::class, 'store'])
        ->middleware('permission:vacation_balances.create');
    Route::get('vacation-balances/{vacation_balance}', [VacationBalanceController::class, 'show'])
        ->middleware('permission:vacation_balances.view');
    Route::put('vacation-balances/{vacation_balance}', [VacationBalanceController::class, 'update'])
        ->middleware('permission:vacation_balances.update');

    Route::get('vacation-periods', [VacationPeriodController::class, 'index'])
        ->middleware('permission:vacation_periods.view');
    Route::post('vacation-periods', [VacationPeriodController::class, 'store'])
        ->middleware('permission:vacation_periods.create');
    Route::post('vacation-periods/{vacation_period}/close', [VacationPeriodController::class, 'close'])
        ->middleware('permission:vacation_periods.close');

    Route::get('vacation-grants', [VacationGrantController::class, 'index'])
        ->middleware('permission:vacation_grants.view');
    Route::post('vacation-grants', [VacationGrantController::class, 'store'])
        ->middleware('permission:vacation_grants.create');
    Route::put('vacation-grants/{vacation_grant}', [VacationGrantController::class, 'update'])
        ->middleware('permission:vacation_grants.update');
    Route::delete('vacation-grants/{vacation_grant}', [VacationGrantController::class, 'destroy'])
        ->middleware('permission:vacation_grants.delete');

    Route::get('vacation-requests', [VacationRequestController::class, 'index'])
        ->middleware('permission:vacation_requests.view');
    Route::post('vacation-requests', [VacationRequestController::class, 'store'])
        ->middleware('permission:vacation_requests.create');
    Route::post('vacation-requests/{vacation_request}/cancel', [VacationRequestController::class, 'cancel'])
        ->middleware('permission:vacation_requests.cancel');

    Route::get('sales', [CommissionController::class, 'index'])
        ->middleware('permission:commissions.view');
    Route::post('sales', [CommissionController::class, 'store'])
        ->middleware('permission:commissions.create');

    Route::get('enterprises/list', [EnterpriseController::class, 'list'])
        ->middleware('permission:enterprises.view');
    Route::apiResource('enterprises', EnterpriseController::class)->middleware([
        'index' => 'permission:enterprises.view',
        'store' => 'permission:enterprises.create',
        'show' => 'permission:enterprises.view',
        'update' => 'permission:enterprises.update',
        'destroy' => 'permission:enterprises.delete',
    ]);
    Route::post('commissions/{commission}/pay', [CommissionController::class, 'pay'])
        ->middleware('permission:commissions.pay');
    Route::get('sales/{sale}/invoice-download', [CommissionController::class, 'downloadInvoice'])
        ->middleware('permission:commissions.view');

    Route::get('cost-categories', [CostController::class, 'categories'])
        ->middleware('permission:costs.view');
    Route::get('cost-categories/list', [CostController::class, 'listCategories'])
        ->middleware('permission:costs.view');
    Route::post('cost-categories', [CostController::class, 'storeCategory'])
        ->middleware('permission:costs.create');
    Route::get('cost-categories/{cost_category}', [CostController::class, 'showCategory'])
        ->middleware('permission:costs.view');
    Route::put('cost-categories/{cost_category}', [CostController::class, 'updateCategory'])
        ->middleware('permission:costs.update');

    Route::get('collaborator-costs', [CostController::class, 'index'])
        ->middleware('permission:costs.view');
    Route::post('collaborator-costs', [CostController::class, 'store'])
        ->middleware('permission:costs.create');
    Route::get('collaborator-costs/{collaborator_cost}', [CostController::class, 'show'])
        ->middleware('permission:costs.view');
    Route::put('collaborator-costs/{collaborator_cost}', [CostController::class, 'update'])
        ->middleware('permission:costs.update');
    Route::delete('collaborator-costs/{collaborator_cost}', [CostController::class, 'destroy'])
        ->middleware('permission:costs.delete');

    Route::get('provision-rules/list', [ProvisionRuleController::class, 'list'])
        ->middleware('permission:costs.view');
    Route::apiResource('provision-rules', ProvisionRuleController::class)->middleware([
        'index' => 'permission:costs.view',
        'store' => 'permission:costs.create',
        'show' => 'permission:costs.view',
        'update' => 'permission:costs.create',
    ])->except(['destroy']);

    Route::get('costs-report', [CostController::class, 'report'])
        ->middleware('permission:costs.view');

    Route::get('document-types', [DocumentController::class, 'listTypes'])
        ->middleware('permission:document_types.view');
    Route::post('document-types', [DocumentController::class, 'storeType'])
        ->middleware('permission:document_types.create');
    Route::put('document-types/{document_type}', [DocumentController::class, 'updateType'])
        ->middleware('permission:document_types.update');
    Route::delete('document-types/{document_type}', [DocumentController::class, 'destroyType'])
        ->middleware('permission:document_types.delete');

    Route::get('documents', [DocumentController::class, 'indexAll'])
        ->middleware('permission:documents.view');
    Route::get('users/{user}/documents', [DocumentController::class, 'index'])
        ->middleware('permission:documents.view');
    Route::post('users/{user}/documents', [DocumentController::class, 'store'])
        ->middleware('permission:documents.create');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])
        ->middleware('permission:documents.delete');
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])
        ->middleware('permission:documents.view');
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])
        ->middleware('permission:documents.view');

    Route::get('invoices', [InvoiceController::class, 'indexAll'])
        ->middleware('permission:invoices.view');
    Route::post('invoices', [InvoiceController::class, 'store'])
        ->middleware('permission:invoices.create');
    Route::get('users/{user}/invoices', [InvoiceController::class, 'indexByUser'])
        ->middleware('permission:invoices.view');
    Route::get('invoices/{invoice}/download', [InvoiceController::class, 'download'])
        ->middleware('permission:invoices.view');

    Route::get('medical-exams', [MedicalExamController::class, 'indexAll'])
        ->middleware('permission:medical_exams.view');
    Route::get('users/{user}/medical-exams', [MedicalExamController::class, 'index'])
        ->middleware('permission:medical_exams.view');
    Route::post('users/{user}/medical-exams', [MedicalExamController::class, 'store'])
        ->middleware('permission:medical_exams.create');
    Route::put('medical-exams/{medical_exam}', [MedicalExamController::class, 'update'])
        ->middleware('permission:medical_exams.update');
    Route::delete('medical-exams/{medical_exam}', [MedicalExamController::class, 'destroy'])
        ->middleware('permission:medical_exams.delete');
    Route::get('medical-exams/{medical_exam}/download', [MedicalExamController::class, 'download'])
        ->middleware('permission:medical_exams.view');

    Route::get('notifications', [NotificationController::class, 'index'])
        ->middleware('permission:notifications.view');
    Route::get('notifications/all', [NotificationController::class, 'indexAll'])
        ->middleware('permission:notifications.view');
    Route::post('notifications/{notification}/retry', [NotificationController::class, 'retry'])
        ->middleware('permission:notifications.view');

    Route::get('notification-rules', [NotificationRuleController::class, 'index'])
        ->middleware('permission:notifications.view');
    Route::post('notification-rules', [NotificationRuleController::class, 'store'])
        ->middleware('permission:notifications.view');
    Route::get('notification-rules/{notification_rule}', [NotificationRuleController::class, 'show'])
        ->middleware('permission:notifications.view');
    Route::put('notification-rules/{notification_rule}', [NotificationRuleController::class, 'update'])
        ->middleware('permission:notifications.view');
    Route::delete('notification-rules/{notification_rule}', [NotificationRuleController::class, 'destroy'])
        ->middleware('permission:notifications.view');
    Route::post('notification-rules/{notification_rule}/test-send', [NotificationRuleController::class, 'testSend'])
        ->middleware('permission:notifications.view');

    Route::get('notification-templates', [NotificationTemplateController::class, 'index'])
        ->middleware('permission:notifications.view');
    Route::post('notification-templates', [NotificationTemplateController::class, 'store'])
        ->middleware('permission:notifications.view');
    Route::get('notification-templates/{notification_template}', [NotificationTemplateController::class, 'show'])
        ->middleware('permission:notifications.view');
    Route::put('notification-templates/{notification_template}', [NotificationTemplateController::class, 'update'])
        ->middleware('permission:notifications.view');
    Route::delete('notification-templates/{notification_template}', [NotificationTemplateController::class, 'destroy'])
        ->middleware('permission:notifications.view');
    Route::get('notification-variables', [NotificationTemplateController::class, 'variables'])
        ->middleware('permission:notifications.view');

    Route::get('dashboard', [DashboardController::class, 'summary']);

    Route::get('docs/user-guide', [DocController::class, 'guide']);

    Route::get('reports/collaborators', [ReportController::class, 'collaborators'])
        ->middleware('permission:users.view');
    Route::get('reports/vacation-requests', [ReportController::class, 'vacationRequests'])
        ->middleware('permission:vacation_requests.view');
    Route::get('reports/invoices', [ReportController::class, 'invoices'])
        ->middleware('permission:invoices.view');
    Route::get('reports/medical-exams', [ReportController::class, 'medicalExams'])
        ->middleware('permission:medical_exams.view');

    Route::get('audit-logs', [AuditController::class, 'index'])
        ->middleware('permission:audit.view');
});
