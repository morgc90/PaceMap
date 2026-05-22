import { useState, useEffect, useRef } from "react";
import { RUN_CLUBS, VIBE_TAGS } from "./data/clubs";
import "./App.css";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: "Sarah Chen", handle: "@sarahchen", avatar: "SC", city: "London", following: false, clubs: 8, trips: 3, bio: "Marathon runner. London → Tokyo 2026 🎌", mutual: 2 },
  { id: 2, name: "David Murphy", handle: "@dmurph", avatar: "DM", city: "Dublin", following: true, clubs: 12, trips: 5, bio: "Mild Activity crew. Dublin native 🍕", mutual: 5 },
  { id: 3, name: "Ana García", handle: "@anagarcia", avatar: "AG", city: "Madrid", following: false, clubs: 6, trips: 2, bio: "TRC Madrid captain. Ultra runner 🏔️", mutual: 1 },
  { id: 4, name: "Tom Walsh", handle: "@tomwalsh", avatar: "TW", city: "Dublin", following: true, clubs: 9, trips: 4, bio: "FROLIK Valencia every summer ☀️", mutual: 8 },
  { id: 5, name: "Mei Tanaka", handle: "@meitanaka", avatar: "MT", city: "Tokyo", following: false, clubs: 14, trips: 7, bio: "080Tokyo crew. World run club collector 🌍", mutual: 0 },
];

const ACTIVITY_FEED = [
  { id: 1, user: USERS[1], action: "saved", club: "Mild Activity", city: "Dublin", time: "2m ago", emoji: "🍕" },
  { id: 2, user: USERS[3], action: "added to trip", club: "FROLIK", city: "Valencia", time: "14m ago", emoji: "🎉" },
  { id: 3, user: USERS[0], action: "saved", club: "Midnight Runners", city: "London", time: "1h ago", emoji: "🎶" },
  { id: 4, user: USERS[2], action: "planned a trip to", club: "Paris + Amsterdam", city: "Europe", time: "2h ago", emoji: "✈️" },
  { id: 5, user: USERS[4], action: "saved", club: "080Tokyo", city: "Tokyo", time: "3h ago", emoji: "🗾" },
];

const MESSAGES = [
  { id: 1, user: USERS[1], last: "Are you doing the Wednesday pizza run?", time: "2m", unread: 2 },
  { id: 2, user: USERS[3], last: "FROLIK Tuesday is incredible 🔥", time: "1h", unread: 0 },
  { id: 3, user: USERS[0], last: "See you at Midnight Runners!", time: "3h", unread: 1 },
  { id: 4, user: USERS[2], last: "TRC Madrid 7am Saturday?", time: "1d", unread: 0 },
];

const SAMPLE_TRIP = {
  name: "Europe Summer Tour",
  dates: "Jun 14 – Jul 2",
  isPublic: true,
  stops: [
    { city: "Dublin", date: "Jun 14", club: "Mild Activity", time: "9am", done: true, emoji: "🍕", alsoGoing: [USERS[1], USERS[3]] },
    { city: "London", date: "Jun 19", club: "Midnight Runners", time: "7pm", done: true, emoji: "🎶", alsoGoing: [USERS[0]] },
    { city: "Madrid", date: "Jun 25", club: null, time: null, done: false, emoji: "🏅", alsoGoing: [] },
    { city: "Valencia", date: "Jun 29", club: "FROLIK", time: "8pm", done: false, emoji: "🎉", alsoGoing: [USERS[3], USERS[2]] },
  ],
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {user.avatar}
    </div>
  );
}

// ─── CLUB CARD ────────────────────────────────────────────────────────────────
function ClubCard({ club, onSelect }) {
  return (
    <div className="club-card" onClick={() => onSelect(club)}>
      <div className="club-emoji-wrap"><span>{club.emoji}</span></div>
      <div className="club-info">
        <div className="club-name">{club.name}</div>
        <div className="club-meta"><i className="ti ti-map-pin" aria-hidden="true" /> {club.city} · {club.days.slice(0,2).join("/")} {club.time}</div>
        <div className="club-tags-row">
          {club.tags?.slice(0,3).map(t => {
            const f = VIBE_TAGS.find(v => v.id === t);
            return f ? <span key={t} className="mini-tag">{f.emoji}</span> : null;
          })}
          {club.free && <span className="free-tag">FREE</span>}
        </div>
      </div>
      <div className="club-chev"><i className="ti ti-chevron-right" aria-hidden="true" /></div>
    </div>
  );
}

