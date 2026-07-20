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

export const updateTrip = async (tripId, updates) => {
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single();
  return { data, error };
};

export const deleteTrip = async (tripId) => {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  return { error };
};

export const createTripStop = async (tripId, stop) => {
  const { data, error } = await supabase
    .from('trip_stops')
    .insert({ trip_id: tripId, ...stop })
    .select()
    .single();
  return { data, error };
};

export const updateTripStop = async (stopId, updates) => {
  const { data, error } = await supabase
    .from('trip_stops')
    .update(updates)
    .eq('id', stopId)
    .select()
    .single();
  return { data, error };
};

export const deleteTripStop = async (stopId) => {
  const { error } = await supabase.from('trip_stops').delete().eq('id', stopId);
  return { error };
};

// ── Follow helpers ────────────────────────────────────────────────────────────

export const getFollowing = async (userId) => {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id, profiles!following_id(id, name, handle, avatar_url, preset_bg, city)')
    .eq('follower_id', userId);
  return { data, error };
};

export const getFollowers = async (userId) => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, profiles!follower_id(id, name, handle, avatar_url, preset_bg, city)')
    .eq('following_id', userId);
  return { data, error };
};

export const followUser = async (myId, targetId) => {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: myId, following_id: targetId });
  return { error };
};

export const unfollowUser = async (myId, targetId) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', myId)
    .eq('following_id', targetId);
  return { error };
};

// ── Social feed helpers ───────────────────────────────────────────────────────

export const getRunners = async (myId) => {
  const [{ data: profiles }, { data: following }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, handle, avatar_url, preset_bg, city')
      .neq('id', myId)
      .order('name'),
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', myId),
  ]);
  const followingSet = new Set((following || []).map(f => f.following_id));
  return {
    data: (profiles || []).map(p => ({ ...p, isFollowing: followingSet.has(p.id) })),
    error: null,
  };
};

export const getActivityFeed = async (myId) => {
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', myId);

  if (!follows?.length) return { data: [], error: null };

  const followingIds = follows.map(f => f.following_id);
  const { data, error } = await supabase
    .from('saved_clubs')
    .select('*, profiles!user_id(id, name, handle, avatar_url, preset_bg, city)')
    .in('user_id', followingIds)
    .order('saved_at', { ascending: false })
    .limit(30);

  return { data: data || [], error };
};

// ── Messages helpers ──────────────────────────────────────────────────────────

export const getConversations = async (myId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, sender_id, receiver_id, content, read_at, created_at,
      sender:profiles!sender_id(id, name, handle, avatar_url, preset_bg),
      receiver:profiles!receiver_id(id, name, handle, avatar_url, preset_bg)
    `)
    .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };

  const seen = new Map();
  for (const msg of (data || [])) {
    const partnerId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
    const partner = msg.sender_id === myId ? msg.receiver : msg.sender;
    if (!seen.has(partnerId)) {
      seen.set(partnerId, { partnerId, partner, lastMessage: msg, unreadCount: 0 });
    }
    if (!msg.read_at && msg.sender_id !== myId) {
      seen.get(partnerId).unreadCount++;
    }
  }
  return { data: Array.from(seen.values()), error: null };
};

export const getMessages = async (myId, partnerId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, read_at, created_at')
    .or(
      `and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`
    )
    .order('created_at', { ascending: true });
  return { data: data || [], error };
};

export const sendMessage = async (senderId, receiverId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content })
    .select()
    .single();
  return { data, error };
};

export const subscribeToMessages = (myId, partnerId, onMessage) => {
  const channelName = `messages:${[myId, partnerId].sort().join('-')}`;
  return supabase
    .channel(channelName)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${myId}`,
    }, payload => {
      if (payload.new.sender_id === partnerId) {
        onMessage(payload.new);
      }
    })
    .subscribe();
};

export const markMessagesRead = async (myId, senderId) => {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', myId)
    .eq('sender_id', senderId)
    .is('read_at', null);
  return { error };
};
