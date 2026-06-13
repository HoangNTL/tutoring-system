<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->get()
            ->filter(function ($n) {
                $data = $n->data;
                if (isset($data['registrationEndAt'])) {
                    return now()->lessThan(Carbon::parse($data['registrationEndAt']));
                }
                return true;
            });

        $formatted = $notifications->map(fn ($n) => [
            'id' => $n->id,
            'type' => $n->type,
            'data' => $n->data,
            'readAt' => $n->read_at?->toIso8601String(),
            'createdAt' => $n->created_at?->toIso8601String(),
        ])->values();

        return $this->success(
            $formatted,
            'Notifications retrieved successfully'
        );
    }

    public function markAsRead(string $id, Request $request)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return $this->success(
            null,
            'Notification marked as read'
        );
    }
}
