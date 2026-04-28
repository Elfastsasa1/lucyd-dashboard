import { useState, useEffect } from "react";

const COLORS = {
  bg: "#080c10",
  surface: "#0d1117",
  border: "#1a2332",
  accent: "#00c8ff",
  green: "#00e5a0",
  yellow: "#f5c400",
  red: "#ff4757",
  muted: "#4a6072",
  text: "#c9d6e3",
};

const modules = [
  { id: 1, name: "Auto-Move", desc: "File organizer", icon: "↕", priority: "P1", on: true },
  { id: 2, name: "Auto-Tagging", desc: "Classify by keyword", icon: "⊞", priority: "P2", on: true },
  { id: 3, name: "Intel_Raw", desc: "Scrape social/news/chain", icon: "↓", priority: "P3", on: true },
  { id: 4, name: "Dashboard", desc: "Control & monitoring", icon: "◈", priority: "P4", on: true },
  { id: 5, name: "Phantom Core", desc: "IF→THEN decisions", icon: "◎", priority: "P5", on: false },
  { id: 6, name: "Alert", desc: "Event notifications", icon: "◷", priority: "P6", on: true },
  { id: 7, name: "Execution", desc: "Auto transactions", icon: "⚡", priority: "P7", on: false },
  { id: 8, name: "Memory", desc: "Log & pattern store", icon: "◉", priority: "P8", on: true },
];

const phantomRules = [
  { if: "token_volume > 2x avg", then: "ALERT + FLAG", status: "on" },
  { if: "new_file_detected", then: "AUTO-TAG + MOVE", status: "on" },
  { if: "wallet_seed_valid", then: "LOG + STORE", status: "on" },
  { if: "sentiment < -0.7", then: "HALT EXEC", status: "idle" },
  { if: "mode == AUTO", then: "EXECUTE_TX", status: "off" },
];

const initialLogs = [
  { time: "09:14", tag: "warn", label: "HUNT", msg: "Token Hunter: OP spike +47%" },
  { time: "09:10", tag: "info", label: "SCRP", msg: "Intel_Raw: 312 entries ingested" },
  { time: "08:55", tag: "ok", label: "MOVE", msg: "Auto-Move: 43 files → /reports" },
  { time: "08:52", tag: "err", label: "EXEC", msg: "Execution blocked: ASSISTED mode" },
  { time: "08:30", tag: "info", label: "TAG", msg: "Auto-Tagging: 89 items classified" },
  { time: "07:44", tag: "ok", label: "MEM", msg: "Memory: pattern → airdrop_cycle_3" },
];

const liveMsgs = [
  { tag: "info", label: "SCRP", msg: "Intel_Raw: new batch ingested" },
  { tag: "ok", label: "TAG", msg: "Auto-Tagging: 12 items processed" },
  { tag: "warn", label: "HUNT", msg: "Token Hunter: scanning pairs..." },
  { tag: "ok", label: "MEM", msg: "Memory: log flushed" },
  { tag: "info", label: "CORE", msg: "Phantom Core: rule evaluated" },
  { tag: "ok", label: "MOVE", msg: "Auto-Move: pattern matched" },
];

const tagColor = { info: "#00c8ff", ok: "#00e5a0", warn: "#f5c400", err: "#ff4757" };
const tagBg = { info: "rgba(0,200,255,0.1)", ok: "rgba(0,229,160,0.1)", warn: "rgba(245,196,0,0.1)", err: "rgba(255,71,87,0.1)" };

const navTabs = ["Dashboard", "Modules", "Phantom", "Log", "Alerts"];

