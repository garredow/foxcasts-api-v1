import dotenv from 'dotenv';
import { parseBool } from './parseBool';
dotenv.config();

enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
  Silent = 'silent',
}

export type Config = {
  logger: {
    enabled: boolean;
    level: `${LogLevel}`;
    file?: string;
  };
  podcastIndex: {
    apiKey: string;
    apiSecret: string;
  };
  swagger: {
    host: string;
    schemes: string[];
  };
  authorization: {
    enabled: boolean;
    jwtSecret: string;
    allowedTokens: string[];
  };
};

export const config: Config = {
  logger: {
    enabled: parseBool(process.env.LOGGER_ENABLED, true),
    level: Object.values(LogLevel).includes(
      process.env.LOGGER_LEVEL as LogLevel
    )
      ? (process.env.LOGGER_LEVEL as LogLevel)
      : 'info',
    file: process.env.LOGGER_FILE || undefined,
  },
  podcastIndex: {
    apiKey: process.env.API_KEY || '',
    apiSecret: process.env.API_SECRET || '',
  },
  swagger: {
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    schemes: process.env.SWAGGER_SCHEMES?.split(',') || ['http'],
  },
  authorization: {
    enabled: parseBool(process.env.AUTH_ENABLED, true),
    jwtSecret: process.env.JWT_SECRET || 'secret',
    allowedTokens: process.env.ALLOWED_TOKENS?.split(',') || [],
  },
};
