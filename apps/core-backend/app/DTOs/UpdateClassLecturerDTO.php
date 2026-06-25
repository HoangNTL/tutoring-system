<?php

namespace App\DTOs;

class UpdateClassLecturerDTO
{
    public function __construct(
        public readonly int $lecturerId,
        public readonly string $lecturerName
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            lecturerId: (int) ($data['lecturer_id'] ?? 0),
            lecturerName: (string) ($data['lecturer_name'] ?? '')
        );
    }
}
