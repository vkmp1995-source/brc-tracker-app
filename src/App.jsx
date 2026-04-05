import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://hrejjfxdwwmqcnhzonai.supabase.co";
const SUPABASE_KEY = "sb_publishable_BRVPEb-uvK88OmkLX7E0mg_AftxuccP";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── USERS ────────────────────────────────────────────────────────────────────
const USERS = [
  { id:1, email:"admin@brctracker.com", password:"admin123", name:"Admin User",   plan:"Pro" },
  { id:2, email:"ca@firm.com",          password:"ca1234",   name:"CA Firm User", plan:"Starter" },
];

const STATUS_CONFIG = {
  DONE:         { label:"BRC Done ✅",     color:"#00C896", bg:"rgba(0,200,150,0.12)" },
  PENDING:      { label:"Pending ⏳",       color:"#F5A623", bg:"rgba(245,166,35,0.12)" },
  IRM_RECEIVED: { label:"IRM Received 🔄", color:"#4FC3F7", bg:"rgba(79,195,247,0.12)" },
  OVERDUE:      { label:"Overdue ❌",       color:"#FF5C5C", bg:"rgba(255,92,92,0.12)" },
};

const S = {
  app:     { fontFamily:"'Segoe UI',sans-serif", background:"#0D1117", minHeight:"100vh", color:"#E6EDF3" },
  sidebar: { width:230, background:"#161B22", borderRight:"1px solid #21262D", padding:"24px 12px", display:"flex", flexDirection:"column", gap:4, minHeight:"100vh", flexShrink:0 },
  main:    { flex:1, padding:28, overflowY:"auto" },
  card:    { background:"#161B22", border:"1px solid #21262D", borderRadius:14, padding:20, marginBottom:16 },
  input:   { background:"#21262D", border:"1px solid #30363D", color:"#E6EDF3", padding:"9px 13px", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", width:"100%" },
  btnP:    { padding:"10px 20px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:"#00C896", color:"#0D1117", fontFamily:"inherit" },
  btnG:    { padding:"9px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:500, background:"rgba(255,255,255,0.07)", color:"#E6EDF3", fontFamily:"inherit" },
  modalBg: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 },
  modal:   { background:"#161B22", border:"1px solid #30363D", borderRadius:16, padding:28, width:"90%", maxWidth:500, maxHeight:"90vh", overflowY:"auto" },
  badge:   (st) => ({ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:STATUS_CONFIG[st]?.bg||"#333", color:STATUS_CONFIG[st]?.color||"#fff" }),
  navItem: (a) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:10, cursor:"pointer", color:a?"#00C896":"#8B949E", background:a?"rgba(0,200,150,0.12)":"transparent", fontSize:14, fontWeight:500, marginBottom:2 }),
  label:   { fontSize:12, color:"#8B949E", display:"block", marginBottom:6 },
  tip:     { background:"rgba(79,195,247,0.08)", borderLeft:"3px solid #4FC3F7", borderRadius:"0 6px 6px 0", padding:"10px 14px", fontSize:12, color:"#4FC3F7", marginTop:10, lineHeight:1.6 },
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email,setEmail]   = useState("");
  const [pass,setPass]     = useState("");
  const [err,setErr]       = useState("");
  const [loading,setLoading] = useState(false);

  const handle = () => {
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email===email && u.password===pass);
      if (user) onLogin(user);
      else { setErr("Email ya password galat hai!"); setLoading(false); }
    }, 700);
  };

  return (
    <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:400, padding:24 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>📋</div>
          <div style={{ fontSize:26, fontWeight:700, color:"#00C896" }}>BRC Tracker</div>
          <div style={{ fontSize:14, color:"#8B949E", marginTop:4 }}>Export Compliance Tool — Powered by Supabase</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>Login Karo</div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" placeholder="email@example.com" value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••" value={pass} onChange={e=>{setPass(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&handle()} />
          </div>
          {err && <div style={{ color:"#FF5C5C", fontSize:13, marginBottom:14 }}>⚠️ {err}</div>}
          <button style={{ ...S.btnP, width:"100%", padding:12, fontSize:15 }} onClick={handle} disabled={loading}>
            {loading ? "Login ho raha hai..." : "Login →"}
          </button>
          <div style={S.tip}>
            <strong>Demo:</strong> admin@brctracker.com / admin123
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]           = useState(null);
  const [records,setRecords]     = useState([]);
  const [irmData,setIrmData]     = useState([]);
  const [tab,setTab]             = useState("dashboard");
  const [search,setSearch]       = useState("");
  const [filter,setFilter]       = useState("ALL");
  const [loading,setLoading]     = useState(false);
  const [dbConnected,setDbConnected] = useState(false);
  const [selRec,setSelRec]       = useState(null);
  const [showUpdate,setShowUpdate] = useState(false);
  const [showAdd,setShowAdd]     = useState(false);
  const [showWA,setShowWA]       = useState(false);
  const [waRec,setWaRec]         = useState(null);
  const [waPhone,setWaPhone]     = useState("");
  const [notif,setNotif]         = useState(null);
  const [uploading,setUploading] = useState(false);
  const [newRec,setNewRec]       = useState({ sb_number:"", sb_date:"", buyer:"", country:"", fob_value:"", currency:"USD", bank:"", port_code:"", iec_code:"" });
  const fileRef = useRef();

  const toast = (msg,type="success") => { setNotif({msg,type}); setTimeout(()=>setNotif(null),3500); };

  // ── Fetch from Supabase ───────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch shipping bills
      const { data: sbData, error: sbErr } = await supabase
        .from("shipping_bills")
        .select(`*, brc_records(*)`)
        .order("created_at", { ascending: false });

      if (sbErr) throw sbErr;

      // Fetch IRM data
      const { data: irmRaw, error: irmErr } = await supabase
        .from("irm_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (irmErr) throw irmErr;

      // Map to UI format with BRC status
      const mapped = (sbData || []).map(sb => {
        const brcs = sb.brc_records || [];
        const hasIrm = (irmRaw || []).some(irm => irm.sb_id === sb.id);
        let status = "PENDING";
        if (brcs.some(b => b.status === "DONE")) status = "DONE";
        else if (hasIrm) status = "IRM_RECEIVED";
        else {
          // Check overdue — 6 months from sb_date
          if (sb.sb_date) {
            const sbDate = new Date(sb.sb_date);
            const sixMonthsLater = new Date(sbDate.setMonth(sbDate.getMonth() + 6));
            if (new Date() > sixMonthsLater) status = "OVERDUE";
          }
        }
        return {
          ...sb,
          status,
          irmNumber: (irmRaw||[]).find(i=>i.sb_id===sb.id)?.irm_number || "",
          brcNumber: brcs[0]?.brc_number || "",
        };
      });

      setRecords(mapped);
      setIrmData(irmRaw || []);
      setDbConnected(true);
    } catch (err) {
      console.error(err);
      setDbConnected(false);
    }
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const stats = {
    total:       records.length,
    done:        records.filter(r=>r.status==="DONE").length,
    pending:     records.filter(r=>r.status==="PENDING").length,
    overdue:     records.filter(r=>r.status==="OVERDUE").length,
    irmReceived: records.filter(r=>r.status==="IRM_RECEIVED").length,
    totalValue:  records.reduce((s,r)=>s+(parseFloat(r.fob_value)||0),0),
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return (!q || (r.sb_number||"").toLowerCase().includes(q) || (r.buyer||"").toLowerCase().includes(q) || (r.country||"").toLowerCase().includes(q))
        && (filter==="ALL" || r.status===filter);
  });

  // ── Add Record to Supabase ────────────────────────────────────────────────
  const addRecord = async () => {
    if (!newRec.sb_number || !newRec.buyer) { toast("SB Number aur Buyer zaroori hai!","error"); return; }
    const { error } = await supabase.from("shipping_bills").insert([{
      sb_number:  newRec.sb_number,
      sb_date:    newRec.sb_date || null,
      buyer:      newRec.buyer,
      country:    newRec.country,
      fob_value:  parseFloat(newRec.fob_value) || 0,
      currency:   newRec.currency,
      bank:       newRec.bank,
      port_code:  newRec.port_code,
      iec_code:   newRec.iec_code,
    }]);
    if (error) { toast("Record save nahi hua: " + error.message,"error"); return; }
    toast("✅ Record database mein save ho gaya!");
    setNewRec({ sb_number:"", sb_date:"", buyer:"", country:"", fob_value:"", currency:"USD", bank:"", port_code:"", iec_code:"" });
    setShowAdd(false);
    fetchData();
  };

  // ── Update BRC Status ─────────────────────────────────────────────────────
  const updateBRC = async (sbId, brcNumber, irmNumber, status) => {
    // Upsert BRC record
    const { error: brcErr } = await supabase.from("brc_records").upsert([{
      sb_id: sbId, brc_number: brcNumber, status, bank: selRec?.bank
    }]);
    if (brcErr) { toast("Update nahi hua: " + brcErr.message,"error"); return; }

    // Update IRM if provided
    if (irmNumber) {
      await supabase.from("irm_data").upsert([{
        sb_id: sbId, irm_number: irmNumber, type: "INWARD"
      }]);
    }
    toast("✅ Status database mein update ho gaya!"); setShowUpdate(false); fetchData();
  };

  // ── Excel / CSV Upload ────────────────────────────────────────────────────
  const handleExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/"/g,""));
        const obj = {};
        headers.forEach((h,i) => obj[h] = vals[i]||"");
        return obj;
      }).filter(r => r["SB Number"] || r["sb_number"]);

      const toInsert = rows.map(row => ({
        sb_number: row["SB Number"]  || row["sb_number"]  || "",
        sb_date:   row["SB Date"]    || row["sb_date"]    || null,
        buyer:     row["Buyer"]      || row["buyer"]      || "",
        country:   row["Country"]    || row["country"]    || "",
        fob_value: parseFloat(row["FOB Value"] || row["fob_value"] || 0),
        currency:  row["Currency"]   || row["currency"]   || "USD",
        bank:      row["Bank"]       || row["bank"]       || "",
        iec_code:  row["IEC Code"]   || row["iec_code"]   || "",
      })).filter(r => r.sb_number);

      if (toInsert.length === 0) { toast("File mein data nahi mila!","error"); setUploading(false); return; }

      const { error } = await supabase.from("shipping_bills").insert(toInsert);
      if (error) { toast("Upload nahi hua: " + error.message,"error"); }
      else { toast(`✅ ${toInsert.length} records database mein save ho gaye!`); fetchData(); }
    } catch(err) { toast("File read error: " + err.message,"error"); }
    setUploading(false); e.target.value="";
  };

  // ── Download Sample CSV ───────────────────────────────────────────────────
  const downloadSample = () => {
    const csv = `SB Number,SB Date,Buyer,Country,FOB Value,Currency,Bank,IEC Code
SB/001/2024/JNPT,2024-01-15,ABC Trading LLC,UAE,450000,USD,HDFC Bank,IEC0123456
SB/002/2024/JNPT,2024-02-01,Global Exports Inc,USA,820000,USD,ICICI Bank,IEC0123456
SB/003/2024/MUND,2023-06-10,Euro Trade GmbH,Germany,310000,EUR,SBI,IEC0123456`;
    const blob = new Blob([csv],{type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="brc-sample.csv"; a.click();
    toast("📥 Sample CSV download ho gayi!");
  };

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  const sendWA = () => {
    if (!waPhone) { toast("Phone number daalo!","error"); return; }
    const msg = `🚨 *BRC Pending Alert*\n\nShipping Bill: ${waRec.sb_number}\nBuyer: ${waRec.buyer} (${waRec.country})\nFOB Value: ${waRec.currency} ${Number(waRec.fob_value).toLocaleString()}\nBank: ${waRec.bank||"N/A"}\nStatus: ${STATUS_CONFIG[waRec.status]?.label}\n\n⚠️ Please submit BRC on DGFT portal to avoid penalty!\n\n- BRC Tracker`;
    window.open(`https://wa.me/${waPhone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");
    toast("📱 WhatsApp khul gaya!"); setShowWA(false); setWaPhone("");
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div style={{...S.app, display:"flex"}}>
      {/* Toast */}
      {notif && (
        <div style={{position:"fixed",top:20,right:20,zIndex:300,padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:500,background:notif.type==="error"?"#FF5C5C":"#00C896",color:notif.type==="error"?"#fff":"#0D1117",boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
          {notif.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{padding:"0 8px 24px"}}>
          <div style={{fontSize:18,fontWeight:700,color:"#00C896"}}>BRC Tracker</div>
          <div style={{fontSize:11,color:"#8B949E",marginTop:2}}>Export Compliance Tool</div>
          <div style={{fontSize:11,marginTop:6,display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:dbConnected?"#00C896":"#FF5C5C",display:"inline-block"}}/>
            <span style={{color:dbConnected?"#00C896":"#FF5C5C"}}>{dbConnected?"Supabase Live":"Connecting..."}</span>
          </div>
        </div>
        {[
          {id:"dashboard",icon:"📊",label:"Dashboard"},
          {id:"records",  icon:"📋",label:"BRC Records"},
          {id:"irm",      icon:"💰",label:"IRM / ORM Data"},
          {id:"upload",   icon:"📁",label:"Excel Upload"},
          {id:"alerts",   icon:"🔔",label:"Alerts"},
          {id:"dgft",     icon:"⚡",label:"DGFT Sync"},
        ].map(item=>(
          <div key={item.id} style={S.navItem(tab===item.id)} onClick={()=>setTab(item.id)}>
            <span style={{fontSize:15}}>{item.icon}</span>{item.label}
            {item.id==="alerts"&&stats.overdue>0&&<span style={{background:"#FF5C5C",color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,marginLeft:"auto"}}>{stats.overdue}</span>}
          </div>
        ))}
        <div style={{marginTop:"auto",padding:"16px 8px 0",borderTop:"1px solid #21262D"}}>
          <div style={{fontSize:12,color:"#8B949E"}}>Logged in</div>
          <div style={{fontSize:13,fontWeight:600,marginTop:2}}>{user.name}</div>
          <div style={{fontSize:11,color:"#00C896",marginTop:2}}>● {user.plan} Plan</div>
          <button style={{...S.btnG,marginTop:10,width:"100%",fontSize:12}} onClick={()=>setUser(null)}>Logout →</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={S.main}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Dashboard</h1>
                <p style={{color:"#8B949E",fontSize:14}}>Namaste {user.name}! Real-time BRC overview from Supabase</p>
              </div>
              <button style={{...S.btnG,fontSize:12,display:"flex",alignItems:"center",gap:6}} onClick={fetchData} disabled={loading}>
                {loading?"🔄 Syncing...":"🔄 Refresh"}
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24}}>
              {[
                {label:"Total Bills",  value:stats.total,       color:"#E6EDF3",icon:"📦"},
                {label:"BRC Done",     value:stats.done,        color:"#00C896",icon:"✅"},
                {label:"Pending",      value:stats.pending,     color:"#F5A623",icon:"⏳"},
                {label:"IRM Received", value:stats.irmReceived, color:"#4FC3F7",icon:"🔄"},
                {label:"Overdue",      value:stats.overdue,     color:"#FF5C5C",icon:"❌"},
              ].map((st,i)=>(
                <div key={i} style={S.card}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:12,color:"#8B949E",marginBottom:8}}>{st.label}</div>
                      <div style={{fontSize:32,fontWeight:700,color:st.color}}>{st.value}</div>
                    </div>
                    <span style={{fontSize:22}}>{st.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DB Status Banner */}
            <div style={{background:dbConnected?"rgba(0,200,150,0.08)":"rgba(255,92,92,0.08)",border:`1px solid ${dbConnected?"rgba(0,200,150,0.3)":"rgba(255,92,92,0.3)"}`,borderRadius:12,padding:14,marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>{dbConnected?"🟢":"🔴"}</span>
              <div>
                <div style={{fontWeight:600,color:dbConnected?"#00C896":"#FF5C5C"}}>{dbConnected?"Supabase Database Live — Real-time Data":"Database Connect Nahi Hua"}</div>
                <div style={{fontSize:12,color:"#8B949E",marginTop:2}}>{dbConnected?`${records.length} shipping bills • ${irmData.length} IRM records loaded`:"Network check karo"}</div>
              </div>
            </div>

            {stats.overdue>0&&(
              <div style={{background:"rgba(255,92,92,0.1)",border:"1px solid rgba(255,92,92,0.3)",borderRadius:12,padding:16,marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:20}}>🚨</span>
                <div>
                  <div style={{fontWeight:600,color:"#FF5C5C"}}>{stats.overdue} Overdue BRC — Turant action lo!</div>
                  <div style={{fontSize:13,color:"#8B949E",marginTop:2}}>6-month window cross ho gayi. DGFT penalty aa sakti hai.</div>
                </div>
                <button style={{...S.btnG,marginLeft:"auto",background:"rgba(255,92,92,0.15)",color:"#FF5C5C",whiteSpace:"nowrap"}} onClick={()=>{setFilter("OVERDUE");setTab("records");}}>View →</button>
              </div>
            )}

            <div style={S.card}>
              <div style={{fontWeight:600,marginBottom:14}}>Recent Records {loading&&<span style={{fontSize:12,color:"#8B949E",fontWeight:400}}>— Loading...</span>}</div>
              {records.length===0&&!loading&&(
                <div style={{textAlign:"center",padding:24,color:"#8B949E"}}>
                  <div style={{fontSize:32,marginBottom:8}}>📭</div>
                  <div>Koi record nahi — Excel upload karo ya manually add karo!</div>
                </div>
              )}
              {records.slice(0,5).map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #21262D"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{r.sb_number}</div>
                    <div style={{fontSize:12,color:"#8B949E"}}>{r.buyer} • {r.country} • {r.currency} {Number(r.fob_value).toLocaleString()}</div>
                  </div>
                  <span style={S.badge(r.status)}>{STATUS_CONFIG[r.status]?.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECORDS */}
        {tab==="records"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
              <div>
                <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>BRC Records</h1>
                <p style={{color:"#8B949E",fontSize:14}}>Supabase database se real-time data</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={{...S.btnG,fontSize:12}} onClick={fetchData}>🔄 Refresh</button>
                <button style={S.btnP} onClick={()=>setShowAdd(true)}>+ Add Record</button>
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:18}}>
              <input style={{...S.input,maxWidth:280}} placeholder="🔍 SB Number, Buyer, Country..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select style={{...S.input,maxWidth:180}} value={filter} onChange={e=>setFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
              <div style={{marginLeft:"auto",color:"#8B949E",fontSize:13,alignSelf:"center"}}>{filtered.length} records</div>
            </div>
            <div style={{...S.card,padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #21262D"}}>
                    {["SB Number","Buyer / Country","FOB Value","Bank","IEC","IRM","Status","Actions"].map(h=>(
                      <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:12,color:"#8B949E",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r=>(
                    <tr key={r.id} style={{borderBottom:"1px solid #21262D"}}>
                      <td style={{padding:"13px 16px",fontSize:13,fontWeight:600}}>{r.sb_number}<br/><span style={{fontSize:11,color:"#8B949E",fontWeight:400}}>{r.sb_date}</span></td>
                      <td style={{padding:"13px 16px"}}><div style={{fontSize:13}}>{r.buyer}</div><div style={{fontSize:12,color:"#8B949E"}}>{r.country}</div></td>
                      <td style={{padding:"13px 16px",fontSize:13}}>{r.currency} {Number(r.fob_value).toLocaleString()}</td>
                      <td style={{padding:"13px 16px",fontSize:12,color:"#8B949E"}}>{r.bank||"-"}</td>
                      <td style={{padding:"13px 16px",fontSize:12,color:"#8B949E"}}>{r.iec_code||"-"}</td>
                      <td style={{padding:"13px 16px",fontSize:12}}>{r.irmNumber?<span style={{color:"#4FC3F7"}}>✓ {r.irmNumber}</span>:<span style={{color:"#8B949E"}}>-</span>}</td>
                      <td style={{padding:"13px 16px"}}><span style={S.badge(r.status)}>{STATUS_CONFIG[r.status]?.label}</span></td>
                      <td style={{padding:"13px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button style={{...S.btnG,padding:"5px 10px",fontSize:11}} onClick={()=>{setSelRec(r);setShowUpdate(true);}}>Update</button>
                          {r.status!=="DONE"&&<button style={{...S.btnG,padding:"5px 10px",fontSize:11,color:"#25D366"}} onClick={()=>{setWaRec(r);setShowWA(true);}}>📱</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length===0&&<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#8B949E"}}>{loading?"Loading...":"Koi record nahi mila"}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IRM / ORM DATA */}
        {tab==="irm"&&(
          <div>
            <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>IRM / ORM Data</h1>
            <p style={{color:"#8B949E",fontSize:14,marginBottom:24}}>Inward aur Outward Remittance records</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div style={S.card}>
                <div style={{fontSize:12,color:"#8B949E",marginBottom:6}}>Total IRM (Inward)</div>
                <div style={{fontSize:28,fontWeight:700,color:"#00C896"}}>{irmData.filter(i=>i.type==="INWARD"||!i.type).length}</div>
              </div>
              <div style={S.card}>
                <div style={{fontSize:12,color:"#8B949E",marginBottom:6}}>Total ORM (Outward)</div>
                <div style={{fontSize:28,fontWeight:700,color:"#4FC3F7"}}>{irmData.filter(i=>i.type==="OUTWARD").length}</div>
              </div>
            </div>
            <div style={{...S.card,padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #21262D"}}>
                    {["IRM Number","Bank","Amount","Currency","Purpose Code","Type","Date"].map(h=>(
                      <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:12,color:"#8B949E",fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {irmData.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:"center",color:"#8B949E"}}>Koi IRM/ORM data nahi — DGFT se sync karo!</td></tr>}
                  {irmData.map(irm=>(
                    <tr key={irm.id} style={{borderBottom:"1px solid #21262D"}}>
                      <td style={{padding:"13px 16px",fontSize:13,fontWeight:600}}>{irm.irm_number||"-"}</td>
                      <td style={{padding:"13px 16px",fontSize:13}}>{irm.bank_name||"-"}</td>
                      <td style={{padding:"13px 16px",fontSize:13}}>{Number(irm.amount||0).toLocaleString()}</td>
                      <td style={{padding:"13px 16px",fontSize:12,color:"#8B949E"}}>{irm.currency||"-"}</td>
                      <td style={{padding:"13px 16px",fontSize:12,color:"#8B949E"}}>{irm.purpose_code||"-"}</td>
                      <td style={{padding:"13px 16px"}}>
                        <span style={{padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:600,background:irm.type==="OUTWARD"?"rgba(79,195,247,0.15)":"rgba(0,200,150,0.15)",color:irm.type==="OUTWARD"?"#4FC3F7":"#00C896"}}>
                          {irm.type||"INWARD"}
                        </span>
                      </td>
                      <td style={{padding:"13px 16px",fontSize:12,color:"#8B949E"}}>{irm.remittance_date||"-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXCEL UPLOAD */}
        {tab==="upload"&&(
          <div>
            <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Excel / CSV Upload</h1>
            <p style={{color:"#8B949E",fontSize:14,marginBottom:24}}>File upload karo — data seedha Supabase database mein jayega!</p>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={handleExcel} />
            <div style={{...S.card,textAlign:"center",padding:48,border:"2px dashed #30363D",cursor:"pointer",marginBottom:16}} onClick={()=>!uploading&&fileRef.current.click()}>
              <div style={{fontSize:48,marginBottom:12}}>{uploading?"⏳":"📁"}</div>
              <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>{uploading?"Database mein save ho raha hai...":"File Click Karke Upload Karo"}</div>
              <div style={{fontSize:13,color:"#8B949E",marginBottom:16}}>.csv, .xlsx supported • Data seedha Supabase mein jayega</div>
              {!uploading&&<button style={S.btnP}>📁 File Select Karo</button>}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:600,marginBottom:10}}>📥 Sample Format Download Karo</div>
              <p style={{fontSize:13,color:"#8B949E",marginBottom:14}}>Isi format mein data bharo phir upload karo!</p>
              <button style={S.btnG} onClick={downloadSample}>📥 Sample CSV Download</button>
              <div style={S.tip}><strong>Columns:</strong> SB Number • SB Date • Buyer • Country • FOB Value • Currency • Bank • IEC Code</div>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {tab==="alerts"&&(
          <div>
            <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Alert Center</h1>
            <p style={{color:"#8B949E",fontSize:14,marginBottom:24}}>Pending BRC ke liye WhatsApp alerts bhejo</p>
            {records.filter(r=>r.status!=="DONE").length===0?(
              <div style={{...S.card,textAlign:"center",padding:40}}>
                <div style={{fontSize:40,marginBottom:12}}>🎉</div>
                <div style={{fontSize:16,fontWeight:600,color:"#00C896"}}>Sabhi BRC Complete Hain!</div>
              </div>
            ):records.filter(r=>r.status!=="DONE").map(r=>(
              <div key={r.id} style={{...S.card,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:10,background:STATUS_CONFIG[r.status]?.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                    {r.status==="OVERDUE"?"❌":r.status==="IRM_RECEIVED"?"🔄":"⏳"}
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600}}>{r.sb_number}</div>
                    <div style={{fontSize:12,color:"#8B949E"}}>{r.buyer} • {r.country} • {r.currency} {Number(r.fob_value).toLocaleString()}</div>
                    <span style={{...S.badge(r.status),marginTop:4}}>{STATUS_CONFIG[r.status]?.label}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <button style={{...S.btnG,fontSize:12,color:"#25D366"}} onClick={()=>{setWaRec(r);setShowWA(true);}}>📱 WhatsApp</button>
                  <button style={{...S.btnG,fontSize:12}} onClick={()=>toast(`📧 ${r.buyer} ke bank ko email draft ho gaya!`)}>📧 Email</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DGFT SYNC */}
        {tab==="dgft"&&(
          <div>
            <h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>DGFT Sync</h1>
            <p style={{color:"#8B949E",fontSize:14,marginBottom:24}}>DGFT portal se IRM/ORM data fetch karke Supabase mein save karo</p>
            <div style={S.card}>
              <div style={{fontWeight:600,marginBottom:14}}>📋 DGFT API Setup Steps</div>
              {[
                ["Step 1","dgft.gov.in pe jaao → Login with IEC"],
                ["Step 2","Services → eBRC → API Registration"],
                ["Step 3","DSC se sign karo → Credentials download karo"],
                ["Step 4","Make.com pe workflow banao → DGFT API call → Supabase mein save"],
                ["Step 5","Auto-sync har roz subah 9 baje"],
              ].map(([step,desc])=>(
                <div key={step} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #21262D",alignItems:"center"}}>
                  <span style={{background:"rgba(0,200,150,0.15)",color:"#00C896",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{step}</span>
                  <span style={{fontSize:13}}>{desc}</span>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{fontWeight:600,marginBottom:12}}>🔑 Manual IRM Data Add Karo</div>
              <p style={{fontSize:13,color:"#8B949E",marginBottom:14}}>DGFT se manually IRM details copy karke yahan add karo — database mein save ho jaayega</p>
              <div style={{display:"grid",gap:12}}>
                {[["IRM Number","irm_num"],["Bank Name","bank"],["Amount","amount"],["Purpose Code","purpose"]].map(([label,field])=>(
                  <div key={field}><label style={S.label}>{label}</label><input style={S.input} id={`irm-${field}`} placeholder={label+"..."} /></div>
                ))}
                <button style={S.btnP} onClick={async()=>{
                  const irm = {
                    irm_number: document.getElementById("irm-irm_num").value,
                    bank_name:  document.getElementById("irm-bank").value,
                    amount:     parseFloat(document.getElementById("irm-amount").value)||0,
                    purpose_code: document.getElementById("irm-purpose").value,
                    type: "INWARD",
                  };
                  const {error} = await supabase.from("irm_data").insert([irm]);
                  if(error) toast("Save nahi hua: "+error.message,"error");
                  else { toast("✅ IRM data save ho gaya!"); fetchData(); }
                }}>💾 IRM Data Save Karo</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPDATE MODAL */}
      {showUpdate&&selRec&&(
        <div style={S.modalBg} onClick={()=>setShowUpdate(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>BRC Status Update</div>
            <div style={{color:"#8B949E",fontSize:13,marginBottom:20}}>{selRec.sb_number} — {selRec.buyer}</div>
            <div style={{display:"grid",gap:14}}>
              <div><label style={S.label}>IRM Number</label><input style={S.input} defaultValue={selRec.irmNumber} id="upd-irm" placeholder="IRM number..." /></div>
              <div><label style={S.label}>BRC Number</label><input style={S.input} defaultValue={selRec.brcNumber} id="upd-brc" placeholder="BRC number..." /></div>
              <div><label style={S.label}>Status</label>
                <select style={S.input} id="upd-status" defaultValue={selRec.status}>
                  {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={{...S.btnP,flex:1}} onClick={()=>updateBRC(selRec.id,document.getElementById("upd-brc").value,document.getElementById("upd-irm").value,document.getElementById("upd-status").value)}>
                  💾 Database mein Save Karo
                </button>
                <button style={S.btnG} onClick={()=>setShowUpdate(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd&&(
        <div style={S.modalBg} onClick={()=>setShowAdd(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:20}}>Naya Shipping Bill Add Karo</div>
            <div style={{display:"grid",gap:12}}>
              {[["SB Number *","sb_number","text"],["SB Date","sb_date","date"],["Buyer Name *","buyer","text"],["Country","country","text"],["FOB Value","fob_value","number"],["Bank Name","bank","text"],["IEC Code","iec_code","text"],["Port Code","port_code","text"]].map(([label,field,type])=>(
                <div key={field}><label style={S.label}>{label}</label>
                  <input style={S.input} type={type} value={newRec[field]} onChange={e=>setNewRec(p=>({...p,[field]:e.target.value}))} />
                </div>
              ))}
              <div><label style={S.label}>Currency</label>
                <select style={S.input} value={newRec.currency} onChange={e=>setNewRec(p=>({...p,currency:e.target.value}))}>
                  {["USD","EUR","GBP","SGD","AED","JPY","AUD"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button style={{...S.btnP,flex:1}} onClick={addRecord}>💾 Database mein Save Karo</button>
                <button style={S.btnG} onClick={()=>setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {showWA&&waRec&&(
        <div style={S.modalBg} onClick={()=>setShowWA(false)}>
          <div style={S.modal} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>📱 WhatsApp Alert</div>
            <div style={{color:"#8B949E",fontSize:13,marginBottom:16}}>{waRec.sb_number} — {waRec.buyer}</div>
            <div style={{background:"#21262D",borderRadius:10,padding:14,fontSize:13,lineHeight:1.8,marginBottom:16}}>
              🚨 <strong>BRC Pending Alert</strong><br/>
              Shipping Bill: {waRec.sb_number}<br/>
              Buyer: {waRec.buyer} ({waRec.country})<br/>
              FOB Value: {waRec.currency} {Number(waRec.fob_value).toLocaleString()}<br/>
              Status: {STATUS_CONFIG[waRec.status]?.label}<br/>
              ⚠️ DGFT portal pe BRC submit karo — penalty se bachao!
            </div>
            <div style={{marginBottom:16}}>
              <label style={S.label}>WhatsApp Number (with country code)</label>
              <input style={S.input} placeholder="+919876543210" value={waPhone} onChange={e=>setWaPhone(e.target.value)} />
              <div style={S.tip}>India ke liye +91 se shuru karo</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={{...S.btnP,flex:1,background:"#25D366"}} onClick={sendWA}>📱 Send WhatsApp</button>
              <button style={S.btnG} onClick={()=>{setShowWA(false);setWaPhone("");}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
