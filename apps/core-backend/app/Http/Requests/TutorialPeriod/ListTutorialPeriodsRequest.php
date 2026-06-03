<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Enums\TutorialPeriodStatus;
use App\Http\Requests\BaseQueryRequest;

class ListTutorialPeriodsRequest extends BaseQueryRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'search' => 'string|nullable|max:255',
            'status' => 'string|nullable|in:' . implode(
                ',',
                array_map(
                    static fn(TutorialPeriodStatus $status): string => $status->name,
                    TutorialPeriodStatus::cases()
                )
            ),
        ]);
    }

    /**
     * @return array<string, string>
     */
    protected function sortableFields(): array
    {
        return [
            'id' => 'id',
            'academicPeriodId' => 'academic_period_id',
            'title' => 'title',
            'registrationStartAt' => 'registration_start_at',
            'registrationEndAt' => 'registration_end_at',
            'studyStartAt' => 'study_start_at',
            'studyEndAt' => 'study_end_at',
            'status' => 'status',
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];
    }
}
