<?php

namespace App\Http\Requests\Department;

use App\Http\Requests\BaseFormRequest;

class AssignTutorialClassLecturerRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lecturer_id' => ['required', 'integer', 'min:1'],
        ];
    }

    public function attributes(): array
    {
        return [
            'lecturer_id' => 'lecturerId',
        ];
    }
}
