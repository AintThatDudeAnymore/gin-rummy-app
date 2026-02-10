import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   FONTS & META
   ═══════════════════════════════════════════ */
const FONT = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
if (typeof document !== "undefined" && !document.getElementById("grf3")) {
  const l = document.createElement("link"); l.id = "grf3"; l.rel = "stylesheet"; l.href = FONT; document.head.appendChild(l);
}

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
const C = {
  felt:"#1a5c38", feltL:"#1e6b42", feltD:"#14472c",
  gold:"#d4a849", goldDim:"#b8923e", goldF:"rgba(212,168,73,0.12)",
  cream:"#f5f0e8", creamD:"#d6cfc2",
  red:"#c0392b", redS:"#e74c3c",
  dark:"#0f1a12",
  card:"rgba(245,240,232,0.06)",
  bdr:"rgba(212,168,73,0.2)", bdrA:"rgba(212,168,73,0.55)",
  win:"#f1c40f",
  aceL:"#5dade2", aceH:"#e74c3c",
};
const mono = "'JetBrains Mono',monospace";
const serif = "'Playfair Display',serif";

/* ═══════════════════════════════════════════
   PERSISTENT STORAGE HELPERS (localStorage)
   ═══════════════════════════════════════════ */
const STORAGE_KEY = "gin-saved-players";

