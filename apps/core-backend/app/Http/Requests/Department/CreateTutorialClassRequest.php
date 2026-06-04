<?php

namespace App\Http\Requests\Department;

use App\Http\Requests\BaseFormRequest;

class CreateTutorialClassRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_code' => ['required', 'string', 'max:100'],
            'total_sessions' => ['required', 'integer', 'min:1', 'max:30'],
            'periods_per_session' => ['required', 'integer', 'min:1', 'max:6'],
        ];
    }

    public function attributes(): array
    {
        return [
            'course_code' => 'courseCode',
            'total_sessions' => 'totalSessions',
            'periods_per_session' => 'periodsPerSession',
        ];
    }
}
