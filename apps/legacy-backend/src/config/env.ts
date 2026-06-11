import dotenv from 'dotenv';

dotenv.config();

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const toOptionalNumber = (value: string | undefined): number | null => {
  if (value === undefined || value.trim() === '') {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : null;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  allowStartWithoutDb: toBoolean(process.env.ALLOW_START_WITHOUT_DB, false),
  coreBackendUrl: process.env.CORE_BACKEND_URL || 'http://localhost:8000',
  coreBackendApiKey: process.env.CORE_BACKEND_API_KEY || '',
  db: {
    host: process.env.DB_SERVER || 'localhost',
    instance: process.env.DB_INSTANCE || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || '',
    port: toOptionalNumber(process.env.DB_PORT),
  },
};

export const isProduction = env.nodeEnv === 'production';
