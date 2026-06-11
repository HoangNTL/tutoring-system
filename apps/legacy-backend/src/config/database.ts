import knex from 'knex';

import { env, isProduction } from '@/config/env';
import logger from '@/shared/logger';

let databaseAvailable: boolean | null = null;

const db = knex({
  client: 'mssql',
  connection: {
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    port: env.db.port,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
});

db.on('query', (query) => {
  if (!isProduction) {
    logger.info(
      `[SQL] ${query.sql} | Params: ${JSON.stringify(query.bindings)}`,
    );
  }
});

db.raw('SELECT 1')
  .then(() => {
    databaseAvailable = true;
    logger.info('[Database] SQL Server connected successfully.');
  })
  .catch((err) => {
    databaseAvailable = false;

    logger.error(`[Database] Connection failed! Reason: ${err.message}`, {
      stack: err.stack,
      code: err.code,
    });

    if (env.allowStartWithoutDb) {
      logger.warn(
        '[Database] Starting without SQL Server because ALLOW_START_WITHOUT_DB=true. Legacy endpoints will return empty fallback data.',
      );
      return;
    }

    if (!isProduction) {
      logger.error('Stopping server due to DB connection error...');
      process.exit(1);
    }
  });

export const shouldUseDatabaseFallback = (): boolean =>
  env.allowStartWithoutDb && databaseAvailable === false;

export { db };
