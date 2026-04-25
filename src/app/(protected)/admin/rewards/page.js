"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ArrowRight, Loader2, Gift } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────── */
const CONFIG = {
  storageKey   : "lucira_profile_data",
  apiBase      : "/api/proxy/earn-rewards",
  totalSteps   : 4,
  pointsPerStep: 100,
};

const STEP_NAMES = { 1: "About You", 2: "Gifting Behaviour", 3: "Your Wishlist", 4: "Your Style" };

/* theme colours (mirrors the Shopify liquid CSS vars) */
const T = {
  blush : "#5A413F",
  dark  : "#3d2a1e",
  ivory : "#f4f0f0",
  border: "#e5ddd4",
  muted : "#9a8f85",
};

/* ─────────────────────────────────────────────────────────
   TINY UTILS / HELPERS
───────────────────────────────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
function extractNumericId(gid = "") {
  const p = String(gid).split("/");
  return p[p.length - 1];
}

/* ─────────────────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────────────────── */
function Chip({ label, selected, onToggle }) {
  return (
    <button
      type="button"
      className="chip-button"
      onClick={onToggle}
      style={{
        padding       : "10px 18px",
        borderRadius  : "8px",
        border        : `1px solid ${selected ? T.blush : "#ffeaea"}`,
        background    : selected ? T.blush : "#fff0f0",
        color         : selected ? "#fff" : "#1a1a1a",
        fontSize      : "13px",
        cursor        : "pointer",
        transition    : "all .2s",
        minHeight     : "44px",
        fontFamily    : "inherit",
        fontWeight    : "500",
      }}
    >
      {label}
    </button>
  );
}


