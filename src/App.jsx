import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { RUN_CLUBS, VIBE_TAGS } from "./data/clubs";
import Logo from "./Logo";
import {
  supabase,
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signOut,
  getProfile,
  upsertProfile,
  getSavedClubs,
  saveClub,
  unsaveClub,
} from "./supabase";
import "./App.css";

// ─── Static data ──────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: "Sarah Chen", handle: "@sarahchen", avatar: "SC", city: "London", following: false, clubs: 8, trips: 3, mutual: 2 },
  { id: 2, name: "David Murphy", handle: "@dmurph", avatar: "DM", city: "Dublin", following: true, clubs: 12, trips: 5, mutual: 5 },
  { id: 3, name: "Ana García", handle: "@anagarcia", avatar: "AG", city: "Madrid", following: false, clubs: 6, trips: 2, mutual: 1 },
  { id: 4, name: "Tom Walsh", handle: "@tomwalsh", avatar: "TW", city: "Dublin", following: true, clubs: 9, trips: 4, mutual: 8 },
  { id: 5, name: "Mei Tanaka", handle: "@meitanaka", avatar: "MT", city: "Tokyo", following: false, clubs: 14, trips: 7, mutual: 0 },
];

const ACTIVITY_FEED = [
  { id: 1, user: USERS[1], action: "saved", club: "Mild Activity", city: "Dublin", time: "2m ago", emoji: "🍕" },
  { id: 2, user: USERS[3], action: "added to trip", club: "FROLIK", city: "Valencia", time: "14m ago", emoji: "🎉" },
  { id: 3, user: USERS[0], action: "saved", club: "Midnight Runners", city: "London", time: "1h ago", emoji: "🎶" },
  { id: 4, user: USERS[2], action: "planned a trip to", club: "Paris + Amsterdam", city: "Europe", time: "2h ago", emoji: "✈️" },
  { id: 5, user: USERS[4], action: "saved", club: "080Tokyo", city: "Tokyo", time: "3h ago", emoji: "🗾" },
];

const MESSAGES_DATA = [
  { id: 1, user: USERS[1], last: "Are you doing the Wednesday pizza run?", time: "2m", unread: 2 },
  { id: 2, user: USERS[3], last: "FROLIK Tuesday is incredible 🔥", time: "1h", unread: 0 },
  { id: 3, user: USERS[0], last: "See you at Midnight Runners!", time: "3h", unread: 1 },
  { id: 4, user: USERS[2], last: "TRC Madrid 7am Saturday?", time: "1d", unread: 0 },
];

const SAMPLE_TRIP = {
  name: "Europe Summer Tour", dates: "Jun 14 – Jul 2", isPublic: true,
  stops: [
    { city: "Dublin", date: "Jun 14", club: "Mild Activity", time: "9am", done: true, emoji: "🍕", alsoGoing: [USERS[1], USERS[3]] },
    { city: "London", date: "Jun 19", club: "Midnight Runners", time: "7pm", done: true, emoji: "🎶", alsoGoing: [USERS[0]] },
    { city: "Madrid", date: "Jun 25", club: null, time: null, done: false, emoji: "🏅", alsoGoing: [] },
    { city: "Valencia", date: "Jun 29", club: "FROLIK", time: "8pm", done: false, emoji: "🎉", alsoGoing: [USERS[3], USERS[2]] },
  ],
};

