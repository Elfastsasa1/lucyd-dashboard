import { useState, useEffect, useRef, useCallback } from "react";

const CRYPTOCOMPARE_KEY = "6c0e84e47f5a9b3526650f3409788c4373e370ec37e27653e544e79bf3c76f67";
const TWELVEDATA_KEY = "373d4dee7c35444fbb9d3073a6444b95";

const C = {
  bg: "#07090d",
  surface: "#0b0f16",
  surface2: "#0f1520",
  border: "#151e2e",
  accent: "#00c8ff",
  accentDim: "rgba(0,200,255,0.1)",
  green: "#00e5a0",
  greenDim: "rgba(0,229,160,0.1)",
  yellow: "#f5c518",
  yellowDim: "rgba(245,197,24,0.1)",
  red: "#ff4455",
  redDim: "rgba(255,68,85,0.1)",
  muted: "#3d5470",
  text: "#b8cde0",
  bright: "#d8eaf8",
  mono: "'Space Mono', monospace",
  body: "'DM Sans', sans-serif",
};

const COINS = ["BTC", "ETH", "SOL", "OP", "ARB"];
const TABS = ["OVERVIEW", "CONTROL", "EVENTS", "TERMINAL", "STATUS"];
const TAB_ICONS = { OVERVIEW: "◈", CONTROL: "⚡", EVENTS: "◎", TERMINAL: "≡", STATUS: "◷" };

