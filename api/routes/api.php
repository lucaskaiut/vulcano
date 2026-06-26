<?php

use App\Modules\User\Http\Controllers\AuthController;
use App\Modules\User\Http\Controllers\PermissionController;
use App\Modules\User\Http\Controllers\RoleController;
use App\Modules\User\Http\Controllers\SalaryHistoryController;
use App\Modules\User\Http\Controllers\UserController;
use App\Modules\User\Http\Controllers\UserPreferenceController;
use App\Modules\User\Domain\Models\Role;
use App\Modules\User\Domain\Models\SalaryHistory;
use App\Modules\User\Domain\Models\User;
use App\Modules\Workflow\Http\Controllers\WorkflowInstanceController;
use App\Modules\Workflow\Http\Controllers\WorkflowStepController;
use App\Modules\Commission\Http\Controllers\CommissionController;
use App\Modules\Commission\Domain\Models\Commission;
use App\Modules\Workflow\Domain\Models\WorkflowInstance;
use App\Modules\Workflow\Domain\Models\WorkflowStep;
use App\Modules\Vacation\Http\Controllers\VacationBalanceController;
use App\Modules\Vacation\Http\Controllers\VacationGrantController;
use App\Modules\Vacation\Http\Controllers\VacationPeriodController;
use App\Modules\Vacation\Http\Controllers\VacationRequestController;
use App\Modules\Vacation\Domain\Models\VacationBalance;
use App\Modules\Vacation\Domain\Models\VacationPeriod;
use App\Modules\Vacation\Domain\Models\VacationRequest;
use Illuminate\Support\Facades\Route;

Route::bind('user', fn (string $value) => User::query()->findOrFail($value));
Route::bind('role', fn (string $value) => Role::query()->findOrFail($value));
Route::bind('workflow_step', fn (string $value) => WorkflowStep::query()->findOrFail($value));
Route::bind('workflow_instance', fn (string $value) => WorkflowInstance::query()->findOrFail($value));
Route::bind('vacation_balance', fn (string $value) => VacationBalance::query()->findOrFail($value));
Route::bind('vacation_period', fn (string $value) => VacationPeriod::query()->findOrFail($value));
Route::bind('vacation_request', fn (string $value) => VacationRequest::query()->findOrFail($value));
Route::bind('commission', fn (string $value) => Commission::query()->findOrFail($value));
Route::bind('salary_history', function (string $value, $route) {
    $user = $route->parameter('user');

    return SalaryHistory::query()
        ->where('user_id', $user->id)
        ->findOrFail($value);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me/preferences', [UserPreferenceController::class, 'show']);
    Route::patch('/me/preferences', [UserPreferenceController::class, 'update']);

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
    Route::post('commissions/{commission}/pay', [CommissionController::class, 'pay'])
        ->middleware('permission:commissions.pay');
});
