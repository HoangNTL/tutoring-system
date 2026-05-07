import knex from 'knex';
import dotenv from 'dotenv';
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

db.on('query-error', (error, obj) => {
  logger.error(`[SQL Error] ${error.message} | Query: ${obj.sql}`);
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

// const dbConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER || 'localhost',
//   database: process.env.DB_DATABASE,
//   port: Number(process.env.DB_PORT) || 1433,
//   options: {
//     encrypt: false,
//     trustServerCertificate: true,
//   },
// };

// // configure connection pool
// export const pool = new sql.ConnectionPool(dbConfig);
// export const poolConnect = pool.connect();

// // configure Knex for query building
// export const db = knex({
//   client: 'mssql',
//   connection: dbConfig,
//   pool: { min: 2, max: 10 },
// });
