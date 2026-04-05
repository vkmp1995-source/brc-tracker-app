import { useState, useRef } from "react";

const SAMPLE_DATA = [
  { id: 1, sbNumber: "SB/001/2024/JNPT", sbDate: "2024-01-15", buyer: "ABC Trading LLC", country: "UAE", fobValue: 450000, currency: "USD", bank: "HDFC Bank", irmNumber: "IRM20240115001", brcNumber: "BRC2024001", status: "DONE", realisationDate: "2024-02-10" },
  { id: 2, sbNumber: "SB/002/2024/JNPT", sbDate: "2024-02-01", buyer: "Global Exports Inc", country: "USA", fobValue: 820000, currency: "USD", bank: "ICICI Bank", irmNumber: "", brcNumber: "", status: "PENDING", realisationDate: "" },
  { id: 3, sbNumber: "SB/003/2024/MUND", sbDate: "2024-02-10", buyer: "Euro Trade GmbH", country: "Germany", fobValue: 310000, currency: "EUR", bank: "SBI", irmNumber: "IRM20240210003", brcNumber: "", status: "IRM_RECEIVED", realisationDate: "" },
  { id: 4, sbNumber: "SB/004/2024/CHEN", sbDate: "2023-09-05", buyer: "Asia Pacific Co.", country: "Singapore", fobValue: 155000, currency: "SGD", bank: "Axis Bank", irmNumber: "", brcNumber: "", status: "OVERDUE", realisationDate: "" },
  { id: 5, sbNumber: "SB/005/2024/JNPT", sbDate: "2024-03-01", buyer: "Sunrise Traders", country: "UK", fobValue: 675000, currency: "GBP", bank: "HDFC Bank", irmNumber: "IRM20240301005", brcNumber: "BRC2024005", status: "DONE", realisationDate: "2024-03-28" },
  { id: 6, sbNumber: "SB/006/2024/MUND", sbDate: "2024-03-15", buyer: "Middle East Corp", country: "Saudi Arabia", fobValue: 920000, currency: "USD", bank: "Kotak Bank", irmNumber: "", brcNumber: "", status: "PENDING", realisationDate: "" },
];

const STATUS_CONFIG = {
  DONE: { label: "BRC Done ✅", color: "#00C896", bg: "rgba(0,200,150,0.12)", dot: "#00C896" },
  PENDING: { label: "Pending ⏳", color: "#F5A623", bg: "rgba(245,166,35,0.12)", dot: "#F5A623" },
  IRM_RECEIVED: { label: "IRM Received 🔄", color: "#4FC3F7", bg: "rgba(79,195,247,0.12)", dot: "#4FC3F7" },
  OVERDUE: { label: "Overdue ❌", color: "#FF5C5C", bg: "rgba(255,92,92,0.12)", dot: "#FF5C5C" },
};

const formatVal = (val, currency) => {
  if (!val) return "-";
  return `${currency} ${Number(val).toLocaleString("en-IN")}`;
};

