const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const dns = require("dns");
const dnsp = dns.promises;
const { URL } = require("url");

// ─── config (optional) ────────────────────────────────────────
// On Render (web-only deployment), there's no config.json — the Discord bot
// runs elsewhere. Fall back to env vars; if none present, we boot web-only.
let token = null, LOCKED_GUILD = null, LOG_CHANNEL = null;
try {
  const cfg = require("./config.json");
  token = cfg.token;
  LOCKED_GUILD = cfg.guildId;
  LOG_CHANNEL = cfg.logChannelId;
} catch (_) {
  // No config.json — that's fine on Render
}
token       = token       || process.env.DISCORD_TOKEN || null;
LOCKED_GUILD = LOCKED_GUILD || process.env.GUILD_ID || null;
LOG_CHANNEL = LOG_CHANNEL || process.env.LOG_CHANNEL_ID || null;

// Optional Discord webhook — if the site runs on Render with no bot token but
// a webhook URL, /event posts reach Discord via the webhook instead of the bot.
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || null;

const BOT_ENABLED = Boolean(token);

const DATA_PATH = path.join(__dirname, "data.json");
const SITE_PORT = Number(process.env.PORT || process.env.SITE_PORT || 3000);
const HEARTBEAT_TTL_MS = 60_000;
const EVENT_DEDUPE_MS = 3_000;
const GITHUB_REPO = process.env.GITHUB_REPO || "midicl/IntellectualOS";
const GITHUB_POLL_MS = 5 * 60 * 1000;

const COLORS = {
  green: 0x57f287,
  red: 0xed4245,
  blue: 0x5865f2,
  yellow: 0xfee75c,
  grey: 0x95a5a6,
  dark: 0x2b2d31,
  orange: 0xfd9644,
};

// ─── data persistence ─────────────────────────────────────────
const DATA_DEFAULTS = { logChannel: {}, autorole: {}, blacklist: [], users: [], status: {}, lastCommitSha: null };

function loadData() {
  try {
    if (!fs.existsSync(DATA_PATH)) return { ...DATA_DEFAULTS };
    const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    return { ...DATA_DEFAULTS, ...raw };
  } catch (err) {
    console.warn(`[data] corrupted data.json: ${err.message}`);
    return { ...DATA_DEFAULTS };
  }
}

function saveData(d) {
  try { fs.writeFileSync(DATA_PATH, JSON.stringify(d, null, 2)); }
  catch (e) { console.error(`[data] save failed: ${e.message}`); }
}

let data = loadData();

// ─── online presence ──────────────────────────────────────────
const online = new Map(); // email -> lastSeenMs
const eventDedupe = new Map(); // "email|type|detail" -> lastSeenMs

function dedupeEvent(email, type, detail) {
  const key = `${email}|${type}|${detail}`;
  const now = Date.now();
  const prev = eventDedupe.get(key);
  if (prev && now - prev < EVENT_DEDUPE_MS) return true; // duplicate
  eventDedupe.set(key, now);
  // Aggressive cleanup to prevent memory bloat
  if (eventDedupe.size > 200) {
    const threshold = now - EVENT_DEDUPE_MS;
    for (const [k, t] of eventDedupe) {
      if (t < threshold) eventDedupe.delete(k);
    }
  }
  return false;
}
function pruneOnline() {
  const now = Date.now();
  for (const [e, t] of online) if (now - t > HEARTBEAT_TTL_MS) online.delete(e);
}
function onlineCount() { pruneOnline(); return online.size; }
function onlineList() { pruneOnline(); return [...online.keys()]; }

function isBlacklisted(email) {
  if (!email) return false;
  const e = String(email).trim().toLowerCase();
  return data.blacklist.some((b) => String(b).toLowerCase() === e);
}

function recordSeen(email) {
  if (!email) return;
  const e = String(email).trim().toLowerCase();
  if (!e || e === "anon") return;
  if (data.users.includes(e)) return;
  data.users.push(e);
  saveData(data);
}

// ─── Discord client ───────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
});

function getLogChannel(guildId) {
  const id = data.logChannel[guildId] || LOG_CHANNEL;
  return id ? client.channels.cache.get(id) || null : null;
}

async function sendSiteLog(embed) {
  // Prefer bot → channel if the bot is running in-process
  if (BOT_ENABLED) {
    const ch = getLogChannel(LOCKED_GUILD);
    if (ch) { try { await ch.send({ embeds: [embed] }); return; } catch (e) { console.warn(`[log] ${e.message}`); } }
  }
  // Otherwise, post through a Discord webhook (no bot needed)
  if (DISCORD_WEBHOOK) {
    try {
      const body = JSON.stringify({ embeds: [embed.toJSON ? embed.toJSON() : embed] });
      const u = new URL(DISCORD_WEBHOOK);
      const req = https.request({
        method: "POST", hostname: u.hostname, path: u.pathname + u.search,
        headers: { "content-type": "application/json", "content-length": Buffer.byteLength(body) },
        timeout: 8000,
      });
      req.on("error", (e) => console.warn(`[webhook] ${e.message}`));
      req.on("timeout", () => req.destroy());
      req.end(body);
    } catch (e) { console.warn(`[webhook] ${e.message}`); }
  }
}

