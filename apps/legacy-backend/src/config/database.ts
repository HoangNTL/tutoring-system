import knex from 'knex';

import { env, isProduction } from '@/config/env';
import logger from '@/shared/logger';

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
    logger.info('[Database] SQL Server connected successfully.');
  })
  .catch((err) => {
    logger.error(`[Database] Connection failed! Reason: ${err.message}`, {
      stack: err.stack,
      code: err.code,
    });

    if (!isProduction) {
      logger.error('Stopping server due to DB connection error...');
      process.exit(1);
    }
  });

export { db };
