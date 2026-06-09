<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Department\AssignTutorialClassLecturerRequest;
use App\Http\Requests\Department\CreateTutorialClassRequest;
use App\Http\Requests\Department\StoreTutorialClassScheduleRequest;
use App\Http\Requests\Department\UpdateTutorialClassRequest;
use App\Http\Resources\DepartmentTutorialClassResource;
use App\Http\Resources\DepartmentTutorialClassScheduleResource;
use App\Services\TutorialPeriods\DepartmentTutorialClassService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class DepartmentTutorialClassController extends Controller
{
    public function __construct(
        private DepartmentTutorialClassService $departmentTutorialClassService
    ) {}

    public function index(Request $request, int $tutorialPeriodId)
    {
        $this->ensureDepartmentAccess($request);

        $classes = $this->departmentTutorialClassService->getClasses($tutorialPeriodId);

        return $this->success(
            DepartmentTutorialClassResource::collection(collect($classes)),
            'Tutorial classes retrieved successfully'
        );
    }

    public function store(CreateTutorialClassRequest $request, int $tutorialPeriodId)
    {
        $this->ensureDepartmentAccess($request);

        $tutorialClass = $this->departmentTutorialClassService->createClass(
            $tutorialPeriodId,
            $request->validated(),
            (int) $request->user()->id
        );

        return $this->success(
            new DepartmentTutorialClassResource($tutorialClass),
            'Tutorial class created successfully',
            null,
            201
        );
    }

    public function update(UpdateTutorialClassRequest $request, int $classId)
    {
        $this->ensureDepartmentAccess($request);

        $tutorialClass = $this->departmentTutorialClassService->updateClass(
            $classId,
            $request->validated()
        );

        return $this->success(
            new DepartmentTutorialClassResource($tutorialClass),
            'Tutorial class updated successfully'
        );
    }

    public function cancel(Request $request, int $classId)
    {
        $this->ensureDepartmentAccess($request);

        $tutorialClass = $this->departmentTutorialClassService->cancelClass($classId);

        return $this->success(
            new DepartmentTutorialClassResource($tutorialClass),
            'Tutorial class cancelled successfully'
        );
    }

    public function restore(Request $request, int $classId)
    {
        $this->ensureDepartmentAccess($request);

        $tutorialClass = $this->departmentTutorialClassService->restoreClass($classId);

        return $this->success(
            new DepartmentTutorialClassResource($tutorialClass),
            'Tutorial class restored successfully'
        );
    }

    public function assignLecturer(AssignTutorialClassLecturerRequest $request, int $classId)
    {
        $this->ensureDepartmentAccess($request);

        $tutorialClass = $this->departmentTutorialClassService->assignLecturer(
            $classId,
            (int) $request->validated('lecturer_id'),
            $request->user()?->department_id
        );

        return $this->success(
            new DepartmentTutorialClassResource($tutorialClass),
            'Lecturer assigned successfully'
        );
    }

    public function schedules(Request $request, int $classId)
    {
        $this->ensureDepartmentAccess($request);

        $schedules = $this->departmentTutorialClassService->getSchedules($classId);

        return $this->success(
            DepartmentTutorialClassScheduleResource::collection(collect($schedules)),
            'Tutorial class schedules retrieved successfully'
        );
    }

    public function storeSchedule(StoreTutorialClassScheduleRequest $request, int $classId)
    {
        $this->ensureDepartmentAccess($request);

        $schedule = $this->departmentTutorialClassService->addSchedule(
            $classId,
            $request->validated()
        );

        return $this->success(
            new DepartmentTutorialClassScheduleResource($schedule),
            'Tutorial class schedule created successfully',
            null,
            201
        );
    }

    public function destroySchedule(Request $request, int $classId, int $scheduleId)
    {
        $this->ensureDepartmentAccess($request);

        $schedule = $this->departmentTutorialClassService->deleteSchedule(
            $classId,
            $scheduleId
        );

        return $this->success(
            new DepartmentTutorialClassScheduleResource($schedule),
            'Tutorial class schedule deleted successfully'
        );
    }

    public function weeklyTimetable(Request $request, int $tutorialPeriodId)
    {
        $this->ensureDepartmentAccess($request);

        return $this->success(
            $this->departmentTutorialClassService->getWeeklyTimetable($tutorialPeriodId),
            'Weekly timetable retrieved successfully'
        );
    }

    private function ensureDepartmentAccess(Request $request): void
    {
        if ($request->user()?->role !== UserRole::DEPARTMENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }
    }
}
