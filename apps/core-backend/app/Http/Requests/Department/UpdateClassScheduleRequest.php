<?php

namespace App\Http\Requests\Department;

use App\Http\Requests\BaseFormRequest;

class UpdateClassScheduleRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function afterPrepareForValidation(): void
    {
        if (!$this->has('schedules') && $this->has('day_of_week') && $this->has('start_period') && $this->has('room')) {
            $this->merge([
                'schedules' => [
                    [
                        'day_of_week' => $this->input('day_of_week'),
                        'start_period' => $this->input('start_period'),
                        'room' => $this->input('room'),
                    ]
                ]
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'schedules' => ['required', 'array', 'min:1'],
            'schedules.*.day_of_week' => ['required', 'integer', 'min:2', 'max:8'],
            'schedules.*.start_period' => ['required', 'integer', 'min:1', 'max:12'],
            'schedules.*.room' => ['required', 'string', 'max:50'],
        ];
    }

    public function attributes(): array
    {
        return [
            'schedules' => 'schedules',
            'schedules.*.day_of_week' => 'dayOfWeek',
            'schedules.*.start_period' => 'startPeriod',
            'schedules.*.room' => 'room',
        ];
    }
}
