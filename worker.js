// ════════════════════════════════════════════════════════
//  VirBro — Cloudflare Worker
//  • GET  /*              → serves the HTML app
//  • POST /api/hb-session → proxies to Hyperbeam API
// ════════════════════════════════════════════════════════

const HB_API_KEY = 'sk_test_sJTS3MT3ltGA2Z-LCbKnEra9izw6IXAkRXbZHjfhGv0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // ── CORS preflight ──
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // ── Hyperbeam session proxy ──
    if (url.pathname === '/api/hb-session' && request.method === 'POST') {
      try {
        const body = await request.json();
        const hbResp = await fetch('https://engine.hyperbeam.com/v0/vm', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HB_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const text = await hbResp.text();
        return new Response(text, {
          status: hbResp.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Serve HTML app ──
    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};

// ════════════════════════════════════════════════════════
//  HTML — inlined so the single Worker file is self-contained
// ════════════════════════════════════════════════════════
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VirBro — Watch Together</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <style>
    /* ── RESET & BASE ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:        #090c14;
      --surface:   #101420;
      --panel:     #141926;
      --border:    rgba(255,255,255,.07);
      --accent:    #4af0c4;
      --accent2:   #6c7eff;
      --accent3:   #ff6b9d;
      --text:      #e8eaf2;
      --muted:     #5a627a;
      --chrome-h:  42px;
      --tab-h:     38px;
      --sidebar-w: 220px;
      --radius:    10px;
    }
    html, body { height: 100%; overflow: hidden; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

    /* ── LANDING PAGE ── */
    #landing {
      position: fixed; inset: 0; z-index: 100;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: var(--bg);
      animation: fadeIn .6s ease both;
    }
    @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
    #landing .noise {
      position: absolute; inset: 0; opacity: .03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 200px;
    }
    #landing .glow {
      position: absolute; width: 700px; height: 400px; border-radius: 50%;
      background: radial-gradient(ellipse, rgba(74,240,196,.12) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%, -60%); pointer-events: none;
    }
    #landing .glow2 {
      position: absolute; width: 500px; height: 300px; border-radius: 50%;
      background: radial-gradient(ellipse, rgba(108,126,255,.1) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-30%, -30%); pointer-events: none;
    }
    .brand { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 3.2rem; letter-spacing: -.03em; position: relative; z-index:1; }
    .brand span { color: var(--accent); }
    .tagline { font-family: 'DM Mono', monospace; font-size: .78rem; color: var(--muted); letter-spacing: .12em; text-transform: uppercase; margin-top: 8px; position: relative; z-index:1; }
    .landing-card {
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 18px; padding: 36px 40px; width: 460px; margin-top: 40px;
      position: relative; z-index:1;
      box-shadow: 0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(74,240,196,.05);
    }
    .landing-card h2 { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
    .landing-card p  { font-size: .82rem; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }
    .input-label { font-family: 'DM Mono', monospace; font-size: .65rem; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .url-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .url-row input {
      flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
      padding: 10px 14px; color: var(--text); font-family: 'DM Mono', monospace; font-size: .8rem;
      outline: none; transition: border-color .2s;
    }
    .url-row input:focus { border-color: var(--accent); }
    .url-row input::placeholder { color: var(--muted); }
    .btn-launch {
      background: var(--accent); color: #050a0e; border: none; border-radius: 8px;
      padding: 10px 18px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .82rem;
      cursor: pointer; white-space: nowrap; transition: opacity .15s, transform .15s;
    }
    .btn-launch:hover { opacity: .85; transform: translateY(-1px); }
    .btn-launch:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .quick-links { margin-top: 4px; margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 8px; }
    .quick-link {
      background: var(--surface); border: 1px solid var(--border); border-radius: 6px;
      padding: 5px 10px; font-size: .73rem; font-family: 'DM Mono', monospace; color: var(--muted);
      cursor: pointer; transition: border-color .2s, color .2s;
    }
    .quick-link:hover { border-color: var(--accent); color: var(--accent); }
    .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0 20px; }
    .divider span { font-size: .7rem; font-family: 'DM Mono', monospace; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; white-space: nowrap; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .session-row { display: flex; gap: 8px; }
    .session-row input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text); font-family: 'DM Mono', monospace; font-size: .78rem; outline: none; transition: border-color .2s; }
    .session-row input:focus { border-color: var(--accent2); }
    .btn-join { background: var(--accent2); color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: .82rem; cursor: pointer; transition: opacity .15s; }
    .btn-join:hover { opacity: .85; }

    /* ── LOADING OVERLAY ── */
    #loading-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: var(--bg);
      display: none; align-items: center; justify-content: center; flex-direction: column; gap: 20px;
    }
    #loading-overlay.show { display: flex; }
    .spinner {
      width: 44px; height: 44px; border-radius: 50%;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-family: 'DM Mono', monospace; font-size: .8rem; color: var(--muted); }

    /* ── APP SHELL ── */
    #app { display: none; height: 100vh; flex-direction: column; }
    #app.visible { display: flex; }

    /* ── TOP CHROME ── */
    #chrome {
      height: var(--chrome-h); background: var(--panel);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px; padding: 0 12px; flex-shrink: 0;
    }
    .chrome-btn {
      width: 30px; height: 30px; border-radius: 7px; border: none;
      background: var(--surface); color: var(--muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; transition: color .15s, background .15s;
    }
    .chrome-btn:hover { background: rgba(255,255,255,.07); color: var(--text); }
    #omnibox-wrap {
      flex: 1; position: relative; display: flex; align-items: center;
    }
    #omnibox-icon { position: absolute; left: 12px; color: var(--muted); font-size: 13px; pointer-events: none; }
    #omnibox {
      width: 100%; height: 30px; background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 0 14px 0 34px; color: var(--text);
      font-family: 'DM Mono', monospace; font-size: .78rem; outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    #omnibox:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(74,240,196,.1); }
    .chrome-right { display: flex; align-items: center; gap: 6px; }
    .session-pill {
      background: rgba(74,240,196,.1); border: 1px solid rgba(74,240,196,.2);
      border-radius: 20px; padding: 3px 12px 3px 8px;
      display: flex; align-items: center; gap: 6px; cursor: pointer;
      font-family: 'DM Mono', monospace; font-size: .7rem; color: var(--accent);
      transition: background .15s;
    }
    .session-pill:hover { background: rgba(74,240,196,.18); }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: pulse 2s ease infinite; }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
    .user-count {
      background: rgba(108,126,255,.15); border: 1px solid rgba(108,126,255,.25);
      border-radius: 20px; padding: 3px 10px; font-family: 'DM Mono', monospace;
      font-size: .7rem; color: var(--accent2); display: flex; align-items: center; gap: 5px;
    }

    /* ── TAB BAR ── */
    #tabbar {
      height: var(--tab-h); background: var(--surface); border-bottom: 1px solid var(--border);
      display: flex; align-items: flex-end; padding: 0 8px; gap: 2px; flex-shrink: 0; overflow-x: auto;
    }
    #tabbar::-webkit-scrollbar { height: 3px; }
    #tabbar::-webkit-scrollbar-track { background: transparent; }
    #tabbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    .tab {
      height: 32px; min-width: 130px; max-width: 200px; border-radius: 8px 8px 0 0;
      display: flex; align-items: center; gap: 7px; padding: 0 10px;
      font-size: .73rem; color: var(--muted); cursor: pointer; flex-shrink: 0;
      transition: background .15s, color .15s; position: relative; overflow: hidden;
      white-space: nowrap;
    }
    .tab:hover { background: rgba(255,255,255,.04); color: var(--text); }
    .tab.active { background: var(--panel); color: var(--text); }
    .tab .tab-favicon { font-size: 12px; flex-shrink: 0; }
    .tab .tab-title { flex: 1; overflow: hidden; text-overflow: ellipsis; }
    .tab .tab-close {
      width: 16px; height: 16px; border-radius: 4px; display: flex; align-items: center;
      justify-content: center; font-size: 10px; flex-shrink: 0; opacity: 0;
      transition: opacity .15s, background .15s;
    }
    .tab:hover .tab-close, .tab.active .tab-close { opacity: 1; }
    .tab .tab-close:hover { background: rgba(255,255,255,.1); }
    #new-tab-btn {
      width: 28px; height: 28px; border-radius: 6px; border: 1px dashed var(--border);
      background: transparent; color: var(--muted); cursor: pointer; margin-bottom: 4px; margin-left: 4px;
      display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
      transition: border-color .15s, color .15s;
    }
    #new-tab-btn:hover { border-color: var(--accent); color: var(--accent); }

    /* ── MAIN AREA ── */
    #main { display: flex; flex: 1; overflow: hidden; }

    /* ── SIDEBAR ── */
    #sidebar {
      width: var(--sidebar-w); background: var(--panel); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; flex-shrink: 0; transition: width .25s; overflow: hidden;
    }
    #sidebar.collapsed { width: 0; }
    .sidebar-section { padding: 14px 14px 8px; }
    .sidebar-label { font-family: 'DM Mono', monospace; font-size: .62rem; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); margin-bottom: 8px; }
    .sidebar-item {
      display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 7px;
      font-size: .78rem; color: var(--muted); cursor: pointer; transition: background .15s, color .15s;
      white-space: nowrap; overflow: hidden;
    }
    .sidebar-item:hover { background: rgba(255,255,255,.05); color: var(--text); }
    .sidebar-item.active { background: rgba(74,240,196,.08); color: var(--accent); }
    .sidebar-item .icon { font-size: 14px; flex-shrink: 0; }
    .sidebar-divider { height: 1px; background: var(--border); margin: 8px 14px; }
    .users-list { padding: 0 14px 14px; }
    .user-item {
      display: flex; align-items: center; gap: 8px; padding: 6px 0;
      font-size: .75rem; color: var(--text);
    }
    .avatar {
      width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: .65rem; font-weight: 700; flex-shrink: 0;
    }
    .user-status { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

    /* ── VIEWPORT ── */
    #viewport { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
    #hb-container {
      flex: 1;
      position: relative;
      background: #000;
      overflow: hidden;
    }
    #hb-container > div,
    #hb-container canvas,
    #hb-container video {
      width: 100% !important;
      height: 100% !important;
    }

    /* ── STATUS BAR ── */
    #statusbar {
      height: 26px; background: var(--surface); border-top: 1px solid var(--border);
      display: flex; align-items: center; padding: 0 14px; gap: 20px; flex-shrink: 0;
    }
    .status-item { display: flex; align-items: center; gap: 5px; font-family: 'DM Mono', monospace; font-size: .65rem; color: var(--muted); }
    .status-dot { width: 5px; height: 5px; border-radius: 50%; }
    .green { background: var(--accent); }
    .blue  { background: var(--accent2); }
    .orange { background: #ffc96b; }

    /* ── CHAT PANEL ── */
    #chat-panel {
      width: 0; background: var(--panel); border-left: 1px solid var(--border);
      display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0;
      transition: width .25s;
    }
    #chat-panel.open { width: 260px; }
    .chat-header { padding: 14px 14px 10px; border-bottom: 1px solid var(--border); font-family: 'Syne', sans-serif; font-size: .85rem; font-weight: 700; display: flex; align-items: center; justify-content: space-between; }
    .chat-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 14px; }
    #chat-messages { flex: 1; overflow-y: auto; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
    #chat-messages::-webkit-scrollbar { width: 3px; }
    #chat-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
    .msg { display: flex; flex-direction: column; gap: 2px; }
    .msg-author { font-family: 'DM Mono', monospace; font-size: .62rem; color: var(--muted); }
    .msg-text { font-size: .78rem; color: var(--text); line-height: 1.5; background: var(--surface); border-radius: 0 8px 8px 8px; padding: 7px 10px; }
    .msg.me .msg-text { background: rgba(74,240,196,.1); border-radius: 8px 0 8px 8px; }
    .msg.me .msg-author { text-align: right; color: var(--accent); }
    .chat-input-wrap { padding: 10px 14px; border-top: 1px solid var(--border); display: flex; gap: 6px; }
    .chat-input { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 7px; padding: 7px 10px; color: var(--text); font-size: .78rem; outline: none; transition: border-color .2s; }
    .chat-input:focus { border-color: var(--accent); }
    .chat-send { width: 30px; height: 30px; background: var(--accent); border: none; border-radius: 7px; cursor: pointer; color: #050a0e; font-size: 13px; display: flex; align-items: center; justify-content: center; }

    /* ── VOLUME CONTROL ── */
    .volume-wrap { display: flex; align-items: center; gap: 6px; }
    .volume-wrap input[type=range] {
      width: 70px; height: 3px; -webkit-appearance: none; appearance: none;
      background: var(--border); border-radius: 2px; outline: none; cursor: pointer;
    }
    .volume-wrap input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 11px; height: 11px; border-radius: 50%;
      background: var(--accent); cursor: pointer;
    }

    /* ── TOAST ── */
    #toast {
      position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
      padding: 10px 20px; font-family: 'DM Mono', monospace; font-size: .75rem; color: var(--text);
      opacity: 0; transition: opacity .3s, transform .3s; pointer-events: none; z-index: 1000; white-space: nowrap;
    }
    #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* ── MODAL ── */
    #modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 200;
      display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px);
    }
    #modal-overlay.open { display: flex; }
    .modal {
      background: var(--panel); border: 1px solid var(--border); border-radius: 16px;
      padding: 28px 32px; width: 420px; animation: fadeIn .25s ease both;
    }
    .modal h3 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
    .modal p { font-size: .8rem; color: var(--muted); margin-bottom: 18px; line-height: 1.6; }
    .modal-link-box { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-family: 'DM Mono', monospace; font-size: .73rem; color: var(--accent); word-break: break-all; margin-bottom: 14px; }
    .modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
    .btn-sm { background: var(--surface); border: 1px solid var(--border); border-radius: 7px; padding: 7px 14px; font-family: 'Syne', sans-serif; font-size: .78rem; font-weight: 600; color: var(--text); cursor: pointer; transition: background .15s; }
    .btn-sm:hover { background: rgba(255,255,255,.07); }
    .btn-sm.primary { background: var(--accent); border-color: var(--accent); color: #050a0e; }
    .btn-sm.primary:hover { opacity: .85; }

    /* ── SCROLLBAR GLOBAL ── */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  </style>
</head>
<body>

<!-- ══════════════ LOADING OVERLAY ══════════════ -->
<div id="loading-overlay">
  <div class="spinner"></div>
  <div class="loading-text" id="loading-text">Starting virtual browser…</div>
</div>

<!-- ══════════════ LANDING ══════════════ -->
<div id="landing">
  <div class="noise"></div>
  <div class="glow"></div>
  <div class="glow2"></div>

  <div class="brand">Vir<span>Bro</span></div>
  <div class="tagline">Watch videos &amp; browse together, in real time</div>

  <div class="landing-card">
    <h2>Start a new session</h2>
    <p>Opens a real cloud browser that you and your friends can watch and control together. Powered by Hyperbeam.</p>

    <div class="input-label">Start URL</div>
    <div class="url-row">
      <input id="start-url" type="text" placeholder="https://www.youtube.com" />
    </div>

    <div class="quick-links">
      <div class="quick-link" onclick="setUrl('https://www.youtube.com')">▶ YouTube</div>
      <div class="quick-link" onclick="setUrl('https://www.netflix.com')">🎬 Netflix</div>
      <div class="quick-link" onclick="setUrl('https://www.twitch.tv')">🎮 Twitch</div>
      <div class="quick-link" onclick="setUrl('https://www.reddit.com')">🟠 Reddit</div>
      <div class="quick-link" onclick="setUrl('https://www.google.com')">🔍 Google</div>
      <div class="quick-link" onclick="setUrl('https://www.github.com')">💻 GitHub</div>
    </div>

    <div class="url-row" style="margin-bottom:0;">
      <button class="btn-launch" style="width:100%;" onclick="launchBrowser()">🚀 Launch Session</button>
    </div>

    <div class="divider"><span>or join existing session</span></div>

    <div class="session-row">
      <input id="join-embed" type="text" placeholder="Paste session link here…" />
      <button class="btn-join" onclick="joinSession()">Join</button>
    </div>
  </div>
</div>

<!-- ══════════════ APP SHELL ══════════════ -->
<div id="app">

  <!-- TOP CHROME -->
  <div id="chrome">
    <button class="chrome-btn" title="Toggle sidebar" onclick="toggleSidebar()">☰</button>
    <button class="chrome-btn" title="Back" onclick="navBack()">←</button>
    <button class="chrome-btn" title="Forward" onclick="navForward()">→</button>
    <button class="chrome-btn" title="Reload" onclick="navReload()">↻</button>
    <div id="omnibox-wrap">
      <span id="omnibox-icon">🔒</span>
      <input id="omnibox" type="text" placeholder="Navigate to URL…"
        onkeydown="if(event.key==='Enter') navigateTo(this.value)"
      />
    </div>
    <div class="chrome-right">
      <div class="volume-wrap" title="Volume">
        🔊
        <input type="range" id="vol-slider" min="0" max="100" value="100" oninput="setVolume(this.value)" />
      </div>
      <div class="session-pill" title="Copy session link" onclick="copySessionLink()">
        <div class="dot"></div>
        <span id="session-label">Live</span>
      </div>
      <div class="user-count">
        <span>👥</span>
        <span id="user-count-val">1</span>
      </div>
      <button class="chrome-btn" title="Chat" onclick="toggleChat()">💬</button>
      <button class="chrome-btn" title="Share" onclick="openShareModal()">🔗</button>
      <button class="chrome-btn" title="Home" onclick="goHome()">⌂</button>
    </div>
  </div>

  <!-- TAB BAR -->
  <div id="tabbar">
    <button id="new-tab-btn" title="New tab" onclick="newTab()">+</button>
  </div>

  <!-- MAIN -->
  <div id="main">

    <!-- SIDEBAR -->
    <div id="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Navigation</div>
        <div class="sidebar-item active">
          <span class="icon">🎬</span> Watch Together
        </div>
        <div class="sidebar-item" onclick="navigateTo('https://www.youtube.com')">
          <span class="icon">▶️</span> YouTube
        </div>
        <div class="sidebar-item" onclick="navigateTo('https://www.netflix.com')">
          <span class="icon">📺</span> Netflix
        </div>
        <div class="sidebar-item" onclick="navigateTo('https://www.twitch.tv')">
          <span class="icon">🎮</span> Twitch
        </div>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sidebar-section">
        <div class="sidebar-label" style="margin-bottom:4px;">In this session</div>
      </div>
      <div class="users-list" id="users-list"></div>
    </div>

    <!-- VIEWPORT -->
    <div id="viewport">
      <div id="hb-container"></div>

      <!-- STATUS BAR -->
      <div id="statusbar">
        <div class="status-item"><div class="status-dot green"></div> <span id="conn-status">Connected</span></div>
        <div class="status-item"><div class="status-dot blue"></div> <span id="status-url">Ready</span></div>
        <div class="status-item" style="margin-left:auto;">
          <span id="load-time"></span>
        </div>
      </div>
    </div>

    <!-- CHAT PANEL -->
    <div id="chat-panel">
      <div class="chat-header">
        💬 Chat
        <button class="chat-close" onclick="toggleChat()">✕</button>
      </div>
      <div id="chat-messages"></div>
      <div class="chat-input-wrap">
        <input class="chat-input" id="chat-input" type="text" placeholder="Say something…"
          onkeydown="if(event.key==='Enter') sendChat()" />
        <button class="chat-send" onclick="sendChat()">↑</button>
      </div>
    </div>

  </div><!-- /main -->
</div><!-- /app -->

<!-- SHARE MODAL -->
<div id="modal-overlay">
  <div class="modal">
    <h3>🔗 Invite to session</h3>
    <p>Share this link with your friends. They'll join the same live virtual browser session instantly!</p>
    <div class="modal-link-box" id="modal-link"></div>
    <div class="modal-btns">
      <button class="btn-sm" onclick="closeModal()">Close</button>
      <button class="btn-sm primary" onclick="copyModalLink()">Copy Link</button>
    </div>
  </div>
</div>

<!-- TOAST -->
<div id="toast"></div>

<!-- Hyperbeam SDK -->
<script type="module">
import Hyperbeam from 'https://unpkg.com/@hyperbeam/web@latest/dist/index.js';

// ── STATE ──
const state = {
  embedUrl: '',
  adminToken: '',
  currentUrl: '',
  sidebarOpen: true,
  chatOpen: false,
  hb: null,
};

// ── CHECK URL PARAMS (joining an existing session) ──
(function checkJoinParams() {
  const params = new URLSearchParams(location.search);
  const embed = params.get('embed');
  if (embed) {
    document.getElementById('join-embed').value = decodeURIComponent(embed);
    const startUrl = params.get('url');
    if (startUrl) document.getElementById('start-url').value = decodeURIComponent(startUrl);
    showToast('Session found — click Join to connect!');
  }
})();

// ── LANDING ──
window.setUrl = function(url) {
  document.getElementById('start-url').value = url;
};

window.launchBrowser = async function() {
  const rawUrl = document.getElementById('start-url').value.trim();
  if (!rawUrl) { showToast('Enter a URL first'); return; }
  const url = normalizeUrl(rawUrl);

  showLoading('Starting virtual browser…');

  try {
    // POST to our Worker's proxy endpoint — no CORS issues, API key stays server-side
    const resp = await fetch('/api/hb-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_url: url,
        search_engine: 'google',
        dark: true,
        fps: 24,
        adblock: true,
        timeout: { offline: 7200, inactive: 3600 },
        touch_gestures: { swipe: true, pinch: true },
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error('Hyperbeam API error ' + resp.status + ': ' + err);
    }

    const data = await resp.json();
    state.embedUrl   = data.embed_url;
    state.adminToken = data.admin_token || '';
    state.currentUrl = url;

    await startApp();
  } catch (err) {
    hideLoading();
    console.error(err);
    showToast('Error: ' + err.message.slice(0, 80));
  }
};

window.joinSession = async function() {
  const input = document.getElementById('join-embed').value.trim();
  if (!input) { showToast('Paste a session link first'); return; }

  let embedUrl = input;
  try {
    const parsed = new URL(input);
    const embed = parsed.searchParams.get('embed');
    if (embed) embedUrl = decodeURIComponent(embed);
  } catch(e) {}

  if (!embedUrl.includes('hyperbeam.com')) {
    showToast('Invalid session link — must be a Hyperbeam URL');
    return;
  }

  state.embedUrl   = embedUrl;
  state.currentUrl = document.getElementById('start-url').value.trim() || 'about:blank';

  showLoading('Joining session…');
  await startApp();
};

// ── START APP ──
async function startApp() {
  document.getElementById('landing').style.transition = 'opacity .4s';
  document.getElementById('landing').style.opacity   = '0';
  await delay(400);
  document.getElementById('landing').style.display = 'none';
  document.getElementById('app').classList.add('visible');
  hideLoading();

  document.getElementById('omnibox').value        = state.currentUrl;
  document.getElementById('status-url').textContent = getDomain(state.currentUrl);

  const container = document.getElementById('hb-container');
  const t0 = Date.now();

  try {
    state.hb = await Hyperbeam(container, state.embedUrl, {
      adminToken: state.adminToken || undefined,
      volume: 1.0,
      onDisconnect({ type }) {
        const msgs = {
          request:  'Session ended.',
          inactive: 'Session ended due to inactivity.',
          absolute: 'Session time limit reached.',
          kick:     'You were removed from the session.',
        };
        showToast(msgs[type] || 'Disconnected from session.');
        document.getElementById('conn-status').textContent = 'Disconnected';
      },
      onConnectionStateChange({ state: s }) {
        const el  = document.getElementById('conn-status');
        const dot = el.parentElement.querySelector('.status-dot');
        if (s === 'playing') {
          el.textContent  = 'Connected';
          dot.className   = 'status-dot green';
        } else if (s === 'reconnecting') {
          el.textContent = 'Reconnecting…';
          dot.className  = 'status-dot orange';
        } else {
          el.textContent = 'Connecting…';
          dot.className  = 'status-dot blue';
        }
      },
    });

    document.getElementById('load-time').textContent = (Date.now() - t0) + 'ms';

    state.hb.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.url) {
        state.currentUrl = changeInfo.url;
        document.getElementById('omnibox').value          = changeInfo.url;
        document.getElementById('status-url').textContent = getDomain(changeInfo.url);
        document.getElementById('omnibox-icon').textContent = changeInfo.url.startsWith('https') ? '🔒' : '⚠️';
      }
      if (changeInfo.title) {
        document.getElementById('status-url').textContent = changeInfo.title.slice(0, 40);
      }
    });

    renderUsers(['You']);
    document.getElementById('user-count-val').textContent = 1;

  } catch (err) {
    hideLoading();
    console.error('Hyperbeam embed failed:', err);
    showToast('Failed to connect to virtual browser: ' + err.message.slice(0, 60));
  }
}

