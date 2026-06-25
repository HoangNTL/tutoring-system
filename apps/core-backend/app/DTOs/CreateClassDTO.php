<?php

namespace App\DTOs;

class CreateClassDTO
{
    public function __construct(
        public readonly string $courseCode,
        public readonly int $totalSessions,
        public readonly int $periodsPerSession
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            courseCode: (string) ($data['course_code'] ?? ''),
            totalSessions: (int) ($data['total_sessions'] ?? 0),
            periodsPerSession: (int) ($data['periods_per_session'] ?? 0)
        );
    }
}
