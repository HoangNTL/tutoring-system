<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\TutorialPeriods\LecturerTeachingScheduleService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class LecturerTeachingScheduleController extends Controller
{
    public function __construct(
        private LecturerTeachingScheduleService $lecturerTeachingScheduleService
    ) {}

    public function index(Request $request)
    {
        if ($request->user()?->role !== UserRole::LECTURER) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriodId = $request->query('tutorialPeriodId')
            ? (int) $request->query('tutorialPeriodId')
            : null;

        $result = $this->lecturerTeachingScheduleService->getTeachingSchedule(
            $request->user(),
            $tutorialPeriodId
        );

        return $this->success($result, 'Teaching schedule retrieved successfully');
    }
}
