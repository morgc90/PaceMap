import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ── Auth helpers ──────────────────────────────────────────────────────────────

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

export const signInWithApple = () =>
  supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo: window.location.origin },
  });

export const signInWithEmail = (email) =>
  supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });

export const signOut = () => supabase.auth.signOut();

// ── Profile helpers ───────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const upsertProfile = async (profile) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  return { data, error };
};

// ── Saved clubs helpers ───────────────────────────────────────────────────────

export const getSavedClubs = async (userId) => {
  const { data, error } = await supabase
    .from('saved_clubs')
    .select('club_id, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });
  return { data, error };
};

export const saveClub = async (userId, clubId) => {
  const { error } = await supabase
    .from('saved_clubs')
    .insert({ user_id: userId, club_id: clubId });
  return { error };
};

export const unsaveClub = async (userId, clubId) => {
  const { error } = await supabase
    .from('saved_clubs')
    .delete()
    .eq('user_id', userId)
    .eq('club_id', clubId);
  return { error };
};

// ── Trip helpers ──────────────────────────────────────────────────────────────

export const getTrips = async (userId) => {
  const { data, error } = await supabase
    .from('trips')
    .select('*, trip_stops(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createTrip = async (userId, trip) => {
  const { data, error } = await supabase
    .from('trips')
    .insert({ user_id: userId, ...trip })
    .select()
    .single();
  return { data, error };
};
