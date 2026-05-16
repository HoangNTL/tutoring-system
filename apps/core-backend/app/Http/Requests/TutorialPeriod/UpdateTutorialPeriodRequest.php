<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Http\Requests\BaseFormRequest;
use App\Models\TutorialPeriod;

class UpdateTutorialPeriodRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'start_reg_date' => ['sometimes', 'date', 'before:end_reg_date'],
            'end_reg_date' => ['sometimes', 'date', 'after:start_reg_date'],
            'start_study_date' => ['sometimes', 'date'],
            'end_study_date' => ['sometimes', 'date'],
        ];
    }

    protected function afterPrepareForValidation(): void
    {
        $payload = $this->all();

        /** @var TutorialPeriod|null $tutorialPeriod */
        $tutorialPeriod = $this->route('tutorial_period');

        if ($tutorialPeriod !== null) {
            $isUpdatingStartRegDate = array_key_exists('start_reg_date', $payload) && $payload['start_reg_date'] !== null;
            $isUpdatingEndRegDate = array_key_exists('end_reg_date', $payload) && $payload['end_reg_date'] !== null;

            if ($isUpdatingStartRegDate && !$isUpdatingEndRegDate) {
                $payload['end_reg_date'] = optional($tutorialPeriod->end_reg_date)->format('Y-m-d H:i:s');
            }

            if ($isUpdatingEndRegDate && !$isUpdatingStartRegDate) {
                $payload['start_reg_date'] = optional($tutorialPeriod->start_reg_date)->format('Y-m-d H:i:s');
            }
        }

        $this->merge($payload);
    }

    public function attributes(): array
    {
        return [
            'start_reg_date' => 'startRegDate',
            'end_reg_date' => 'endRegDate',
            'start_study_date' => 'startStudyDate',
            'end_study_date' => 'endStudyDate',
        ];
    }
}
