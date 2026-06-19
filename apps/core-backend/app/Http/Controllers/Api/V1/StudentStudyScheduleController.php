<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\TutorialPeriods\StudentStudyScheduleService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class StudentStudyScheduleController extends Controller
{
    public function __construct(
        private StudentStudyScheduleService $studentStudyScheduleService
    ) {}

    public function index(Request $request)
    {
        if ($request->user()?->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriodId = $request->query('tutorialPeriodId')
            ? (int) $request->query('tutorialPeriodId')
            : null;

        $result = $this->studentStudyScheduleService->getStudySchedule(
            $request->user(),
            $tutorialPeriodId
        );

        return $this->success($result, 'Study schedule retrieved successfully');
    }
}
