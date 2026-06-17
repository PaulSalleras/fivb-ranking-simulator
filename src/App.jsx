import { useState, useRef, useEffect } from "react";

const C1 = 0.9, C2 = 0.3, C3 = -0.1, C4 = -0.6, C5 = -1.1;

function normalCDF(x) {
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return 0.5 * (1 + sign * y);
}

function calcProbabilities(wrs1, wrs2) {
  const d = 8 * (wrs1 - wrs2) / 1000;
  return [
    normalCDF(C1+d),
    normalCDF(C2+d)-normalCDF(C1+d),
    normalCDF(C3+d)-normalCDF(C2+d),
    normalCDF(C4+d)-normalCDF(C3+d),
    normalCDF(C5+d)-normalCDF(C4+d),
    1-normalCDF(C5+d),
  ];
}

const OUTCOMES = [
  { label:"3-0", ssv: 2,   win:true  },
  { label:"3-1", ssv: 1.5, win:true  },
  { label:"3-2", ssv: 1,   win:true  },
  { label:"2-3", ssv:-1,   win:false },
  { label:"1-3", ssv:-1.5, win:false },
  { label:"0-3", ssv:-2,   win:false },
];

const MWF_OPTIONS = [
  { label:"Olympic Games / World Cup",       value:50 },
  { label:"Nations League / Continental",    value:40 },
  { label:"Annual Continental Events",       value:30 },
  { label:"Zonal / Recognized Events",       value:20 },
];

const C = {
  bg:"#080c14", surface:"#0d1320", card:"#111826", border:"#1c2b3a",
  accent:"#3b82f6", win:"#22c55e", loss:"#ef4444",
  dim:"#3a5068", text:"#c8d8e8", muted:"#607a90", gold:"#f59e0b",
};

function NumInput({ label, value, onChange, prefix, allowDecimal }) {
  const [raw, setRaw] = useState(String(value));

  useEffect(() => {
    if (parseFloat(raw) !== value && raw !== "" && raw !== "-") {
      setRaw(String(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    const pattern = allowDecimal ? /^-?\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(v)) return;
    setRaw(v);
    const parsed = parseFloat(v);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) { setRaw(String(value)); return; }
    setRaw(String(parsed));
    onChange(parsed);
  };

  return (
    <div style={{ flex:1 }}>
      <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"2px", marginBottom:"5px" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
        {prefix && <span style={{ fontSize:"14px", color:C.muted }}>{prefix}</span>}
        <input
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            width:"100%", background:"#090e18",
            border:`1px solid ${C.border}`, borderRadius:"6px",
            color:C.text, padding:"8px 10px", fontSize:"20px",
            fontFamily:"'IBM Plex Mono',monospace", fontWeight:600,
            outline:"none", textAlign:"center",
          }}
        />
      </div>
    </div>
  );
}

function TeamCard({ label, color, team, onChange }) {
  return (
    <div style={{
      background:C.card, border:`1px solid ${C.border}`,
      borderRadius:"10px", padding:"16px", flex:1,
    }}>
      <div style={{ fontSize:"9px", color:color, letterSpacing:"2px", marginBottom:"14px" }}>
        {label}
      </div>
      <div style={{ marginBottom:"12px" }}>
        <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"2px", marginBottom:"5px" }}>COUNTRY / TEAM</div>
        <input
          type="text"
          value={team.name}
          onChange={e => onChange({ ...team, name: e.target.value })}
          placeholder="Spain..."
          style={{
            width:"100%", background:"#090e18",
            border:`1px solid ${C.border}`, borderRadius:"6px",
            color:C.text, padding:"8px 12px", fontSize:"15px",
            fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600,
            outline:"none",
          }}
        />
      </div>
      <div style={{ display:"flex", gap:"10px" }}>
        <NumInput label="RANK" prefix="#" value={team.rank} onChange={v => onChange({ ...team, rank: v })} />
        <NumInput label="WR SCORE" value={team.score} onChange={v => onChange({ ...team, score: v })} allowDecimal />
      </div>
      <div style={{
        marginTop:"12px", display:"flex", alignItems:"center",
        gap:"10px", padding:"8px 10px",
        background:"#090e18", border:`1px solid ${color}22`, borderRadius:"6px",
      }}>
        <div style={{ fontSize:"22px", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, color }}>
          #{team.rank}
        </div>
        <div style={{ fontSize:"11px", color:C.muted }}>world ranking</div>
        <div style={{ marginLeft:"auto", fontSize:"13px", color:C.text, fontWeight:600 }}>
          {team.score} pts
        </div>
      </div>
    </div>
  );
}

