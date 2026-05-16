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
            'title' => 'title',
            'startRegDate' => 'start_reg_date',
            'endRegDate' => 'end_reg_date',
            'startStudyDate' => 'start_study_date',
            'endStudyDate' => 'end_study_date',
            'status' => 'status',
            'createdAt' => 'created_at',
            'updatedAt' => 'updated_at',
        ];
    }
}
