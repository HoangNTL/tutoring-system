<?php

namespace App\Services\External;

use App\Contracts\LegacyDataGateway;
use Illuminate\Contracts\Cache\Repository as CacheRepository;

class CachedLegacyDataGateway implements LegacyDataGateway
{
    private const LEGACY_PERIODS_TTL_MINUTES = 15;
    private const STUDENT_INFO_TTL_MINUTES = 10;

    public function __construct(
        private LegacyDataGateway $inner,
        private CacheRepository $cache
    ) {}

    public function fetchLegacyPeriods(): array
    {
        return $this->cache->remember(
            'legacy:periods:all',
            now()->addMinutes(self::LEGACY_PERIODS_TTL_MINUTES),
            fn (): array => $this->inner->fetchLegacyPeriods()
        );
    }

    public function fetchStudentCoursesByLegacyStudentId(int $studentId, int $periodId): array
    {
        return $this->inner->fetchStudentCoursesByLegacyStudentId($studentId, $periodId);
    }

    public function fetchStudentCoursesByStudentCode(string $studentCode, int $periodId): array
    {
        return $this->inner->fetchStudentCoursesByStudentCode($studentCode, $periodId);
    }

    public function fetchStudentInfoByLegacyStudentId(int $studentId): ?array
    {
        return $this->cache->remember(
            "legacy:student-info:id:{$studentId}",
            now()->addMinutes(self::STUDENT_INFO_TTL_MINUTES),
            fn (): ?array => $this->inner->fetchStudentInfoByLegacyStudentId($studentId)
        );
    }

    public function fetchStudentInfoByStudentCode(string $studentCode): ?array
    {
        $cacheKey = 'legacy:student-info:code:' . md5($studentCode);

        return $this->cache->remember(
            $cacheKey,
            now()->addMinutes(self::STUDENT_INFO_TTL_MINUTES),
            fn (): ?array => $this->inner->fetchStudentInfoByStudentCode($studentCode)
        );
    }

    public function fetchAllStudents(): array
    {
        return $this->inner->fetchAllStudents();
    }

    public function fetchAllLecturers(): array
    {
        return $this->inner->fetchAllLecturers();
    }

    public function fetchAllDepartments(): array
    {
        return $this->inner->fetchAllDepartments();
    }
}
