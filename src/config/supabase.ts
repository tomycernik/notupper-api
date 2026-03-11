import { createClient } from '@supabase/supabase-js';
import { envs } from './envs';

export const supabase = createClient(
  envs.SUPABASE_URL,
  envs.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
