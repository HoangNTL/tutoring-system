<?php

namespace App\Services\External;

use App\Contracts\LegacyDataGateway;

class NullLegacyDataGateway implements LegacyDataGateway
{
    public function fetchLegacyPeriods(): array
    {
        return [];
    }

    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
    {
        return [];
    }

    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
    {
        return [];
    }

    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
    {
        return null;
    }

    public function fetchStudentInfoByStudentCode(string $studentCode): ?array
    {
        return null;
    }

    public function fetchAllStudents(): array
    {
        return [];
    }

    public function fetchAllLecturers(?int $departmentId = null, ?string $courseCode = null): array
    {
        return [];
    }

    public function fetchAllDepartments(): array
    {
        return [];
    }
}
