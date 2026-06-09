import { db } from '@/config/database';

import { Room } from '@/modules/rooms/room.types';

export class RoomRepository {
  async getAll(): Promise<Room[]> {
    const rooms = await db('DM_Phong')
      .whereRaw(`
        (IsDeleted = 0 OR IsDeleted IS NULL)
        AND (IsNgungSuDung = 0 OR IsNgungSuDung IS NULL)
      `)
      .orderBy('TenPhong', 'asc')
      .select(
        'Id as id',
        'MaPhong as code',
        'TenPhong as name',
        'SoCho as capacity',
      );

    return rooms.map((room) => ({
      id: Number(room.id),
      code: String(room.code ?? '').trim(),
      name: String(room.name ?? '').trim(),
      capacity: Number(room.capacity ?? 0),
    }));
  }
}
