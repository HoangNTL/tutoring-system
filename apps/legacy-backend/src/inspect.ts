import { db } from './config/database';
import logger from './shared/logger';

async function inspectSchema() {
  try {
    logger.info('--- Inserting test mappings for Course 018801 (ID 196) ---');
    
    // Check if mappings already exist just in case
    const existing = await db('TKB_MonHocGiangVien')
      .where('IDMonHoc', 196)
      .whereIn('IDGiangVien', [1, 3]);

    if (existing.length > 0) {
      logger.info('Mappings already exist: ' + JSON.stringify(existing, null, 2));
      return;
    }

    // Insert mapping for Phạm Duy Hòa (ID 1)
    await db('TKB_MonHocGiangVien').insert({
      IDGiangVien: 1,
      IDMonHoc: 196,
      IDHeDaoTao: 1,
      IDLoaiDaoTao: 1,
      NguoiTao: 1,
      NgayTao: new Date(),
    });
    logger.info('Inserted mapping for Pham Duy Hoa (ID 1)');

    // Insert mapping for Hoàng Tùng (ID 3)
    await db('TKB_MonHocGiangVien').insert({
      IDGiangVien: 3,
      IDMonHoc: 196,
      IDHeDaoTao: 1,
      IDLoaiDaoTao: 1,
      NguoiTao: 1,
      NgayTao: new Date(),
    });
    logger.info('Inserted mapping for Hoang Tung (ID 3)');

  } catch (error: any) {
    logger.error('Insertion failed: ' + error.message, { stack: error.stack });
  } finally {
    await db.destroy();
  }
}

inspectSchema();