// ─── CLUB DETAIL ─────────────────────────────────────────────────────────────
function ClubDetail({ club, onBack }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="screen detail-screen">
      <div className="detail-hero">
        <button className="back-btn" onClick={onBack}><i className="ti ti-arrow-left" aria-hidden="true" /></button>
        <div className="detail-emoji">{club.emoji}</div>
        <div className="detail-name">{club.name}</div>
        <div className="detail-city"><i className="ti ti-map-pin" aria-hidden="true" /> {club.neighbourhood}, {club.city}</div>
      </div>
      <div className="detail-stats">
        <div className="stat-block"><div className="stat-val">{club.members?.toLocaleString()}+</div><div className="stat-lbl">Runners</div></div>
        <div className="stat-div" />
        <div className="stat-block"><div className="stat-val">{club.distance}</div><div className="stat-lbl">Distance</div></div>
        <div className="stat-div" />
        <div className="stat-block"><div className="stat-val">{club.pace}</div><div className="stat-lbl">Pace</div></div>
      </div>
      <div className="detail-sec">
        <div className="detail-lbl">ABOUT</div>
        <div className="detail-txt">{club.description}</div>
      </div>
      <div className="detail-sec">
        <div className="detail-lbl">SCHEDULE</div>
        <div className="sched-row">{club.days.map(d => <div key={d} className="day-pill">{d}</div>)}</div>
        <div className="detail-time"><i className="ti ti-clock" aria-hidden="true" /> Meets at {club.time}</div>
      </div>
      <div className="detail-sec">
        <div className="detail-lbl">VIBES</div>
        <div className="vibe-row">
          {club.tags?.map(t => { const f = VIBE_TAGS.find(v => v.id === t); return f ? <span key={t} className="vibe-chip">{f.emoji} {f.label}</span> : null; })}
        </div>
      </div>
      <div className="detail-actions">
        {club.instagram && <button className="act-btn ig-btn"><i className="ti ti-brand-instagram" aria-hidden="true" /><span>Follow</span></button>}
        {club.whatsapp && <button className="act-btn wa-btn"><i className="ti ti-brand-whatsapp" aria-hidden="true" /><span>WhatsApp</span></button>}
        <button className={`act-btn ${saved ? "saved-btn" : "join-btn"}`} onClick={() => setSaved(!saved)}>
          <i className={`ti ti-${saved ? "check" : "plus"}`} aria-hidden="true" /><span>{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
    </div>
  );
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────────
function DiscoverScreen({ onClubSelect }) {
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
      <div className="top-bar">
        <div className="pm-logo">PM</div>
        <div className="top-title">PACEMAP</div>
        <div className="top-icon"><i className="ti ti-bell" aria-hidden="true" /></div>
      </div>
      <div className="hero-block">
        <div className="hero-kicker">FIND YOUR TRIBE</div>
        <div className="hero-h1">Run clubs<br/>near you</div>
      </div>
      <div className="search-bar">
        <i className="ti ti-search" aria-hidden="true" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search city or club..." className="search-input" />
        {search && <button className="search-clear" onClick={() => setSearch("")}><i className="ti ti-x" aria-hidden="true" /></button>}
      </div>
      <div className="pill-row">
        {cities.map(c => <button key={c} className={`city-pill ${activeCity === c ? "active" : ""}`} onClick={() => setActiveCity(c)}>{c}</button>)}
      </div>
      <div className="tag-row">
        {VIBE_TAGS.slice(0,8).map(t => <button key={t.id} className={`vibe-tag ${activeTags.includes(t.id) ? "active" : ""}`} onClick={() => toggleTag(t.id)}>{t.emoji} {t.label}</button>)}
      </div>
      <div className="notif-card">
        <div className="notif-dot" />
        <div className="notif-body"><div className="notif-title">You're in Dublin tomorrow!</div><div className="notif-sub">Mild Activity meets Sun 9am → Bambino 🍕</div></div>
      </div>
      <div className="sec-head"><span className="sec-lbl">{filtered.length} CLUBS</span><button className="sec-btn"><i className="ti ti-adjustments-horizontal" aria-hidden="true" /> Filter</button></div>
      <div className="clubs-list">{filtered.map(c => <ClubCard key={c.id} club={c} onSelect={onClubSelect} />)}</div>
    </div>
  );
}

