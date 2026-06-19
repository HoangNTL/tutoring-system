<?php

namespace App\Contracts;

interface LegacyDataGateway
{
    public function fetchLegacyPeriods(): array;

    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array;

    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array;

    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array;

    public function fetchStudentInfoByStudentCode(string $studentCode): ?array;

    public function fetchAllStudents(): array;

    public function fetchAllLecturers(): array;

    public function fetchAllDepartments(): array;
}
