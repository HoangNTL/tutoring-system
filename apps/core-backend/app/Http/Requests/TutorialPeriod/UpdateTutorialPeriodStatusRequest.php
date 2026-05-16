<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Enums\TutorialPeriodStatus;
use App\Http\Requests\BaseFormRequest;

class UpdateTutorialPeriodStatusRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:' . implode(',', [
                TutorialPeriodStatus::OPEN->name,
                TutorialPeriodStatus::ASSIGNING->name,
                TutorialPeriodStatus::ONGOING->name,
                TutorialPeriodStatus::CLOSED->name,
            ])],
        ];
    }
}
