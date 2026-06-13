<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\TutorialPeriods\DepartmentTutorialClassService;
use Illuminate\Http\Request;

class DepartmentRoomController extends Controller
{
    public function __construct(
        private DepartmentTutorialClassService $departmentTutorialClassService,
    ) {}

    public function index(Request $request)
    {
        $this->authorize("viewAny", Room::class);

        return $this->success(
            $this->departmentTutorialClassService->getRoomOptions(),
            "Rooms retrieved successfully",
        );
    }
}
