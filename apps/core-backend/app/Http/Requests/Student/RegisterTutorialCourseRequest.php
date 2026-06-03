<?php

namespace App\Http\Requests\Student;

use App\Http\Requests\BaseFormRequest;

class RegisterTutorialCourseRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_code' => ['required', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'course_code' => 'courseCode',
        ];
    }
}
