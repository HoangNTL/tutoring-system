<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\TutorialPeriods\StudentScheduleForDepartmentService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class StudentScheduleForDepartmentController extends Controller
{
    public function __construct(
        private StudentScheduleForDepartmentService $studentScheduleService
    ) {}

    public function index(Request $request, int $classId)
    {
        if ($request->user()?->role !== UserRole::DEPARTMENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $departmentId = $request->user()->department_id !== null
            ? (int) $request->user()->department_id
            : null;

        $result = $this->studentScheduleService->getStudentBusySlots($classId, $departmentId);

        return $this->success($result, 'Student schedules retrieved successfully');
    }
}
