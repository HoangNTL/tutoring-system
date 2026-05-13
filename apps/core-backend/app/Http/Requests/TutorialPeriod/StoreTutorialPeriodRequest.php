<?php

namespace App\Http\Requests\TutorialPeriod;

use Illuminate\Foundation\Http\FormRequest;

class StoreTutorialPeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'start_reg_date' => ['required', 'date', 'before:end_reg_date'],
            'end_reg_date' => ['required', 'date', 'after:start_reg_date'],
            'start_study_date' => ['required', 'date'],
            'end_study_date' => ['required', 'date'],
        ];
    }
}
