import { Request, Response } from 'express'
import { pool, poolConnect } from '../config/db'

export const testDb = async (req: Request, res: Response) => {
  try {
    await poolConnect

    // const result = await pool.request().query('SELECT 1 as test')
    const result = await pool.request().query(`
      SELECT TOP (50)
        Id,
        MaSinhVien,
        HoDem + ' ' + Ten AS HoTen,
        GioiTinh,
        NgaySinh,
        Email
      FROM DT_SinhVien
    `)

    res.json({
      message: 'DB Connected',
      result: result.recordset
    })
  } catch (err: any) {
    res.status(500).json({
      error: err.message
    })
  }
}
