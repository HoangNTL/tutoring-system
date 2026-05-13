<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Http\Requests\BaseQueryParamsRequest;

class ListTutorialPeriodsRequest extends BaseQueryParamsRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'sortBy' => 'string|nullable|in:id,title,start_reg_date,end_reg_date,start_study_date,end_study_date,status,created_at,updated_at',
            'search' => 'string|nullable|max:255',
        ]);
    }
}