// ─── URL filter detection ─────────────────────────────────────
// Family / content DNS resolvers commonly used by schools or as upstream
// to school filters. If they block, most school filters block too.
const FAMILY_RESOLVERS = [
  { name: "Cloudflare Family",   servers: ["1.1.1.3", "1.0.0.3"],              blocks: "malware + adult" },
  { name: "OpenDNS FamilyShield", servers: ["208.67.222.123", "208.67.220.123"], blocks: "adult + proxy + games" },
  { name: "CleanBrowsing Family", servers: ["185.228.168.168", "185.228.169.168"], blocks: "games + adult + proxy" },
  { name: "AdGuard Family",      servers: ["94.140.14.15", "94.140.15.16"],    blocks: "ads + adult + trackers" },
  { name: "Quad9 Secure",        servers: ["9.9.9.9", "149.112.112.112"],       blocks: "malware + phishing" },
];
const BASELINE_RESOLVER = ["1.1.1.1", "8.8.8.8"];

// Block-page hostname signatures, seen in the final URL or headers after a HEAD/GET
const FILTER_SIGNATURES = [
  { vendor: "Securly",      patterns: [/securly\.com/i, /quarantine\.securly/i, /block\.securly/i] },
  { vendor: "GoGuardian",   patterns: [/goguardian\.com/i, /blocked\.goguardian/i] },
  { vendor: "Lightspeed",   patterns: [/lightspeedsystems\.com/i, /blocksi/i] },
  { vendor: "iBoss",        patterns: [/iboss\.com/i, /ibosscloud/i] },
  { vendor: "Cisco Umbrella", patterns: [/opendns\.com\/phishing/i, /umbrella\.com/i] },
  { vendor: "Fortinet",     patterns: [/fortiguard/i, /fortinet/i] },
  { vendor: "Palo Alto",    patterns: [/paloaltonetworks\.com/i] },
  { vendor: "Blocksi",      patterns: [/blocksi\.net/i, /blocksi\.com/i] },
  { vendor: "Hapara",       patterns: [/hapara\.com/i] },
  { vendor: "Linewize",     patterns: [/linewize\.com/i, /linewize\.net/i] },
  { vendor: "ContentKeeper", patterns: [/contentkeeper/i] },
  { vendor: "Smoothwall",   patterns: [/smoothwall/i] },
  { vendor: "Bark",         patterns: [/bark\.us/i] },
];

// Keywords that commonly trigger school-filter "Games" / "Proxy" categories
const RISKY_KEYWORDS = [
  "game", "play", "proxy", "unblock", "vpn", "mirror", "bypass",
  "stream", "download", "torrent", "crack", "hack",
];

function resolveWith(servers, host) {
  return new Promise((resolve) => {
    const r = new dns.promises.Resolver();
    r.setServers(servers);
    const done = (out) => resolve(out);
    Promise.race([
      r.resolve4(host).then((a) => ({ ok: true, ips: a })).catch((e) => ({ ok: false, err: e.code || e.message })),
      new Promise((res) => setTimeout(() => res({ ok: false, err: "timeout" }), 3000)),
    ]).then(done);
  });
}

function isSinkhole(ips) {
  if (!ips || !ips.length) return true;
  return ips.every((ip) => ip === "0.0.0.0" || ip.startsWith("146.112.") || ip === "146.112.61.104");
}

function probeHttp(urlStr) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(urlStr.includes("://") ? urlStr : `https://${urlStr}`); }
    catch { return resolve({ ok: false, error: "invalid URL" }); }

    const redirects = [];
    const started = Date.now();

    const req = (cur, hops) => {
      if (hops > 6) return resolve({ ok: false, error: "too many redirects", redirects });
      const lib = cur.protocol === "https:" ? https : http;
      const r = lib.request({
        method: "GET",
        hostname: cur.hostname,
        port: cur.port || (cur.protocol === "https:" ? 443 : 80),
        path: cur.pathname + cur.search,
        headers: { "user-agent": "Mozilla/5.0" },
        timeout: 6000,
      }, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          redirects.push({ to: res.headers.location, status: res.statusCode });
          res.resume();
          try { return req(new URL(res.headers.location, cur), hops + 1); }
          catch { return resolve({ ok: false, error: "bad redirect", redirects }); }
        }
        // read up to 8KB of body to scan for block-page markers
        let body = "";
        res.on("data", (c) => { if (body.length < 8192) body += c.toString("utf8", 0, 8192 - body.length); });
        res.on("end", () => {
          resolve({
            ok: true,
            finalUrl: cur.href,
            status: res.statusCode,
            headers: res.headers,
            body,
            redirects,
            ms: Date.now() - started,
          });
        });
      });
      r.on("timeout", () => { r.destroy(new Error("timeout")); });
      r.on("error", (e) => resolve({ ok: false, error: e.code || e.message, redirects, ms: Date.now() - started }));
      r.end();
    };
    req(u, 0);
  });
}

