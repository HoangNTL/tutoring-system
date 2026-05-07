import winston from 'winston';
import path from 'path';
import rTracer from 'cls-rtracer';

// Custom format to inject requestId into log messages
const injectRequestId = winston.format((info) => {
  const rid = rTracer.id();
  if (rid) info.requestId = rid;
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    injectRequestId(),
  ),
  transports: [
    // --- CONSOLE ---
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, metadata, requestId }: any) => {
            const shortId = requestId
              ? ` [${(requestId as string).split('-')[0]}]`
              : '';
            let log = `[${timestamp}]${shortId} ${level}: ${message}`;

            if ((metadata as any)?.stack) {
              const stackLines =
                typeof (metadata as any).stack === 'string'
                  ? (metadata as any).stack.split('\n')
                  : (metadata as any).stack;

              const shortStack = stackLines.slice(1, 4).join('\n    ');
              if (shortStack) log += `\n    ${shortStack}`;
            }

            return log;
          },
        ),
      ),
    }),

    // --- FILE ---
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: winston.format.json(),
    }),

    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: winston.format.json(),
    }),
  ],
});

export default logger;
