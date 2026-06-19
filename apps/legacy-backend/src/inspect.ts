import { db } from './config/database';
import logger from './shared/logger';

async function inspectSchema() {
  try {
    logger.info('--- Querying relationship between DM_GiangVien and TMP_DsBoMonKhoa ---');
    
    // Check if IDKhoa values match IDBoMon values
    const matchCount = await db('DM_GiangVien as gv')
      .join('TMP_DsBoMonKhoa as bm', 'gv.IDKhoa', '=', 'bm.IDBoMon')
      .count('gv.Id as total');

    logger.info('Matching rows between IDKhoa and IDBoMon: ' + JSON.stringify(matchCount, null, 2));

    // Show a sample mapping
    const sample = await db('DM_GiangVien as gv')
      .join('TMP_DsBoMonKhoa as bm', 'gv.IDKhoa', '=', 'bm.IDBoMon')
      .select('gv.Id as LecturerId', 'gv.MaGiangVien', 'gv.HoDem', 'gv.Ten', 'bm.IDBoMon', 'bm.TenBoMon')
      .limit(5);

    logger.info('Sample matching: ' + JSON.stringify(sample, null, 2));

  } catch (error: any) {
    logger.error('Inspection failed: ' + error.message, { stack: error.stack });
  } finally {
    await db.destroy();
  }
}

inspectSchema();