export default function LucydDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [mode, setMode] = useState("ASSISTED");
  const [mods, setMods] = useState(modules);
  const [logs, setLogs] = useState(initialLogs);
  const [clock, setClock] = useState("");
  const [barData] = useState(() => Array.from({ length: 18 }, () => Math.floor(Math.random() * 80) + 15));

  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const entry = liveMsgs[Math.floor(Math.random() * liveMsgs.length)];
      const now = new Date().toTimeString().slice(0, 5);
      setLogs(prev => [{ time: now, ...entry }, ...prev].slice(0, 12));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const toggleMod = (id) => setMods(prev => prev.map(m => m.id === id ? { ...m, on: !m.on } : m));

  const s = {
    root: {
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 14,
      display: "flex",
      flexDirection: "column",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
    },
    topbar: {
      background: COLORS.surface,
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    },
    logo: {
      fontFamily: "monospace",
      fontWeight: 700,
      fontSize: 18,
      color: COLORS.accent,
      letterSpacing: 4,
    },
    clockText: {
      fontFamily: "monospace",
      fontSize: 11,
      color: COLORS.muted,
    },
    modeRow: {
      display: "flex",
      gap: 4,
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 6,
      overflow: "hidden",
      padding: 2,
    },
    modeBtn: (active) => ({
      padding: "4px 10px",
      fontSize: 10,
      fontFamily: "monospace",
      letterSpacing: 1,
      borderRadius: 4,
      cursor: "pointer",
      background: active ? COLORS.accent : "transparent",
      color: active ? COLORS.bg : COLORS.muted,
      fontWeight: active ? 700 : 400,
      border: "none",
      transition: "all 0.15s",
    }),
    content: { flex: 1, padding: "16px", paddingBottom: 80, overflowY: "auto" },
    card: {
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      marginBottom: 12,
      overflow: "hidden",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 14px",
      borderBottom: `1px solid ${COLORS.border}`,
    },
    cardTitle: {
      fontFamily: "monospace",
      fontSize: 10,
      letterSpacing: 2,
      color: COLORS.muted,
      textTransform: "uppercase",
    },
    cardBody: { padding: "12px 14px" },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 },
    statCard: (color) => ({
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: "14px",
      borderTop: `2px solid ${color}`,
    }),
    statLabel: { fontSize: 10, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
    statValue: { fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: COLORS.text, lineHeight: 1, marginBottom: 4 },
    statSub: (color) => ({ fontSize: 11, color }),
    modRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "11px 14px",
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      marginBottom: 8,
    },
    modIcon: { fontSize: 16, width: 24, textAlign: "center" },
    modInfo: { flex: 1 },
    modName: { fontSize: 13, fontWeight: 500, color: COLORS.text },
    modDesc: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
    badge: (color, bg) => ({
      fontFamily: "monospace",
      fontSize: 9,
      padding: "2px 6px",
      borderRadius: 3,
      color,
      background: bg,
      fontWeight: 700,
    }),
    toggle: (on) => ({
      width: 36,
      height: 20,
      borderRadius: 10,
      background: on ? COLORS.accent : COLORS.border,
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s",
      flexShrink: 0,
    }),
    toggleKnob: (on) => ({
      position: "absolute",
      width: 14,
      height: 14,
      background: "#fff",
      borderRadius: "50%",
      top: 3,
      left: on ? 19 : 3,
      transition: "left 0.2s",
    }),
    ruleRow: {
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
    },
    logRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "9px 0",
      borderBottom: `1px solid ${COLORS.border}`,
    },
    logTime: { fontFamily: "monospace", fontSize: 10, color: COLORS.muted, whiteSpace: "nowrap", paddingTop: 2 },
    logMsg: { fontSize: 12, color: COLORS.text, lineHeight: 1.5 },
    alertRow: (color, bg) => ({
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 8,
      marginBottom: 8,
      background: bg,
      border: `1px solid ${color}30`,
    }),
    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      background: COLORS.surface,
      borderTop: `1px solid ${COLORS.border}`,
      display: "flex",
      zIndex: 100,
    },
    navBtn: (active) => ({
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 4px 8px",
      cursor: "pointer",
      color: active ? COLORS.accent : COLORS.muted,
      fontSize: 10,
      fontFamily: "monospace",
      letterSpacing: 1,
      borderTop: active ? `2px solid ${COLORS.accent}` : "2px solid transparent",
      transition: "all 0.15s",
      background: "none",
      border: "none",
      borderTop: active ? `2px solid ${COLORS.accent}` : "2px solid transparent",
    }),
  };

  const navIcons = { Dashboard: "◈", Modules: "⬡", Phantom: "◎", Log: "≡", Alerts: "◷" };

  // ── VIEWS ──

  const ViewDashboard = () => (
    <>
      {/* Mode */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2 }}>SYSTEM MODE</span>
        <div style={s.modeRow}>
          {["PASSIVE", "ASSISTED", "AUTO"].map(m => (
            <button key={m} style={s.modeBtn(mode === m)} onClick={() => setMode(m)}>{m}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsGrid}>
        <div style={s.statCard(COLORS.accent)}>
          <div style={s.statLabel}>Data Scraped</div>
          <div style={s.statValue}>2,847</div>
          <div style={s.statSub(COLORS.green)}>↑ 12% today</div>
        </div>
        <div style={s.statCard(COLORS.green)}>
          <div style={s.statLabel}>Tokens Found</div>
          <div style={s.statValue}>3</div>
          <div style={s.statSub(COLORS.green)}>↑ New signals</div>
        </div>
        <div style={s.statCard(COLORS.yellow)}>
          <div style={s.statLabel}>Rules Fired</div>
          <div style={s.statValue}>14</div>
          <div style={s.statSub(COLORS.yellow)}>↑ 5 today</div>
        </div>
        <div style={s.statCard(COLORS.red)}>
          <div style={s.statLabel}>Pending</div>
          <div style={s.statValue}>2</div>
          <div style={s.statSub(COLORS.red)}>⚠ Review needed</div>
        </div>
      </div>

      {/* Infra */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Infrastructure</span>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.green }}>ONLINE</span>
        </div>
        <div style={s.cardBody}>
          {[
            { label: "HP (Control)", status: "on" },
            { label: "VPS (Engine)", status: "on" },
            { label: "Execution Engine", status: "idle" },
          ].map(({ label, status }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13 }}>{label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: status === "on" ? COLORS.green : status === "idle" ? COLORS.yellow : COLORS.red,
                }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.muted }}>
                  {status === "on" ? "LIVE" : status === "idle" ? "IDLE" : "OFF"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={s.cardTitle}>Activity / 24h</span>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.muted }}>{clock}</span>
        </div>
        <div style={s.cardBody}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 56 }}>
            {barData.map((v, i) => (
              <div key={i} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end" }}>
                <div style={{
                  width: "100%",
                  height: `${v}%`,
                  background: i === barData.length - 1 ? COLORS.accent : "rgba(0,200,255,0.2)",
                  borderRadius: "2px 2px 0 0",
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {["00:00", "06:00", "12:00", "18:00", "NOW"].map(t => (
              <span key={t} style={{ fontFamily: "monospace", fontSize: 9, color: COLORS.muted }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const ViewModules = () => (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>All Modules</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.muted }}>
          {mods.filter(m => m.on).length}/{mods.length} ACTIVE
        </span>
      </div>
      <div style={s.cardBody}>
        {mods.map(m => (
          <div key={m.id} style={s.modRow}>
            <span style={s.modIcon}>{m.icon}</span>
            <div style={s.modInfo}>
              <div style={s.modName}>{m.name}</div>
              <div style={s.modDesc}>{m.desc}</div>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.muted, background: COLORS.border, padding: "2px 6px", borderRadius: 3 }}>{m.priority}</span>
            <div style={s.toggle(m.on)} onClick={() => toggleMod(m.id)}>
              <div style={s.toggleKnob(m.on)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ViewPhantom = () => (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>Phantom Core Rules</span>
        <span style={{ fontSize: 11, color: COLORS.accent, cursor: "pointer" }}>+ Add</span>
      </div>
      <div style={s.cardBody}>
        {phantomRules.map((r, i) => {
          const color = r.status === "on" ? COLORS.green : r.status === "idle" ? COLORS.yellow : COLORS.red;
          const bg = r.status === "on" ? "rgba(0,229,160,0.1)" : r.status === "idle" ? "rgba(245,196,0,0.1)" : "rgba(255,71,87,0.1)";
          const label = r.status === "on" ? "ON" : r.status === "idle" ? "IDLE" : "OFF";
          return (
            <div key={i} style={s.ruleRow}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.accent }}>IF</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.text, flex: 1 }}>{r.if}</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.muted }}>→</span>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: COLORS.green }}>{r.then}</span>
              <span style={s.badge(color, bg)}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ViewLog = () => (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>System Log</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.green }}>● LIVE</span>
      </div>
      <div style={s.cardBody}>
        {logs.map((l, i) => (
          <div key={i} style={{ ...s.logRow, borderBottom: i === logs.length - 1 ? "none" : `1px solid ${COLORS.border}` }}>
            <span style={s.logTime}>{l.time}</span>
            <span style={s.badge(tagColor[l.tag], tagBg[l.tag])}>{l.label}</span>
            <span style={s.logMsg}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ViewAlerts = () => (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardTitle}>Alerts</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.red }}>2 ACTIVE</span>
      </div>
      <div style={s.cardBody}>
        {[
          { type: "warn", icon: "⚠", title: "Token signal detected", sub: "Token Hunter — OP/USDC spike", time: "09:14" },
          { type: "err", icon: "✕", title: "Execution pending approval", sub: "AUTO mode required", time: "08:52" },
          { type: "ok", icon: "✓", title: "Auto-Move completed", sub: "143 files organized", time: "07:30" },
          { type: "ok", icon: "✓", title: "Intel_Raw batch done", sub: "312 entries ingested", time: "07:10" },
        ].map((a, i) => {
          const color = tagColor[a.type];
          const bg = tagBg[a.type];
          return (
            <div key={i} style={s.alertRow(color, bg)}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>{a.title}</div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{a.sub}</div>
              </div>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: COLORS.muted }}>{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const views = { Dashboard: ViewDashboard, Modules: ViewModules, Phantom: ViewPhantom, Log: ViewLog, Alerts: ViewAlerts };
  const ActiveView = views[activeTab];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #080c10; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={s.root}>
        {/* Topbar */}
        <div style={s.topbar}>
          <div style={s.logo}>LUCYD</div>
          <div style={s.clockText}>{clock}</div>
        </div>

        {/* Content */}
        <div style={s.content}>
          <ActiveView />
        </div>

        {/* Bottom Nav */}
        <nav style={s.bottomNav}>
          {navTabs.map(tab => (
            <button key={tab} style={s.navBtn(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              <span style={{ fontSize: 14, marginBottom: 2 }}>{navIcons[tab]}</span>
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