async function checkFilters(inputUrl) {
  let host;
  try {
    const u = new URL(inputUrl.includes("://") ? inputUrl : `https://${inputUrl}`);
    host = u.hostname;
  } catch { return { error: "invalid URL" }; }

  // 1. Baseline resolution
  const base = await resolveWith(BASELINE_RESOLVER, host);

  // 2. Family resolvers in parallel
  const familyResults = await Promise.all(
    FAMILY_RESOLVERS.map(async (r) => {
      const res = await resolveWith(r.servers, host);
      let blocked = false;
      let reason = "";
      if (!res.ok) {
        if (res.err === "ENODATA" || res.err === "ENOTFOUND" || res.err === "REFUSED" || res.err === "SERVFAIL") {
          blocked = true; reason = res.err;
        } else if (res.err === "timeout") {
          reason = "timeout";
        } else { reason = res.err; }
      } else if (isSinkhole(res.ips)) {
        blocked = true; reason = `sinkholed to ${res.ips.join(",")}`;
      } else if (base.ok && !res.ips.some((ip) => base.ips.includes(ip))) {
        reason = `resolves differently (${res.ips.join(",")})`;
      }
      return { vendor: r.name, category: r.blocks, blocked, reason };
    })
  );

  // 3. HTTP probe for block-page fingerprints
  const probe = await probeHttp(inputUrl);
  const vendorHits = [];
  if (probe.ok) {
    const blob = `${probe.finalUrl} ${JSON.stringify(probe.headers)} ${probe.body}`;
    for (const sig of FILTER_SIGNATURES) {
      if (sig.patterns.some((p) => p.test(blob))) vendorHits.push(sig.vendor);
    }
  }

  // 4. Keyword heuristic — likely to be categorised as "Games/Proxy"
  const lowerUrl = inputUrl.toLowerCase();
  const riskyHits = RISKY_KEYWORDS.filter((k) => lowerUrl.includes(k));

  return { host, base, familyResults, probe, vendorHits, riskyHits };
}

// ─── URL masking ──────────────────────────────────────────────
// Gateways via the Blooket subdomain trick (game-skin URLs that proxy any
// base64-encoded host through gn-math.dev's gateway).
const BLOOKET_GATEWAYS = [
  "bees", "mining", "laser", "coco", "defense2", "defense", "brawl",
  "dinos", "cafe", "factory", "racing", "rush", "classic",
];

function maskUrl(inputUrl) {
  let u;
  try { u = new URL(inputUrl.includes("://") ? inputUrl : `https://${inputUrl}`); }
  catch { return { error: "invalid URL" }; }

  const host = u.hostname;
  const b64 = Buffer.from(host).toString("base64");

  return {
    original: u.href,
    variants: BLOOKET_GATEWAYS.map((sub) => ({
      name: `${sub}.blooket.com`,
      note: "Routes the target through the Blooket game-skin gateway.",
      url: `https://${sub}.blooket.com/gs/${b64}/`,
    })),
  };
}

// ─── Webshare proxy pool ──────────────────────────────────────
// Reads ./Webshare 10 proxies.txt in `host:port:user:pass` format and
// round-robins through the exits. If the file is missing or empty, /proxy
// falls back to direct fetch.
const PROXY_FILE = path.join(__dirname, "Webshare 10 proxies.txt");
let proxyPool = [];
let proxyIdx = 0;

function loadProxies() {
  try {
    if (!fs.existsSync(PROXY_FILE)) return [];
    const raw = fs.readFileSync(PROXY_FILE, "utf-8");
    const list = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
      const [host, port, user, pass] = l.split(":");
      if (!host || !port) return null;
      return { host, port: Number(port), user: user || null, pass: pass || null };
    }).filter(Boolean);
    return list;
  } catch (e) {
    console.warn(`[proxy] failed to load pool: ${e.message}`);
    return [];
  }
}
proxyPool = loadProxies();
console.log(`[proxy] pool: ${proxyPool.length} exits loaded`);

function nextProxy() {
  if (!proxyPool.length) return null;
  const p = proxyPool[proxyIdx % proxyPool.length];
  proxyIdx = (proxyIdx + 1) % proxyPool.length;
  return p;
}

// Fetch a URL through an HTTP proxy via CONNECT tunnel for HTTPS, or direct
// HTTP GET with absolute-URI for plain HTTP. Returns { stream, headers, status }.
function proxiedFetch(targetUrl, proxy) {
  return new Promise((resolve, reject) => {
    let u;
    try { u = new URL(targetUrl); } catch (e) { return reject(new Error("invalid URL")); }

    const isHttps = u.protocol === "https:";
    const targetHost = u.hostname;
    const targetPort = u.port || (isHttps ? 443 : 80);
    const authHeader = proxy && proxy.user
      ? "Basic " + Buffer.from(`${proxy.user}:${proxy.pass}`).toString("base64")
      : null;

    const reqHeaders = {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "host": targetHost,
    };

    if (!proxy) {
      // Direct fallback
      const lib = isHttps ? https : http;
      const r = lib.request({ hostname: targetHost, port: targetPort, path: u.pathname + u.search, headers: reqHeaders, timeout: 15_000 }, (res) => {
        resolve({ stream: res, headers: res.headers, status: res.statusCode });
      });
      r.on("error", reject); r.on("timeout", () => { r.destroy(new Error("timeout")); });
      r.end();
      return;
    }

    if (isHttps) {
      // CONNECT tunnel
      const connectReq = http.request({
        host: proxy.host,
        port: proxy.port,
        method: "CONNECT",
        path: `${targetHost}:${targetPort}`,
        headers: authHeader ? { "proxy-authorization": authHeader, "host": `${targetHost}:${targetPort}` } : { "host": `${targetHost}:${targetPort}` },
        timeout: 15_000,
      });
      connectReq.on("connect", (res, socket) => {
        if (res.statusCode !== 200) { socket.destroy(); return reject(new Error(`proxy CONNECT ${res.statusCode}`)); }
        const tls = require("tls");
        const tlsSock = tls.connect({ socket, servername: targetHost, rejectUnauthorized: false }, () => {
          const pathAndQuery = u.pathname + u.search;
          const lines = [
            `GET ${pathAndQuery} HTTP/1.1`,
            `Host: ${targetHost}`,
            ...Object.entries(reqHeaders).filter(([k]) => k !== "host").map(([k, v]) => `${k}: ${v}`),
            "Connection: close",
            "", "",
          ];
          tlsSock.write(lines.join("\r\n"));
          parseHttpResponse(tlsSock).then(resolve).catch(reject);
        });
        tlsSock.on("error", reject);
      });
      connectReq.on("error", reject);
      connectReq.on("timeout", () => connectReq.destroy(new Error("proxy timeout")));
      connectReq.end();
    } else {
      // Plain HTTP via absolute-URI
      const r = http.request({
        host: proxy.host, port: proxy.port, method: "GET",
        path: targetUrl,
        headers: Object.assign({}, reqHeaders, authHeader ? { "proxy-authorization": authHeader } : {}),
        timeout: 15_000,
      }, (res) => resolve({ stream: res, headers: res.headers, status: res.statusCode }));
      r.on("error", reject); r.on("timeout", () => r.destroy(new Error("timeout")));
      r.end();
    }
  });
}

