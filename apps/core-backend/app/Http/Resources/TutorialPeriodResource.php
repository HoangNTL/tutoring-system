<?php

namespace App\Http\Resources;

use App\Enums\TutorialPeriodStatus;
use Illuminate\Http\Request;

class TutorialPeriodResource extends BaseApiResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->camelize([
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'start_reg_date' => $this->formatDateTime($this->start_reg_date),
            'end_reg_date' => $this->formatDateTime($this->end_reg_date),
            'start_study_date' => $this->formatDateTime($this->start_study_date),
            'end_study_date' => $this->formatDateTime($this->end_study_date),
            'status' => $this->status?->name,
            'opened_at' => $this->whenNotNull($this->formatDateTime($this->opened_at)),
            'assigned_at' => $this->whenNotNull($this->formatDateTime($this->assigned_at)),
            'started_at' => $this->whenNotNull($this->formatDateTime($this->started_at)),
            'closed_at' => $this->whenNotNull($this->formatDateTime($this->closed_at)),
            'created_by' => $this->whenLoaded('createdBy', function (): ?array {
                if (!$this->createdBy) {
                    return null;
                }

                return [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                ];
            }),
            'created_at' => $this->formatDateTime($this->created_at),
            'updated_at' => $this->formatDateTime($this->updated_at),
            'permissions' => [
                'can_edit' => $this->status === TutorialPeriodStatus::DRAFT,
                'can_delete' => $this->status === TutorialPeriodStatus::DRAFT,
                'can_open' => $this->status === TutorialPeriodStatus::DRAFT && $this->hasValidRegistrationDates(),
            ],
            'status_logs' => $this->when(
                $request->boolean('include_status_logs') && $this->relationLoaded('statusLogs'),
                function () use ($request) {
                    $limit = max(1, min((int) $request->integer('status_logs_limit', 10), 100));

                    return $this->statusLogs
                    ->take($limit)
                    ->map(function ($log): array {
                        return [
                            'id' => $log->id,
                            'old_status' => $log->old_status?->name,
                            'new_status' => $log->new_status?->name,
                            'changed_by' => $log->changedBy
                                ? [
                                    'id' => $log->changedBy->id,
                                    'username' => $log->changedBy->username,
                                ]
                                : null,
                            'note' => $log->note,
                            'created_at' => $this->formatDateTime($log->created_at),
                            'updated_at' => $this->formatDateTime($log->updated_at),
                        ];
                    })
                    ->values()
                    ->all();
                }
            ),
        ]);
    }

    private function formatDateTime(mixed $value): ?string
    {
        return $value?->format('Y-m-d H:i:s');
    }

    private function hasValidRegistrationDates(): bool
    {
        return $this->start_reg_date !== null
            && $this->end_reg_date !== null
            && $this->start_reg_date->lt($this->end_reg_date);
    }
}
