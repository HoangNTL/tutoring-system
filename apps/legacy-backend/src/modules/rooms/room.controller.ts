import { Request, Response } from 'express';

import { RoomRepository } from '@/modules/rooms/room.repository';
import { successResponse } from '@/shared/response';

export class RoomController {
  constructor(private readonly roomRepository: RoomRepository) {}

  getAllRooms = async (_req: Request, res: Response): Promise<Response> => {
    const rooms = await this.roomRepository.getAll();

    return successResponse(res, rooms, 'Rooms fetched successfully');
  };
}