function ResultRow({ outcome, wrPoints }) {
  const sign = wrPoints >= 0 ? "+" : "";
  const col  = wrPoints >= 0 ? C.win : C.loss;

  return (
    <div style={{
      background: C.card,
      border:`1px solid ${C.border}`,
      borderRadius:"8px", padding:"12px 16px",
      display:"flex", alignItems:"center", gap:"12px",
    }}>
      {/* Score */}
      <div style={{
        fontSize:"20px", fontWeight:700, minWidth:"42px",
        color: outcome.win ? "#60a5fa" : "#f87171",
        fontFamily:"'IBM Plex Sans',sans-serif",
      }}>
        {outcome.label}
      </div>

      {/* WIN / LOSS badge */}
      <span style={{
        fontSize:"9px", letterSpacing:"1.5px", padding:"2px 7px", borderRadius:"3px",
        background: outcome.win ? "#22c55e18" : "#ef444418",
        color: outcome.win ? C.win : C.loss,
        border:`1px solid ${outcome.win ? "#22c55e33" : "#ef444433"}`,
      }}>
        {outcome.win ? "WIN" : "LOSS"}
      </span>

      <div style={{ flex:1 }} />

      {/* Points */}
      <div style={{ textAlign:"right" }}>
        <div style={{ fontSize:"9px", color:C.dim, marginBottom:"2px" }}>WR POINTS</div>
        <div style={{
          fontSize:"24px", fontWeight:700, color:col,
          fontFamily:"'IBM Plex Sans',sans-serif",
          lineHeight:1,
        }}>
          {sign}{wrPoints.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [myTeam, setMyTeam] = useState({ name:"Spain",      rank:29, score:140 });
  const [rival,  setRival]  = useState({ name:"Azerbaijan", rank:47, score:79  });
  const [mwf,    setMwf]    = useState(40);

  const probs = calcProbabilities(myTeam.score, rival.score);
  const emr   = OUTCOMES.reduce((s,o,i) => s + probs[i]*o.ssv, 0);
  const delta = 8*(myTeam.score - rival.score)/1000;
  const maxP  = Math.max(...probs);

  const results = OUTCOMES.map((o,i) => ({
    outcome:  o,
    prob:     probs[i],
    wrPoints: (o.ssv - emr) * mwf / 8,
    maxProb:  maxP,
  }));

  const bestWin   = Math.max(...results.filter(r=>r.outcome.win ).map(r=>r.wrPoints));
  const worstLoss = Math.min(...results.filter(r=>!r.outcome.win).map(r=>r.wrPoints));
  const isFav     = myTeam.score > rival.score;

  return (
    <div style={{
      background:C.bg, minHeight:"100vh",
      fontFamily:"'IBM Plex Mono','Courier New',monospace",
      color:C.text, padding:"20px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color:#3a5068; }
      `}</style>

      {/* Title */}
      <div style={{ textAlign:"center", marginBottom:"24px" }}>
        <div style={{ fontSize:"9px", color:C.accent, letterSpacing:"4px", marginBottom:"6px" }}>
          FIVB · WORLD RANKING SIMULATOR
        </div>
        <div style={{ fontSize:"22px", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:700, color:"#e8f0f8" }}>
          Calculate how many points you can win or lose · by Paul Salleras
        </div>
        <div style={{ fontSize:"11px", color:C.muted, marginTop:"4px" }}>
          Enter team data from volleyballworld.com
        </div>
      </div>

      {/* Team cards */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"14px", flexWrap:"wrap" }}>
        <TeamCard label="▶ YOUR TEAM" color={C.accent} team={myTeam} onChange={setMyTeam} />
        <TeamCard label="◀ OPPONENT"  color={C.gold}   team={rival}  onChange={setRival}  />
      </div>

      {/* Tournament */}
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:"8px", padding:"12px 14px", marginBottom:"14px",
        display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap",
      }}>
        <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"2px", whiteSpace:"nowrap" }}>COMPETITION</div>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {MWF_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setMwf(o.value)} style={{
              padding:"5px 10px", fontSize:"10px", borderRadius:"4px", cursor:"pointer",
              border: mwf===o.value ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
              background: mwf===o.value ? `${C.accent}22` : "transparent",
              color: mwf===o.value ? C.accent : C.muted,
            }}>
              {o.label} <span style={{ opacity:0.5 }}>×{o.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background:C.card, border:`1px solid ${C.border}`,
        borderRadius:"8px", padding:"12px 16px", marginBottom:"14px",
        display:"flex", gap:"20px", flexWrap:"wrap", alignItems:"center",
      }}>
        <div>
          <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"1.5px" }}>STATUS</div>
          <div style={{ fontSize:"13px", fontFamily:"'IBM Plex Sans',sans-serif", fontWeight:600,
            color: isFav ? C.win : C.loss }}>
            {myTeam.name || "Your team"} is {isFav ? "FAVOURITE" : "UNDERDOG"}
          </div>
        </div>
        <div>
          <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"1.5px" }}>Δ STRENGTH GAP</div>
          <div style={{ fontSize:"17px", fontWeight:700 }}>{delta.toFixed(3)}</div>
        </div>
        <div>
          <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"1.5px" }}>EXPECTED RESULT</div>
          <div style={{ fontSize:"17px", fontWeight:700, color: emr>0 ? C.accent : C.loss }}>
            {emr>0?"+":""}{emr.toFixed(3)}
          </div>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <div style={{ fontSize:"9px", color:C.dim }}>BEST CASE</div>
          <div style={{ fontSize:"18px", fontWeight:700, color:C.win }}>+{bestWin.toFixed(2)}</div>
        </div>
        <div>
          <div style={{ fontSize:"9px", color:C.dim }}>WORST CASE</div>
          <div style={{ fontSize:"18px", fontWeight:700, color:C.loss }}>{worstLoss.toFixed(2)}</div>
        </div>
      </div>

      {/* Results */}
      <div style={{ fontSize:"9px", color:C.dim, letterSpacing:"2px", marginBottom:"8px" }}>
        ALL SCENARIOS · POINTS FOR {(myTeam.name || "YOUR TEAM").toUpperCase()}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {results.map((r,i) => <ResultRow key={i} {...r} />)}
      </div>

      {/* Note */}
      <div style={{
        marginTop:"14px", padding:"12px 14px",
        background:"#080e18", border:`1px solid ${C.border}`,
        borderRadius:"8px", fontSize:"10px", color:C.muted, lineHeight:"1.7",
      }}>
        <span style={{ color:C.accent }}>↗ KEY: </span>
        {isFav
          ? "As the favourite, winning as expected earns few points. The system rewards exceeding expectations — a tight 3-2 can be worth more than a routine 3-0 against a much weaker side."
          : "As the underdog, any win earns significant points. The system rewards upsets — winning 3-0 would be the maximum possible gain."}
        {" "}Points won by one team are lost by the other (zero-sum).
      </div>

      <div style={{ marginTop:"12px", fontSize:"9px", color:"#1e2d3a", textAlign:"center" }}>
        Official FIVB formula · C1–C5 cut-points calibrated from historical match data
      </div>
    </div>
  );
}