// ── NAVIGATION ──
window.navigateTo = async function(input) {
  if (!state.hb) { showToast('No active session'); return; }
  const url = normalizeUrl(input);
  try {
    await state.hb.tabs.update({ url });
    document.getElementById('omnibox').value = url;
    state.currentUrl = url;
  } catch(e) { showToast('Navigation failed'); }
};
window.navBack    = async () => { if (state.hb) await state.hb.tabs.goBack().catch(()=>{}); };
window.navForward = async () => { if (state.hb) await state.hb.tabs.goForward().catch(()=>{}); };
window.navReload  = async () => { if (state.hb) await state.hb.tabs.reload().catch(()=>{}); };
window.newTab     = async function() {
  if (!state.hb) return;
  const url = prompt('Enter URL for new tab:', 'https://www.youtube.com');
  if (url) await state.hb.tabs.create({ url: normalizeUrl(url), active: true }).catch(()=>{});
};

// ── VOLUME ──
window.setVolume = function(val) {
  if (state.hb) state.hb.volume = val / 100;
};

// ── SESSION SHARING ──
function buildSessionLink() {
  const base = location.origin + location.pathname;
  return base + '?embed=' + encodeURIComponent(state.embedUrl) + '&url=' + encodeURIComponent(state.currentUrl);
}
window.copySessionLink = function() {
  navigator.clipboard.writeText(buildSessionLink())
    .then(() => showToast('✓ Session link copied!'))
    .catch(() => showToast(buildSessionLink()));
};
window.openShareModal = function() {
  document.getElementById('modal-link').textContent = buildSessionLink();
  document.getElementById('modal-overlay').classList.add('open');
};
window.closeModal     = () => document.getElementById('modal-overlay').classList.remove('open');
window.copyModalLink  = function() {
  const link = document.getElementById('modal-link').textContent;
  navigator.clipboard.writeText(link)
    .then(() => { showToast('✓ Copied!'); closeModal(); })
    .catch(() => showToast('Copy failed'));
};

