<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentTutorialClassScheduleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tutorialClassId' => $this->tutorial_class_id,
            'roomId' => $this->room_id,
            'roomCode' => $this->room_code,
            'roomName' => $this->room_name,
            'roomCapacity' => $this->room_capacity,
            'dayOfWeek' => $this->day_of_week,
            'startPeriod' => $this->start_period,
            'endPeriod' => $this->end_period,
        ];
    }
}
