import { useState, useRef, useEffect } from "react";
import { RUN_CLUBS, VIBE_TAGS } from "./data/clubs";
import "./App.css";

// ─── TRIP PLANNER DATA ───────────────────────────────────────────────────────
const SAMPLE_TRIP = {
  name: "Europe Summer Tour",
  dates: "Jun 14 – Jul 2",
  stops: [
    { city: "Dublin", date: "Jun 14", club: "Mild Activity", time: "9am", done: true, emoji: "🍕" },
    { city: "London", date: "Jun 19", club: "Midnight Runners", time: "7pm", done: true, emoji: "🎶" },
    { city: "Madrid", date: "Jun 25", club: null, time: null, done: false, emoji: "🏅" },
    { city: "Valencia", date: "Jun 29", club: "FROLIK", time: "8pm", done: false, emoji: "🎉" },
  ],
};

// ─── DISCOVER SCREEN ─────────────────────────────────────────────────────────
function DiscoverScreen({ onClubSelect }) {
  const [search, setSearch] = useState("");
  const [activeCity, setActiveCity] = useState("All");
  const [activeTags, setActiveTags] = useState([]);

  const cities = ["All", "Dublin", "London", "Valencia", "Madrid", "Amsterdam", "Paris", "New York", "Bangkok"];

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filtered = RUN_CLUBS.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    const matchCity = activeCity === "All" || c.city === activeCity;
    const matchTags = activeTags.length === 0 || activeTags.some(t => c.tags?.includes(t));
    return matchSearch && matchCity && matchTags;
  });

  return (
    <div className="screen discover">
      <div className="top-bar">
        <div className="logo-mark">PM</div>
        <div className="top-title">PACEMAP</div>
        <div className="top-action"><i className="ti ti-bell" aria-hidden="true" /></div>
      </div>

      <div className="hero-greeting">
        <div className="greeting-sub">FIND YOUR TRIBE</div>
        <div className="greeting-h1">Run clubs near you</div>
      </div>

      <div className="search-wrap">
        <i className="ti ti-search" aria-hidden="true" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search city or club..."
          className="search-input"
        />
        {search && <button className="search-clear" onClick={() => setSearch("")}><i className="ti ti-x" aria-hidden="true" /></button>}
      </div>

      <div className="city-row">
        {cities.map(c => (
          <button key={c} className={`city-pill ${activeCity === c ? "active" : ""}`} onClick={() => setActiveCity(c)}>{c}</button>
        ))}
      </div>

      <div className="tag-row">
        {VIBE_TAGS.slice(0, 8).map(t => (
          <button key={t.id} className={`vibe-tag ${activeTags.includes(t.id) ? "active" : ""}`} onClick={() => toggleTag(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="notification-card">
        <div className="notif-dot" />
        <div className="notif-content">
          <div className="notif-title">You're in Dublin tomorrow!</div>
          <div className="notif-sub">Mild Activity meets Sun 9am at Fenian St → Bambino 🍕</div>
        </div>
        <div className="notif-arrow"><i className="ti ti-chevron-right" aria-hidden="true" /></div>
      </div>

      <div className="section-head">
        <span className="section-label">{filtered.length} CLUBS</span>
        <button className="section-filter"><i className="ti ti-adjustments-horizontal" aria-hidden="true" /> Filter</button>
      </div>

      <div className="clubs-list">
        {filtered.map(club => (
          <ClubCard key={club.id} club={club} onSelect={onClubSelect} />
        ))}
      </div>
    </div>
  );
}

// ─── CLUB CARD ────────────────────────────────────────────────────────────────
function ClubCard({ club, onSelect, compact }) {
  return (
    <div className={`club-card ${compact ? "compact" : ""}`} onClick={() => onSelect(club)}>
      <div className="club-card-inner">
        <div className="club-emoji-wrap">
          <span className="club-emoji">{club.emoji}</span>
        </div>
        <div className="club-info">
          <div className="club-name">{club.name}</div>
          <div className="club-meta">
            <span><i className="ti ti-map-pin" aria-hidden="true" /> {club.city}</span>
            <span><i className="ti ti-clock" aria-hidden="true" /> {club.days.slice(0,2).join("/")} {club.time}</span>
          </div>
          <div className="club-tags-row">
            {club.tags?.slice(0, 3).map(t => {
              const found = VIBE_TAGS.find(v => v.id === t);
              return found ? <span key={t} className="mini-tag">{found.emoji}</span> : null;
            })}
            {club.free && <span className="free-tag">FREE</span>}
          </div>
        </div>
        <div className="club-chevron"><i className="ti ti-chevron-right" aria-hidden="true" /></div>
      </div>
    </div>
  );
}

// ─── CLUB DETAIL ─────────────────────────────────────────────────────────────
function ClubDetail({ club, onBack }) {
  const [joined, setJoined] = useState(false);

  return (
    <div className="screen detail">
      <div className="detail-hero">
        <button className="back-btn" onClick={onBack}><i className="ti ti-arrow-left" aria-hidden="true" /></button>
        <div className="detail-emoji">{club.emoji}</div>
        <div className="detail-name">{club.name}</div>
        <div className="detail-city"><i className="ti ti-map-pin" aria-hidden="true" /> {club.neighbourhood}, {club.city}</div>
      </div>

      <div className="detail-stats">
        <div className="stat-block">
          <div className="stat-val">{club.members?.toLocaleString()}+</div>
          <div className="stat-lbl">Runners</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-val">{club.distance}</div>
          <div className="stat-lbl">Distance</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-val">{club.pace}</div>
          <div className="stat-lbl">Pace</div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-label">ABOUT</div>
        <div className="detail-text">{club.description}</div>
      </div>

      <div className="detail-section">
        <div className="detail-label">SCHEDULE</div>
        <div className="schedule-row">
          {club.days.map(d => (
            <div key={d} className="day-pill">{d}</div>
          ))}
        </div>
        <div className="detail-time"><i className="ti ti-clock" aria-hidden="true" /> Meets at {club.time}</div>
      </div>

      <div className="detail-section">
        <div className="detail-label">VIBES</div>
        <div className="vibe-row">
          {club.tags?.map(t => {
            const found = VIBE_TAGS.find(v => v.id === t);
            return found ? <span key={t} className="vibe-chip">{found.emoji} {found.label}</span> : null;
          })}
        </div>
      </div>

      <div className="detail-actions">
        {club.instagram && (
          <button className="action-btn ig-btn">
            <i className="ti ti-brand-instagram" aria-hidden="true" />
            <span>Follow</span>
          </button>
        )}
        {club.whatsapp && (
          <button className="action-btn wa-btn">
            <i className="ti ti-brand-whatsapp" aria-hidden="true" />
            <span>WhatsApp</span>
          </button>
        )}
        <button className={`action-btn join-btn ${joined ? "joined" : ""}`} onClick={() => setJoined(!joined)}>
          <i className={`ti ti-${joined ? "check" : "plus"}`} aria-hidden="true" />
          <span>{joined ? "Saved" : "Save club"}</span>
        </button>
      </div>
    </div>
  );
}

// ─── TRIP PLANNER ─────────────────────────────────────────────────────────────
function TripScreen({ onClubSelect }) {
  const [activeStop, setActiveStop] = useState(null);

  return (
    <div className="screen trip">
      <div className="top-bar">
        <div className="top-title">TRIP PLANNER</div>
        <button className="top-action-btn"><i className="ti ti-plus" aria-hidden="true" /> New trip</button>
      </div>

      <div className="trip-card">
        <div className="trip-header">
          <div>
            <div className="trip-name">{SAMPLE_TRIP.name}</div>
            <div className="trip-dates">{SAMPLE_TRIP.dates} · {SAMPLE_TRIP.stops.length} cities</div>
          </div>
          <div className="trip-progress">{SAMPLE_TRIP.stops.filter(s => s.done).length}/{SAMPLE_TRIP.stops.length}</div>
        </div>

        <div className="trip-timeline">
          {SAMPLE_TRIP.stops.map((stop, i) => (
            <div key={i}>
              <div className={`timeline-stop ${stop.done ? "done" : ""} ${activeStop === i ? "active" : ""}`} onClick={() => setActiveStop(i === activeStop ? null : i)}>
                <div className={`stop-dot ${stop.done ? "done" : ""}`} />
                <div className="stop-info">
                  <div className="stop-city">{stop.city}</div>
                  <div className="stop-detail">
                    {stop.club ? `${stop.emoji} ${stop.club} · ${stop.time}` : "No club selected"}
                  </div>
                </div>
                <div className="stop-date">{stop.date}</div>
              </div>
              {i < SAMPLE_TRIP.stops.length - 1 && <div className="timeline-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="section-head">
        <span className="section-label">SUGGESTED FOR MADRID</span>
      </div>

      <div className="notification-card orange">
        <div className="notif-dot orange" />
        <div className="notif-content">
          <div className="notif-title">Pick a club for Madrid</div>
          <div className="notif-sub">You arrive Jun 25 · TRC meets daily across 5 locations</div>
        </div>
      </div>

      {RUN_CLUBS.filter(c => c.city === "Madrid").map(club => (
        <ClubCard key={club.id} club={club} onSelect={onClubSelect} compact />
      ))}
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen() {
  const saved = RUN_CLUBS.slice(0, 3);

  return (
    <div className="screen profile">
      <div className="top-bar">
        <div className="top-title">MY PACE</div>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar">JM</div>
        <div className="profile-name">Jamie Morgan</div>
        <div className="profile-sub">Running since 2022 · Dublin → London</div>
      </div>

      <div className="stats-strip">
        <div className="stat-block">
          <div className="stat-val">23</div>
          <div className="stat-lbl">Clubs visited</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-val">8</div>
          <div className="stat-lbl">Cities run</div>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <div className="stat-val">3</div>
          <div className="stat-lbl">Trips planned</div>
        </div>
      </div>

      <div className="section-head">
        <span className="section-label">SAVED CLUBS</span>
      </div>

      {saved.map(club => (
        <ClubCard key={club.id} club={club} onSelect={() => {}} compact />
      ))}

      <div className="section-head" style={{ marginTop: 8 }}>
        <span className="section-label">MY PACE</span>
      </div>
      <div className="pace-card">
        <div className="pace-row">
          <span className="pace-label">Preferred pace</span>
          <span className="pace-val">5:30–6:30 /km</span>
        </div>
        <div className="pace-row">
          <span className="pace-label">Favourite vibe</span>
          <span className="pace-val">🍺 Beer after</span>
        </div>
        <div className="pace-row">
          <span className="pace-label">Home city</span>
          <span className="pace-val">Dublin</span>
        </div>
      </div>
    </div>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "discover", label: "Discover", icon: "ti-compass" },
  { id: "map", label: "Map", icon: "ti-map" },
  { id: "trip", label: "Trip", icon: "ti-route" },
  { id: "profile", label: "Me", icon: "ti-user" },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("discover");
  const [selectedClub, setSelectedClub] = useState(null);

  const handleClubSelect = (club) => {
    setSelectedClub(club);
  };

  const handleBack = () => setSelectedClub(null);

  if (selectedClub) {
    return (
      <div className="app">
        <div className="phone-frame">
          <div className="phone-screen">
            <ClubDetail club={selectedClub} onBack={handleBack} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="screen-content">
            {tab === "discover" && <DiscoverScreen onClubSelect={handleClubSelect} />}
            {tab === "map" && (
              <div className="screen map-placeholder">
                <div className="top-bar"><div className="top-title">MAP</div></div>
                <div className="map-mock">
                  <div className="map-bg" />
                  {RUN_CLUBS.slice(0, 6).map((c, i) => (
                    <div key={c.id} className="map-pin" style={{ left: `${15 + i * 13}%`, top: `${20 + (i % 3) * 20}%` }} onClick={() => handleClubSelect(c)}>
                      <span>{c.emoji}</span>
                    </div>
                  ))}
                  <div className="map-overlay">
                    <div className="map-city-label">Dublin, Ireland</div>
                    <div className="map-club-count">5 clubs nearby</div>
                  </div>
                </div>
                <div className="nearby-strip">
                  {RUN_CLUBS.filter(c => c.city === "Dublin").map(c => (
                    <div key={c.id} className="nearby-pill" onClick={() => handleClubSelect(c)}>
                      {c.emoji} {c.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "trip" && <TripScreen onClubSelect={handleClubSelect} />}
            {tab === "profile" && <ProfileScreen />}
          </div>

          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t.id} className={`tab-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                <i className={`ti ${t.icon}`} aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