// ── UI TOGGLES ──
window.toggleSidebar = function() {
  state.sidebarOpen = !state.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !state.sidebarOpen);
};
window.toggleChat = function() {
  state.chatOpen = !state.chatOpen;
  document.getElementById('chat-panel').classList.toggle('open', state.chatOpen);
};
window.goHome = async function() {
  if (state.hb) { state.hb.destroy(); state.hb = null; }
  document.getElementById('app').classList.remove('visible');
  document.getElementById('hb-container').innerHTML = '';
  const l = document.getElementById('landing');
  l.style.display = '';
  l.style.opacity = '0';
  requestAnimationFrame(() => { l.style.transition = 'opacity .4s'; l.style.opacity = '1'; });
};

// ── USERS ──
const COLORS = ['#4af0c4','#6c7eff','#ff6b9d','#ffc96b','#b06bff'];
function renderUsers(users) {
  const list = document.getElementById('users-list');
  list.innerHTML = '';
  users.forEach((u, i) => {
    const el = document.createElement('div');
    el.className = 'user-item';
    const c = COLORS[i % COLORS.length];
    const initials = u.slice(0,2).toUpperCase();
    el.innerHTML = '<div class="avatar" style="background:' + c + '22;color:' + c + ';border:1px solid ' + c + '44">' + initials + '</div><span>' + u + '</span><div class="user-status" style="background:' + c + ';margin-left:auto;"></div>';
    list.appendChild(el);
  });
}