export default function BRCChecker() {
  const [records, setRecords] = useState(SAMPLE_DATA);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [newRecord, setNewRecord] = useState({
    sbNumber: "", sbDate: "", buyer: "", country: "", fobValue: "", currency: "USD", bank: "", irmNumber: "", brcNumber: "", status: "PENDING", realisationDate: ""
  });
  const fileRef = useRef();

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const stats = {
    total: records.length,
    done: records.filter(r => r.status === "DONE").length,
    pending: records.filter(r => r.status === "PENDING").length,
    overdue: records.filter(r => r.status === "OVERDUE").length,
    irmReceived: records.filter(r => r.status === "IRM_RECEIVED").length,
  };

  const filtered = records.filter(r => {
    const matchSearch = !search || r.sbNumber.toLowerCase().includes(search.toLowerCase()) || r.buyer.toLowerCase().includes(search.toLowerCase()) || r.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id, status) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    showNotif("Status update ho gaya!");
    setShowModal(false);
  };

  const addRecord = () => {
    if (!newRecord.sbNumber || !newRecord.buyer) { showNotif("Required fields bharo!", "error"); return; }
    setRecords(prev => [...prev, { ...newRecord, id: Date.now(), fobValue: parseFloat(newRecord.fobValue) || 0 }]);
    setNewRecord({ sbNumber: "", sbDate: "", buyer: "", country: "", fobValue: "", currency: "USD", bank: "", irmNumber: "", brcNumber: "", status: "PENDING", realisationDate: "" });
    setShowAddModal(false);
    showNotif("Record add ho gaya!");
  };

  const navItems = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "records", label: "📋 BRC Records" },
    { id: "alerts", label: "🔔 Alerts" },
    { id: "dgft", label: "⚡ DGFT Sync" },
  ];

  const s = {
    app: { fontFamily: "'Segoe UI', sans-serif", background: "#0D1117", minHeight: "100vh", color: "#E6EDF3", display: "flex" },
    sidebar: { width: 220, background: "#161B22", borderRight: "1px solid #21262D", padding: "24px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 },
    logo: { fontWeight: 700, fontSize: 18, color: "#00C896", padding: "0 8px 24px" },
    logoSub: { fontSize: 11, color: "#8B949E", marginTop: 2 },
    navItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, cursor: "pointer", color: active ? "#00C896" : "#8B949E", background: active ? "rgba(0,200,150,0.12)" : "transparent", fontSize: 14, fontWeight: 500 }),
    main: { flex: 1, overflow: "auto", padding: 28 },
    card: { background: "#161B22", border: "1px solid #21262D", borderRadius: 14, padding: 20 },
    badge: (status) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: STATUS_CONFIG[status].bg, color: STATUS_CONFIG[status].color }),
    btn: (type) => ({ padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", background: type === "primary" ? "#00C896" : "rgba(255,255,255,0.06)", color: type === "primary" ? "#0D1117" : "#E6EDF3" }),
    input: { background: "#21262D", border: "1px solid #30363D", color: "#E6EDF3", padding: "9px 13px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%" },
    modalBg: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
    modal: { background: "#161B22", border: "1px solid #30363D", borderRadius: 16, padding: 28, width: "90%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" },
  };

  return (
    <div style={s.app}>
      {/* Notification */}
      {notification && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 200, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: notification.type === "error" ? "#FF5C5C" : "#00C896", color: notification.type === "error" ? "#fff" : "#0D1117" }}>
          {notification.msg}
        </div>
      )}

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.logo}>
          BRC Tracker
          <div style={s.logoSub}>Export Compliance Tool</div>
        </div>
        {navItems.map(item => (
          <div key={item.id} style={s.navItem(activeTab === item.id)} onClick={() => setActiveTab(item.id)}>
            {item.label}
            {item.id === "alerts" && stats.overdue > 0 && (
              <span style={{ background: "#FF5C5C", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginLeft: "auto" }}>{stats.overdue}</span>
            )}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: "16px 8px 0", borderTop: "1px solid #21262D" }}>
          <div style={{ fontSize: 12, color: "#8B949E" }}>IEC Code</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>IEC0123456789</div>
          <div style={{ fontSize: 11, color: "#00C896", marginTop: 4 }}>● DGFT Connected</div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: "#8B949E", fontSize: 14, marginBottom: 24 }}>BRC status overview — sabkuch ek jagah</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Bills", value: stats.total, color: "#E6EDF3", icon: "📦" },
                { label: "BRC Done", value: stats.done, color: "#00C896", icon: "✅" },
                { label: "Pending", value: stats.pending, color: "#F5A623", icon: "⏳" },
                { label: "IRM Received", value: stats.irmReceived, color: "#4FC3F7", icon: "🔄" },
                { label: "Overdue", value: stats.overdue, color: "#FF5C5C", icon: "❌" },
              ].map((st, i) => (
                <div key={i} style={{ ...s.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#8B949E", marginBottom: 8 }}>{st.label}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: st.color }}>{st.value}</div>
                    </div>
                    <span style={{ fontSize: 24 }}>{st.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {stats.overdue > 0 && (
              <div style={{ background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🚨</span>
                <div>
                  <div style={{ fontWeight: 600, color: "#FF5C5C" }}>{stats.overdue} Overdue BRC — Turant action lo!</div>
                  <div style={{ fontSize: 13, color: "#8B949E", marginTop: 2 }}>6-month window cross ho gayi. DGFT penalty aa sakti hai.</div>
                </div>
                <button style={{ ...s.btn("danger"), marginLeft: "auto", background: "rgba(255,92,92,0.15)", color: "#FF5C5C" }} onClick={() => { setFilterStatus("OVERDUE"); setActiveTab("records"); }}>View All →</button>
              </div>
            )}

            <div style={s.card}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Records</div>
              {records.slice(0, 5).map(r => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #21262D" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.sbNumber}</div>
                    <div style={{ fontSize: 12, color: "#8B949E" }}>{r.buyer} • {r.country}</div>
                  </div>
                  <span style={s.badge(r.status)}>{STATUS_CONFIG[r.status].label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECORDS */}
        {activeTab === "records" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>BRC Records</h1>
                <p style={{ color: "#8B949E", fontSize: 14 }}>Sabhi shipping bills aur BRC status</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input ref={fileRef} type="file" accept=".xlsx,.csv" style={{ display: "none" }} />
                <button style={s.btn("ghost")} onClick={() => fileRef.current.click()}>📁 Excel Upload</button>
                <button style={s.btn("primary")} onClick={() => setShowAddModal(true)}>+ Add Record</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <input style={{ ...s.input, maxWidth: 300 }} placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...s.input, maxWidth: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="DONE">BRC Done ✅</option>
                <option value="IRM_RECEIVED">IRM Received 🔄</option>
                <option value="PENDING">Pending ⏳</option>
                <option value="OVERDUE">Overdue ❌</option>
              </select>
            </div>

            <div style={{ ...s.card, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #21262D" }}>
                    {["SB Number", "Buyer / Country", "FOB Value", "Bank", "IRM", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, color: "#8B949E", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #21262D" }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600 }}>{r.sbNumber}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13 }}>{r.buyer}</div>
                        <div style={{ fontSize: 12, color: "#8B949E" }}>{r.country}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13 }}>{formatVal(r.fobValue, r.currency)}</td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#8B949E" }}>{r.bank || "-"}</td>
                      <td style={{ padding: "14px 16px", fontSize: 12 }}>
                        {r.irmNumber ? <span style={{ color: "#4FC3F7" }}>✓ Received</span> : <span style={{ color: "#8B949E" }}>Pending</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={s.badge(r.status)}>{STATUS_CONFIG[r.status].label}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button style={{ ...s.btn("ghost"), padding: "6px 12px", fontSize: 12 }} onClick={() => { setSelectedRecord(r); setShowModal(true); }}>Update</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === "alerts" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Alert Center</h1>
            <p style={{ color: "#8B949E", fontSize: 14, marginBottom: 24 }}>Pending BRC ke liye reminders</p>
            {records.filter(r => r.status !== "DONE").map(r => (
              <div key={r.id} style={{ ...s.card, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: STATUS_CONFIG[r.status].bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {r.status === "OVERDUE" ? "❌" : r.status === "IRM_RECEIVED" ? "🔄" : "⏳"}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.sbNumber}</div>
                    <div style={{ fontSize: 12, color: "#8B949E" }}>{r.buyer} • {r.country}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...s.btn("ghost"), fontSize: 12 }} onClick={() => showNotif(`📧 Bank email draft ho gaya!`)}>📧 Email Bank</button>
                  <button style={{ ...s.btn("ghost"), fontSize: 12 }} onClick={() => showNotif(`📱 WhatsApp reminder bheja!`)}>📱 WhatsApp</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DGFT */}
        {activeTab === "dgft" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>DGFT Sync</h1>
            <p style={{ color: "#8B949E", fontSize: 14, marginBottom: 24 }}>Government portal se real-time data</p>
            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#00C896", display: "inline-block" }} />
                <span style={{ color: "#00C896", fontWeight: 600 }}>DGFT Portal Connected</span>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Sync IRM Data", "Fetch eBRC Status", "Update Shipping Bills"].map(action => (
                  <button key={action} style={s.btn("ghost")} onClick={() => showNotif(`⚡ ${action} — Processing...`)}>⚡ {action}</button>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>API Key Setup</div>
              <div style={{ display: "flex", gap: 12 }}>
                <input style={s.input} placeholder="DGFT API Key daalo..." />
                <button style={{ ...s.btn("primary"), whiteSpace: "nowrap" }} onClick={() => showNotif("✅ API Key save ho gayi!")}>Save & Test</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showModal && selectedRecord && (
        <div style={s.modalBg} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>BRC Status Update</div>
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#8B949E", display: "block", marginBottom: 6 }}>New Status</label>
                <select style={s.input} id="status-sel" defaultValue={selectedRecord.status}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ ...s.btn("primary"), flex: 1 }} onClick={() => updateStatus(selectedRecord.id, document.getElementById("status-sel").value)}>Update</button>
                <button style={s.btn("ghost")} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={s.modalBg} onClick={() => setShowAddModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Naya Record Add Karo</div>
            <div style={{ display: "grid", gap: 12 }}>
              {[["SB Number *", "sbNumber"], ["SB Date", "sbDate"], ["Buyer Name *", "buyer"], ["Country", "country"], ["FOB Value", "fobValue"], ["Bank Name", "bank"], ["IRM Number", "irmNumber"], ["BRC Number", "brcNumber"]].map(([label, field]) => (
                <div key={field}>
                  <label style={{ fontSize: 12, color: "#8B949E", display: "block", marginBottom: 6 }}>{label}</label>
                  <input style={s.input} type={field === "sbDate" ? "date" : "text"} value={newRecord[field]} onChange={e => setNewRecord(p => ({ ...p, [field]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button style={{ ...s.btn("primary"), flex: 1 }} onClick={addRecord}>Add Karo</button>
                <button style={s.btn("ghost")} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