const CITIES_LIST = ["Dublin", "London", "Madrid", "Barcelona", "Valencia", "Amsterdam", "Paris", "New York", "Bangkok", "Rome", "Milan", "Lisbon", "Berlin", "Vienna", "Stockholm", "Other"];
const PACE_OPTIONS = ["<5:00 /km", "5:00–5:30 /km", "5:30–6:30 /km", "6:30–7:30 /km", "7:30+ /km", "Just vibes 🤙"];
const PRESET_AVATARS = [
  { id: "a", bg: "linear-gradient(135deg,#FC4C02,#ff8c00)" },
  { id: "b", bg: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
  { id: "c", bg: "linear-gradient(135deg,#00C875,#00a86b)" },
  { id: "d", bg: "linear-gradient(135deg,#ec4899,#f43f5e)" },
  { id: "e", bg: "linear-gradient(135deg,#0ea5e9,#2563eb)" },
  { id: "f", bg: "linear-gradient(135deg,#f59e0b,#eab308)" },
];

// ─── Auth screens ─────────────────────────────────────────────────────────────
function SignInScreen({ onEmailSent }) {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(null); // "google" | "apple" | "email"
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogle = async () => {
    setLoading("google"); setError(null);
    const { error } = await signInWithGoogle();
    if (error) { setError(error.message); setLoading(null); }
    // On success the page redirects — no need to clear loading
  };

  const handleApple = async () => {
    setLoading("apple"); setError(null);
    const { error } = await signInWithApple();
    if (error) { setError(error.message); setLoading(null); }
  };

  const handleEmail = async () => {
    if (!email) return;
    setLoading("email"); setError(null);
    const { error } = await signInWithEmail(email);
    if (error) { setError(error.message); setLoading(null); }
    else { setEmailSent(true); setLoading(null); }
  };

  if (emailSent) return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-content">
        <div className="auth-logo-wrap">
          <Logo full />
        </div>
        <div className="auth-card" style={{ textAlign: "center", gap: 16 }}>
          <div style={{ fontSize: 40 }}>📬</div>
          <div className="onboard-title">Check your email</div>
          <div className="onboard-sub">We sent a magic link to <strong style={{ color: "#fff" }}>{email}</strong>. Tap it to sign in — no password needed.</div>
          <button className="auth-link" onClick={() => setEmailSent(false)}>Use a different email</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-content">
        <div className="auth-logo-wrap">
          <Logo full />
          <div className="auth-tagline" style={{marginTop:4}}>Find your running tribe, anywhere.</div>
        </div>

        <div className="auth-card">
          <div className="auth-card-title">Get started</div>

          {error && <div className="auth-error">{error}</div>}

          {/* Passkey / Face ID note */}
          <button className="auth-btn passkey-btn" onClick={handleGoogle} disabled={!!loading}>
            <span className="auth-btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/>
                <path d="M9 12.5C9 14 10.5 16 12 16s3-2 3-3.5"/>
              </svg>
            </span>
            <span className="auth-btn-label">Continue with Passkey</span>
            <span className="auth-btn-sub">Face ID · Touch ID</span>
          </button>

          <div className="auth-divider"><span>or</span></div>

          <button className="auth-btn apple-btn" onClick={handleApple} disabled={!!loading}>
            <span className="auth-btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </span>
            <span className="auth-btn-label">{loading === "apple" ? "Redirecting…" : "Continue with Apple"}</span>
          </button>

          <button className="auth-btn google-btn" onClick={handleGoogle} disabled={!!loading}>
            <span className="auth-btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </span>
            <span className="auth-btn-label">{loading === "google" ? "Redirecting…" : "Continue with Google"}</span>
          </button>

          {!emailMode ? (
            <button className="auth-link" onClick={() => setEmailMode(true)}>Continue with email →</button>
          ) : (
            <div className="email-form">
              <input className="email-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEmail()} autoFocus />
              <button className="email-submit" disabled={!email || loading === "email"} onClick={handleEmail}>
                {loading === "email" ? "…" : "→"}
              </button>
            </div>
          )}
        </div>
        <div className="auth-footer">By continuing you agree to our Terms &amp; Privacy Policy</div>
      </div>
    </div>
  );
}

