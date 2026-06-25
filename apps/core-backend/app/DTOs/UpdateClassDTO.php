<?php

namespace App\DTOs;

class UpdateClassDTO
{
    public function __construct(
        public readonly int $totalSessions,
        public readonly int $periodsPerSession
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            totalSessions: (int) ($data['total_sessions'] ?? 0),
            periodsPerSession: (int) ($data['periods_per_session'] ?? 0)
        );
    }
}
