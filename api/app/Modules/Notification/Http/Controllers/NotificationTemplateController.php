<?php

namespace App\Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Domain\Models\NotificationTemplate;
use App\Modules\Notification\Domain\Services\TemplateRendererService;
use App\Modules\Notification\Http\Resources\NotificationTemplateResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationTemplateController extends Controller
{
    public function __construct(private readonly TemplateRendererService $renderer) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => NotificationTemplateResource::collection(
                NotificationTemplate::query()->orderBy('name')->get(),
            ),
        ]);
    }

    public function show(NotificationTemplate $template): JsonResponse
    {
        return response()->json([
            'data' => new NotificationTemplateResource($template),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'available_variables' => ['nullable', 'array'],
            'active' => ['boolean'],
        ]);

        $template = NotificationTemplate::query()->create($validated);

        return response()->json([
            'data' => new NotificationTemplateResource($template),
            'message' => 'Template criado com sucesso.',
        ], 201);
    }

    public function update(Request $request, NotificationTemplate $template): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'subject' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'available_variables' => ['nullable', 'array'],
            'active' => ['boolean'],
        ]);

        $template->update($validated);

        return response()->json([
            'data' => new NotificationTemplateResource($template->fresh()),
            'message' => 'Template atualizado com sucesso.',
        ]);
    }

    public function destroy(NotificationTemplate $template): JsonResponse
    {
        $template->delete();

        return response()->json(['message' => 'Template removido com sucesso.']);
    }

    public function variables(): JsonResponse
    {
        return response()->json([
            'data' => $this->renderer->getAvailableVariables(),
        ]);
    }
}
