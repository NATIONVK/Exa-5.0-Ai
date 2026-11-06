import { useEffect, useRef, useState } from "react";
import { Activity, ArrowUp, Bot, BrainCircuit, ChevronDown, Cpu, Menu, MessageSquare, Plus, Settings2, ShieldCheck, Sparkles, Trash2, Wifi, X } from "lucide-react";

const API = import.meta.env.VITE_API_BASE || "";
const copy = {
  en: { workspace: "WORKSPACE", newChat: "New conversation", history: "Recent conversations", welcome: "Intelligence, connected.", subtitle: "Your personal AI workspace is ready.", hint: "Ask NEXUS anything. Your API keys stay on the server.", placeholder: "Message NEXUS AI...", send: "Send", thinking: "NEXUS is thinking…", empty: "No conversations yet", settings: "AI Settings", online: "API online", offline: "API offline", choose: "Choose an AI provider", gemini: "Google Gemini", openai: "OpenAI", save: "Apply provider", configured: "Configured", missing: "Needs API key", error: "Something went wrong" },
  bn: { workspace: "ওয়ার্কস্পেস", newChat: "নতুন কথোপকথন", history: "সাম্প্রতিক কথোপকথন", welcome: "বুদ্ধিমত্তা, এখন একসঙ্গে।", subtitle: "তোর ব্যক্তিগত AI workspace প্রস্তুত।", hint: "NEXUS-কে যেকোনো প্রশ্ন কর। API key সার্ভারেই সুরক্ষিত থাকে।", placeholder: "NEXUS AI-কে মেসেজ কর...", send: "পাঠাও", thinking: "NEXUS ভাবছে…", empty: "এখনো কোনো কথোপকথন নেই", settings: "AI সেটিংস", online: "API অনলাইন", offline: "API অফলাইন", choose: "AI Provider নির্বাচন কর", gemini: "Google Gemini", openai: "OpenAI", save: "Provider প্রয়োগ কর", configured: "কনফিগার করা", missing: "API key প্রয়োজন", error: "একটি সমস্যা হয়েছে" }
};

