<?php

namespace App\Http\Requests\Department;

use App\Http\Requests\BaseFormRequest;

class UpdateTutorialClassRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total_sessions' => ['required', 'integer', 'min:1', 'max:30'],
            'periods_per_session' => ['required', 'integer', 'min:1', 'max:6'],
        ];
    }

    public function attributes(): array
    {
        return [
            'total_sessions' => 'totalSessions',
            'periods_per_session' => 'periodsPerSession',
        ];
    }
}
