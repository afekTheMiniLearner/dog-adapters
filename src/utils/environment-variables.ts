import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { dotEnvPath } from './paths';

expand(config({ path: dotEnvPath }));

export const PORT: number = +(process.env.PORT ?? 3005);
export const MONGO_URL: string = process.env.MONGO_URL ?? '';
export const NODE_ENV: string = process.env.NODE_ENV ?? 'local';
export const LOGGING_MODE: string = process.env.LOGGING_MODE ?? 'error';
