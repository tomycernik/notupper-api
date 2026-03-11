import { get } from 'env-var';
import dotenv from 'dotenv';

dotenv.config();

export const envs = {
  PORT: get('PORT').default('3000').asPortNumber(),
  NODE_ENV: get('NODE_ENV').default('development').asString(),
  SUPABASE_URL: get('SUPABASE_URL').required().asString(),
  SUPABASE_SERVICE_ROLE_KEY: get('SUPABASE_SERVICE_ROLE_KEY').required().asString(),
  JWT_SECRET: get('JWT_SECRET').required().asString(),
};
