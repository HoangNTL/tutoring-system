<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TutorialPeriods\DepartmentTutorialClassService;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class DepartmentLecturerController extends Controller
{
    public function __construct(
        private DepartmentTutorialClassService $departmentTutorialClassService,
    ) {}

    public function index(Request $request)
    {
        $this->authorize("viewLecturers", User::class);

        $departmentId = $request->user()?->department_id;

        if ($departmentId === null) {
            throw new BadRequestHttpException(
                "Không xác định được bộ môn của tài khoản hiện tại.",
            );
        }

        return $this->success(
            $this->departmentTutorialClassService->getLecturerOptions(
                (int) $departmentId,
            ),
            "Lecturers retrieved successfully",
        );
    }
}
