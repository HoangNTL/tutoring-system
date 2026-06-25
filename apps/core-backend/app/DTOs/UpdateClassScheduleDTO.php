<?php

namespace App\DTOs;

class UpdateClassScheduleDTO
{
    /**
     * @param array<int, array{day_of_week:int,start_period:int,room:string}> $schedules
     */
    public function __construct(
        public readonly array $schedules
    ) {}

    public static function fromArray(array $data): self
    {
        $rawSchedules = $data['schedules'] ?? [];
        $schedules = [];

        foreach ($rawSchedules as $slot) {
            $schedules[] = [
                'day_of_week' => (int) ($slot['day_of_week'] ?? 0),
                'start_period' => (int) ($slot['start_period'] ?? 0),
                'room' => (string) ($slot['room'] ?? ''),
            ];
        }

        return new self($schedules);
    }
}
