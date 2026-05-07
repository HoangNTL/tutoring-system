import sql from "mssql";
import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// configure connection pool
export const pool = new sql.ConnectionPool(dbConfig);
export const poolConnect = pool.connect();

// configure Knex for query building
export const db = knex({
  client: "mssql",
  connection: dbConfig,
  pool: { min: 2, max: 10 },
})