const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(2)}`;
const fmtPct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
const ts = () => new Date().toTimeString().slice(0, 8);

const typeColor = { info: C.accent, ok: C.green, warn: C.yellow, err: C.red };
const typeBg = { info: C.accentDim, ok: C.greenDim, warn: C.yellowDim, err: C.redDim };
const levelColor = { INFO: C.accent, OK: C.green, WARN: C.yellow, ERR: C.red };

const SIM_LOGS = [
  { level: "INFO", msg: "Intel_Raw: batch ingested — 312 entries" },
  { level: "OK", msg: "Auto-Move: 43 files sorted → /reports" },
  { level: "WARN", msg: "Token Hunter: OP spike detected +47%" },
  { level: "INFO", msg: "Auto-Tagging: 89 items classified" },
  { level: "OK", msg: "Memory: pattern saved → airdrop_cycle_3" },
  { level: "ERR", msg: "RPC timeout, fallback activated" },
  { level: "INFO", msg: "Phantom Core: 5 rules evaluated" },
  { level: "OK", msg: "Scan complete: 0 threats found" },
  { level: "WARN", msg: "VPS latency high: 420ms" },
  { level: "INFO", msg: "Agent heartbeat OK" },
];

const SIM_EVENTS = [
  { type: "warn", icon: "◈", title: "Token spike detected", sub: "OP +47% in 15m" },
  { type: "ok", icon: "✓", title: "Wallet activity", sub: "0x4f3a...c2d1 — 12 ETH moved" },
  { type: "info", icon: "↓", title: "New contract deployed", sub: "Uniswap V4 pool created" },
  { type: "warn", icon: "⚠", title: "Unusual volume", sub: "ARB/USDC 3x avg" },
  { type: "ok", icon: "◉", title: "Pattern matched", sub: "airdrop_cycle_4 → Memory saved" },
  { type: "err", icon: "✕", title: "RPC timeout", sub: "Fallback node activated" },
  { type: "info", icon: "▲", title: "Sentiment shift", sub: "Crypto Twitter: bullish +0.8" },
  { type: "ok", icon: "✓", title: "Seed scan done", sub: "0 active wallets found" },
];

const INIT_MODULES = [
  { id: 1, name: "Intel_Raw", icon: "↓", desc: "Social/news/chain scraper", active: false },
  { id: 2, name: "Auto-Move", icon: "↕", desc: "File organizer", active: false },
  { id: 3, name: "Auto-Tagging", icon: "⊞", desc: "Keyword classifier", active: false },
  { id: 4, name: "Phantom Core", icon: "◎", desc: "Decision engine", active: false },
  { id: 5, name: "Token Hunter", icon: "▲", desc: "Opportunity scanner", active: false },
  { id: 6, name: "Execution", icon: "⚡", desc: "Auto transactions", active: false },
  { id: 7, name: "Seed Scanner", icon: "◌", desc: "Wallet generator", active: false },
  { id: 8, name: "Memory", icon: "◉", desc: "Log & pattern store", active: false },
];

export default function LucydDashboard() {
  const [tab, setTab] = useState("OVERVIEW");
  const [agentState, setAgentState] = useState("STOPPED");
  const [prices, setPrices] = useState({});
  const [priceLoading, setPriceLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [modules, setModules] = useState(INIT_MODULES);
  const [clock, setClock] = useState(ts());
  const [cmdInput, setCmdInput] = useState("");
  const termRef = useRef(null);
  const logInt = useRef(null);
  const evInt = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setClock(ts()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [logs]);

  const addLog = useCallback((level, msg) => {
    setLogs(p => [...p, { level, msg, time: ts() }].slice(-100));
  }, []);

  const addEvent = useCallback((ev) => {
    setEvents(p => [{ ...ev, time: ts() }, ...p].slice(0, 40));
  }, []);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${COINS.join(",")}&tsyms=USD`,
        { headers: { authorization: `Apikey ${CRYPTOCOMPARE_KEY}` } }
      );
      const data = await res.json();
      const parsed = {};
      COINS.forEach(coin => {
        if (data.RAW?.[coin]?.USD) {
          parsed[coin] = {
            price: data.RAW[coin].USD.PRICE,
            change: data.RAW[coin].USD.CHANGEPCT24HOUR,
          };
        }
      });
      setPrices(parsed);
      setPriceLoading(false);
      addLog("OK", "CryptoCompare: prices refreshed");
    } catch (e) {
      addLog("ERR", `Price fetch failed: ${e.message}`);
      setPriceLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    fetchPrices();
    const t = setInterval(fetchPrices, 30000);
    return () => clearInterval(t);
  }, [fetchPrices]);

  useEffect(() => {
    if (agentState === "STOPPED") {
      clearInterval(logInt.current);
      clearInterval(evInt.current);
      return;
    }
    logInt.current = setInterval(() => {
      const e = SIM_LOGS[Math.floor(Math.random() * SIM_LOGS.length)];
      addLog(e.level, e.msg);
    }, 2500);
    evInt.current = setInterval(() => {
      const e = SIM_EVENTS[Math.floor(Math.random() * SIM_EVENTS.length)];
      addEvent(e);
    }, 5000);
    return () => { clearInterval(logInt.current); clearInterval(evInt.current); };
  }, [agentState, addLog, addEvent]);

  const startAgent = () => {
    if (agentState !== "STOPPED") return;
    setAgentState("RUNNING");
    setModules(p => p.map(m => ({ ...m, active: true })));
    addLog("OK", "Agent started — all modules online");
    addEvent({ type: "ok", icon: "✓", title: "Agent started", sub: "All modules activated" });
  };

  const stopAgent = () => {
    if (agentState === "STOPPED") return;
    setAgentState("STOPPED");
    setModules(p => p.map(m => ({ ...m, active: false })));
    addLog("WARN", "Agent stopped by user");
    addEvent({ type: "warn", icon: "⚠", title: "Agent stopped", sub: "All modules offline" });
  };

  const runScan = async () => {
    if (agentState === "STOPPED") return;
    setAgentState("SCANNING");
    addLog("INFO", "Scan initiated — querying TwelveData...");
    addEvent({ type: "info", icon: "◎", title: "Scan started", sub: "Token Hunter active" });
    try {
      const res = await fetch(
        `https://api.twelvedata.com/price?symbol=BTC/USD,ETH/USD&apikey=${TWELVEDATA_KEY}`
      );
      const data = await res.json();
      const btc = parseFloat(data["BTC/USD"]?.price || 0).toFixed(0);
      const eth = parseFloat(data["ETH/USD"]?.price || 0).toFixed(0);
      addLog("OK", `TwelveData: BTC=$${btc} ETH=$${eth}`);
      addEvent({ type: "ok", icon: "▲", title: "Scan complete", sub: `BTC $${btc} · ETH $${eth}` });
    } catch (e) {
      addLog("ERR", `TwelveData failed: ${e.message}`);
    }
    setTimeout(() => setAgentState("RUNNING"), 2000);
  };

  const triggerPhantom = () => {
    if (agentState === "STOPPED") return;
    setAgentState("THINKING");
    addLog("INFO", "Phantom Core: evaluating decision tree...");
    addEvent({ type: "info", icon: "◎", title: "Phantom triggered", sub: "Evaluating 5 rules..." });
    setTimeout(() => {
      const actions = ["ALERT + FLAG", "AUTO-TAG + MOVE", "LOG + STORE", "HALT EXEC"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      addLog("OK", `Phantom executed → ${action}`);
      addEvent({ type: "ok", icon: "✓", title: "Phantom decision", sub: `→ ${action}` });
      setAgentState("RUNNING");
    }, 3000);
  };

  const handleCmd = (e) => {
    if (e.key !== "Enter" || !cmdInput.trim()) return;
    const cmd = cmdInput.trim().toLowerCase();
    addLog("INFO", `> ${cmdInput}`);
    if (cmd === "start") startAgent();
    else if (cmd === "stop") stopAgent();
    else if (cmd === "scan") runScan();
    else if (cmd === "phantom") triggerPhantom();
    else if (cmd === "clear") setLogs([]);
    else if (cmd === "status") addLog("INFO", `State: ${agentState} | Modules: ${modules.filter(m=>m.active).length}/8 online`);
    else if (cmd === "help") {
      ["start · stop · scan · phantom · status · clear"].forEach(l => addLog("INFO", l));
    } else addLog("ERR", `Unknown: '${cmd}'. Type help`);
    setCmdInput("");
  };

  // ── CARD WRAPPER ──
  const Card = ({ title, right, children }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>{title}</span>
        {right}
      </div>
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );

  const Dot = ({ color }) => (
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: "lucydPulse 1.5s infinite" }} />
  );

  const Badge = ({ label, color, bg }) => (
    <span style={{ fontFamily: C.mono, fontSize: 9, padding: "2px 7px", borderRadius: 3, fontWeight: 700, color, background: bg }}>{label}</span>
  );

  const EventRow = ({ ev }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 8, background: typeBg[ev.type], border: `1px solid ${typeColor[ev.type]}25` }}>
      <span style={{ fontSize: 14, color: typeColor[ev.type], marginTop: 1 }}>{ev.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.bright, marginBottom: 2 }}>{ev.title}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{ev.sub}</div>
      </div>
      <span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, flexShrink: 0 }}>{ev.time}</span>
    </div>
  );

  // ── VIEWS ──
  const ViewOverview = () => (
    <>
      <Card title="Live Data Flow" right={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {priceLoading
            ? <Badge label="FETCHING" color={C.yellow} bg={C.yellowDim} />
            : <><Dot color={C.green} /><Badge label="LIVE · 30s" color={C.green} bg={C.greenDim} /></>
          }
          <button onClick={fetchPrices} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 4, padding: "2px 7px", fontFamily: C.mono, fontSize: 9, cursor: "pointer" }}>↻</button>
        </div>
      }>
        {priceLoading
          ? <div style={{ textAlign: "center", padding: "16px 0", color: C.muted, fontFamily: C.mono, fontSize: 11 }}>Connecting to CryptoCompare...</div>
          : COINS.map((coin, i) => {
            const d = prices[coin];
            const up = (d?.change ?? 0) >= 0;
            return (
              <div key={coin} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: i === COINS.length - 1 ? "none" : `1px solid ${C.border}` }}>
                <span style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 700, color: C.bright, width: 40 }}>{coin}</span>
                <span style={{ fontFamily: C.mono, fontSize: 13, color: C.text }}>{d ? fmt(d.price) : "—"}</span>
                <span style={{ fontFamily: C.mono, fontSize: 12, color: d ? (up ? C.green : C.red) : C.muted }}>{d ? fmtPct(d.change) : "—"}</span>
              </div>
            );
          })
        }
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[
          { label: "Data Scraped", val: "2,847", sub: "↑ 12%", color: C.accent },
          { label: "Events", val: events.length, sub: "Live feed", color: C.green },
          { label: "Rules Fired", val: "14", sub: "↑ 5 today", color: C.yellow },
          { label: "Agent", val: agentState, sub: agentState === "STOPPED" ? "Idle" : "Active", color: agentState === "STOPPED" ? C.red : C.green },
        ].map(({ label, val, sub, color }) => (
          <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", borderTop: `2px solid ${color}` }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: C.mono, fontSize: 18, fontWeight: 700, color: C.bright, marginBottom: 4 }}>{val}</div>
            <div style={{ fontSize: 11, color }}>{sub}</div>
          </div>
        ))}
      </div>

      <Card title="Recent Events" right={
        <button onClick={() => setTab("EVENTS")} style={{ background: "none", border: "none", color: C.accent, fontFamily: C.mono, fontSize: 9, cursor: "pointer" }}>ALL →</button>
      }>
        {events.length === 0
          ? <div style={{ color: C.muted, fontFamily: C.mono, fontSize: 11, textAlign: "center", padding: "12px 0" }}>Start agent to receive events</div>
          : events.slice(0, 3).map((ev, i) => <EventRow key={i} ev={ev} />)
        }
      </Card>
    </>
  );

  const ViewControl = () => (
    <>
      <Card title="Control Panel" right={
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {agentState !== "STOPPED" && <Dot color={C.green} />}
          <Badge label={agentState} color={agentState === "STOPPED" ? C.red : C.green} bg={agentState === "STOPPED" ? C.redDim : C.greenDim} />
        </div>
      }>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "START AGENT", icon: "▶", color: C.green, action: startAgent, disabled: agentState !== "STOPPED" },
            { label: "STOP AGENT", icon: "■", color: C.red, action: stopAgent, disabled: agentState === "STOPPED" },
            { label: "RUN SCAN", icon: "⟳", color: C.accent, action: runScan, disabled: agentState === "STOPPED" },
            { label: "PHANTOM", icon: "◎", color: C.yellow, action: triggerPhantom, disabled: agentState === "STOPPED" },
          ].map(({ label, icon, color, action, disabled }) => (
            <button key={label} onClick={action} disabled={disabled} style={{
              padding: "14px 10px", borderRadius: 8,
              border: `1px solid ${disabled ? C.border : color + "50"}`,
              background: disabled ? C.surface2 : color + "12",
              color: disabled ? C.muted : color,
              fontFamily: C.mono, fontSize: 10, letterSpacing: 1,
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              opacity: disabled ? 0.5 : 1, transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: "10px 12px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: 1 }}>LAST LOG</div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.text }}>
            {logs.length > 0 ? `[${logs[logs.length-1].level}] ${logs[logs.length-1].msg}` : "No actions yet"}
          </div>
        </div>
      </Card>

      <Card title="Module Control" right={
        <Badge label={`${modules.filter(m=>m.active).length}/8 ON`} color={C.accent} bg={C.accentDim} />
      }>
        {modules.map((m, i) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i === modules.length - 1 ? "none" : `1px solid ${C.border}` }}>
            <span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.bright }}>{m.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{m.desc}</div>
            </div>
            <div onClick={() => setModules(p => p.map(x => x.id === m.id ? { ...x, active: !x.active } : x))}
              style={{ width: 36, height: 20, borderRadius: 10, background: m.active ? C.accent : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", width: 14, height: 14, background: "#fff", borderRadius: "50%", top: 3, left: m.active ? 19 : 3, transition: "left 0.2s" }} />
            </div>
          </div>
        ))}
      </Card>
    </>
  );

  const ViewEvents = () => (
    <Card title="Event Panel" right={
      <Badge label={agentState !== "STOPPED" ? "● LIVE" : "○ IDLE"} color={agentState !== "STOPPED" ? C.green : C.muted} bg={agentState !== "STOPPED" ? C.greenDim : "transparent"} />
    }>
      {events.length === 0
        ? <div style={{ textAlign: "center", padding: "30px 0", color: C.muted, fontFamily: C.mono, fontSize: 11 }}>No events yet<br /><span style={{ fontSize: 10 }}>Start agent to receive events</span></div>
        : events.map((ev, i) => <EventRow key={i} ev={ev} />)
      }
    </Card>
  );

  const ViewTerminal = () => (
    <Card title="Log Terminal" right={
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setLogs([])} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 4, padding: "2px 7px", fontFamily: C.mono, fontSize: 9, cursor: "pointer" }}>CLR</button>
        <Badge label={`${logs.length} lines`} color={C.muted} bg="transparent" />
      </div>
    }>
      <div ref={termRef} style={{ background: "#050709", border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontFamily: C.mono, fontSize: 11, maxHeight: 300, overflowY: "auto" }}>
        {logs.length === 0
          ? <div style={{ color: C.muted }}>// No logs. Start agent or type a command.</div>
          : logs.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, lineHeight: 1.5 }}>
              <span style={{ color: C.muted, flexShrink: 0, fontSize: 10 }}>{l.time}</span>
              <span style={{ color: levelColor[l.level], flexShrink: 0, width: 32, fontSize: 10 }}>{l.level}</span>
              <span style={{ color: C.text, fontSize: 11 }}>{l.msg}</span>
            </div>
          ))
        }
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
          <span style={{ color: C.accent, fontSize: 11 }}>$</span>
          <input value={cmdInput} onChange={e => setCmdInput(e.target.value)} onKeyDown={handleCmd}
            placeholder="type command... (help)"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: C.mono, fontSize: 11, color: C.bright }} />
        </div>
      </div>
      <div style={{ marginTop: 8, fontFamily: C.mono, fontSize: 9, color: C.muted }}>start · stop · scan · phantom · status · clear · help</div>
    </Card>
  );

  const ViewStatus = () => (
    <>
      <Card title="System Status" right={<span style={{ fontFamily: C.mono, fontSize: 9, color: C.muted }}>{clock}</span>}>
        {[
          { label: "Agent Core", state: agentState, icon: "◈" },
          { label: "Intel_Raw", state: modules[0].active ? "ACTIVE" : "IDLE", icon: "↓" },
          { label: "Token Hunter", state: modules[4].active ? (agentState === "SCANNING" ? "SCANNING" : "ACTIVE") : "IDLE", icon: "▲" },
          { label: "Phantom Core", state: modules[3].active ? (agentState === "THINKING" ? "THINKING" : "ACTIVE") : "IDLE", icon: "◎" },
          { label: "Execution", state: modules[5].active ? "STANDBY" : "OFF", icon: "⚡" },
          { label: "HP (Control)", state: "ONLINE", icon: "◌" },
          { label: "VPS (Engine)", state: agentState !== "STOPPED" ? "ONLINE" : "STANDBY", icon: "▣" },
        ].map(({ label, state, icon }, i, arr) => {
          const active = ["ACTIVE","ONLINE","SCANNING","THINKING","RUNNING","STANDBY"].includes(state);
          const color = state === "SCANNING" || state === "THINKING" ? C.yellow : active ? C.green : C.red;
          const bg = state === "SCANNING" || state === "THINKING" ? C.yellowDim : active ? C.greenDim : C.redDim;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15, width: 22, textAlign: "center" }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.bright }}>{label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {active && <Dot color={color} />}
                <Badge label={state} color={color} bg={bg} />
              </div>
            </div>
          );
        })}
      </Card>

      <Card title="API Health">
        {[
          { name: "CryptoCompare", status: priceLoading ? "FETCHING" : "LIVE", url: "min-api.cryptocompare.com" },
          { name: "TwelveData", status: "READY", url: "api.twelvedata.com" },
          { name: "Backend Agent", status: "SIMULATED", url: "pending VPS endpoint" },
        ].map(({ name, status, url }, i, arr) => {
          const color = status === "LIVE" ? C.green : status === "FETCHING" ? C.yellow : C.accent;
          const bg = status === "LIVE" ? C.greenDim : status === "FETCHING" ? C.yellowDim : C.accentDim;
          return (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 13, color: C.bright, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{url}</div>
              </div>
              <Badge label={status} color={color} bg={bg} />
            </div>
          );
        })}
      </Card>
    </>
  );

  const VIEWS = { OVERVIEW: ViewOverview, CONTROL: ViewControl, EVENTS: ViewEvents, TERMINAL: ViewTerminal, STATUS: ViewStatus };
  const ActiveView = VIEWS[tab];

  const agentColor = agentState === "STOPPED" ? C.red : agentState === "THINKING" || agentState === "SCANNING" ? C.yellow : C.green;
  const agentBg = agentState === "STOPPED" ? C.redDim : agentState === "THINKING" || agentState === "SCANNING" ? C.yellowDim : C.greenDim;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #07090d; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #151e2e; border-radius: 2px; }
        input::placeholder { color: #3d5470; }
        @keyframes lucydPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: C.body, fontSize: 14, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto",
        backgroundImage: `linear-gradient(rgba(0,200,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,255,0.015) 1px,transparent 1px)`,
        backgroundSize: "32px 32px" }}>

        {/* Topbar */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div>
            <div style={{ fontFamily: C.mono, fontWeight: 700, fontSize: 17, color: C.accent, letterSpacing: 4 }}>LUCYD</div>
            <div style={{ fontFamily: C.mono, fontSize: 8, color: C.muted, letterSpacing: 2, marginTop: 1 }}>AUTONOMOUS INTELLIGENCE</div>
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: 1, padding: "4px 10px", borderRadius: 4, fontWeight: 700, background: agentBg, color: agentColor, border: `1px solid ${agentColor}40`, display: "flex", alignItems: "center", gap: 6 }}>
            {agentState !== "STOPPED" && <Dot color={agentColor} />}
            {agentState}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "14px 14px 80px", overflowY: "auto" }}>
          <ActiveView />
        </div>

        {/* Bottom Nav */}
        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "9px 4px 7px", cursor: "pointer", color: tab === t ? C.accent : C.muted, fontSize: 9, fontFamily: C.mono, letterSpacing: 1, background: "none", border: "none", borderTop: tab === t ? `2px solid ${C.accent}` : "2px solid transparent", transition: "all 0.15s" }}>
              <span style={{ fontSize: 13, marginBottom: 2 }}>{TAB_ICONS[t]}</span>
              {t}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
