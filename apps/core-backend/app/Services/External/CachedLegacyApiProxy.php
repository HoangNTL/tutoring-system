<?php

namespace App\Services\External;

use App\Contracts\Legacy\LegacyApiClient;
use Illuminate\Support\Facades\Cache;

class CachedLegacyApiProxy implements LegacyApiClient
{
    public function __construct(
        private LegacyApiClient $client
    ) {}

    public function fetchLegacyPeriods(): array
    {
        return $this->remember(
            'legacy:periods',
            (int) config('services.legacy_service.cache.periods_ttl', 300),
            fn (): array => $this->client->fetchLegacyPeriods()
        );
    }

    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
    {
        return $this->remember(
            "legacy:student-courses:id:{$studentId}:period:{$periodId}",
            (int) config('services.legacy_service.cache.courses_ttl', 180),
            fn (): array => $this->client->fetchStudentCoursesByLegacyStudentId($studentId, $periodId)
        );
    }

    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
    {
        return $this->remember(
            'legacy:student-courses:code:' . md5($studentCode) . ":period:{$periodId}",
            (int) config('services.legacy_service.cache.courses_ttl', 180),
            fn (): array => $this->client->fetchStudentCoursesByStudentCode($studentCode, $periodId)
        );
    }

    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
    {
        return $this->client->fetchStudentInfoByLegacyStudentId($studentId);
    }

    public function fetchStudentInfoByStudentCode(string $studentCode): ?array
    {
        return $this->client->fetchStudentInfoByStudentCode($studentCode);
    }

    public function fetchAllStudents(): array
    {
        return $this->remember(
            'legacy:students:all',
            (int) config('services.legacy_service.cache.imports_ttl', 600),
            fn (): array => $this->client->fetchAllStudents()
        );
    }

    public function fetchAllLecturers(): array
    {
        return $this->remember(
            'legacy:lecturers:all',
            (int) config('services.legacy_service.cache.lecturers_ttl', 300),
            fn (): array => $this->client->fetchAllLecturers()
        );
    }

    public function fetchLecturersByDepartment(int $departmentId): array
    {
        return $this->remember(
            "legacy:lecturers:department:{$departmentId}",
            (int) config('services.legacy_service.cache.lecturers_ttl', 300),
            fn (): array => $this->client->fetchLecturersByDepartment($departmentId)
        );
    }

    public function fetchRooms(): array
    {
        return $this->remember(
            'legacy:rooms',
            (int) config('services.legacy_service.cache.rooms_ttl', 300),
            fn (): array => $this->client->fetchRooms()
        );
    }

    public function fetchAllDepartments(): array
    {
        return $this->remember(
            'legacy:departments:all',
            (int) config('services.legacy_service.cache.imports_ttl', 600),
            fn (): array => $this->client->fetchAllDepartments()
        );
    }

    private function remember(string $key, int $ttlSeconds, callable $resolver): array
    {
        return Cache::remember($key, now()->addSeconds(max($ttlSeconds, 1)), $resolver);
    }
}