export default function App() {
  const [lang, setLang] = useState("bn");
  const [provider, setProvider] = useState("gemini");
  const [providers, setProviders] = useState({});
  const [health, setHealth] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef(null);
  const t = copy[lang];

  async function refresh() {
    try {
      const [h, p, c] = await Promise.all([fetch(`${API}/api/health`), fetch(`${API}/api/providers`), fetch(`${API}/api/conversations`)]);
      setHealth(h.ok);
      if (p.ok) setProviders(await p.json());
      if (c.ok) setConversations(await c.json());
    } catch { setHealth(false); }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function newChat() { setConversationId(null); setMessages([]); setError(""); setSidebarOpen(false); }
  async function openConversation(id) {
    try {
      const r = await fetch(`${API}/api/conversations/${id}`);
      if (!r.ok) throw new Error("Could not load conversation.");
      const data = await r.json();
      setConversationId(id); setMessages(data.messages || []); setError(""); setSidebarOpen(false);
    } catch (e) { setError(e.message); }
  }
  async function removeConversation(id) {
    if (!confirm(lang === "bn" ? "এই কথোপকথন মুছে ফেলবে?" : "Delete this conversation?")) return;
    await fetch(`${API}/api/conversations/${id}`, { method: "DELETE" });
    if (conversationId === id) newChat();
    refresh();
  }
  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setError(""); setInput(""); setBusy(true);
    const optimistic = [...messages, { id: crypto.randomUUID(), role: "user", content: text }];
    setMessages(optimistic);
    try {
      const response = await fetch(`${API}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, message: text, provider }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setConversationId(data.conversationId);
      setMessages(prev => [...prev, data.reply]);
      refresh();
    } catch (e) { setError(e.message); setInput(text); }
    finally { setBusy(false); }
  }
  function onKeyDown(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }

  return <div className="shell">
    <aside className={`sidebar ${sidebarOpen ? "show" : ""}`}>
      <div className="brand"><div className="brand-mark"><BrainCircuit size={22}/></div><div><b>NEXUS<span>AI</span></b><small>PERSONAL INTELLIGENCE</small></div><button className="icon-btn mobile-close" onClick={() => setSidebarOpen(false)}><X/></button></div>
      <button className="new-chat" onClick={newChat}><Plus size={17}/>{t.newChat}</button>
      <div className="side-label">{t.workspace}</div>
      <div className="nav-item active"><MessageSquare size={16}/>AI Workspace</div>
      <div className="nav-item" onClick={() => setSettingsOpen(true)}><Settings2 size={16}/>{t.settings}</div>
      <div className="side-label history-label">{t.history}</div>
      <div className="history-list">{conversations.map(c => <div className={`history-item ${conversationId === c.id ? "selected" : ""}`} key={c.id}><button onClick={() => openConversation(c.id)}>{c.title || c.preview || "Conversation"}</button><button className="delete-btn" onClick={() => removeConversation(c.id)} aria-label="Delete"><Trash2 size={13}/></button></div>)}
      {!conversations.length && <p className="muted tiny">{t.empty}</p>}</div>
      <div className="sidebar-bottom"><div className="profile-orb">J</div><div><b>Personal Workspace</b><small>Local profile · v0.1.0</small></div><button className="icon-btn" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "EN" : "বাং"}</button></div>
    </aside>
    {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)}/>}
    <main className="main">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu/></button><div className="breadcrumb">NEXUS <span>/</span> <b>AI Workspace</b></div><div className="top-actions"><div className={`status ${health ? "good" : "bad"}`}><span/>{health ? t.online : t.offline}</div><button className="icon-btn" onClick={() => setSettingsOpen(true)}><Settings2 size={18}/></button></div></header>
      <section className="chat-area">
        {!messages.length ? <div className="welcome"><div className="core-wrap"><div className="core-ring ring-one"/><div className="core-ring ring-two"/><div className="core"><BrainCircuit size={42}/><span/></div><div className="core-pulse"/></div><div className="eyebrow"><Sparkles size={13}/> PERSONAL INTELLIGENCE SYSTEM</div><h1>{t.welcome}</h1><p>{t.subtitle}</p><div className="suggestions"><button onClick={() => setInput(lang === "bn" ? "আমাকে NEXUS AI-এর capabilities বুঝিয়ে বলো।" : "Explain what NEXUS AI can do.")}> <Cpu size={15}/> Explore NEXUS</button><button onClick={() => setInput(lang === "bn" ? "আমার জন্য একটি project plan তৈরি কর।" : "Create a project plan for me.")}><Activity size={15}/> Plan a project</button><button onClick={() => setInput(lang === "bn" ? "একটি বিষয় নিয়ে research শুরু কর।" : "Help me research a topic.")}><ShieldCheck size={15}/> Research</button></div><small className="hint">{t.hint}</small></div> : <div className="messages">{messages.map(m => <div className={`message ${m.role}`} key={m.id}><div className="avatar">{m.role === "assistant" ? <BrainCircuit size={17}/> : "J"}</div><div className="bubble-wrap"><div className="message-label">{m.role === "assistant" ? "NEXUS AI" : "YOU"}</div><div className="bubble">{m.content}</div>{m.provider && <div className="message-meta">{m.provider} · {m.model}</div>}</div></div>)}{busy && <div className="message assistant"><div className="avatar"><BrainCircuit size={17}/></div><div className="bubble-wrap"><div className="message-label">NEXUS AI</div><div className="bubble thinking"><span/><span/><span/> {t.thinking}</div></div></div>}<div ref={endRef}/></div>}
        {error && <div className="error-banner">{t.error}: {error}</div>}
      </section>
      <footer className="composer-wrap"><div className="composer"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={t.placeholder} rows={1} disabled={busy}/><div className="composer-bottom"><div className="provider-pill"><span className="provider-dot"/> {provider === "gemini" ? "Gemini" : "OpenAI"} <ChevronDown size={13}/><select aria-label="Provider" value={provider} onChange={e => setProvider(e.target.value)}><option value="gemini">Gemini</option><option value="openai">OpenAI</option></select></div><button className="send-btn" onClick={send} disabled={busy || !input.trim()}><ArrowUp size={17}/></button></div></div><p className="disclaimer">NEXUS AI can make mistakes. Verify important information.</p></footer>
    </main>
    {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}><div className="settings-modal" onClick={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">CONFIGURATION</span><h2>{t.settings}</h2></div><button className="icon-btn" onClick={() => setSettingsOpen(false)}><X/></button></div><p className="muted">{t.choose}</p>{Object.entries(providers).map(([key, value]) => <div className="provider-row" key={key}><div className="provider-logo">{key === "gemini" ? "✦" : "◎"}</div><div className="provider-info"><b>{key === "gemini" ? t.gemini : t.openai}</b><small>{value.model}</small></div><span className={`config-state ${value.configured ? "configured" : ""}`}>{value.configured ? t.configured : t.missing}</span></div>)}<div className="settings-note">API credentials are configured on the server using environment secrets. They are never stored in this browser.</div><button className="new-chat modal-done" onClick={() => setSettingsOpen(false)}>Done</button></div></div>}
  </div>;
}