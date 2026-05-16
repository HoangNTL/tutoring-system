<?php

namespace App\Http\Resources;

use App\Enums\TutorialPeriodStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorialPeriodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'startRegDate' => $this->formatDateTime($this->start_reg_date),
            'endRegDate' => $this->formatDateTime($this->end_reg_date),
            'startStudyDate' => $this->formatDateTime($this->start_study_date),
            'endStudyDate' => $this->formatDateTime($this->end_study_date),
            'status' => $this->status?->name,
            'openedAt' => $this->whenNotNull($this->formatDateTime($this->opened_at)),
            'assignedAt' => $this->whenNotNull($this->formatDateTime($this->assigned_at)),
            'startedAt' => $this->whenNotNull($this->formatDateTime($this->started_at)),
            'closedAt' => $this->whenNotNull($this->formatDateTime($this->closed_at)),
            'createdBy' => $this->whenLoaded('createdBy', function (): ?array {
                if (!$this->createdBy) {
                    return null;
                }

                return [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                ];
            }),
            'createdAt' => $this->formatDateTime($this->created_at),
            'updatedAt' => $this->formatDateTime($this->updated_at),
            'permissions' => [
                'canEdit' => $this->status === TutorialPeriodStatus::DRAFT,
                'canDelete' => $this->status === TutorialPeriodStatus::DRAFT,
                'canOpen' => $this->status === TutorialPeriodStatus::DRAFT && $this->hasValidRegistrationDates(),
            ],
            'statusLogs' => $this->when(
                $request->boolean('include_status_logs') && $this->relationLoaded('statusLogs'),
                function () use ($request) {
                    $limit = max(1, min((int) $request->integer('status_logs_limit', 10), 100));

                    return $this->statusLogs
                    ->take($limit)
                    ->map(function ($log): array {
                        return [
                            'id' => $log->id,
                            'oldStatus' => $log->old_status?->name,
                            'newStatus' => $log->new_status?->name,
                            'changedBy' => $log->changedBy
                                ? [
                                    'id' => $log->changedBy->id,
                                    'username' => $log->changedBy->username,
                                ]
                                : null,
                            'note' => $log->note,
                            'createdAt' => $this->formatDateTime($log->created_at),
                            'updatedAt' => $this->formatDateTime($log->updated_at),
                        ];
                    })
                    ->values()
                    ->all();
                }
            ),
        ];
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
