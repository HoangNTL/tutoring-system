<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Services\TutorialPeriods\DepartmentTutorialClassService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class DepartmentRoomController extends Controller
{
    public function __construct(
        private DepartmentTutorialClassService $departmentTutorialClassService
    ) {}

    public function index(Request $request)
    {
        $this->ensureDepartmentAccess($request);

        return $this->success(
            $this->departmentTutorialClassService->getRoomOptions(),
            'Rooms retrieved successfully'
        );
    }

    private function ensureDepartmentAccess(Request $request): void
    {
        if ($request->user()?->role !== UserRole::DEPARTMENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }
    }
}
