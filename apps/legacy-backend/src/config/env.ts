import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  coreBackendUrl: process.env.CORE_BACKEND_URL || 'http://localhost:8000',
  coreBackendApiKey: process.env.CORE_BACKEND_API_KEY || '',
  db: {
    host: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    port: toNumber(process.env.DB_PORT, 1433),
  },
};

export const isProduction = env.nodeEnv === 'production';