function OnboardingScreen({ session, onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || "");
  const [handle, setHandle] = useState("");
  const [city, setCity] = useState("");
  const [pace, setPace] = useState("");
  const [vibes, setVibes] = useState([]);
  const [photoSrc, setPhotoSrc] = useState(session?.user?.user_metadata?.avatar_url || null);
  const [presetId, setPresetId] = useState("a");
  const [saving, setSaving] = useState(false);

  const autoHandle = n => "@" + n.toLowerCase().replace(/\s+/g, "").slice(0, 16);
  const toggleVibe = id => setVibes(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 5 ? [...p, id] : p);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const selectedPreset = PRESET_AVATARS.find(p => p.id === presetId);

  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setSaving(true);
    const profile = {
      id: session.user.id,
      name,
      handle: handle || autoHandle(name),
      city,
      pace,
      vibes,
      preset_bg: selectedPreset.bg,
      avatar_url: photoSrc,
    };
    const { data, error } = await upsertProfile(profile);
    setSaving(false);
    if (!error) onComplete(data || profile);
  };

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-content">
        <div className="onboard-progress">
          {[1,2,3].map(s => <div key={s} className={`onboard-dot ${step >= s ? "active" : ""}`} />)}
        </div>

        {step === 1 && (
          <div className="onboard-card">
            <div className="avatar-picker-wrap">
              <label className="avatar-upload-btn" htmlFor="avatar-upload">
                {photoSrc
                  ? <img src={photoSrc} alt="profile" className="avatar-photo-preview" />
                  : <div className="avatar-initials-preview" style={{ background: selectedPreset.bg }}>{initials}</div>
                }
                <div className="avatar-upload-overlay"><i className="ti ti-camera" /></div>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
              {photoSrc && <button className="avatar-remove-btn" onClick={() => setPhotoSrc(null)}>Remove photo</button>}
            </div>
            {!photoSrc && (
              <div className="avatar-presets">
                <div className="avatar-presets-lbl">PICK A COLOUR</div>
                <div className="avatar-presets-row">
                  {PRESET_AVATARS.map(p => (
                    <button key={p.id} className={`avatar-preset-dot ${presetId === p.id ? "selected" : ""}`} style={{ background: p.bg }} onClick={() => setPresetId(p.id)} />
                  ))}
                </div>
              </div>
            )}
            <div className="onboard-title">What's your name?</div>
            <div className="onboard-sub">This is how other runners will find you</div>
            <input className="onboard-input" placeholder="Full name" value={name} onChange={e => { setName(e.target.value); setHandle(autoHandle(e.target.value)); }} autoFocus />
            <div className="onboard-handle-preview">{handle || "@yourhandle"}</div>
            <input className="onboard-input" placeholder="@handle (optional)" value={handle} onChange={e => setHandle(e.target.value)} />
            <button className="onboard-next" disabled={name.trim().length < 2} onClick={() => setStep(2)}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-card">
            <div className="onboard-title">Your running base</div>
            <div className="onboard-sub">Where do you run most?</div>
            <div className="onboard-section-lbl">HOME CITY</div>
            <div className="onboard-grid">
              {CITIES_LIST.map(c => <button key={c} className={`onboard-chip ${city === c ? "active" : ""}`} onClick={() => setCity(c)}>{c}</button>)}
            </div>
            <div className="onboard-section-lbl" style={{ marginTop: 16 }}>YOUR PACE</div>
            <div className="onboard-col">
              {PACE_OPTIONS.map(p => <button key={p} className={`onboard-pace-chip ${pace === p ? "active" : ""}`} onClick={() => setPace(p)}>{p}</button>)}
            </div>
            <div className="onboard-row">
              <button className="onboard-back" onClick={() => setStep(1)}>← Back</button>
              <button className="onboard-next flex1" disabled={!city || !pace} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-card">
            <div className="onboard-title">Your vibe</div>
            <div className="onboard-sub">Pick up to 5 — we'll find your tribe</div>
            <div className="onboard-vibes">
              {VIBE_TAGS.map(t => (
                <button key={t.id} className={`onboard-vibe-btn ${vibes.includes(t.id) ? "active" : ""}`} onClick={() => toggleVibe(t.id)}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
            <div className="onboard-row">
              <button className="onboard-back" onClick={() => setStep(2)}>← Back</button>
              <button className="onboard-next flex1" disabled={vibes.length === 0 || saving} onClick={handleFinish}>
                {saving ? "Saving…" : "Start running 🏃"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const src = user.avatar_url || user.photo;
  if (src) return <img src={src} alt={user.name} className="avatar" style={{ width: size, height: size, objectFit: "cover" }} />;
  const bg = user.preset_bg || user.preset?.bg || "var(--o)";
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, background: bg }}>{user.initials || user.avatar || "?"}</div>;
}

function ClubCard({ club, onSelect, savedIds, onSaveToggle, userId }) {
  const isSaved = savedIds?.has(club.id);
  return (
    <div className="club-card" onClick={() => onSelect(club)}>
      <div className="club-emoji-wrap"><span>{club.emoji}</span></div>
      <div className="club-info">
        <div className="club-name">{club.name}</div>
        <div className="club-meta"><i className="ti ti-map-pin" /> {club.city} · {club.days.slice(0,2).join("/")} {club.time}</div>
        <div className="club-tags-row">
          {club.tags?.slice(0,3).map(t => { const f = VIBE_TAGS.find(v => v.id === t); return f ? <span key={t} className="mini-tag">{f.emoji}</span> : null; })}
          {club.free && <span className="free-tag">FREE</span>}
        </div>
      </div>
      {userId && onSaveToggle && (
        <button className={`save-quick-btn ${isSaved ? "saved" : ""}`}
          onClick={e => { e.stopPropagation(); onSaveToggle(club.id, isSaved); }}>
          <i className={`ti ti-${isSaved ? "heart-filled" : "heart"}`} />
        </button>
      )}
      <div className="club-chev"><i className="ti ti-chevron-right" /></div>
    </div>
  );
}

function ClubDetail({ club, onBack, savedIds, onSaveToggle, userId }) {
  const isSaved = savedIds?.has(club.id);
  return (
    <div className="screen detail-screen">
      <div className="detail-hero">
        <button className="back-btn" onClick={onBack}><i className="ti ti-arrow-left" /></button>
        <div className="detail-emoji">{club.emoji}</div>
        <div className="detail-name">{club.name}</div>
        <div className="detail-city"><i className="ti ti-map-pin" /> {club.neighbourhood}, {club.city}</div>
      </div>
      <div className="detail-stats">
        <div className="stat-block"><div className="stat-val">{club.members?.toLocaleString()}+</div><div className="stat-lbl">Runners</div></div>
        <div className="stat-div" />
        <div className="stat-block"><div className="stat-val">{club.distance}</div><div className="stat-lbl">Distance</div></div>
        <div className="stat-div" />
        <div className="stat-block"><div className="stat-val">{club.pace}</div><div className="stat-lbl">Pace</div></div>
      </div>
      <div className="detail-sec"><div className="detail-lbl">ABOUT</div><div className="detail-txt">{club.description}</div></div>
      <div className="detail-sec">
        <div className="detail-lbl">SCHEDULE</div>
        <div className="sched-row">{club.days.map(d => <div key={d} className="day-pill">{d}</div>)}</div>
        <div className="detail-time"><i className="ti ti-clock" /> Meets at {club.time}</div>
      </div>
      <div className="detail-sec">
        <div className="detail-lbl">VIBES</div>
        <div className="vibe-row">{club.tags?.map(t => { const f = VIBE_TAGS.find(v => v.id === t); return f ? <span key={t} className="vibe-chip">{f.emoji} {f.label}</span> : null; })}</div>
      </div>
      <div className="detail-actions">
        {club.instagram && <button className="act-btn ig-btn"><i className="ti ti-brand-instagram" /><span>Follow</span></button>}
        {club.whatsapp && <button className="act-btn wa-btn"><i className="ti ti-brand-whatsapp" /><span>WhatsApp</span></button>}
        {userId && (
          <button className={`act-btn ${isSaved ? "saved-btn" : "join-btn"}`} onClick={() => onSaveToggle(club.id, isSaved)}>
            <i className={`ti ti-${isSaved ? "heart-filled" : "heart"}`} /><span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main screens ─────────────────────────────────────────────────────────────
function DiscoverScreen({ onClubSelect, savedIds, onSaveToggle, userId }) {
  const [search, setSearch] = useState("");
  const [activeCity, setActiveCity] = useState("All");
  const [activeTags, setActiveTags] = useState([]);
  const cities = ["All", "Dublin", "London", "Valencia", "Madrid", "Amsterdam", "Paris", "New York", "Bangkok"];
  const toggleTag = t => setActiveTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const filtered = RUN_CLUBS.filter(c => {
    const ms = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const mc = activeCity === "All" || c.city === activeCity;
    const mt = activeTags.length === 0 || activeTags.some(t => c.tags?.includes(t));
    return ms && mc && mt;
  });
  return (
    <div className="screen">
      <div className="top-bar"><Logo size={28} /><div className="top-title">PACEMAP</div><div className="top-icon"><i className="ti ti-bell" /></div></div>
      <div className="hero-block"><div className="hero-kicker">FIND YOUR TRIBE</div><div className="hero-h1">Run clubs<br/>near you</div></div>
      <div className="search-bar">
        <i className="ti ti-search" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search city or club..." className="search-input" />
        {search && <button className="search-clear" onClick={() => setSearch("")}><i className="ti ti-x" /></button>}
      </div>
      <div className="pill-row">{cities.map(c => <button key={c} className={`city-pill ${activeCity === c ? "active" : ""}`} onClick={() => setActiveCity(c)}>{c}</button>)}</div>
      <div className="tag-row">{VIBE_TAGS.slice(0,8).map(t => <button key={t.id} className={`vibe-tag ${activeTags.includes(t.id) ? "active" : ""}`} onClick={() => toggleTag(t.id)}>{t.emoji} {t.label}</button>)}</div>
      <div className="notif-card">
        <div className="notif-dot" />
        <div className="notif-body"><div className="notif-title">You're in Dublin tomorrow!</div><div className="notif-sub">Mild Activity meets Sun 9am → Bambino 🍕</div></div>
      </div>
      <div className="sec-head"><span className="sec-lbl">{filtered.length} CLUBS</span><button className="sec-btn"><i className="ti ti-adjustments-horizontal" /> Filter</button></div>
      <div className="clubs-list">{filtered.map(c => <ClubCard key={c.id} club={c} onSelect={onClubSelect} savedIds={savedIds} onSaveToggle={onSaveToggle} userId={userId} />)}</div>
    </div>
  );
}

function createClubIcon(emoji) {
  return L.divIcon({
    html: `<div style="width:34px;height:34px;background:#1a1a1a;border:2px solid #FC4C02;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;box-shadow:0 2px 8px rgba(252,76,2,0.5)">${emoji}</div>`,
    className: "", iconSize: [34, 34], iconAnchor: [17, 17],
  });
}

function MapScreen({ onClubSelect }) {
  const validClubs = RUN_CLUBS.filter(c => c.lat && c.lng);
  return (
    <div className="screen map-screen">
      <div className="top-bar"><Logo size={28} /><div className="top-title">WORLD MAP</div><div className="top-icon"><i className="ti ti-current-location" /></div></div>
      <div className="map-container">
        <MapContainer center={[48, 10]} zoom={3} style={{ width: "100%", height: "100%" }} zoomControl={false} attributionControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" maxZoom={18} />
          {validClubs.map(club => (
            <Marker key={club.id} position={[club.lat, club.lng]} icon={createClubIcon(club.emoji)} eventHandlers={{ click: () => onClubSelect(club) }}>
              <Popup>
                <div style={{fontFamily:"sans-serif",fontSize:13,color:"#fff",background:"#1a1a1a",padding:"6px 8px",borderRadius:8,minWidth:120}}>
                  <strong>{club.name}</strong><br/><span style={{color:"#FC4C02"}}>{club.city}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="map-legend"><div className="legend-title">🔴 {validClubs.length} clubs worldwide</div><div className="legend-sub">Tap a pin to view club details</div></div>
      <div className="nearby-strip">
        {RUN_CLUBS.filter(c => c.city === "Dublin").map(c => <div key={c.id} className="nearby-pill" onClick={() => onClubSelect(c)}>{c.emoji} {c.name}</div>)}
      </div>
    </div>
  );
}

function TripScreen({ onClubSelect }) {
  const [isPublic, setIsPublic] = useState(true);
  return (
    <div className="screen">
      <div className="top-bar"><div className="top-title">TRIP PLANNER</div><button className="new-trip-btn"><i className="ti ti-plus" /> New trip</button></div>
      <div className="trip-card">
        <div className="trip-header">
          <div><div className="trip-name">{SAMPLE_TRIP.name}</div><div className="trip-dates">{SAMPLE_TRIP.dates} · {SAMPLE_TRIP.stops.length} cities</div></div>
          <div className="trip-right">
            <div className="trip-prog">{SAMPLE_TRIP.stops.filter(s => s.done).length}/{SAMPLE_TRIP.stops.length}</div>
            <button className={`privacy-btn ${isPublic ? "pub" : "priv"}`} onClick={() => setIsPublic(!isPublic)}>
              <i className={`ti ti-${isPublic ? "world" : "lock"}`} /><span>{isPublic ? "Public" : "Private"}</span>
            </button>
          </div>
        </div>
        <div className="trip-timeline">
          {SAMPLE_TRIP.stops.map((stop, i) => (
            <div key={i}>
              <div className="timeline-stop">
                <div className={`stop-dot ${stop.done ? "done" : ""}`} />
                <div className="stop-info">
                  <div className="stop-city">{stop.city}</div>
                  <div className="stop-detail">{stop.club ? `${stop.emoji} ${stop.club} · ${stop.time}` : <span style={{color:"#FC4C02"}}>No club selected</span>}</div>
                  {stop.alsoGoing.length > 0 && (
                    <div className="also-going">
                      {stop.alsoGoing.slice(0,3).map(u => <div key={u.id} className="mini-avatar">{u.avatar}</div>)}
                      <span className="also-txt">{stop.alsoGoing.length} friend{stop.alsoGoing.length > 1 ? "s" : ""} going</span>
                    </div>
                  )}
                </div>
                <div className="stop-date">{stop.date}</div>
              </div>
              {i < SAMPLE_TRIP.stops.length - 1 && <div className="timeline-line" />}
            </div>
          ))}
        </div>
      </div>
      <div className="sec-head"><span className="sec-lbl">SUGGESTED FOR MADRID</span></div>
      <div className="notif-card orange"><div className="notif-dot orange" /><div className="notif-body"><div className="notif-title">Pick a club for Madrid</div><div className="notif-sub">You arrive Jun 25 · Ana García is running TRC that week</div></div></div>
      {RUN_CLUBS.filter(c => c.city === "Madrid").map(c => <ClubCard key={c.id} club={c} onSelect={onClubSelect} />)}
    </div>
  );
}

function SocialScreen() {
  const [users, setUsers] = useState(USERS);
  const [tab, setTab] = useState("feed");
  const toggleFollow = id => setUsers(prev => prev.map(u => u.id === id ? {...u, following: !u.following} : u));
  return (
    <div className="screen">
      <div className="top-bar"><div className="top-title">COMMUNITY</div><div className="top-icon"><i className="ti ti-user-search" /></div></div>
      <div className="social-tabs">
        <button className={`s-tab ${tab === "feed" ? "active" : ""}`} onClick={() => setTab("feed")}>Feed</button>
        <button className={`s-tab ${tab === "runners" ? "active" : ""}`} onClick={() => setTab("runners")}>Runners</button>
      </div>
      {tab === "feed" && (
        <div className="feed">
          {ACTIVITY_FEED.map(item => (
            <div key={item.id} className="feed-item">
              <Avatar user={item.user} size={38} />
              <div className="feed-body">
                <div className="feed-text"><span className="feed-name">{item.user.name}</span> {item.action} <span className="feed-club">{item.emoji} {item.club}</span></div>
                <div className="feed-meta">{item.city} · {item.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === "runners" && (
        <div className="runners-list">
          {users.map(u => (
            <div key={u.id} className="runner-card">
              <Avatar user={u} size={44} />
              <div className="runner-info">
                <div className="runner-name">{u.name}</div>
                <div className="runner-handle">{u.handle} · {u.city}</div>
                {u.mutual > 0 && <div className="runner-mutual">{u.mutual} mutual runners</div>}
              </div>
              <button className={`follow-btn ${u.following ? "following" : ""}`} onClick={() => toggleFollow(u.id)}>{u.following ? "Following" : "Follow"}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesScreen() {
  const [activeConvo, setActiveConvo] = useState(null);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { from: "them", text: "Are you doing the Wednesday pizza run?", time: "2:14pm" },
    { from: "me", text: "Yes! See you at 7pm 🍕", time: "2:16pm" },
    { from: "them", text: "Amazing! Bringing 2 friends too", time: "2:17pm" },
  ]);
  const send = () => { if (input.trim()) { setMsgs(p => [...p, { from: "me", text: input, time: "now" }]); setInput(""); } };

  if (activeConvo) return (
    <div className="screen messages-screen">
      <div className="convo-header">
        <button className="back-btn sm" onClick={() => setActiveConvo(null)}><i className="ti ti-arrow-left" /></button>
        <Avatar user={activeConvo.user} size={32} />
        <div className="convo-name">{activeConvo.user.name}</div>
      </div>
      <div className="convo-body">
        {msgs.map((m, i) => (
          <div key={i} className={`bubble-wrap ${m.from}`}>
            <div className={`bubble ${m.from === "me" ? "mine" : "theirs"}`}>{m.text}</div>
            <div className="bubble-time">{m.time}</div>
          </div>
        ))}
      </div>
      <div className="msg-input-bar">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message..." className="msg-input" onKeyDown={e => e.key === "Enter" && send()} />
        <button className="send-btn" onClick={send}><i className="ti ti-send" /></button>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="top-bar"><div className="top-title">MESSAGES</div><div className="top-icon"><i className="ti ti-edit" /></div></div>
      <div className="msg-list">
        {MESSAGES_DATA.map(m => (
          <div key={m.id} className="msg-row" onClick={() => setActiveConvo(m)}>
            <div style={{position:"relative"}}><Avatar user={m.user} size={44} />{m.unread > 0 && <div className="unread-badge">{m.unread}</div>}</div>
            <div className="msg-info"><div className="msg-name">{m.user.name}</div><div className="msg-preview">{m.last}</div></div>
            <div className="msg-time">{m.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileScreen({ profile, savedIds, onSignOut }) {
  const savedClubs = RUN_CLUBS.filter(c => savedIds?.has(c.id));
  const suggestedClubs = RUN_CLUBS.filter(c => profile.vibes?.some(v => c.tags?.includes(v))).slice(0, 3);
  const displayClubs = savedClubs.length > 0 ? savedClubs.slice(0, 3) : suggestedClubs.length > 0 ? suggestedClubs : RUN_CLUBS.slice(0, 3);
  const sectionLabel = savedClubs.length > 0 ? "SAVED CLUBS" : "CLUBS FOR YOU";

  return (
    <div className="screen">
      <div className="top-bar">
        <div className="top-title">MY PACE</div>
        <button className="signout-btn" onClick={onSignOut} title="Sign out"><i className="ti ti-logout" /></button>
      </div>
      <div className="profile-hero">
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt="profile" className="profile-avatar profile-avatar-photo" />
          : <div className="profile-avatar" style={{ background: profile.preset_bg || "var(--o)" }}>
              {profile.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?"}
            </div>
        }
        <div className="profile-name">{profile.name || "Runner"}</div>
        <div className="profile-handle">{profile.handle || "@runner"} · {profile.city || "Everywhere"}</div>
        <div className="profile-bio">
          {profile.vibes?.slice(0,3).map(id => VIBE_TAGS.find(v => v.id === id)?.emoji).join(" ")}
          {profile.pace ? ` · ${profile.pace}` : ""}
        </div>
        <div className="profile-stats">
          <div className="pstat"><div className="pstat-val">{savedIds?.size || 0}</div><div className="pstat-lbl">Saved</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-val">1</div><div className="pstat-lbl">Cities</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-val">0</div><div className="pstat-lbl">Followers</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-val">0</div><div className="pstat-lbl">Following</div></div>
        </div>
      </div>
      <div className="sec-head"><span className="sec-lbl">{sectionLabel}</span></div>
      {displayClubs.map(c => (
        <div key={c.id} className="club-card" style={{margin:"0 16px 8px"}}>
          <div className="club-emoji-wrap"><span>{c.emoji}</span></div>
          <div className="club-info"><div className="club-name">{c.name}</div><div className="club-meta"><i className="ti ti-map-pin" /> {c.city}</div></div>
        </div>
      ))}
      <div className="sec-head" style={{marginTop:8}}><span className="sec-lbl">PACE PREFERENCES</span></div>
      <div className="pace-card">
        {[["Preferred pace", profile.pace || "—"], ["Vibes", profile.vibes?.slice(0,3).map(id => VIBE_TAGS.find(v => v.id === id)?.emoji).join(" ") || "—"], ["Home city", profile.city || "—"]].map(([l,v]) => (
          <div key={l} className="pace-row"><span className="pace-lbl">{l}</span><span className="pace-val">{v}</span></div>
        ))}
      </div>
      <div style={{height:24}} />
    </div>
  );
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-content">
        <Logo size={48} />
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "discover", label: "Discover", icon: "ti-compass" },
  { id: "map", label: "Map", icon: "ti-map" },
  { id: "trip", label: "Trip", icon: "ti-route" },
  { id: "social", label: "Community", icon: "ti-users" },
  { id: "messages", label: "Messages", icon: "ti-message" },
];

export default function App() {
  const [authState, setAuthState] = useState("loading"); // loading | signin | onboarding | app
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [tab, setTab] = useState("discover");
  const [selectedClub, setSelectedClub] = useState(null);

  // ── Load session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session) => {
    if (!session) { setAuthState("signin"); setSession(null); setProfile(null); return; }
    setSession(session);
    // Check if profile exists
    const { data } = await getProfile(session.user.id);
    if (data && data.name) {
      setProfile(data);
      await loadSavedClubs(session.user.id);
      setAuthState("app");
    } else {
      setAuthState("onboarding");
    }
  };

  const loadSavedClubs = async (userId) => {
    const { data } = await getSavedClubs(userId);
    if (data) setSavedIds(new Set(data.map(r => r.club_id)));
  };

  const handleOnboardingComplete = async (prof) => {
    setProfile(prof);
    await loadSavedClubs(session.user.id);
    setAuthState("app");
  };

  const handleSignOut = async () => {
    await signOut();
    setProfile(null); setSession(null); setSavedIds(new Set());
    setTab("discover"); setSelectedClub(null);
    setAuthState("signin");
  };

  const handleSaveToggle = async (clubId, isSaved) => {
    if (!session) return;
    const userId = session.user.id;
    if (isSaved) {
      setSavedIds(prev => { const s = new Set(prev); s.delete(clubId); return s; });
      await unsaveClub(userId, clubId);
    } else {
      setSavedIds(prev => new Set([...prev, clubId]));
      await saveClub(userId, clubId);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const tabAvatar = () => {
    if (!profile) return <div className="tab-avatar">?</div>;
    if (profile.avatar_url) return <img src={profile.avatar_url} alt="me" className="tab-avatar tab-avatar-photo" />;
    return <div className="tab-avatar" style={{ background: profile.preset_bg || "var(--o)" }}>{profile.name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?"}</div>;
  };

  const renderTabBar = () => (
    <div className="tab-bar">
      {TABS.map(t => <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => { setSelectedClub(null); setTab(t.id); }}><i className={`ti ${t.icon}`} /><span>{t.label}</span></button>)}
      <button className={`tab-item ${tab === "profile" ? "active" : ""}`} onClick={() => { setSelectedClub(null); setTab("profile"); }}>
        {tabAvatar()}<span>Profile</span>
      </button>
    </div>
  );

  if (authState === "loading") return <div className="app"><div className="phone-frame"><div className="phone-screen"><LoadingScreen /></div></div></div>;
  if (authState === "signin") return <div className="app"><div className="phone-frame"><div className="phone-screen"><SignInScreen /></div></div></div>;
  if (authState === "onboarding") return <div className="app"><div className="phone-frame"><div className="phone-screen"><OnboardingScreen session={session} onComplete={handleOnboardingComplete} /></div></div></div>;

  if (selectedClub) return (
    <div className="app"><div className="phone-frame"><div className="phone-screen">
      <div className="screen-content"><ClubDetail club={selectedClub} onBack={() => setSelectedClub(null)} savedIds={savedIds} onSaveToggle={handleSaveToggle} userId={session?.user?.id} /></div>
      {renderTabBar()}
    </div></div></div>
  );

  return (
    <div className="app"><div className="phone-frame"><div className="phone-screen">
      <div className="screen-content">
        {tab === "discover" && <DiscoverScreen onClubSelect={setSelectedClub} savedIds={savedIds} onSaveToggle={handleSaveToggle} userId={session?.user?.id} />}
        {tab === "map" && <MapScreen onClubSelect={setSelectedClub} />}
        {tab === "trip" && <TripScreen onClubSelect={setSelectedClub} />}
        {tab === "social" && <SocialScreen />}
        {tab === "messages" && <MessagesScreen />}
        {tab === "profile" && <ProfileScreen profile={profile} savedIds={savedIds} onSignOut={handleSignOut} />}
      </div>
      {renderTabBar()}
    </div></div></div>
  );
}