// ─── MAP ──────────────────────────────────────────────────────────────────────
function MapScreen({ onClubSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [30, 10],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
    }).addTo(map);

    const pinIcon = (emoji) => L.divIcon({
      html: `<div style="width:36px;height:36px;background:#1a1a1a;border:2px solid #FC4C02;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;box-shadow:0 0 8px rgba(252,76,2,0.4)">${emoji}</div>`,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    RUN_CLUBS.forEach(club => {
      if (!club.lat || !club.lng) return;
      const marker = L.marker([club.lat, club.lng], { icon: pinIcon(club.emoji) }).addTo(map);
      marker.on("click", () => onClubSelect(club));
    });

    mapInstance.current = map;
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  return (
    <div className="screen map-screen">
      <div className="top-bar">
        <div className="pm-logo">PM</div>
        <div className="top-title">WORLD MAP</div>
        <div className="top-icon"><i className="ti ti-current-location" aria-hidden="true" /></div>
      </div>
      <div className="map-container" ref={mapRef} />
      <div className="map-legend">
        <div className="legend-title">🔴 {RUN_CLUBS.length} clubs worldwide</div>
        <div className="legend-sub">Tap a pin to view club details</div>
      </div>
      <div className="nearby-strip">
        {RUN_CLUBS.filter(c => c.city === "Dublin").map(c => (
          <div key={c.id} className="nearby-pill" onClick={() => onClubSelect(c)}>{c.emoji} {c.name}</div>
        ))}
      </div>
    </div>
  );
}

// ─── TRIP ─────────────────────────────────────────────────────────────────────
function TripScreen({ onClubSelect }) {
  const [isPublic, setIsPublic] = useState(SAMPLE_TRIP.isPublic);
  return (
    <div className="screen">
      <div className="top-bar">
        <div className="top-title">TRIP PLANNER</div>
        <button className="new-trip-btn"><i className="ti ti-plus" aria-hidden="true" /> New trip</button>
      </div>
      <div className="trip-card">
        <div className="trip-header">
          <div>
            <div className="trip-name">{SAMPLE_TRIP.name}</div>
            <div className="trip-dates">{SAMPLE_TRIP.dates} · {SAMPLE_TRIP.stops.length} cities</div>
          </div>
          <div className="trip-right">
            <div className="trip-prog">{SAMPLE_TRIP.stops.filter(s => s.done).length}/{SAMPLE_TRIP.stops.length}</div>
            <button className={`privacy-btn ${isPublic ? "pub" : "priv"}`} onClick={() => setIsPublic(!isPublic)}>
              <i className={`ti ti-${isPublic ? "world" : "lock"}`} aria-hidden="true" />
              <span>{isPublic ? "Public" : "Private"}</span>
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
      <div className="notif-card orange">
        <div className="notif-dot orange" />
        <div className="notif-body"><div className="notif-title">Pick a club for Madrid</div><div className="notif-sub">You arrive Jun 25 · Ana García is running TRC that week</div></div>
      </div>
      {RUN_CLUBS.filter(c => c.city === "Madrid").map(c => <ClubCard key={c.id} club={c} onSelect={onClubSelect} />)}
    </div>
  );
}

// ─── SOCIAL ───────────────────────────────────────────────────────────────────
function SocialScreen() {
  const [users, setUsers] = useState(USERS);
  const [tab, setTab] = useState("feed");
  const toggleFollow = id => setUsers(prev => prev.map(u => u.id === id ? {...u, following: !u.following} : u));
  return (
    <div className="screen">
      <div className="top-bar">
        <div className="top-title">COMMUNITY</div>
        <div className="top-icon"><i className="ti ti-user-search" aria-hidden="true" /></div>
      </div>
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
              <button className={`follow-btn ${u.following ? "following" : ""}`} onClick={() => toggleFollow(u.id)}>
                {u.following ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function MessagesScreen() {
  const [activeConvo, setActiveConvo] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "them", text: "Are you doing the Wednesday pizza run?", time: "2:14pm" },
    { from: "me", text: "Yes! See you at 7pm 🍕", time: "2:16pm" },
    { from: "them", text: "Amazing! Bringing 2 friends too", time: "2:17pm" },
  ]);

  if (activeConvo) {
    return (
      <div className="screen messages-screen">
        <div className="convo-header">
          <button className="back-btn sm" onClick={() => setActiveConvo(null)}><i className="ti ti-arrow-left" aria-hidden="true" /></button>
          <Avatar user={activeConvo.user} size={32} />
          <div className="convo-name">{activeConvo.user.name}</div>
        </div>
        <div className="convo-body">
          {messages.map((m, i) => (
            <div key={i} className={`bubble-wrap ${m.from === "me" ? "me" : "them"}`}>
              <div className={`bubble ${m.from === "me" ? "mine" : "theirs"}`}>{m.text}</div>
              <div className="bubble-time">{m.time}</div>
            </div>
          ))}
        </div>
        <div className="msg-input-bar">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message..." className="msg-input" onKeyDown={e => {
            if (e.key === "Enter" && input.trim()) {
              setMessages(p => [...p, { from: "me", text: input, time: "now" }]);
              setInput("");
            }
          }} />
          <button className="send-btn" onClick={() => { if (input.trim()) { setMessages(p => [...p, { from: "me", text: input, time: "now" }]); setInput(""); } }}>
            <i className="ti ti-send" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <div className="top-title">MESSAGES</div>
        <div className="top-icon"><i className="ti ti-edit" aria-hidden="true" /></div>
      </div>
      <div className="msg-list">
        {MESSAGES.map(m => (
          <div key={m.id} className="msg-row" onClick={() => setActiveConvo(m)}>
            <div style={{position:"relative"}}>
              <Avatar user={m.user} size={44} />
              {m.unread > 0 && <div className="unread-badge">{m.unread}</div>}
            </div>
            <div className="msg-info">
              <div className="msg-name">{m.user.name}</div>
              <div className="msg-preview">{m.last}</div>
            </div>
            <div className="msg-time">{m.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileScreen() {
  return (
    <div className="screen">
      <div className="top-bar">
        <div className="top-title">MY PACE</div>
        <div className="top-icon"><i className="ti ti-settings" aria-hidden="true" /></div>
      </div>
      <div className="profile-hero">
        <div className="profile-avatar">JM</div>
        <div className="profile-name">Jamie Morgan</div>
        <div className="profile-handle">@jamiemorgan · Dublin</div>
        <div className="profile-bio">Mild Activity Wednesday crew 🍕 Trip planning Europe 2026</div>
        <div className="profile-stats">
          <div className="pstat"><div className="pstat-val">23</div><div className="pstat-lbl">Clubs</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-val">8</div><div className="pstat-lbl">Cities</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-val">142</div><div className="pstat-lbl">Followers</div></div>
          <div className="pstat-div" />
          <div className="pstat"><div className="pstat-val">89</div><div className="pstat-lbl">Following</div></div>
        </div>
      </div>
      <div className="sec-head"><span className="sec-lbl">SAVED CLUBS</span></div>
      {RUN_CLUBS.slice(0,3).map(c => (
        <div key={c.id} className="club-card" style={{margin:"0 16px 8px"}}>
          <div className="club-emoji-wrap"><span>{c.emoji}</span></div>
          <div className="club-info">
            <div className="club-name">{c.name}</div>
            <div className="club-meta"><i className="ti ti-map-pin" aria-hidden="true" /> {c.city}</div>
          </div>
        </div>
      ))}
      <div className="sec-head" style={{marginTop:8}}><span className="sec-lbl">PACE PREFERENCES</span></div>
      <div className="pace-card">
        {[["Preferred pace","5:30–6:30 /km"],["Favourite vibe","🍺 Beer after"],["Home city","Dublin"],["Trips planned","3"]].map(([l,v]) => (
          <div key={l} className="pace-row"><span className="pace-lbl">{l}</span><span className="pace-val">{v}</span></div>
        ))}
      </div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "discover", label: "Discover", icon: "ti-compass" },
  { id: "map", label: "Map", icon: "ti-map" },
  { id: "trip", label: "Trip", icon: "ti-route" },
  { id: "social", label: "Community", icon: "ti-users" },
  { id: "messages", label: "Messages", icon: "ti-message" },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("discover");
  const [selectedClub, setSelectedClub] = useState(null);

  if (selectedClub) return (
    <div className="app">
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="screen-content"><ClubDetail club={selectedClub} onBack={() => setSelectedClub(null)} /></div>
          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => { setSelectedClub(null); setTab(t.id); }}>
                <i className={`ti ${t.icon}`} aria-hidden="true" /><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="screen-content">
            {tab === "discover" && <DiscoverScreen onClubSelect={setSelectedClub} />}
            {tab === "map" && <MapScreen onClubSelect={club => { setSelectedClub(club); }} />}
            {tab === "trip" && <TripScreen onClubSelect={setSelectedClub} />}
            {tab === "social" && <SocialScreen />}
            {tab === "messages" && <MessagesScreen />}
            {tab === "profile" && <ProfileScreen />}
          </div>
          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                <i className={`ti ${t.icon}`} aria-hidden="true" /><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
