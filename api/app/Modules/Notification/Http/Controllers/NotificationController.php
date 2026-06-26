<?php

namespace App\Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notification\Domain\Services\NotificationService;
use App\Modules\Notification\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    public function index(): JsonResponse
    {
        $user = request()->user();

        return response()->json([
            'data' => NotificationResource::collection($this->notificationService->listByUser($user->id)),
        ]);
    }
}
