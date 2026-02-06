import { createClient } from './supabase/server';

export const supabase = await createClient();