// ── CHAT ──
function addChatMsg(author, text, isMe = false) {
  const wrap = document.getElementById('chat-messages');
  const msg  = document.createElement('div');
  msg.className = 'msg' + (isMe ? ' me' : '');
  msg.innerHTML = '<div class="msg-author">' + author + '</div><div class="msg-text">' + escapeHtml(text) + '</div>';
  wrap.appendChild(msg);
  wrap.scrollTop = wrap.scrollHeight;
  if (!state.chatOpen) showToast(author + ': ' + text.slice(0, 30));
}
window.sendChat = function() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;
  addChatMsg('You', text, true);
  input.value = '';
};

// ── HELPERS ──
function normalizeUrl(input) {
  input = input.trim();
  if (!input) return '';
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  if (input.includes('.') && !input.includes(' ')) return 'https://' + input;
  return 'https://www.google.com/search?q=' + encodeURIComponent(input);
}
function getDomain(url) {
  try { return new URL(url).hostname.replace('www.',''); } catch { return url.slice(0,40); }
}
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function showLoading(msg) {
  document.getElementById('loading-text').textContent = msg || 'Loading…';
  document.getElementById('loading-overlay').classList.add('show');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('show');
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── ENTER KEY HANDLERS ──
document.getElementById('start-url').addEventListener('keydown', e => { if(e.key==='Enter') window.launchBrowser(); });
document.getElementById('join-embed').addEventListener('keydown', e => { if(e.key==='Enter') window.joinSession(); });
document.getElementById('omnibox').addEventListener('input', function() {
  document.getElementById('omnibox-icon').textContent = this.value.startsWith('https') ? '🔒' : '⚠️';
});

</script>
</body>
</html>`;
