<?php

namespace App\Http\Requests\Department;

use App\Http\Requests\BaseFormRequest;

class UpdateClassScheduleRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['required', 'integer', 'min:2', 'max:8'],
            'start_period' => ['required', 'integer', 'min:1', 'max:12'],
            'room' => ['required', 'string', 'max:50'],
        ];
    }

    public function attributes(): array
    {
        return [
            'day_of_week' => 'dayOfWeek',
            'start_period' => 'startPeriod',
            'room' => 'room',
        ];
    }
}
