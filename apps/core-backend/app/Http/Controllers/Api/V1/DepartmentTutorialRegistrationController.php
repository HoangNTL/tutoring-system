<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TutorialRegistration;
use App\Http\Resources\DepartmentCourseRegistrationSummaryResource;
use App\Http\Resources\DepartmentRegisteredStudentResource;
use App\Http\Resources\DepartmentTutorialPeriodOptionResource;
use App\Services\TutorialPeriods\DepartmentTutorialRegistrationService;
use Illuminate\Http\Request;

class DepartmentTutorialRegistrationController extends Controller
{
    public function __construct(
        private DepartmentTutorialRegistrationService $departmentTutorialRegistrationService,
    ) {}

    public function tutorialPeriods(Request $request)
    {
        $this->authorize(
            "viewDepartmentRegistrations",
            TutorialRegistration::class,
        );

        $tutorialPeriods = $this->departmentTutorialRegistrationService->getTutorialPeriods();

        return $this->success(
            DepartmentTutorialPeriodOptionResource::collection(
                $tutorialPeriods,
            ),
            "Department tutorial periods retrieved successfully",
        );
    }

    public function courseRegistrations(Request $request, int $tutorialPeriodId)
    {
        $this->authorize(
            "viewDepartmentRegistrations",
            TutorialRegistration::class,
        );

        $summary = $this->departmentTutorialRegistrationService->getCourseRegistrationSummary(
            $tutorialPeriodId,
        );

        return $this->success(
            DepartmentCourseRegistrationSummaryResource::collection(
                collect($summary),
            ),
            "Course registration summary retrieved successfully",
        );
    }

    public function students(
        Request $request,
        int $tutorialPeriodId,
        string $courseCode,
    ) {
        $this->authorize(
            "viewDepartmentRegistrations",
            TutorialRegistration::class,
        );

        $students = $this->departmentTutorialRegistrationService->getRegisteredStudents(
            $tutorialPeriodId,
            $courseCode,
        );

        return $this->success(
            DepartmentRegisteredStudentResource::collection($students),
            "Registered students retrieved successfully",
        );
    }
}
