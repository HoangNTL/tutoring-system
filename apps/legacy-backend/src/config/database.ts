import knex from 'knex';
import dotenv from 'dotenv';
import rTracer from 'cls-rtracer';

import logger from '../utils/logger';

dotenv.config();

const db = knex({
  client: 'mssql',
  connection: {
    host: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT) || 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  },
  // optional: configure connection pool settings
});

// Listen for query events to log SQL queries and errors
db.on('query', (query) => {
  // log SQL queries in development mode for debugging
  if (process.env.NODE_ENV !== 'production') {
    logger.info(
      `[SQL] ${query.sql} | Params: ${JSON.stringify(query.bindings)}`,
    );
  }
});

// Test the database connection immediately
db.raw('SELECT 1')
  .then(() => {
    logger.info('[Database] SQL Server connected successfully.');
  })
  .catch((err) => {
    logger.error(`[Database] Connection failed! Reason: ${err.message}`, {
      stack: err.stack,
      code: err.code,
    });

    if (process.env.NODE_ENV !== 'production') {
      logger.error('Stopping server due to DB connection error...');
      process.exit(1);
    }
  });
export { db };
