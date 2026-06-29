import { createClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
);

export function subscribeToTable<T = any>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
) {
  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes',
      { event, schema: 'public', table },
      callback,
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
