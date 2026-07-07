<?php

namespace App\Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Domain\Enums\NotificationEventEnum;
use App\Modules\Notification\Domain\Models\NotificationRule;
use App\Modules\Notification\Domain\Services\RuleProcessorService;
use App\Modules\Notification\Http\Resources\NotificationRuleResource;
use App\Modules\User\Domain\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationRuleController extends Controller
{
    public function __construct(
        private readonly RuleProcessorService $ruleProcessor,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => NotificationRuleResource::collection(
                NotificationRule::query()->with(['template'])->orderBy('name')->get(),
            ),
        ]);
    }

    public function show(NotificationRule $rule): JsonResponse
    {
        return response()->json([
            'data' => new NotificationRuleResource($rule->load(['template'])),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event' => ['required', 'string', Rule::in(NotificationEventEnum::values())],
            'channel' => ['required', 'string', Rule::in(['email'])],
            'schedule_type' => ['required', 'string', Rule::in(['daily', 'weekly', 'monthly', 'once'])],
            'schedule_config' => ['nullable', 'array'],
            'template_id' => ['nullable', 'integer', Rule::exists('notification_templates', 'id')],
            'active' => ['boolean'],
        ]);

        $rule = NotificationRule::query()->create($validated);

        return response()->json([
            'data' => new NotificationRuleResource($rule->load(['template'])),
            'message' => 'Regra criada com sucesso.',
        ], 201);
    }

    public function update(Request $request, NotificationRule $rule): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event' => ['sometimes', 'string', Rule::in(NotificationEventEnum::values())],
            'channel' => ['sometimes', 'string', Rule::in(['email'])],
            'schedule_type' => ['sometimes', 'string', Rule::in(['daily', 'weekly', 'monthly', 'once'])],
            'schedule_config' => ['nullable', 'array'],
            'template_id' => ['nullable', 'integer', Rule::exists('notification_templates', 'id')],
            'active' => ['boolean'],
        ]);

        $rule->update($validated);

        return response()->json([
            'data' => new NotificationRuleResource($rule->fresh(['template'])),
            'message' => 'Regra atualizada com sucesso.',
        ]);
    }

    public function destroy(NotificationRule $rule): JsonResponse
    {
        $rule->delete();

        return response()->json(['message' => 'Regra removida com sucesso.']);
    }

    public function testSend(Request $request, NotificationRule $rule): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', Rule::exists('users', 'id')],
        ]);

        $user = User::query()->findOrFail($validated['user_id']);

        try {
            $count = $this->ruleProcessor->processRule($rule, $user);

            return response()->json([
                'message' => "E-mail enviado para {$user->name} com sucesso.",
                'notifications_created' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Falha ao enviar e-mail: ' . $e->getMessage(),
            ], 500);
        }
    }
}
