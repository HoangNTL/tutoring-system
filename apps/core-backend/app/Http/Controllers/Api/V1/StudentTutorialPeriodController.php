<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\StudentTutorialPeriodResource;
use App\Services\TutorialPeriods\StudentTutorialPeriodService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class StudentTutorialPeriodController extends Controller
{
    public function __construct(
        private StudentTutorialPeriodService $studentTutorialPeriodService
    ) {}

    public function index(Request $request)
    {
        if ($request->user()?->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriods = $this->studentTutorialPeriodService->getOpenTutorialPeriods();

        return $this->success(
            StudentTutorialPeriodResource::collection($tutorialPeriods),
            'Student tutorial periods retrieved successfully'
        );
    }
}
