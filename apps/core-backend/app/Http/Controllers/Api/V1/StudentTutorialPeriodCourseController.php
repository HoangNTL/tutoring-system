<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentTutorialCourseResource;
use App\Services\TutorialPeriods\StudentTutorialPeriodCourseService;
use Illuminate\Http\Request;

class StudentTutorialPeriodCourseController extends Controller
{
    public function __construct(
        private StudentTutorialPeriodCourseService $studentTutorialPeriodCourseService
    ) {}

    public function index(Request $request, int $tutorialPeriodId)
    {
        $courses = $this->studentTutorialPeriodCourseService->getAvailableCourses(
            $request->user(),
            $tutorialPeriodId
        );

        return $this->success(
            StudentTutorialCourseResource::collection(collect($courses)),
            'Available courses retrieved successfully'
        );
    }
}
