
import { supabase } from './supabase';
export async function signIn(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'uberclone://auth' } });
  if (error) throw error;
}
export async function signOut() { await supabase.auth.signOut(); }
