<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorialClassSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'tutorial_class_id',
        'room_id',
        'room_code',
        'room_name',
        'room_capacity',
        'day_of_week',
        'start_period',
        'end_period',
    ];

    protected function casts(): array
    {
        return [
            'tutorial_class_id' => 'integer',
            'room_id' => 'integer',
            'room_capacity' => 'integer',
            'day_of_week' => 'integer',
            'start_period' => 'integer',
            'end_period' => 'integer',
        ];
    }

    public function tutorialClass(): BelongsTo
    {
        return $this->belongsTo(TutorialClass::class, 'tutorial_class_id');
    }
}