function RadioOpt({ value, checked, label, onChange }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", fontSize:"13px", color:"#1a1a1a" }}>
      <div
        onClick={() => onChange(value)}
        style={{
          width:"16px", height:"16px", borderRadius:"50%",
          border:`1.5px solid ${checked ? T.blush : T.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, cursor:"pointer",
        }}
      >
        {checked && <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: T.blush }} />}
      </div>
      {label}
    </label>
  );
}

function CheckOpt({ label, checked, onChange }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", fontSize:"13px", color:"#1a1a1a" }}>
      <div
        onClick={onChange}
        style={{
          width:"16px", height:"16px", borderRadius:"3px",
          border:`1.5px solid ${checked ? T.blush : T.border}`,
          background: checked ? T.blush : "#fff",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, cursor:"pointer",
        }}
      >
        {checked && <Check size={9} stroke="#fff" strokeWidth={3} />}
      </div>
      {label}
    </label>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width:"40px", height:"22px", borderRadius:"22px",
        background: checked ? T.blush : T.border,
        border:"none", cursor:"pointer", position:"relative", transition:"background .3s",
        flexShrink:0,
      }}
    >
      <span style={{
        position:"absolute", top:"3px", left: checked ? "19px" : "3px",
        width:"16px", height:"16px", borderRadius:"50%", background:"#fff",
        boxShadow:"0 1px 4px rgba(0,0,0,.2)", transition:"left .3s",
      }} />
    </button>
  );
}

function FieldLabel({ children }) {
  return (
    <p style={{
      fontSize:"11px", fontWeight:600, letterSpacing:"1.5px",
      textTransform:"uppercase", color:"#000", marginBottom:"10px", marginTop:"18px",
    }}>
      {children}
    </p>
  );
}

function DateInput({ value, onChange }) {
  return (
    <input
      type="date"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{
        width:"100%", border:`1px solid ${T.ivory}`, borderRadius:"8px",
        padding:"12px", fontSize:"13px", color:"#1a1a1a", background: T.ivory,
        outline:"none", boxSizing:"border-box", fontFamily:"inherit",
      }}
      onFocus={e => { e.target.style.borderColor = T.blush; e.target.style.background = "#fff"; }}
      onBlur={e => { e.target.style.borderColor = T.ivory; e.target.style.background = T.ivory; }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   PROGRESS RING
───────────────────────────────────────────────────────── */
function ProgressRing({ pct }) {
  const R = 42, C = 2 * Math.PI * R;
  return (
    <div style={{ position:"relative", width:"96px", height:"96px", margin:"0 auto 14px" }}>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ display:"block", transform:"rotate(-90deg)" }}>
        <circle cx="48" cy="48" r={R} fill="none" stroke="#f2ede6" strokeWidth="5" />
        <circle
          cx="48" cy="48" r={R} fill="none" stroke={T.blush} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C - (pct / 100) * C}
          style={{ transition:"stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", gap:"2px" }}>
        <span style={{ fontSize:"22px", fontWeight:600, color:"#1c1410", lineHeight:1 }}>{Math.round(pct)}</span>
        <span style={{ fontSize:"11px", color: T.muted, marginTop:"4px" }}>%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MILESTONE BAR
───────────────────────────────────────────────────────── */
function MilestoneBar({ completedSteps, profileComplete }) {
  const milestones = [
    { id:0, label:"Start" },
    { id:1, label:"+100 pts" },
    { id:2, label:"+200 pts" },
    { id:3, label:"+300 pts" },
    { id:4, label:"+400 pts" },
  ];
  const pct = profileComplete ? 100 : (completedSteps.length / CONFIG.totalSteps) * 100;

  return (
    <div style={{ position:"relative", marginBottom:"8px" }}>
      {/* bg track */}
      <div style={{ position:"absolute", top:"28px", left:0, right:0, height:"10px", background:"#fff", borderRadius:"3rem" }} />
      {/* fill */}
      <div style={{
        position:"absolute", top:"28px", left:0, height:"10px",
        background: T.blush, borderRadius:"3rem",
        width:`${pct}%`, transition:"width .8s cubic-bezier(.4,0,.2,1)",
      }} />
      {/* dots + labels */}
      <div style={{ display:"flex", justifyContent:"space-between", position:"relative", zIndex:2 }}>
        {milestones.map(m => {
          const done    = profileComplete || m.id <= completedSteps.length;
          const current = !profileComplete && m.id === completedSteps.length;
          return (
            <div key={m.id} style={{ display:"flex", flexDirection:"column-reverse", alignItems: m.id === 0 ? "flex-start" : m.id === 4 ? "flex-end" : "center", gap:"8px", flex:1, position:"relative" }}>
              <div style={{
                width:"22px", height:"22px", borderRadius:"50%",
                border:`2px solid ${done ? T.blush : current ? T.blush : T.border}`,
                background: done ? T.blush : "#fff",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: current ? `0 0 0 3px rgba(183,111,121,.15)` : "none",
                flexShrink:0,
              }}>
                {done
                  ? <Check size={9} stroke="#fff" strokeWidth={3} />
                  : <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: current ? T.blush : T.border }} />
                }
              </div>
              <span style={{
                fontSize:"9px", letterSpacing:"1px", textTransform:"uppercase",
                fontWeight: done || current ? 600 : 400,
                color: done || current ? "#1c1410" : T.muted,
                whiteSpace:"nowrap",
              }}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP PANELS
───────────────────────────────────────────────────────── */
const GIFT_FREQ  = ["Frequently", "Occasionally", "Rarely"];
const GIFT_STYLE = ["I plan in advance", "I need Recommendations", "I stay close to the date"];
const GIFT_RECIP = ["Partner", "Parents", "Siblings", "Friends", "Extended Family"];
const JEW_TYPES  = ["Rings", "Necklaces", "Bracelets", "Earrings", "Brooches"];
const METALS     = ["Yellow Gold", "White Gold", "Rose Gold", "Platinum"];
const BUDGETS    = ["Under ₹10K", "₹10K – ₹50K", "₹50K – ₹1L", "₹1L+"];
const STYLES     = ["Classic", "Contemporary", "Vintage", "Minimalist", "Statement"];
const OCCASIONS  = ["Weddings & Engagements", "Festivals & Special Occasions", "Everyday Wear", "Corporate & Formal Events"];

function toggle(arr = [], val, single = false) {
  if (single) return [val];
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function ChipGroup({ options, selected, onChange, single = false }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"4px" }}>
      {options.map(o => (
        <Chip key={o} label={o} selected={(selected||[]).includes(o)}
          onToggle={() => onChange(toggle(selected, o, single))} />
      ))}
    </div>
  );
}

function CheckGroup({ options, selected, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"4px" }}>
      {options.map(o => (
        <CheckOpt key={o} label={o} checked={(selected||[]).includes(o)}
          onChange={() => onChange(toggle(selected, o))} />
      ))}
    </div>
  );
}

function Step1({ data, onChange }) {
  return (
    <>
      <FieldLabel>Gender</FieldLabel>
      <div style={{ display:"flex", gap:"18px", flexWrap:"wrap", marginBottom:"4px" }}>
        {["male","female","other"].map(v => (
          <RadioOpt key={v} value={v} checked={data.gender===v} label={v[0].toUpperCase()+v.slice(1)}
            onChange={val => onChange("gender", val)} />
        ))}
      </div>

      <FieldLabel>Date of Birth</FieldLabel>
      <DateInput value={data.date_of_birth} onChange={v => onChange("date_of_birth", v)} />

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderTop:`1px solid ${T.ivory}`, borderBottom:`1px solid ${T.ivory}`, margin:"14px 0" }}>
        <span style={{ fontSize:"13px", color:"#1c1410", fontWeight:500 }}>Are you Married?</span>
        <Toggle checked={!!data.is_married} onChange={v => onChange("is_married", v)} />
      </div>

      {data.is_married && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
          <div>
            <p style={{ fontSize:"9.5px", letterSpacing:"1.5px", textTransform:"uppercase", color:T.muted, marginBottom:"8px", fontWeight:500 }}>Date of Anniversary</p>
            <DateInput value={data.anniversary_date} onChange={v => onChange("anniversary_date", v)} />
          </div>
          <div>
            <p style={{ fontSize:"9.5px", letterSpacing:"1.5px", textTransform:"uppercase", color:T.muted, marginBottom:"8px", fontWeight:500 }}>Spouse Date of Birth</p>
            <DateInput value={data.spouse_dob} onChange={v => onChange("spouse_dob", v)} />
          </div>
        </div>
      )}
    </>
  );
}

function Step2({ data, onChange }) {
  return (
    <>
      <FieldLabel>How often do you buy Jewelry as a Gift?</FieldLabel>
      <ChipGroup options={GIFT_FREQ} selected={data.gifting_frequency} single
        onChange={v => onChange("gifting_frequency", v)} />

      <FieldLabel>What kind of gifting best describes you?</FieldLabel>
      <CheckGroup options={GIFT_STYLE} selected={data.gifting_style}
        onChange={v => onChange("gifting_style", v)} />

      <FieldLabel>Who do you usually gift jewelry to?</FieldLabel>
      <ChipGroup options={GIFT_RECIP} selected={data.gift_recipients}
        onChange={v => onChange("gift_recipients", v)} />
    </>
  );
}

function Step3({ data, onChange }) {
  return (
    <>
      <FieldLabel>Which jewelry types interest you?</FieldLabel>
      <ChipGroup options={JEW_TYPES} selected={data.jewelry_types}
        onChange={v => onChange("jewelry_types", v)} />

      <FieldLabel>Preferred metal type?</FieldLabel>
      <ChipGroup options={METALS} selected={data.metal_type} single
        onChange={v => onChange("metal_type", v)} />

      <FieldLabel>Your usual budget range?</FieldLabel>
      <ChipGroup options={BUDGETS} selected={data.budget_range} single
        onChange={v => onChange("budget_range", v)} />
    </>
  );
}

function Step4({ data, onChange }) {
  return (
    <>
      <FieldLabel>How would you describe your style?</FieldLabel>
      <ChipGroup options={STYLES} selected={data.style_preference}
        onChange={v => onChange("style_preference", v)} />

      <FieldLabel>Occasions you shop for?</FieldLabel>
      <CheckGroup options={OCCASIONS} selected={data.shopping_occasions}
        onChange={v => onChange("shopping_occasions", v)} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────── */
function validate(step, d) {
  const e = [];
  if (step === 1) {
    if (!d.gender)          e.push("Please select your gender.");
    if (!d.date_of_birth)   e.push("Please enter your date of birth.");
    if (d.is_married) {
      if (!d.anniversary_date) e.push("Please enter your anniversary date.");
      if (!d.spouse_dob)       e.push("Please enter spouse's date of birth.");
    }
  }
  if (step === 2) {
    if (!(d.gifting_frequency||[]).length) e.push("Please select how often you gift jewelry.");
    if (!(d.gifting_style||[]).length)     e.push("Please select at least one gifting style.");
    if (!(d.gift_recipients||[]).length)   e.push("Please select who you gift jewelry to.");
  }
  if (step === 3) {
    if (!(d.jewelry_types||[]).length) e.push("Please select at least one jewelry type.");
    if (!(d.metal_type||[]).length)    e.push("Please select a preferred metal type.");
    if (!(d.budget_range||[]).length)  e.push("Please select your budget range.");
  }
  if (step === 4) {
    if (!(d.style_preference||[]).length)   e.push("Please select a style that describes you.");
    if (!(d.shopping_occasions||[]).length) e.push("Please select at least one shopping occasion.");
  }
  return e;
}

/* ─────────────────────────────────────────────────────────
   DEFAULT STATE
───────────────────────────────────────────────────────── */
const blank = {
  step_1: { gender:"", date_of_birth:"", is_married:false, anniversary_date:"", spouse_dob:"" },
  step_2: { gifting_frequency:[], gifting_style:[], gift_recipients:[] },
  step_3: { jewelry_types:[], metal_type:[], budget_range:[] },
  step_4: { style_preference:[], shopping_occasions:[] },
};

const initial = {
  currentStep:1, formData: blank,
  rewardedSteps:[], completedSteps:[], profileComplete:false,
};

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function EarnRewardsPage() {
  const [state,       setState]       = useState(initial);
  const [nectorCoins, setNectorCoins] = useState(null);   // fetched via proxy
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors,      setErrors]      = useState([]);
  const [saveStatus,  setSaveStatus]  = useState(""); // "" | "saving" | "saved"
  const [completing,  setCompleting]  = useState(false);

  const API = useRef(new Set());

  /* ── Init ── */
  useEffect(() => {
    async function init() {
      loadLocal();
      await fetchServerProgress();
      setPageLoading(false);
      fetchCoins();
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Nector coins (via Next.js proxy — no CORS) ── */
  async function fetchCoins() {
    setCoinsLoading(true);
    try {
      const r    = await fetch("/api/customer/nector-coins", { cache:"no-store" });
      const data = await r.json();
      if (data?.status !== false) setNectorCoins(data.coins_balance ?? 0);
    } catch (e) {
      console.warn("Nector proxy error:", e);
    } finally {
      setCoinsLoading(false);
    }
  }

  /* ── Local storage ── */
  function loadLocal() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return;
      const p = JSON.parse(raw);
      setState(prev => ({
        ...prev, ...p,
        formData      : { ...blank, ...(p.formData || {}) },
        rewardedSteps : p.rewardedSteps  || [],
        completedSteps: p.completedSteps || [],
      }));
    } catch (_) {}
  }

  function saveLocal(s) {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(s)); } catch (_) {}
  }

  /* ── Server progress ── */
  async function fetchServerProgress() {
    try {
      const profileRes = await fetch("/api/customer/profile");
      if (!profileRes.ok) return;
      const profileData = await profileRes.json();
      const simpleId    = extractNumericId(profileData?.customer?.id || "");
      if (!simpleId) return;

      const r = await fetch(
        `${CONFIG.apiBase}/get-progress.php?customer_id=shopify-${simpleId}&t=${Date.now()}`
      );
      const d = await r.json();
      if (!d.success) return;

      const rewardedSteps  = (d.rewarded_steps  || []).map(Number);
      const completedSteps = (d.completed_steps || []).map(Number);
      const profileComplete = !!d.profile_complete;
      let formData = { ...blank };
      if (d.form_data && typeof d.form_data === "object") {
        Object.entries(d.form_data).forEach(([k,v]) => { if (v && typeof v === "object") formData[k] = v; });
      }
      setState(prev => { const ns = { ...prev, rewardedSteps, completedSteps, profileComplete, formData }; saveLocal(ns); return ns; });
    } catch (e) { console.warn("Server progress:", e); }
  }

  /* ── API save (with coin reward on first time) ── */
  async function apiSave(step, stepData, autoSave = false) {
    try {
      const profileRes = await fetch("/api/customer/profile");
      if (!profileRes.ok) return;
      const profileData = await profileRes.json();
      const simpleId    = extractNumericId(profileData?.customer?.id || "");
      if (!simpleId) return;

      const customerId = `shopify-${simpleId}`;
      setState(cur => {
        const all = {
          step_1: cur.formData.step_1 || {},
          step_2: cur.formData.step_2 || {},
          step_3: cur.formData.step_3 || {},
          step_4: cur.formData.step_4 || {},
          [`step_${step}`]: stepData,
        };
        fetch(`${CONFIG.apiBase}/save-step.php`, {
          method:"POST", headers:{"Content-Type":"application/json"}, keepalive:true,
          body: JSON.stringify({ customer_id:customerId, step, form_data:stepData, all_form_data:all, auto_save:autoSave }),
        }).then(r => r.json()).then(d => {
          if (!autoSave && d.coins_awarded) fetchCoins();
        }).catch(() => {});
        return cur;
      });
    } catch (_) {}
  }

  /* ── Debounced auto-save ── */
  const debouncedSave = useCallback(
    debounce((step, stepData) => {
      setSaveStatus("saving");
      apiSave(step, stepData, true)
        .then(() => { setSaveStatus("saved"); setTimeout(() => setSaveStatus(""), 2000); })
        .catch(() => setSaveStatus(""));
    }, 800),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  /* ── Field change ── */
  function handleChange(stepKey, field, value) {
    setState(prev => {
      const ns = { ...prev, formData: { ...prev.formData, [stepKey]: { ...prev.formData[stepKey], [field]:value } } };
      saveLocal(ns);
      debouncedSave(prev.currentStep, ns.formData[stepKey]);
      return ns;
    });
    setErrors([]);
  }

  /* ── Navigation ── */
  function goStep(next) {
    if (next < state.currentStep) { setErrors([]); setState(p => ({ ...p, currentStep:next })); return; }
    const key  = `step_${state.currentStep}`;
    const data = state.formData[key] || {};
    const errs = validate(state.currentStep, data);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);

    setState(prev => {
      const n   = prev.currentStep;
      const isN = !prev.rewardedSteps.includes(n);
      const ns  = {
        ...prev, currentStep:next,
        rewardedSteps : isN ? [...prev.rewardedSteps, n]  : prev.rewardedSteps,
        completedSteps: prev.completedSteps.includes(n) ? prev.completedSteps : [...prev.completedSteps, n],
      };
      saveLocal(ns);
      if (isN) apiSave(n, data, false);
      return ns;
    });
  }

  function completeProfile() {
    const data = state.formData.step_4 || {};
    const errs = validate(4, data);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setCompleting(true);

    setState(prev => {
      const isN = !prev.rewardedSteps.includes(4);
      const ns  = {
        ...prev, profileComplete:true,
        rewardedSteps : isN ? [...prev.rewardedSteps, 4]  : prev.rewardedSteps,
        completedSteps: prev.completedSteps.includes(4) ? prev.completedSteps : [...prev.completedSteps, 4],
      };
      saveLocal(ns);
      if (isN) apiSave(4, data, false).finally(() => setCompleting(false));
      else setCompleting(false);
      return ns;
    });
  }

  /* ── Derived ── */
  const coins       = state.rewardedSteps.length * CONFIG.pointsPerStep;
  const ringPct     = (state.rewardedSteps.length / CONFIG.totalSteps) * 100;
  const remaining   = CONFIG.totalSteps - state.rewardedSteps.length;

  /* ── Loading screen ── */
  if (pageLoading) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:"12px" }}>
        <Loader2 size={36} style={{ animation:"spin 1s linear infinite", color: T.blush }} />
        <p style={{ fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color: T.muted }}>Loading your rewards...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────── */
  return (
    <div style={{ fontFamily:"inherit", animation:"fadeSlide .35s ease" }}>
      <style>{`
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: .6; cursor: pointer; }
        
        @media (max-width: 768px) {
          /* Grid adjustments */
          .rewards-layout {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .rewards-sidebar {
            position: static !important;
            order: -1; /* Move sidebar/stats to top on mobile */
          }
          /* Typography & spacing boosts for mobile */
          .step-tabs button {
            font-size: 10px !important;
            padding: 12px 4px !important;
          }
          .main-card-body {
            padding: 16px 16px 20px !important;
          }
          .chip-button {
            font-size: 14px !important;
            padding: 12px 16px !important;
            min-height: 48px !important;
          }
        }
      `}</style>

      {/* Page header */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:"16px", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontSize:"28px", fontWeight:700, color:"#1c1410", margin:0, letterSpacing:".3px" }}>Earn Rewards</h2>
          <p style={{ color:"#666", fontSize:"14px", margin:"4px 0 0" }}>Complete your profile to earn Lucira Coins and unlock exclusive benefits.</p>
        </div>

        {/* Lucira Coins badge */}
        <div style={{
          display:"flex", alignItems:"center", gap:"12px",
          background:`linear-gradient(135deg,${T.dark},#5c3d28)`,
          borderRadius:"12px", padding:"12px 18px", boxShadow:"0 8px 24px rgba(28,20,16,.18)",
        }}>
          <Gift size={22} color="#d4aa5a" />
          <div>
            <p style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,.45)", margin:0 }}>Lucira Coins</p>
            <p style={{ fontSize:"24px", fontWeight:700, color:"#fff", margin:0, lineHeight:1.2 }}>
              {coinsLoading ? "..." : nectorCoins !== null ? nectorCoins.toLocaleString("en-IN") : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="rewards-layout" style={{ display:"grid", gridTemplateColumns:"1fr 210px", gap:"20px", alignItems:"start" }}>

        {/* ── MAIN CARD ── */}
        <div style={{ background:"#fff", borderRadius:"4px", boxShadow:"0 2px 20px rgba(28,20,16,.07)", overflow:"hidden" }}>

          {/* Milestone / pts bar */}
          <div style={{ padding:"20px 28px 16px", background:"#F4F0F0", borderBottom:`1px solid ${T.ivory}` }}>
            <MilestoneBar completedSteps={state.completedSteps} profileComplete={state.profileComplete} />
            <p style={{ fontSize:"14px", color:"#1a1a1a", marginTop:"10px", letterSpacing:".3px" }}>
              {state.profileComplete
                ? <>🎉 <strong style={{ color: T.blush }}>Profile complete!</strong> You&apos;ve earned all your Lucira Coins.</>
                : <>You are just <strong style={{ color: T.blush, fontSize:"14px" }}>{remaining} more step{remaining!==1?"s":""}</strong> away for Bonus Lucira Coins</>
              }
            </p>
          </div>

          {/* Step tabs */}
          {!state.profileComplete && (
            <div className="step-tabs" style={{ display:"flex", borderBottom:`1px solid ${T.border}`, background: T.ivory }}>
              {[1,2,3,4].map(n => {
                const done   = state.completedSteps.includes(n);
                const active = state.currentStep === n;
                return (
                  <button key={n} type="button"
                    onClick={() => done && !active && setState(p => ({ ...p, currentStep:n }))}
                    style={{
                      flex:1, textAlign:"center", padding:"9px 4px",
                      fontSize:"9px", letterSpacing:"1.5px", textTransform:"uppercase",
                      fontFamily:"inherit", fontWeight:400,
                      color: active ? T.blush : done ? "#1c1410" : T.muted,
                      background: active ? "#fff" : "transparent",
                      border:"none", borderBottom: active ? `2px solid ${T.blush}` : "2px solid transparent",
                      cursor: done && !active ? "pointer" : "default", transition:"all .2s",
                    }}>
                    {STEP_NAMES[n]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Step body */}
          <div className="main-card-body" style={{ padding:"20px 24px 24px" }}>
            {state.profileComplete ? (
              /* ── Completion screen ── */
              <div style={{ textAlign:"center", padding:"28px 16px" }}>
                <div style={{ width:"80px", height:"80px", borderRadius:"50%", border:`2px solid ${T.blush}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", background:"#f4f0f0" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.blush} strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h3 style={{ fontSize:"20px", fontWeight:600, color:"#1c1410", marginBottom:"6px" }}>You Have Completed Your Profile</h3>
                <p style={{ color:"#666", fontSize:"14px", marginBottom:"28px" }}>Visit later if any question is added.</p>
                <a href="/collections/all"
                  style={{ display:"inline-block", background: T.blush, color:"#fff", padding:"13px 48px", borderRadius:"3rem", fontSize:"11px", letterSpacing:"2.5px", textTransform:"uppercase", textDecoration:"none", fontWeight:500 }}>
                  Shop Now
                </a>
                <div style={{ marginTop:"24px", paddingTop:"16px", borderTop:`1px solid ${T.border}`, fontSize:"13px", color:"#666" }}>
                  Need Help?{" "}
                  <a href="https://api.whatsapp.com/send/?phone=%2B919004435760&text=Hi!+Can+you+tell+me+more+about+Lucira+Jewelry%E2%80%99s+collection%3F&type=phone_number&app_absent=0"
                    style={{ color: T.blush, textDecoration:"none" }} target="_blank" rel="noopener noreferrer">
                    Chat with our Expert
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Eyebrow */}
                <p style={{ fontSize:"9px", letterSpacing:"2.5px", textTransform:"uppercase", color: T.blush, marginBottom:"5px", fontWeight:500 }}>
                  Step {state.currentStep} of {CONFIG.totalSteps}
                </p>
                <h3 style={{ fontSize:"20px", fontWeight:500, color:"#1c1410", marginBottom:"4px", lineHeight:1.5 }}>
                  {state.currentStep===1?"Let Us Know You Better":state.currentStep===2?"Gifting Behaviour":state.currentStep===3?"Your Wishlist":"Your Style"}
                </h3>
                {[1,3,4].includes(state.currentStep) && (
                  <p style={{ color:"#666", fontSize:"14px", marginBottom:"18px", lineHeight:1.5 }}>
                    {state.currentStep===1?"Tell us a little about yourself so we can personalise your experience."
                      :state.currentStep===3?"Tell us what jewelry styles you're dreaming about."
                      :"Help us understand your aesthetic preferences."}
                  </p>
                )}

                {/* Validation errors */}
                {errors.length > 0 && (
                  <div style={{ background:"#ffe8e8", borderRadius:"8px", padding:"10px 16px", marginBottom:"14px" }}>
                    {errors.map((e,i) => <p key={i} style={{ color:"#c40000", fontSize:"12px", margin:"2px 0" }}>• {e}</p>)}
                  </div>
                )}

                {/* Active step */}
                {state.currentStep===1 && <Step1 data={state.formData.step_1} onChange={(f,v)=>handleChange("step_1",f,v)} />}
                {state.currentStep===2 && <Step2 data={state.formData.step_2} onChange={(f,v)=>handleChange("step_2",f,v)} />}
                {state.currentStep===3 && <Step3 data={state.formData.step_3} onChange={(f,v)=>handleChange("step_3",f,v)} />}
                {state.currentStep===4 && <Step4 data={state.formData.step_4} onChange={(f,v)=>handleChange("step_4",f,v)} />}

                {/* Actions */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"24px", paddingTop:"18px", borderTop:`1px solid ${T.ivory}` }}>
                  <button type="button"
                    disabled={state.currentStep===1}
                    onClick={() => goStep(state.currentStep-1)}
                    style={{
                      maxWidth:"145px", width:"100%", borderRadius:"3rem", fontSize:"12px",
                      padding:"10px 20px", fontFamily:"inherit", cursor: state.currentStep===1 ? "default" : "pointer",
                      background:"#fff", color: state.currentStep===1 ? T.border : T.blush,
                      border:`1px solid ${state.currentStep===1 ? T.border : T.blush}`,
                      opacity: state.currentStep===1 ? .4 : 1, transition:"all .2s",
                    }}>
                    Back
                  </button>

                  <button type="button"
                    disabled={completing}
                    onClick={() => state.currentStep<CONFIG.totalSteps ? goStep(state.currentStep+1) : completeProfile()}
                    style={{
                      background: T.blush, color:"#fff", border:"none",
                      padding:"11px 26px", borderRadius:"3rem", fontSize:"12px", letterSpacing:"1px",
                      fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px",
                      boxShadow:`0 4px 16px rgb(90 65 63)`, transition:"all .2s",
                    }}>
                    {completing ? <Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> : (
                      <>{state.currentStep<CONFIG.totalSteps?"Save & Continue":"Complete Profile"}<ArrowRight size={12}/></>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="rewards-sidebar" style={{ display:"flex", flexDirection:"column", gap:"14px", position:"sticky", top:"80px" }}>

          {/* Progress ring card */}
          <div style={{ background:"#fff", borderRadius:"4px", padding:"22px 18px", textAlign:"center", boxShadow:"0 2px 20px rgba(28,20,16,.07)" }}>
            <ProgressRing pct={ringPct} />
            <p style={{ fontSize:"9.5px", letterSpacing:"2px", textTransform:"uppercase", color: T.muted, marginBottom:"16px" }}>Profile Completed</p>
            <ul style={{ listStyle:"none", padding:0, margin:0, textAlign:"left", display:"flex", flexDirection:"column", gap:"10px", borderTop:`1px solid ${T.ivory}`, paddingTop:"14px" }}>
              {[1,2,3,4].map(n => {
                const done = state.profileComplete || state.completedSteps.includes(n);
                return (
                  <li key={n} style={{ display:"flex", alignItems:"center", gap:"9px", fontSize:"11.5px", color: done ? "#1c1410" : T.muted }}>
                    <div style={{ width:"18px", height:"18px", borderRadius:"50%", border:`1.5px solid ${done ? "transparent" : T.border}`, background: done ? T.blush : "#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {done ? <Check size={8} stroke="#fff" strokeWidth={3}/> : <div style={{ width:"6px", height:"6px", borderRadius:"50%", background: T.border }} />}
                    </div>
                    {STEP_NAMES[n]}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Coins earned card */}
          <div style={{ background:`linear-gradient(135deg,${T.dark},#5c3d28)`, borderRadius:"4px", padding:"14px 16px", textAlign:"center", boxShadow:"0 8px 40px rgba(28,20,16,.12)" }}>
            <p style={{ fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,.45)", marginBottom:"6px" }}>Coins Earned</p>
            <p style={{ fontSize:"26px", fontWeight:600, color:"#fff", lineHeight:1, margin:0 }}>{coins}</p>
            <p style={{ fontSize:"10px", color:"rgba(255,255,255,.45)", letterSpacing:".5px", marginTop:"8px" }}>Lucira Coins</p>
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {saveStatus && (
        <div style={{
          position:"fixed", bottom:"24px", right:"24px", background:"#fff",
          border:`1px solid ${T.border}`, borderRadius:"3rem", padding:"7px 14px",
          fontSize:"11px", color: T.muted, fontFamily:"inherit", letterSpacing:".5px",
          boxShadow:"0 2px 20px rgba(28,20,16,.07)",
          display:"flex", alignItems:"center", gap:"6px", zIndex:200,
          animation:"fadeSlide .3s ease",
        }}>
          {saveStatus==="saving"
            ? <><div style={{ width:"6px", height:"6px", borderRadius:"50%", background: T.blush, animation:"pulse 1.2s ease infinite" }} />Saving...</>
            : <><Check size={10} color={T.blush}/>Saved</>
          }
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        </div>
      )}

      {/* Mobile responsive */}
      <style>{`
        @media(max-width:700px){
          div[style*="grid-template-columns: 1fr 210px"]{
            grid-template-columns:1fr !important;
          }
          div[style*="position:sticky"]{position:static !important;}
        }
      `}</style>
    </div>
  );
}
