<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentCourseRegistrationSummaryResource;
use App\Http\Resources\DepartmentRegisteredStudentResource;
use App\Http\Resources\DepartmentTutorialPeriodOptionResource;
use App\Services\TutorialPeriods\DepartmentTutorialRegistrationService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class DepartmentTutorialRegistrationController extends Controller
{
    public function __construct(
        private DepartmentTutorialRegistrationService $departmentTutorialRegistrationService
    ) {}

    public function tutorialPeriods(Request $request)
    {
        $this->ensureDepartmentAccess($request);

        $tutorialPeriods = $this->departmentTutorialRegistrationService->getTutorialPeriods();

        return $this->success(
            DepartmentTutorialPeriodOptionResource::collection($tutorialPeriods),
            'Department tutorial periods retrieved successfully'
        );
    }

    public function courseRegistrations(Request $request, int $tutorialPeriodId)
    {
        $this->ensureDepartmentAccess($request);

        $summary = $this->departmentTutorialRegistrationService->getCourseRegistrationSummary($tutorialPeriodId);

        return $this->success(
            DepartmentCourseRegistrationSummaryResource::collection(collect($summary)),
            'Course registration summary retrieved successfully'
        );
    }

    public function students(Request $request, int $tutorialPeriodId, string $courseCode)
    {
        $this->ensureDepartmentAccess($request);

        $students = $this->departmentTutorialRegistrationService->getRegisteredStudents($tutorialPeriodId, $courseCode);

        return $this->success(
            DepartmentRegisteredStudentResource::collection($students),
            'Registered students retrieved successfully'
        );
    }

    private function ensureDepartmentAccess(Request $request): void
    {
        if ($request->user()?->role !== UserRole::DEPARTMENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }
    }
}