function loadSaved() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function savePlayers(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

/* ═══════════════════════════════════════════
   AVATAR COMPONENT
   ═══════════════════════════════════════════ */
function Avatar({ src, name, size = 44, onClick, editable, crown }) {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const ref = useRef(null);

  const handleClick = () => {
    if (!editable) return;
    ref.current?.click();
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onClick?.(reader.result);
    reader.readAsDataURL(f);
  };

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {crown && (
        <div style={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
          fontSize: size < 40 ? 14 : 18, zIndex: 2, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
          lineHeight: 1, animation: "crownBob 2s ease-in-out infinite",
        }}>👑</div>
      )}
      <div
        onClick={handleClick}
        style={{
          width: size, height: size, borderRadius: "50%",
          background: src ? `url(${src}) center/cover no-repeat` : `linear-gradient(135deg, ${C.gold}44, ${C.goldDim}66)`,
          border: crown ? `2px solid ${C.win}` : `1.5px solid ${C.bdr}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: editable ? "pointer" : "default",
          fontSize: size * 0.36, fontWeight: 700, fontFamily: mono,
          color: C.cream, overflow: "hidden",
          boxShadow: crown ? `0 0 12px rgba(241,196,15,0.3)` : "none",
          transition: "all 0.3s",
        }}
      >
        {!src && initials}
        {editable && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <span style={{ fontSize: size * 0.32 }}>📷</span>
          </div>
        )}
      </div>
      {editable && <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STYLE INJECTION (crown animation)
   ═══════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("gin-style3")) {
  const s = document.createElement("style"); s.id = "gin-style3";
  s.textContent = `
    @keyframes crownBob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-3px)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════ */
const shell = {
  minHeight:"100dvh",
  background:`radial-gradient(ellipse at 50% 20%,${C.feltL} 0%,${C.felt} 45%,${C.feltD} 100%)`,
  fontFamily:mono, color:C.cream, display:"flex", flexDirection:"column", alignItems:"center",
};
const texture = {
  position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
  backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='.05'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l2 3.5-2 3z'/%3E%3C/g%3E%3C/svg%3E")`,
};
const wrap = { position:"relative",zIndex:1,width:"100%",maxWidth:"500px",padding:"20px 16px 80px" };

const pill = (active, color = C.gold) => ({
  padding:"12px 0", fontSize:"14px", fontWeight:"600", fontFamily:mono,
  border:`1.5px solid ${active ? color : C.bdr}`, borderRadius:"10px",
  background: active ? `${color}18` : "transparent",
  color: active ? color : C.creamD, cursor:"pointer", transition:"all 0.2s",
  flex:1, textAlign:"center",
});
const inp = {
  width:"100%", padding:"13px 14px", fontSize:"15px", fontFamily:mono,
  border:`1px solid ${C.bdr}`, borderRadius:"10px",
  background:"rgba(255,255,255,0.05)", color:C.cream, outline:"none", boxSizing:"border-box",
};
const label = { fontSize:"10px", letterSpacing:"3px", textTransform:"uppercase", color:C.goldDim, marginBottom:"10px", display:"block", fontFamily:mono };
const btnGold = {
  width:"100%", padding:"17px", fontSize:"13px", fontWeight:"700", fontFamily:mono,
  letterSpacing:"3px", textTransform:"uppercase", border:"none", borderRadius:"12px",
  background:`linear-gradient(135deg,${C.gold} 0%,${C.goldDim} 100%)`,
  color:C.dark, cursor:"pointer", boxShadow:"0 4px 24px rgba(212,168,73,0.3)", transition:"all 0.2s",
};
const btnOutline = (color = C.creamD) => ({
  padding:"10px 18px", fontSize:"10px", fontWeight:600, fontFamily:mono, letterSpacing:"2px",
  textTransform:"uppercase", border:`1px solid ${color}33`, borderRadius:"8px",
  background:"transparent", color, cursor:"pointer",
});

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function App() {
  // ── Navigation ──
  const [screen, setScreen] = useState("home"); // home | setup | game | endSession

  // ── Saved players ──
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [editingSaved, setEditingSaved] = useState(null); // index

  // ── Setup ──
  const [sessionName, setSessionName] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [setupPlayers, setSetupPlayers] = useState([
    { name: "", photo: null, save: false },
    { name: "", photo: null, save: false },
  ]);
  const [aceRule, setAceRule] = useState("low");
  const [goalType, setGoalType] = useState("points"); // points | rounds | free
  const [pointGoal, setPointGoal] = useState(100);
  const [customPointGoal, setCustomPointGoal] = useState("");
  const [roundGoal, setRoundGoal] = useState(10);
  const [customRoundGoal, setCustomRoundGoal] = useState("");

  // ── Game ──
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [roundInputs, setRoundInputs] = useState({});
  const [showRoundEntry, setShowRoundEntry] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionWinner, setSessionWinner] = useState(null);
  const [gameAceRule, setGameAceRule] = useState("low");
  const [gameGoalType, setGameGoalType] = useState("free");
  const [gameTarget, setGameTarget] = useState(0);
  const [gameSessionName, setGameSessionName] = useState("");

  // ── Load saved ──
  useEffect(() => { setSavedPlayers(loadSaved()); }, []);

  // ── Setup player count sync ──
  useEffect(() => {
    setSetupPlayers(prev => {
      const next = [];
      for (let i = 0; i < playerCount; i++) next.push(prev[i] || { name: "", photo: null, save: false });
      return next;
    });
  }, [playerCount]);

  const updateSetupPlayer = (i, field, val) => {
    setSetupPlayers(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n; });
  };

  const addSavedToSetup = (sp, slotIndex) => {
    updateSetupPlayer(slotIndex, "name", sp.name);
    updateSetupPlayer(slotIndex, "photo", sp.photo);
    updateSetupPlayer(slotIndex, "save", false); // already saved
  };

  /* ── Computed ── */
  const getTotal = (pid) => rounds.reduce((s, r) => s + (r.scores[pid] || 0), 0);

  const leaderInfo = useCallback(() => {
    if (players.length === 0) return { idx: -1, id: -1, tied: false };
    let maxScore = -Infinity; let maxIdx = 0; let tied = false;
    players.forEach((p, i) => {
      const t = getTotal(p.id);
      if (t > maxScore) { maxScore = t; maxIdx = i; tied = false; }
      else if (t === maxScore && t > 0) { tied = true; }
    });
    if (maxScore <= 0) return { idx: -1, id: -1, tied: false };
    return { idx: maxIdx, id: players[maxIdx].id, tied };
  }, [players, rounds]);

  const resolvedPointGoal = [100, 200, 300].includes(pointGoal) ? pointGoal : (parseInt(customPointGoal) || 100);
  const resolvedRoundGoal = [5, 10, 15].includes(roundGoal) ? roundGoal : (parseInt(customRoundGoal) || 10);

  /* ── Start Session ── */
  const startSession = () => {
    const p = setupPlayers.map((sp, i) => ({
      id: i, name: sp.name.trim() || `Player ${i + 1}`, photo: sp.photo,
    }));
    // Save marked players
    const toSave = setupPlayers.filter(sp => sp.save && sp.name.trim());
    if (toSave.length > 0) {
      const updated = [...savedPlayers];
      toSave.forEach(sp => {
        const existing = updated.findIndex(s => s.name.toLowerCase() === sp.name.trim().toLowerCase());
        if (existing >= 0) {
          updated[existing] = { name: sp.name.trim(), photo: sp.photo || updated[existing].photo };
        } else {
          updated.push({ name: sp.name.trim(), photo: sp.photo });
        }
      });
      setSavedPlayers(updated);
      savePlayers(updated);
    }
    setPlayers(p);
    setRounds([]);
    setSessionWinner(null);
    setShowRoundEntry(false);
    setShowHistory(false);
    setGameAceRule(aceRule);
    setGameGoalType(goalType);
    setGameTarget(goalType === "points" ? resolvedPointGoal : goalType === "rounds" ? resolvedRoundGoal : 0);
    setGameSessionName(sessionName.trim() || "Gin Rummy");
    setScreen("game");
  };

  /* ── Round Submit ── */
  const submitRound = () => {
    const scores = {};
    players.forEach(p => { scores[p.id] = parseInt(roundInputs[p.id]) || 0; });
    const nr = { roundNum: rounds.length + 1, scores };
    const updated = [...rounds, nr];
    setRounds(updated);
    setShowRoundEntry(false);

    // Check goal
    if (gameGoalType === "points") {
      for (const p of players) {
        const t = updated.reduce((s, r) => s + (r.scores[p.id] || 0), 0);
        if (t >= gameTarget) { setSessionWinner({ ...p, score: t }); break; }
      }
    } else if (gameGoalType === "rounds" && updated.length >= gameTarget) {
      // Most points after N rounds wins
      let best = null; let bestScore = -1;
      players.forEach(p => {
        const t = updated.reduce((s, r) => s + (r.scores[p.id] || 0), 0);
        if (t > bestScore) { bestScore = t; best = { ...p, score: t }; }
      });
      if (best) setSessionWinner(best);
    }
  };

  const undoLast = () => {
    if (rounds.length === 0) return;
    setRounds(prev => prev.slice(0, -1));
    if (sessionWinner) setSessionWinner(null);
  };

  const endSession = () => {
    // Find highest scorer
    if (!sessionWinner && players.length > 0) {
      let best = null; let bestScore = -1;
      players.forEach(p => {
        const t = getTotal(p.id);
        if (t > bestScore) { bestScore = t; best = { ...p, score: t }; }
      });
      if (best && bestScore > 0) setSessionWinner(best);
    }
    setScreen("endSession");
  };

  /* ── Delete saved player ── */
  const deleteSaved = (idx) => {
    const updated = savedPlayers.filter((_, i) => i !== idx);
    setSavedPlayers(updated);
    savePlayers(updated);
  };

  const updateSavedPhoto = (idx, photo) => {
    const updated = [...savedPlayers];
    updated[idx] = { ...updated[idx], photo };
    setSavedPlayers(updated);
    savePlayers(updated);
  };

  const updateSavedName = (idx, name) => {
    const updated = [...savedPlayers];
    updated[idx] = { ...updated[idx], name };
    setSavedPlayers(updated);
    savePlayers(updated);
  };

  // ════════════════════════════════════════
  // HOME SCREEN
  // ════════════════════════════════════════
  if (screen === "home") {
    return (
      <div style={shell}>
        <div style={texture} />
        <div style={wrap}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"32px",paddingTop:"10vh" }}>

            {/* Logo */}
            <div style={{ textAlign:"center", animation:"fadeUp 0.6s ease" }}>
              <div style={{ fontSize:"22px",letterSpacing:"16px",color:C.gold,opacity:0.5,marginBottom:"8px" }}>♠ ♥ ♦ ♣</div>
              <h1 style={{ fontFamily:serif,fontSize:"clamp(38px,10vw,52px)",color:C.cream,margin:0,lineHeight:1.05,fontWeight:900 }}>
                Gin Rummy
              </h1>
              <div style={{ fontSize:"11px",letterSpacing:"6px",textTransform:"uppercase",color:C.goldDim,marginTop:"8px" }}>
                Score Keeper
              </div>
            </div>

            {/* New Session */}
            <button style={{ ...btnGold, animation:"fadeUp 0.6s ease 0.15s both" }} onClick={() => setScreen("setup")}>
              New Session →
            </button>

            {/* Saved Players Section */}
            <div style={{ width:"100%", animation:"fadeUp 0.6s ease 0.3s both" }}>
              <button
                onClick={() => setShowSaved(p => !p)}
                style={{
                  width:"100%", padding:"16px", fontSize:"11px", fontWeight:600, fontFamily:mono,
                  letterSpacing:"2px", textTransform:"uppercase",
                  border:`1px solid ${C.bdr}`, borderRadius:"12px",
                  background: showSaved ? C.goldF : "transparent",
                  color: showSaved ? C.gold : C.creamD, cursor:"pointer", transition:"all 0.2s",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                }}
              >
                <span>Saved Players ({savedPlayers.length})</span>
                <span style={{ fontSize:"16px",transition:"transform 0.2s",transform:showSaved?"rotate(180deg)":"rotate(0)" }}>▾</span>
              </button>

              {showSaved && (
                <div style={{
                  marginTop:"10px", background:C.card, border:`1px solid ${C.bdr}`,
                  borderRadius:"14px", padding:"16px", animation:"popIn 0.25s ease",
                }}>
                  {savedPlayers.length === 0 ? (
                    <div style={{ textAlign:"center",padding:"20px 0",color:C.creamD,fontSize:"12px",lineHeight:1.8 }}>
                      No saved players yet.<br/>
                      <span style={{ color:C.goldDim }}>Toggle "Save" on a player during session setup</span>
                    </div>
                  ) : (
                    <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
                      {savedPlayers.map((sp, i) => (
                        <div key={i} style={{
                          display:"flex", alignItems:"center", gap:"12px",
                          padding:"10px 12px", background:"rgba(255,255,255,0.03)",
                          borderRadius:"10px", border:`1px solid rgba(255,255,255,0.04)`,
                        }}>
                          <Avatar src={sp.photo} name={sp.name} size={40} editable
                            onClick={(photo) => updateSavedPhoto(i, photo)} />
                          {editingSaved === i ? (
                            <input
                              style={{ ...inp, flex:1, padding:"8px 10px", fontSize:"13px" }}
                              value={sp.name}
                              autoFocus
                              onChange={e => updateSavedName(i, e.target.value)}
                              onBlur={() => setEditingSaved(null)}
                              onKeyDown={e => e.key === "Enter" && setEditingSaved(null)}
                            />
                          ) : (
                            <span
                              onClick={() => setEditingSaved(i)}
                              style={{ flex:1, fontSize:"14px", fontWeight:600, cursor:"pointer" }}
                            >{sp.name}</span>
                          )}
                          <button onClick={() => deleteSaved(i)} style={{
                            ...btnOutline(C.redS), padding:"6px 10px", fontSize:"9px",
                          }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // SETUP SCREEN
  // ════════════════════════════════════════
  if (screen === "setup") {
    return (
      <div style={shell}>
        <div style={texture} />
        <div style={wrap}>
          <div style={{ display:"flex",flexDirection:"column",gap:"24px" }}>

            {/* Back */}
            <button onClick={() => setScreen("home")} style={{ ...btnOutline(), alignSelf:"flex-start", marginBottom:"-8px" }}>
              ← Back
            </button>

            {/* Title */}
            <div style={{ textAlign:"center" }}>
              <h2 style={{ fontFamily:serif,fontSize:"28px",color:C.cream,margin:"0 0 4px",fontWeight:700 }}>New Session</h2>
              <div style={{ fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:C.goldDim }}>Configure your game</div>
            </div>

            {/* Card: Session Name */}
            <div style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:"16px", padding:"22px 20px", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column", gap:"20px" }}>

              <div>
                <span style={label}>Session Name</span>
                <input style={inp} placeholder="Friday Night Cards" value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.gold}
                  onBlur={e => e.target.style.borderColor = C.bdr} />
              </div>

              {/* Player Count */}
              <div>
                <span style={label}>Players</span>
                <div style={{ display:"flex",gap:"8px" }}>
                  {[2,3,4,5].map(n => <button key={n} style={pill(playerCount===n)} onClick={() => setPlayerCount(n)}>{n}</button>)}
                </div>
              </div>

              {/* Player Entries */}
              <div>
                <span style={label}>Player Setup</span>
                <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
                  {setupPlayers.map((sp, i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:"10px",
                      padding:"12px", background:"rgba(255,255,255,0.02)",
                      borderRadius:"12px", border:`1px solid rgba(255,255,255,0.04)`,
                    }}>
                      <Avatar src={sp.photo} name={sp.name || `P${i+1}`} size={42} editable
                        onClick={(photo) => updateSetupPlayer(i, "photo", photo)} />
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"6px" }}>
                        <input
                          style={{ ...inp, padding:"10px 12px", fontSize:"14px" }}
                          placeholder={`Player ${i+1}`}
                          value={sp.name}
                          onChange={e => updateSetupPlayer(i, "name", e.target.value)}
                          onFocus={e => e.target.style.borderColor = C.gold}
                          onBlur={e => e.target.style.borderColor = C.bdr}
                        />
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <button
                            onClick={() => updateSetupPlayer(i, "save", !sp.save)}
                            style={{
                              padding:"4px 10px", fontSize:"9px", fontWeight:600, fontFamily:mono,
                              letterSpacing:"1.5px", textTransform:"uppercase",
                              border:`1px solid ${sp.save ? C.gold+"66" : C.bdr}`,
                              borderRadius:"6px", cursor:"pointer",
                              background: sp.save ? C.goldF : "transparent",
                              color: sp.save ? C.gold : C.creamD,
                            }}
                          >
                            {sp.save ? "✓ Saved" : "Save"}
                          </button>
                          {savedPlayers.length > 0 && (
                            <select
                              style={{
                                padding:"4px 8px", fontSize:"9px", fontFamily:mono,
                                border:`1px solid ${C.bdr}`, borderRadius:"6px",
                                background:"rgba(255,255,255,0.05)", color:C.creamD,
                                cursor:"pointer", outline:"none",
                              }}
                              value=""
                              onChange={e => {
                                const idx = parseInt(e.target.value);
                                if (!isNaN(idx)) addSavedToSetup(savedPlayers[idx], i);
                              }}
                            >
                              <option value="">Load saved...</option>
                              {savedPlayers.map((s, si) => <option key={si} value={si}>{s.name}</option>)}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ace Rule */}
              <div>
                <span style={label}>Ace Value</span>
                <div style={{ display:"flex",gap:"8px" }}>
                  <button
                    style={{ ...pill(aceRule==="low",C.aceL), display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",padding:"13px 0" }}
                    onClick={() => setAceRule("low")}
                  >
                    <span style={{ fontSize:"17px",fontWeight:700 }}>5 pts</span>
                    <span style={{ fontSize:"8px",letterSpacing:"1px",opacity:0.7,textTransform:"uppercase" }}>A, 2, 3, 4 ...</span>
                  </button>
                  <button
                    style={{ ...pill(aceRule==="high",C.aceH), display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",padding:"13px 0" }}
                    onClick={() => setAceRule("high")}
                  >
                    <span style={{ fontSize:"17px",fontWeight:700 }}>15 pts</span>
                    <span style={{ fontSize:"8px",letterSpacing:"1px",opacity:0.7,textTransform:"uppercase" }}>... Q, K, A</span>
                  </button>
                </div>
              </div>

              {/* Goal Type */}
              <div>
                <span style={label}>Session Goal</span>
                <div style={{ display:"flex",gap:"8px",marginBottom:"12px" }}>
                  {[
                    { key:"points", label:"Target Score" },
                    { key:"rounds", label:"Round Limit" },
                    { key:"free",   label:"Free Play"  },
                  ].map(g => (
                    <button key={g.key} style={pill(goalType===g.key)} onClick={() => setGoalType(g.key)}>
                      {g.label}
                    </button>
                  ))}
                </div>

                {goalType === "points" && (
                  <>
                    <div style={{ fontSize:"11px",color:C.creamD,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",lineHeight:1.6,marginBottom:"12px" }}>
                      First player to reach the target score wins the session. The standard in Gin Rummy is 100 points — but set it to whatever suits your table.
                    </div>
                    <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                      {[100,200,300].map(n => (
                        <button key={n} style={pill(pointGoal===n)} onClick={() => { setPointGoal(n); setCustomPointGoal(""); }}>{n}</button>
                      ))}
                      <input
                        style={{ ...inp,width:"auto",flex:1,minWidth:"70px",textAlign:"center",
                          borderColor: ![100,200,300].includes(pointGoal) && customPointGoal ? C.gold : C.bdr }}
                        placeholder="Custom" value={customPointGoal} type="number" inputMode="numeric"
                        onChange={e => { setCustomPointGoal(e.target.value); setPointGoal(-1); }} />
                    </div>
                  </>
                )}

                {goalType === "rounds" && (
                  <>
                    <div style={{ fontSize:"11px",color:C.creamD,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",lineHeight:1.6,marginBottom:"12px" }}>
                      Play a fixed number of hands. After the final round, the player with the highest total deadwood score takes the crown.
                    </div>
                    <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                      {[5,10,15].map(n => (
                        <button key={n} style={pill(roundGoal===n)} onClick={() => { setRoundGoal(n); setCustomRoundGoal(""); }}>{n}</button>
                      ))}
                      <input
                        style={{ ...inp,width:"auto",flex:1,minWidth:"70px",textAlign:"center",
                          borderColor: ![5,10,15].includes(roundGoal) && customRoundGoal ? C.gold : C.bdr }}
                        placeholder="Custom" value={customRoundGoal} type="number" inputMode="numeric"
                        onChange={e => { setCustomRoundGoal(e.target.value); setRoundGoal(-1); }} />
                    </div>
                  </>
                )}

                {goalType === "free" && (
                  <div style={{ fontSize:"11px",color:C.creamD,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",lineHeight:1.6 }}>
                    No target — play as many hands as you like. End the session whenever you're done. The player with the most points gets the crown.
                  </div>
                )}
              </div>
            </div>

            {/* Card Values Reference */}
            <div style={{ background:C.card, border:`1px solid ${C.bdr}`, borderRadius:"14px", padding:"16px 18px", backdropFilter:"blur(8px)" }}>
              <span style={{ ...label,marginBottom:"10px" }}>Deadwood Card Values</span>
              <div style={{ display:"flex",flexDirection:"column",gap:"7px",fontSize:"12px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",color:C.creamD }}>
                  <span>2, 3, 4, 5, 6, 7, 8, 9</span>
                  <span style={{ color:C.cream,fontWeight:600 }}>5 pts each</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",color:C.creamD }}>
                  <span>10, J, Q, K</span>
                  <span style={{ color:C.cream,fontWeight:600 }}>10 pts each</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",color:C.creamD }}>
                  <span>Ace</span>
                  <span style={{ color:aceRule==="high"?C.aceH:C.aceL, fontWeight:700 }}>
                    {aceRule==="high" ? "15 pts (high)" : "5 pts (low)"}
                  </span>
                </div>
              </div>
            </div>

            <button style={btnGold} onClick={startSession}>Start Session →</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // END SESSION SCREEN
  // ════════════════════════════════════════
  if (screen === "endSession") {
    const sorted = [...players].sort((a, b) => getTotal(b.id) - getTotal(a.id));
    return (
      <div style={shell}>
        <div style={texture} />
        <div style={wrap}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:"24px",paddingTop:"6vh", animation:"fadeUp 0.5s ease" }}>

            <div style={{ fontSize:"52px", filter:"drop-shadow(0 2px 8px rgba(241,196,15,0.4))" }}>👑</div>
            <div style={{ fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:C.goldDim }}>{gameSessionName}</div>
            <h2 style={{ fontFamily:serif,fontSize:"18px",color:C.creamD,letterSpacing:"3px",textTransform:"uppercase",margin:0 }}>Final Standings</h2>

            <div style={{ width:"100%",display:"flex",flexDirection:"column",gap:"10px" }}>
              {sorted.map((p, rank) => {
                const total = getTotal(p.id);
                const isChamp = rank === 0 && total > 0;
                return (
                  <div key={p.id} style={{
                    display:"flex", alignItems:"center", gap:"14px",
                    padding:"16px 18px", background: isChamp ? "rgba(241,196,15,0.08)" : C.card,
                    border:`1.5px solid ${isChamp ? C.win : C.bdr}`,
                    borderRadius:"14px", backdropFilter:"blur(8px)",
                    animation:`fadeUp 0.4s ease ${rank * 0.08}s both`,
                    ...(isChamp ? { boxShadow:"0 0 30px rgba(241,196,15,0.1)" } : {}),
                  }}>
                    <div style={{
                      width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:serif, fontSize:"16px", fontWeight:700,
                      background: rank === 0 ? C.win : rank === 1 ? "#aaa" : rank === 2 ? "#cd7f32" : "rgba(255,255,255,0.06)",
                      color: rank < 3 ? C.dark : C.creamD, flexShrink:0,
                    }}>{rank + 1}</div>
                    <Avatar src={p.photo} name={p.name} size={38} crown={isChamp} />
                    <span style={{ flex:1,fontSize:"15px",fontWeight:600 }}>{p.name}</span>
                    <span style={{ fontFamily:serif,fontSize:"24px",fontWeight:700,color:isChamp?C.win:C.cream }}>{total}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize:"11px",color:C.creamD }}>
              {rounds.length} hand{rounds.length !== 1 ? "s" : ""} played · Ace = {gameAceRule === "high" ? "15 (High)" : "5 (Low)"}
            </div>

            <button style={btnGold} onClick={() => {
              setScreen("home");
              setSessionWinner(null);
              setRounds([]);
              setPlayers([]);
            }}>
              Done
            </button>
            <button style={btnOutline(C.creamD)} onClick={() => { setScreen("game"); }}>
              ← Back to Scoreboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // GAME SCREEN
  // ════════════════════════════════════════
  const leader = leaderInfo();

  const goalLabel =
    gameGoalType === "points" ? `Target: ${gameTarget} pts` :
    gameGoalType === "rounds" ? `${gameTarget} hands` : "Free Play";

  const progress =
    gameGoalType === "rounds" ? `Hand ${rounds.length} / ${gameTarget}` :
    gameGoalType === "points" ? null : null;

  return (
    <div style={shell}>
      <div style={texture} />
      <div style={wrap}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px" }}>
          <div>
            <h2 style={{ fontFamily:serif,fontSize:"22px",color:C.cream,margin:"0 0 3px",fontWeight:700 }}>{gameSessionName}</h2>
            <div style={{ fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:C.goldDim,display:"flex",gap:"10px",flexWrap:"wrap" }}>
              <span>{goalLabel}</span>
              <span>·</span>
              <span>Ace = {gameAceRule==="high"?"15":"5"}</span>
              {progress && <><span>·</span><span>{progress}</span></>}
            </div>
          </div>
          <button style={{ ...btnOutline(C.redS), padding:"8px 14px" }} onClick={endSession}>
            End
          </button>
        </div>

        {/* Ace badge */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"8px",
          background:gameAceRule==="high"?"rgba(231,76,60,0.12)":"rgba(93,173,226,0.12)",
          border:`1px solid ${gameAceRule==="high"?"rgba(231,76,60,0.3)":"rgba(93,173,226,0.3)"}`,
          marginBottom:"18px",fontSize:"12px",fontWeight:600,
        }}>
          <span style={{ fontSize:"15px" }}>A</span>
          <span style={{ color:gameAceRule==="high"?C.aceH:C.aceL }}>
            {gameAceRule==="high"?"= 15 · High":"= 5 · Low"}
          </span>
        </div>

        {/* Player Cards */}
        <div style={{ display:"flex",flexDirection:"column",gap:"10px",marginBottom:"18px" }}>
          {players.map((p, i) => {
            const total = getTotal(p.id);
            const pct = gameGoalType === "points" && gameTarget > 0 ? (total / gameTarget) * 100 : 0;
            const isCrown = leader.id === p.id && !leader.tied;
            const lastR = rounds.length > 0 ? rounds[rounds.length - 1].scores[p.id] : null;

            return (
              <div key={p.id} style={{
                display:"flex", alignItems:"center", gap:"14px",
                background: isCrown ? "rgba(241,196,15,0.06)" : C.card,
                border:`1.5px solid ${isCrown ? C.win+"66" : C.bdr}`,
                borderRadius:"14px", padding:"14px 16px",
                backdropFilter:"blur(8px)", transition:"all 0.3s",
              }}>
                <Avatar src={p.photo} name={p.name} size={44} crown={isCrown} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"8px" }}>
                    <span style={{ fontSize:"15px",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</span>
                    {isCrown && (
                      <span style={{ fontSize:"8px",letterSpacing:"1.5px",textTransform:"uppercase",color:C.dark,background:C.win,padding:"2px 7px",borderRadius:"4px",fontWeight:700,flexShrink:0 }}>Lead</span>
                    )}
                  </div>
                  {gameGoalType === "points" && (
                    <div style={{ width:"100%",height:"2px",background:"rgba(255,255,255,0.06)",borderRadius:"2px",marginTop:"8px",overflow:"hidden" }}>
                      <div style={{ width:`${Math.min(pct,100)}%`,height:"100%",background:pct>=100?C.win:`linear-gradient(90deg,${C.gold},${C.goldDim})`,borderRadius:"2px",transition:"width 0.5s ease" }} />
                    </div>
                  )}
                </div>
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <div style={{ fontFamily:serif,fontSize:"30px",fontWeight:700,color:isCrown?C.win:C.cream,lineHeight:1 }}>{total}</div>
                  {lastR !== null && lastR > 0 && (
                    <div style={{ fontSize:"10px",color:C.goldDim,marginTop:"2px" }}>+{lastR}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Round */}
        {!showRoundEntry && !sessionWinner && (
          <button style={{ ...btnGold,marginBottom:"14px",fontSize:"12px",padding:"15px" }}
            onClick={() => {
              const init = {};
              players.forEach(p => init[p.id] = "");
              setRoundInputs(init);
              setShowRoundEntry(true);
            }}>
            + Add Hand {rounds.length + 1}
          </button>
        )}

        {/* Round Entry */}
        {showRoundEntry && (
          <div style={{
            width:"100%",background:C.card,border:`1px solid ${C.bdrA}`,borderRadius:"16px",
            padding:"20px 18px",marginBottom:"14px",backdropFilter:"blur(8px)",animation:"popIn 0.25s ease",
          }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px" }}>
              <span style={{ ...label,margin:0,fontSize:"11px" }}>Hand {rounds.length + 1} — Deadwood Scores</span>
              <button style={btnOutline()} onClick={() => setShowRoundEntry(false)}>Cancel</button>
            </div>
            <div style={{
              fontSize:"11px",color:C.creamD,marginBottom:"14px",lineHeight:1.6,
              padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:`1px solid rgba(255,255,255,0.05)`,
            }}>
              <span style={{ color:C.cream }}>2-9</span> = 5 · <span style={{ color:C.cream }}>10,J,Q,K</span> = 10 · <span style={{ color:gameAceRule==="high"?C.aceH:C.aceL }}>A = {gameAceRule==="high"?"15":"5"}</span>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
              {players.map(p => (
                <div key={p.id} style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                  <Avatar src={p.photo} name={p.name} size={32} />
                  <span style={{ fontSize:"13px",fontWeight:600,width:"70px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0 }}>{p.name}</span>
                  <input
                    style={{ ...inp,width:"auto",flex:1,textAlign:"center",fontSize:"17px",fontWeight:600,padding:"11px" }}
                    type="number" inputMode="numeric" placeholder="0"
                    value={roundInputs[p.id] || ""}
                    onChange={e => setRoundInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                    onFocus={e => { e.target.style.borderColor = C.gold; e.target.select(); }}
                    onBlur={e => e.target.style.borderColor = C.bdr}
                  />
                </div>
              ))}
            </div>
            <button style={{ ...btnGold,marginTop:"16px",fontSize:"12px",padding:"14px" }} onClick={submitRound}>
              Submit Hand
            </button>
          </div>
        )}

        {/* Controls */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"8px",borderTop:`1px solid ${C.bdr}22`,marginBottom:"6px" }}>
          <button style={{ ...btnOutline(), opacity:rounds.length===0?0.25:1,cursor:rounds.length===0?"default":"pointer" }}
            onClick={undoLast} disabled={rounds.length===0}>← Undo</button>
          <span style={{ fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:C.goldDim }}>
            {rounds.length} hand{rounds.length!==1?"s":""}
          </span>
          <button style={btnOutline(C.redS)} onClick={endSession}>End Session</button>
        </div>

        {/* History */}
        {rounds.length > 0 && (
          <button
            style={{
              width:"100%",padding:"13px",fontSize:"10px",fontWeight:600,fontFamily:mono,
              letterSpacing:"2px",textTransform:"uppercase",
              border:`1px solid ${C.bdr}`,borderRadius:"10px",
              background:showHistory?C.goldF:"transparent",
              color:showHistory?C.gold:C.creamD,cursor:"pointer",marginTop:"6px",transition:"all 0.2s",
            }}
            onClick={() => setShowHistory(p => !p)}
          >
            {showHistory ? "Hide" : "Show"} History
          </button>
        )}

        {showHistory && rounds.length > 0 && (
          <div style={{ width:"100%",marginTop:"12px",background:C.card,border:`1px solid ${C.bdr}`,borderRadius:"14px",overflow:"hidden",backdropFilter:"blur(8px)" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:"12px" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${C.bdr}` }}>
                    <th style={{ padding:"11px 12px",textAlign:"left",fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:C.goldDim,fontWeight:600 }}>Hand</th>
                    {players.map(p => (
                      <th key={p.id} style={{ padding:"11px 8px",textAlign:"center",fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase",color:C.goldDim,fontWeight:600,maxWidth:"70px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r, ri) => (
                    <tr key={ri} style={{ borderBottom:`1px solid ${C.bdr}11` }}>
                      <td style={{ padding:"9px 12px",color:C.creamD,fontWeight:500 }}>{r.roundNum}</td>
                      {players.map(p => (
                        <td key={p.id} style={{ padding:"9px 8px",textAlign:"center",color:r.scores[p.id]>0?C.cream:C.creamD,fontWeight:r.scores[p.id]>0?600:400 }}>
                          {r.scores[p.id] > 0 ? `+${r.scores[p.id]}` : r.scores[p.id] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr style={{ borderTop:`1.5px solid ${C.gold}`,background:C.goldF }}>
                    <td style={{ padding:"11px 12px",fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:C.gold,fontWeight:700 }}>Tot</td>
                    {players.map(p => (
                      <td key={p.id} style={{ padding:"11px 8px",textAlign:"center",color:C.gold,fontWeight:700,fontSize:"14px" }}>{getTotal(p.id)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Winner Overlay ── */}
      {sessionWinner && screen === "game" && (
        <div
          style={{ position:"fixed",inset:0,background:"rgba(15,26,18,0.9)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"20px" }}
          onClick={() => setSessionWinner(null)}
        >
          <div
            style={{
              background:`radial-gradient(ellipse at 50% 30%,${C.feltL} 0%,${C.feltD} 100%)`,
              border:`2px solid ${C.win}`,borderRadius:"24px",padding:"40px 28px",textAlign:"center",
              maxWidth:"380px",width:"100%",boxShadow:"0 0 60px rgba(241,196,15,0.2)",
              animation:"popIn 0.4s ease",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize:"52px",marginBottom:"6px",filter:"drop-shadow(0 2px 8px rgba(241,196,15,0.4))" }}>👑</div>
            <div style={{ fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:C.goldDim,marginBottom:"10px" }}>{gameSessionName}</div>
            {sessionWinner.photo && (
              <div style={{ width:80,height:80,borderRadius:"50%",margin:"0 auto 12px",
                background:`url(${sessionWinner.photo}) center/cover`,border:`3px solid ${C.win}`,
                boxShadow:"0 0 24px rgba(241,196,15,0.3)" }} />
            )}
            <div style={{ fontFamily:serif,fontSize:"15px",color:C.creamD,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"8px" }}>Winner</div>
            <h2 style={{ fontFamily:serif,fontSize:"clamp(32px,9vw,48px)",color:C.win,margin:"0 0 6px",lineHeight:1.1,fontWeight:900 }}>{sessionWinner.name}</h2>
            <div style={{ fontSize:"17px",color:C.cream,marginBottom:"6px",fontFamily:mono }}>{sessionWinner.score} points</div>
            <div style={{ fontSize:"11px",color:C.creamD,marginBottom:"28px" }}>{rounds.length} hand{rounds.length!==1?"s":""}</div>
            <button style={{ ...btnGold,background:C.win,color:C.dark,marginBottom:"10px" }}
              onClick={() => endSession()}>
              View Standings
            </button>
            <button style={{ ...btnOutline(C.creamD),width:"100%",padding:"14px" }}
              onClick={() => setSessionWinner(null)}>
              Keep Scoring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
