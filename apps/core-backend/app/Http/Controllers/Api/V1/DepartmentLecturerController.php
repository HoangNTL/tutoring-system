<?php

namespace App\Http\Controllers\Api\V1;

use App\Contracts\LegacyDataGateway;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class DepartmentLecturerController extends Controller
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    public function index(Request $request)
    {
        if ($request->user()?->role !== UserRole::DEPARTMENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $departmentId = $request->user()->department_id !== null ? (int) $request->user()->department_id : null;

        $lecturers = $this->legacyDataGateway->fetchAllLecturers($departmentId);

        $formattedLecturers = array_map(function ($lecturer) {
            return [
                'id' => $lecturer['legacy_id'] ?? null,
                'lecturerCode' => $lecturer['username'] ?? null,
                'dateOfBirth' => $lecturer['date_of_birth'] ?? null,
                'firstName' => $lecturer['first_name'] ?? null,
                'lastName' => $lecturer['last_name'] ?? null,
                'fullName' => $lecturer['full_name'] ?? null,
            ];
        }, $lecturers);

        return $this->success(
            $formattedLecturers,
            'Lecturers retrieved successfully'
        );
    }
}