// Minimal HTTP/1.1 response parser over a raw socket (TLS).
function parseHttpResponse(sock) {
  return new Promise((resolve, reject) => {
    let headerBuf = Buffer.alloc(0);
    let headerDone = false;
    let status = 0;
    let headers = {};

    const onData = (chunk) => {
      if (headerDone) return;
      headerBuf = Buffer.concat([headerBuf, chunk]);
      const sep = headerBuf.indexOf("\r\n\r\n");
      if (sep === -1) return;
      const headSection = headerBuf.slice(0, sep).toString("utf8");
      const bodyStart = headerBuf.slice(sep + 4);
      const lines = headSection.split("\r\n");
      const statusLine = lines.shift();
      const m = /^HTTP\/\d\.\d (\d{3})/.exec(statusLine || "");
      status = m ? Number(m[1]) : 0;
      for (const line of lines) {
        const idx = line.indexOf(":");
        if (idx === -1) continue;
        const k = line.slice(0, idx).trim().toLowerCase();
        const v = line.slice(idx + 1).trim();
        headers[k] = headers[k] ? headers[k] + ", " + v : v;
      }
      headerDone = true;
      sock.removeListener("data", onData);

      // Emit any buffered body immediately
      const { Readable } = require("stream");
      const body = new Readable({ read() {} });
      if (bodyStart.length) body.push(bodyStart);
      sock.on("data", (c) => body.push(c));
      sock.on("end",  () => body.push(null));
      sock.on("error", (e) => body.destroy(e));
      resolve({ stream: body, headers, status });
    };

    sock.on("data", onData);
    sock.on("error", reject);
  });
}

// ─── Static file server ───────────────────────────────────────
const PUBLIC_DIR = path.join(__dirname, "public");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".txt":  "text/plain; charset=utf-8",
};

function serveStatic(req, res) {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel === "/" || rel === "") rel = "/index.html";
  // prevent path traversal
  if (rel.includes("..")) { res.writeHead(400); return res.end("bad request"); }
  const file = path.join(PUBLIC_DIR, rel);
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end("not found"); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    fs.createReadStream(file).pipe(res);
  });
}

// ─── Intellectual AI ──────────────────────────────────────────
// Provider auto-detected from env vars. Set one of:
//   ANTHROPIC_API_KEY  → Claude  (model: ANTHROPIC_MODEL, default claude-sonnet-4-5-20250929)
//   OPENAI_API_KEY     → OpenAI  (model: OPENAI_MODEL, default gpt-4o-mini)
//   GROQ_API_KEY       → Groq    (model: GROQ_MODEL, default llama-3.3-70b-versatile)
//   OPENROUTER_API_KEY → OpenRouter (model: OPENROUTER_MODEL, default openai/gpt-4o-mini)
function aiProviderConfig() {
  if (process.env.ANTHROPIC_API_KEY) return {
    name: "anthropic", key: process.env.ANTHROPIC_API_KEY,
    endpoint: "https://api.anthropic.com/v1/messages",
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929",
  };
  if (process.env.GROQ_API_KEY) return {
    name: "groq", key: process.env.GROQ_API_KEY,
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  };
  if (process.env.OPENAI_API_KEY) return {
    name: "openai", key: process.env.OPENAI_API_KEY,
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  };
  if (process.env.OPENROUTER_API_KEY) return {
    name: "openrouter", key: process.env.OPENROUTER_API_KEY,
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  };
  return null;
}

