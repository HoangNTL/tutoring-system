<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\RegisterTutorialCourseRequest;
use App\Services\TutorialPeriods\StudentTutorialRegistrationService;
use Illuminate\Http\Request;

class StudentTutorialRegistrationController extends Controller
{
    public function __construct(
        private StudentTutorialRegistrationService $studentTutorialRegistrationService
    ) {}

    public function store(RegisterTutorialCourseRequest $request, int $tutorialPeriodId)
    {
        $registration = $this->studentTutorialRegistrationService->register(
            $request->user(),
            $tutorialPeriodId,
            (string) $request->validated('course_code')
        );

        return $this->success([
            'courseCode' => $registration->course_code,
            'courseName' => $registration->course_name,
            'credits' => $registration->credits,
            'registeredAt' => $registration->registered_at?->format('Y-m-d H:i:s'),
            'status' => $registration->status?->value,
        ], 'Course registered successfully', null, 201);
    }

    public function destroy(Request $request, int $tutorialPeriodId, string $courseCode)
    {
        $registration = $this->studentTutorialRegistrationService->cancel(
            $request->user(),
            $tutorialPeriodId,
            $courseCode
        );

        return $this->success([
            'courseCode' => $registration->course_code,
            'courseName' => $registration->course_name,
            'credits' => $registration->credits,
            'cancelledAt' => $registration->cancelled_at?->format('Y-m-d H:i:s'),
            'status' => $registration->status?->value,
        ], 'Course registration cancelled successfully');
    }
}
