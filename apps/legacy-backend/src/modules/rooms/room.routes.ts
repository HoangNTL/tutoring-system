import { Router } from 'express';

import { RoomController } from '@/modules/rooms/room.controller';
import { RoomRepository } from '@/modules/rooms/room.repository';

const roomRouter = Router();

const roomRepository = new RoomRepository();
const roomController = new RoomController(roomRepository);

roomRouter.get('/', roomController.getAllRooms);

export default roomRouter;