function postJson(endpoint, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(endpoint);
    const payload = JSON.stringify(body);
    const req = https.request({
      method: "POST", hostname: u.hostname, port: 443, path: u.pathname + u.search,
      headers: Object.assign(
        { "content-type": "application/json", "content-length": Buffer.byteLength(payload), "user-agent": "IntellectualOS-AI/1.1" },
        headers
      ),
      timeout: 60_000,
    }, (res) => {
      let buf = "";
      res.on("data", (c) => { buf += c; });
      res.on("end", () => {
        try { const parsed = JSON.parse(buf); resolve({ status: res.statusCode, body: parsed }); }
        catch (e) { reject(new Error(`non-JSON response: ${buf.slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("AI request timeout")));
    req.end(payload);
  });
}

async function callAI(messages) {
  const cfg = aiProviderConfig();
  if (!cfg) {
    return {
      ok: true,
      provider: "stub",
      content:
        "Intellectual AI isn't connected to a model yet. To enable me:\n\n" +
        "Set **one** of these env vars on your host (Render → Environment):\n" +
        "• `ANTHROPIC_API_KEY` for Claude\n" +
        "• `OPENAI_API_KEY` for GPT\n" +
        "• `GROQ_API_KEY` for Llama (free tier)\n" +
        "• `OPENROUTER_API_KEY` for any model via OpenRouter\n\n" +
        "Groq is free and fast — `console.groq.com/keys` takes 30 seconds to sign up.",
    };
  }

  // Extract system prompt; remaining are conversation turns
  const systemMsg = messages.find((m) => m.role === "system");
  const convo = messages.filter((m) => m.role !== "system");

  if (cfg.name === "anthropic") {
    const body = {
      model: cfg.model,
      max_tokens: 1024,
      system: systemMsg?.content || undefined,
      messages: convo.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    };
    const r = await postJson(cfg.endpoint, {
      "x-api-key": cfg.key,
      "anthropic-version": "2023-06-01",
    }, body);
    if (r.status >= 400) throw new Error(`Anthropic ${r.status}: ${r.body?.error?.message || JSON.stringify(r.body).slice(0,200)}`);
    const content = r.body?.content?.[0]?.text || "";
    return { ok: true, provider: "Claude", model: cfg.model, content };
  }

  // OpenAI-compatible (OpenAI / Groq / OpenRouter)
  const body = {
    model: cfg.model,
    max_tokens: 1024,
    messages: [
      ...(systemMsg ? [{ role: "system", content: systemMsg.content }] : []),
      ...convo.map((m) => ({ role: m.role, content: m.content })),
    ],
  };
  const r = await postJson(cfg.endpoint, { "authorization": `Bearer ${cfg.key}` }, body);
  if (r.status >= 400) throw new Error(`${cfg.name} ${r.status}: ${r.body?.error?.message || JSON.stringify(r.body).slice(0,200)}`);
  const content = r.body?.choices?.[0]?.message?.content || "";
  return { ok: true, provider: cfg.name, model: cfg.model, content };
}

// ─── HTTP bridge ──────────────────────────────────────────────
function sendJson(res, code, body) {
  res.writeHead(code, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let buf = "";
    req.on("data", (c) => { buf += c; if (buf.length > 1e5) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(buf ? JSON.parse(buf) : {}); } catch { resolve({}); } });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return sendJson(res, 204, {});
  const u = new URL(req.url, "http://x");

  if (req.method === "POST" && u.pathname === "/login-check") {
    const body = await readBody(req).catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return sendJson(res, 400, { ok: false, error: "email required" });
    if (isBlacklisted(email)) return sendJson(res, 200, { ok: false, blacklisted: true });
    recordSeen(email);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && u.pathname === "/heartbeat") {
    const body = await readBody(req).catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (email && !isBlacklisted(email)) { online.set(email, Date.now()); recordSeen(email); }
    return sendJson(res, 200, { online: onlineCount() });
  }

  if (req.method === "POST" && u.pathname === "/event") {
    const body = await readBody(req).catch(() => ({}));
    const email = String(body.email || "anon").trim().toLowerCase();
    const type = String(body.type || "event").slice(0, 32);
    const detail = String(body.detail || "").slice(0, 200);
    if (isBlacklisted(email)) return sendJson(res, 403, { ok: false, blacklisted: true });
    online.set(email, Date.now());
    recordSeen(email);

    if (dedupeEvent(email, type, detail)) return sendJson(res, 200, { ok: true, deduped: true });

    const color =
      type === "login"     ? COLORS.green :
      type === "logout"    ? COLORS.grey  :
      type === "game-open" ? COLORS.blue  :
      type === "song-play" ? COLORS.yellow:
      type === "signup"    ? COLORS.orange: COLORS.dark;

    const emoji = { login: "🟢", logout: "⚪", "game-open": "🎮", "song-play": "🎵", signup: "✨" }[type] || "📡";

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} ${type}`)
      .setDescription(`**${email}**${detail ? `\n${detail}` : ""}`)
      .setFooter({ text: `${onlineCount()} online` })
      .setTimestamp();
    sendSiteLog(embed);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "GET" && u.pathname === "/online") {
    return sendJson(res, 200, { online: onlineCount(), users: onlineList() });
  }

  // ── /ai — proxy to the configured AI provider ────────────────
  if (req.method === "POST" && u.pathname === "/ai") {
    const body = await readBody(req).catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length) return sendJson(res, 400, { ok: false, error: "messages required" });
    try {
      const out = await callAI(messages);
      return sendJson(res, 200, out);
    } catch (e) {
      return sendJson(res, 500, { ok: false, error: e.message });
    }
  }

  // ── /proxy?url=<target> — route through rotating Webshare pool ──
  if (req.method === "GET" && u.pathname === "/proxy") {
    const target = u.searchParams.get("url");
    if (!target) return sendJson(res, 400, { ok: false, error: "url required" });

    // Self-referential guard — refuse to fetch our own host (would return index.html
    // and appear as "the loading screen" inside the browser's iframe).
    try {
      const tu = new URL(target);
      const selfHost = (req.headers.host || "").toLowerCase();
      const targetHost = tu.hostname.toLowerCase();
      const loopback = ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(targetHost);
      if (loopback || targetHost === selfHost.split(":")[0]) {
        return sendJson(res, 400, { ok: false, error: "refusing self-referential proxy target" });
      }
    } catch {
      return sendJson(res, 400, { ok: false, error: "invalid target URL" });
    }

    // Attempt up to 3 pool exits before giving up.
    const tried = new Set();
    let attempt = 0;
    const maxAttempts = Math.min(3, Math.max(1, proxyPool.length || 1));

    const tryOne = async () => {
      attempt++;
      let proxy = null;
      for (let i = 0; i < proxyPool.length; i++) {
        const cand = nextProxy();
        const k = cand ? `${cand.host}:${cand.port}` : "direct";
        if (!tried.has(k)) { tried.add(k); proxy = cand; break; }
      }
      try {
        const { stream, headers, status } = await proxiedFetch(target, proxy);
        const safeHeaders = {};
        for (const [k, v] of Object.entries(headers || {})) {
          // Strip headers that break iframing, caching, or carry proxy metadata.
          if (["x-frame-options", "content-security-policy", "content-security-policy-report-only", "transfer-encoding", "content-length", "content-encoding", "strict-transport-security"].includes(k.toLowerCase())) continue;
          safeHeaders[k] = v;
        }
        safeHeaders["x-proxy-via"] = proxy ? `${proxy.host}:${proxy.port}` : "direct";
        res.writeHead(status || 502, safeHeaders);
        stream.pipe(res);
      } catch (err) {
        if (attempt < maxAttempts) return tryOne();
        console.warn(`[proxy] all ${attempt} attempts failed for ${target}: ${err.message}`);
        res.writeHead(502, { "content-type": "text/html; charset=utf-8" });
        res.end(`<!doctype html><html><head><title>CONNECTION REFUSED</title><style>body{background:#000105;color:#ef4444;font-family:'Fira Code',monospace;height:100vh;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;letter-spacing:2px}h1{margin:0;text-shadow:0 0 20px rgba(239,68,68,.4)}small{color:#64748b}</style></head><body><h1>CONNECTION REFUSED</h1><div>ROUTING VIA BACKUP…</div><small>${String(err.message).slice(0,180)}</small></body></html>`);
      }
    };
    tryOne();
    return;
  }

  // ── Static files (public/) — default fallback for GET ──
  if (req.method === "GET") return serveStatic(req, res);

  return sendJson(res, 404, { ok: false, error: "not found" });
});

server.listen(SITE_PORT, () => console.log(`[http] bridge + static UI on :${SITE_PORT}`));

// ─── slash commands ───────────────────────────────────────────
async function handle(interaction) {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  try {
    // ── admin ──
    if (commandName === "setchannel") {
      const ch = interaction.options.getChannel("channel", true);
      data.logChannel[interaction.guildId] = ch.id;
      saveData(data);
      return interaction.reply({ content: `Log channel set to ${ch}.`, ephemeral: true });
    }
    if (commandName === "kick") {
      const user = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason") || "no reason";
      const m = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (!m) return interaction.reply({ content: "user not in guild.", ephemeral: true });
      if (!m.kickable) return interaction.reply({ content: "can't kick that user.", ephemeral: true });
      await m.kick(reason);
      return interaction.reply({ content: `Kicked **${user.tag}** — ${reason}` });
    }
    if (commandName === "ban") {
      const user = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason") || "no reason";
      await interaction.guild.members.ban(user.id, { reason });
      return interaction.reply({ content: `Banned **${user.tag}** — ${reason}` });
    }
    if (commandName === "unban") {
      const id = interaction.options.getString("userid", true);
      await interaction.guild.bans.remove(id).catch(() => { throw new Error("not banned / bad id"); });
      return interaction.reply({ content: `Unbanned <@${id}>.` });
    }
    if (commandName === "purge") {
      const n = interaction.options.getInteger("amount", true);
      await interaction.deferReply({ ephemeral: true });
      const del = await interaction.channel.bulkDelete(n, true).catch(() => null);
      return interaction.editReply({ content: `Deleted ${del ? del.size : 0} messages.` });
    }
    if (commandName === "serverinfo") {
      const g = interaction.guild;
      const embed = new EmbedBuilder().setColor(COLORS.blue).setTitle(g.name).addFields(
        { name: "Members", value: String(g.memberCount), inline: true },
        { name: "Owner", value: `<@${g.ownerId}>`, inline: true },
        { name: "Created", value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Roles", value: String(g.roles.cache.size), inline: true },
        { name: "Channels", value: String(g.channels.cache.size), inline: true },
      );
      if (g.iconURL()) embed.setThumbnail(g.iconURL());
      return interaction.reply({ embeds: [embed] });
    }
    if (commandName === "autorole") {
      const role = interaction.options.getRole("role");
      if (role) { data.autorole[interaction.guildId] = role.id; saveData(data); return interaction.reply({ content: `Autorole: ${role}.`, ephemeral: true }); }
      delete data.autorole[interaction.guildId]; saveData(data);
      return interaction.reply({ content: "Autorole disabled.", ephemeral: true });
    }
    if (commandName === "blacklist") {
      const sub = interaction.options.getSubcommand();
      if (sub === "add") {
        const e = interaction.options.getString("email", true).trim().toLowerCase();
        if (data.blacklist.includes(e)) return interaction.reply({ content: `\`${e}\` already blacklisted.`, ephemeral: true });
        data.blacklist.push(e); saveData(data);
        return interaction.reply({ content: `Blacklisted \`${e}\`.`, ephemeral: true });
      }
      if (sub === "remove") {
        const e = interaction.options.getString("email", true).trim().toLowerCase();
        const i = data.blacklist.indexOf(e);
        if (i === -1) return interaction.reply({ content: `\`${e}\` not blacklisted.`, ephemeral: true });
        data.blacklist.splice(i, 1); saveData(data);
        return interaction.reply({ content: `Removed \`${e}\`.`, ephemeral: true });
      }
      if (sub === "list") {
        const list = data.blacklist.length ? data.blacklist.map((e) => `• \`${e}\``).join("\n") : "_empty_";
        const embed = new EmbedBuilder().setColor(COLORS.dark).setTitle("site · blacklist").setDescription(list.slice(0, 4000));
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    // ── /online ──
    if (commandName === "online") {
      const n = onlineCount();
      const list = onlineList();
      const embed = new EmbedBuilder()
        .setColor(n > 0 ? COLORS.green : COLORS.grey)
        .setTitle(`site · ${n} online`)
        .setDescription(list.length ? list.map((e) => `• \`${e}\``).join("\n").slice(0, 3800) : "_nobody active_")
        .setFooter({ text: "active in last 60s" });
      return interaction.reply({ embeds: [embed] });
    }

    // ── /setstatus ──
    if (commandName === "setstatus") {
      const ch = interaction.options.getChannel("channel", true);
      const url = (interaction.options.getString("url") || "https://intellectualos.onrender.com").trim();
      data.status[interaction.guildId] = { channelId: ch.id, url, last: null };
      saveData(data);
      await interaction.reply({ content: `Status channel set to ${ch}. Pinging \`${url}\` every 5 minutes.`, ephemeral: true });
      pollStatus().catch(() => {});
      return;
    }

    // ── /emails ──
    if (commandName === "emails") {
      const all = data.users.slice().sort();
      const onlineSet = new Set(onlineList());
      const blackSet = new Set(data.blacklist.map((e) => String(e).toLowerCase()));
      const lines = all.map((e) => {
        const tags = [];
        if (onlineSet.has(e)) tags.push("🟢");
        if (blackSet.has(e)) tags.push("⛔");
        return `${tags.join("") || "•"} \`${e}\``;
      });
      const body = lines.length ? lines.join("\n") : "_no emails recorded yet_";
      const chunks = [];
      let cur = "";
      for (const line of body.split("\n")) {
        if (cur.length + line.length + 1 > 3800) { chunks.push(cur); cur = ""; }
        cur += (cur ? "\n" : "") + line;
      }
      if (cur) chunks.push(cur);
      const embeds = chunks.slice(0, 10).map((c, i) =>
        new EmbedBuilder()
          .setColor(COLORS.dark)
          .setTitle(i === 0 ? `site · ${all.length} email${all.length === 1 ? "" : "s"}` : `(continued ${i + 1})`)
          .setDescription(c)
          .setFooter(i === chunks.length - 1 ? { text: "🟢 online · ⛔ blacklisted" } : null)
      );
      return interaction.reply({ embeds, ephemeral: true });
    }

    // ── /check — filter detection ──
    if (commandName === "check") {
      const url = interaction.options.getString("url", true);
      await interaction.deferReply();
      const r = await checkFilters(url);
      if (r.error) return interaction.editReply({ content: `error: ${r.error}` });

      const blocked = r.familyResults.filter((x) => x.blocked);
      const allowed = r.familyResults.filter((x) => !x.blocked);

      const embed = new EmbedBuilder()
        .setTitle(`🔍 filter check · ${r.host}`)
        .setColor(blocked.length ? COLORS.red : COLORS.green)
        .setTimestamp();

      if (r.probe.ok) {
        embed.addFields({ name: "HTTP", value: `\`${r.probe.status}\` · ${r.probe.ms}ms · ${r.probe.finalUrl.slice(0, 180)}` });
      } else {
        embed.addFields({ name: "HTTP", value: `unreachable — ${r.probe.error}` });
      }

      const familyLines = r.familyResults.map((x) => {
        const icon = x.blocked ? "🔴" : x.reason ? "🟡" : "🟢";
        return `${icon} **${x.vendor}** _(${x.category})_${x.reason ? ` — ${x.reason}` : ""}`;
      }).join("\n");
      embed.addFields({ name: "Family/content DNS", value: familyLines });

      if (r.vendorHits.length) {
        embed.addFields({ name: "Filter vendor detected", value: r.vendorHits.map((v) => `⛔ **${v}**`).join("\n") });
      }

      if (r.riskyHits.length) {
        embed.addFields({ name: "Category risk", value: `likely flagged as **Games/Proxy** (keywords: ${r.riskyHits.map((k) => `\`${k}\``).join(", ")})` });
      }

      const summary = blocked.length === 0
        ? "✅ not blocked by any tested family resolver"
        : `⛔ blocked by **${blocked.length}/${r.familyResults.length}** tested resolvers${r.vendorHits.length ? ` and served a block page from **${r.vendorHits.join(", ")}**` : ""}`;
      embed.setDescription(summary);

      return interaction.editReply({ embeds: [embed] });
    }

    // ── /maskurl ──
    if (commandName === "maskurl") {
      const url = interaction.options.getString("url", true);
      const m = maskUrl(url);
      if (m.error) return interaction.reply({ content: `error: ${m.error}`, ephemeral: true });

      const embed = new EmbedBuilder()
        .setTitle("🎭 masked variants")
        .setColor(COLORS.blue)
        .setDescription(`**original:** ${m.original}\n\nEach variant uses a different obfuscation. Try them in order — the first that loads is your best bet.`)
        .setFooter({ text: "these defeat naive substring filters, not deep-inspection" });

      for (const v of m.variants) {
        embed.addFields({ name: v.name, value: `${v.note}\n\`\`\`\n${v.url.slice(0, 900)}\n\`\`\`` });
      }
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (err) {
    console.error(`[cmd] ${commandName}: ${err.message}`);
    const payload = { content: `error: ${err.message}`, ephemeral: true };
    if (interaction.deferred || interaction.replied) interaction.editReply(payload).catch(() => {});
    else interaction.reply(payload).catch(() => {});
  }
}

// ─── discord events ───────────────────────────────────────────
client.on("interactionCreate", handle);

client.on("guildMemberAdd", async (m) => {
  const rid = data.autorole[m.guild.id]; if (!rid) return;
  const role = m.guild.roles.cache.get(rid); if (!role) return;
  try { await m.roles.add(role); } catch (e) { console.warn(`[autorole] ${e.message}`); }
});

client.on("guildCreate", async (g) => {
  if (LOCKED_GUILD && g.id !== LOCKED_GUILD) { console.warn(`[lock] leaving ${g.id}`); await g.leave().catch(() => {}); }
});

// ─── status poller ───────────────────────────────────────────
// Channel renames are rate-limited to 2 per 10 min per channel, so we only
// rename when the up/down state actually flips.
const STATUS_NAMES = { up: "🟢-smart-running-bot", down: "🔴-down" };

function probeUrl(target) {
  return new Promise((resolve) => {
    let u; try { u = new URL(target); } catch { return resolve(false); }
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.request({
      method: "GET", hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: (u.pathname || "/") + (u.search || ""),
      headers: { "user-agent": "IntellectualOS-status/1.0" },
      timeout: 8000,
    }, (res) => { res.resume(); resolve(res.statusCode >= 200 && res.statusCode < 500); });
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.on("error", () => resolve(false));
    req.end();
  });
}

async function pollStatus() {
  for (const guildId of Object.keys(data.status)) {
    const cfg = data.status[guildId];
    if (!cfg || !cfg.channelId || !cfg.url) continue;
    const up = await probeUrl(cfg.url);
    const desired = up ? "up" : "down";
    if (cfg.last === desired) continue;
    const ch = client.channels.cache.get(cfg.channelId);
    if (!ch) continue;
    try {
      await ch.setName(STATUS_NAMES[desired], `site ${desired}`);
      cfg.last = desired;
      saveData(data);
    } catch (e) {
      console.warn(`[status] rename failed (${cfg.channelId}): ${e.message}`);
    }
  }
}

// ─── github update poller ────────────────────────────────────
function fetchJsonGet(url, headers) {
  return new Promise((resolve, reject) => {
    let u; try { u = new URL(url); } catch (e) { return reject(e); }
    const req = https.request({
      method: "GET", hostname: u.hostname,
      port: u.port || 443, path: u.pathname + u.search,
      headers: Object.assign({ "user-agent": "IntellectualOS-bot/1.0", "accept": "application/vnd.github+json" }, headers || {}),
      timeout: 10_000,
    }, (res) => {
      let body = "";
      res.on("data", (c) => { body += c; });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    req.on("error", reject);
    req.end();
  });
}

function fmtTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function pollGithub() {
  let commits;
  try {
    commits = await fetchJsonGet(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=10`);
  } catch (e) {
    console.warn(`[github] poll failed: ${e.message}`);
    return;
  }
  if (!Array.isArray(commits) || commits.length === 0) return;

  const lastSha = data.lastCommitSha;
  if (!lastSha) {
    data.lastCommitSha = commits[0].sha;
    saveData(data);
    return; // first run — don't spam
  }

  const fresh = [];
  for (const c of commits) {
    if (c.sha === lastSha) break;
    fresh.push(c);
  }
  if (!fresh.length) return;

  for (const c of fresh.reverse()) {
    const msg = (c.commit && c.commit.message) ? c.commit.message.split("\n")[0].slice(0, 220) : "(no message)";
    const author = (c.commit && c.commit.author && c.commit.author.name) || "unknown";
    const when = fmtTime(new Date(c.commit?.author?.date || Date.now()));
    const embed = new EmbedBuilder()
      .setColor(COLORS.blue)
      .setTitle(`[${when}] Update!`)
      .setDescription(`${msg}\n\n— ${author} · [\`${c.sha.slice(0, 7)}\`](${c.html_url})`)
      .setFooter({ text: GITHUB_REPO });
    await sendSiteLog(embed);
  }

  data.lastCommitSha = commits[0].sha;
  saveData(data);
}

client.once("ready", () => {
  console.log(`[discord] ready as ${client.user.tag}`);
  pollStatus().catch(() => {});
  setInterval(() => pollStatus().catch(() => {}), 5 * 60 * 1000);
  pollGithub().catch(() => {});
  setInterval(() => pollGithub().catch(() => {}), GITHUB_POLL_MS);
});

if (BOT_ENABLED) {
  client.login(token).catch((e) => console.warn(`[discord] login failed: ${e.message} — falling back to web-only`));
} else {
  console.log(`[discord] no token present → running in web-only mode${DISCORD_WEBHOOK ? " (webhook forwarding enabled)" : ""}`);
}
