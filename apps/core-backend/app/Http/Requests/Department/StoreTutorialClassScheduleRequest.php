<?php

namespace App\Http\Requests\Department;

use App\Http\Requests\BaseFormRequest;

class StoreTutorialClassScheduleRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'min:1'],
            'day_of_week' => ['required', 'integer', 'min:2', 'max:8'],
            'start_period' => ['required', 'integer', 'min:1', 'max:15'],
        ];
    }

    public function attributes(): array
    {
        return [
            'room_id' => 'roomId',
            'day_of_week' => 'dayOfWeek',
            'start_period' => 'startPeriod',
        ];
    }
}
