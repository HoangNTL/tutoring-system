import { db } from './config/database';
import logger from './shared/logger';

async function inspectSchema() {
  try {
    logger.info('--- Joining DM_GiangVien to DM_MonHoc via TKB_MonHocGiangVien ---');
    
    // Count matches
    const matchesCount = await db('DM_GiangVien as gv')
      .join('TKB_MonHocGiangVien as mhg', 'gv.Id', 'mhg.IDGiangVien')
      .join('DM_MonHoc as mh', 'mhg.IDMonHoc', 'mh.Id')
      .count('gv.Id as total');
    
    logger.info('Matching rows: ' + JSON.stringify(matchesCount, null, 2));

    // Get a few sample matches
    const sample = await db('DM_GiangVien as gv')
      .join('TKB_MonHocGiangVien as mhg', 'gv.Id', 'mhg.IDGiangVien')
      .join('DM_MonHoc as mh', 'mhg.IDMonHoc', 'mh.Id')
      .select('gv.MaGiangVien', 'gv.HoDem', 'gv.Ten', 'mh.MaMonHoc', 'mh.TenMonHoc')
      .limit(5);

    logger.info('Sample matches: ' + JSON.stringify(sample, null, 2));
    
  } catch (error: any) {
    logger.error('Inspection failed: ' + error.message, { stack: error.stack });
  } finally {
    await db.destroy();
  }
}

inspectSchema();
