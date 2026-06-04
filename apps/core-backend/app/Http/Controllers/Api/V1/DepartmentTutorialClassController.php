<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Department\CreateTutorialClassRequest;
use App\Http\Requests\Department\UpdateTutorialClassRequest;
use App\Http\Resources\DepartmentTutorialClassResource;
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

    private function ensureDepartmentAccess(Request $request): void
    {
        if ($request->user()?->role !== UserRole::DEPARTMENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }
    }
}
