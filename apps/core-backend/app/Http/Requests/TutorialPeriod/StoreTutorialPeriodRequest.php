<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Http\Requests\BaseFormRequest;

class StoreTutorialPeriodRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_period_id' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'registration_start_at' => ['required', 'date', 'before:registration_end_at'],
            'registration_end_at' => ['required', 'date', 'after:registration_start_at', 'before:study_start_at'],
            'study_start_at' => ['required', 'date', 'after:registration_end_at', 'before:study_end_at'],
            'study_end_at' => ['required', 'date', 'after:study_start_at'],
        ];
    }

    public function attributes(): array
    {
        return [
            'academic_period_id' => 'academicPeriodId',
            'registration_start_at' => 'registrationStartAt',
            'registration_end_at' => 'registrationEndAt',
            'study_start_at' => 'studyStartAt',
            'study_end_at' => 'studyEndAt',
        ];
    }
}
