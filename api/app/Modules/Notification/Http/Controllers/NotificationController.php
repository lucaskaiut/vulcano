<?php

namespace App\Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Domain\Models\Notification;
use App\Modules\Notification\Domain\Services\NotificationService;
use App\Modules\Notification\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Notification::query()
            ->with(['user', 'channel'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        if ($status && in_array($status, ['pending', 'sent', 'failed'])) {
            $query->where('status', $status);
        }

        return response()->json([
            'data' => NotificationResource::collection($query->limit(100)->get()),
        ]);
    }

    public function indexAll(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $userId = $request->query('user_id');

        $query = Notification::query()
            ->with(['user', 'channel'])
            ->orderByDesc('created_at');

        if ($status && in_array($status, ['pending', 'sent', 'failed'])) {
            $query->where('status', $status);
        }

        if ($userId) {
            $query->where('user_id', (int) $userId);
        }

        return response()->json([
            'data' => NotificationResource::collection($query->limit(200)->get()),
        ]);
    }

    public function retry(Notification $notification): JsonResponse
    {
        if (! in_array($notification->status, ['failed', 'pending'])) {
            return response()->json(['message' => 'Apenas notificações com falha podem ser reenviadas.'], 422);
        }

        $notification->loadMissing(['user', 'channel']);

        try {
            $this->notificationService->dispatch(
                $notification->type,
                $notification->user,
                $notification->title,
                $notification->body,
                $notification->data ?? [],
            );
            $notification->delete(); // Remove old, new one created

            return response()->json(['message' => 'Notificação reenviada com sucesso.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Falha ao reenviar: ' . $e->getMessage()], 500);
        }
    }
}
