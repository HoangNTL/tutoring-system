<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->get();

        $periodIds = $notifications->map(fn ($n) => $n->data['tutorialPeriodId'] ?? null)
            ->filter()
            ->unique()
            ->toArray();

        $activePeriods = \App\Models\TutorialPeriod::whereIn('id', $periodIds)
            ->where('status', '!=', \App\Enums\TutorialPeriodStatus::CANCELLED->value)
            ->pluck('id')
            ->toArray();

        $formatted = $notifications->filter(function ($n) use ($activePeriods) {
            $data = $n->data;
            if (isset($data['registrationEndAt'])) {
                if (now()->greaterThanOrEqualTo(Carbon::parse($data['registrationEndAt']))) {
                    return false;
                }
            }
            if (isset($data['tutorialPeriodId'])) {
                return in_array($data['tutorialPeriodId'], $activePeriods);
            }
            return true;
        })->map(fn ($n) => [
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
