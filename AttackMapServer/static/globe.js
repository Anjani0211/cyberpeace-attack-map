const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[ch]));
const pad = (n) => String(n).padStart(2, "0");
const fmt = (n) => Number(n || 0).toLocaleString("en-US");
const ts = () => {
  const d = new Date();
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const ST = (cx, cy, r) => {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const q = i % 2 ? r * 0.4 : r;
    points.push((cx + q * Math.cos(a)).toFixed(1) + "," + (cy + q * Math.sin(a)).toFixed(1));
  }
  return points.join(" ");
};
const H = (colors) => colors.map((color, i) => `<rect y="${i * 20 / colors.length}" width="30" height="${20 / colors.length + 0.1}" fill="${color}"/>`).join("");
const V = (colors) => colors.map((color, i) => `<rect x="${i * 30 / colors.length}" width="${30 / colors.length + 0.1}" height="20" fill="${color}"/>`).join("");
const FL={
US:()=>{let s='<rect width="30" height="20" fill="#b22234"/>';for(let i=1;i<13;i+=2)s+=`<rect y="${i*20/13}" width="30" height="${20/13}" fill="#fff"/>`;return s+'<rect width="13" height="10.8" fill="#3c3b6e"/>'},
CN:()=>`<rect width="30" height="20" fill="#de2910"/><polygon points="${ST(6,6,4)}" fill="#ffde00"/>`,
HK:()=>`<rect width="30" height="20" fill="#de2910"/><circle cx="15" cy="10" r="5.5" fill="#fff"/><circle cx="15" cy="10" r="2" fill="#de2910"/>`,
PK:()=>`<rect width="30" height="20" fill="#01411c"/><rect width="7.5" height="20" fill="#fff"/><circle cx="19" cy="10" r="5" fill="#fff"/><circle cx="20.6" cy="9" r="4.2" fill="#01411c"/><polygon points="${ST(22,8,2)}" fill="#fff"/>`,
IN:()=>H(['#ff9933','#fff','#138808'])+`<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".8"/>`,
RU:()=>H(['#fff','#0039a6','#d52b1e']),
AU:()=>`<rect width="30" height="20" fill="#00247d"/><path d="M0 0L15 10M15 0L0 10" stroke="#fff" stroke-width="2"/><path d="M7.5 0v10M0 5h15" stroke="#fff" stroke-width="3.4"/><path d="M7.5 0v10M0 5h15" stroke="#cf142b" stroke-width="1.8"/><polygon points="${ST(8,15,3)}" fill="#fff"/><polygon points="${ST(22,6,1.6)}" fill="#fff"/><polygon points="${ST(25,11,1.6)}" fill="#fff"/><polygon points="${ST(21,15,1.6)}" fill="#fff"/>`,
CA:()=>V(['#d52b1e','#fff','#fff','#d52b1e']).replace('width="7.6"','width="7.6"')+`<polygon points="15,4 16.6,8 19.5,7 18,10.5 20,11.5 15.6,12.5 15.6,16 14.4,16 14.4,12.5 10,11.5 12,10.5 10.5,7 13.4,8" fill="#d52b1e"/>`,
BR:()=>`<rect width="30" height="20" fill="#009c3b"/><polygon points="15,2 28,10 15,18 2,10" fill="#ffdf00"/><circle cx="15" cy="10" r="4.2" fill="#002776"/>`,
DE:()=>H(['#000','#d00','#ffce00']),GB:()=>`<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/>`,
FR:()=>V(['#0055a4','#fff','#ef4135']),NL:()=>H(['#ae1c28','#fff','#21468b']),
JP:()=>`<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>`,
KR:()=>`<rect width="30" height="20" fill="#fff"/><path d="M10 10a5 5 0 0 1 10 0z" fill="#cd2e3a"/><path d="M10 10a5 5 0 0 0 10 0z" fill="#0047a0"/>`,
ID:()=>H(['#e70011','#fff']),VN:()=>`<rect width="30" height="20" fill="#da251d"/><polygon points="${ST(15,10.5,6)}" fill="#ff0"/>`,
SG:()=>H(['#ef3340','#fff'])+`<circle cx="6" cy="5" r="3.2" fill="#fff"/><circle cx="7.4" cy="5" r="2.8" fill="#ef3340"/>`,
TR:()=>`<rect width="30" height="20" fill="#e30a17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.4" cy="10" r="4" fill="#e30a17"/><polygon points="${ST(17,10,2.2)}" fill="#fff"/>`,
IR:()=>H(['#239f40','#fff','#da0000']),UA:()=>H(['#0057b7','#ffd700']),NG:()=>V(['#008751','#fff','#008751']),
ZA:()=>H(['#de3831','#fff','#002395'])+`<polygon points="0,0 12,10 0,20" fill="#007a4d"/><polygon points="0,3 8,10 0,17" fill="#000"/>`,
MX:()=>V(['#006847','#fff','#ce1126'])+`<circle cx="15" cy="10" r="2.4" fill="#8a6d3b"/>`,
AR:()=>H(['#74acdf','#fff','#74acdf'])+`<circle cx="15" cy="10" r="2.2" fill="#f6b40e"/>`,CL:()=>H(['#fff','#d52b1e'])+`<rect width="10" height="10" fill="#0039a6"/><polygon points="${ST(5,5,3)}" fill="#fff"/>`,
NZ:()=>`<rect width="30" height="20" fill="#00247d"/><path d="M7.5 0v10M0 5h15" stroke="#fff" stroke-width="3"/><path d="M7.5 0v10M0 5h15" stroke="#cc142b" stroke-width="1.6"/><polygon points="${ST(22,5,1.6)}" fill="#cc142b"/><polygon points="${ST(25,10,1.6)}" fill="#cc142b"/><polygon points="${ST(22,15,1.6)}" fill="#cc142b"/><polygon points="${ST(19,10,1.6)}" fill="#cc142b"/>`,
KE:()=>H(['#000','#fff','#bb0000','#fff','#006600']).replace(/<rect y="([\d.]+)" width="30" height="4.1" fill="#bb0000"\/>/,'<rect y="$1" width="30" height="4.1" fill="#bb0000"/>')+`<ellipse cx="15" cy="10" rx="2.6" ry="5" fill="#bb0000" stroke="#000"/>`,PE:()=>V(['#d91023','#fff','#d91023']),
TZ:()=>`<rect width="30" height="20" fill="#1eb53a"/><polygon points="0,20 30,0 30,20" fill="#00a3dd"/><path d="M0 20L30 0" stroke="#fcd116" stroke-width="7"/><path d="M0 20L30 0" stroke="#000" stroke-width="4"/>`,
IT:()=>V(['#009246','#fff','#ce2b37']),ES:()=>`<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>`,PL:()=>H(['#fff','#dc143c']),AE:()=>H(['#00732f','#fff','#000'])+`<rect width="7.5" height="20" fill="#f00"/>`,EG:()=>H(['#ce1126','#fff','#000']),
TH:()=>`<rect width="30" height="20" fill="#a51931"/><rect y="3.3" width="30" height="13.4" fill="#f4f5f8"/><rect y="6.7" width="30" height="6.6" fill="#2d2a4a"/>`,BD:()=>`<rect width="30" height="20" fill="#006a4e"/><circle cx="13" cy="10" r="5.5" fill="#f42a41"/>`,
MY:()=>H(['#cc0001','#fff','#cc0001','#fff','#cc0001','#fff','#cc0001'])+`<rect width="15" height="11" fill="#010066"/><circle cx="6" cy="5.5" r="3" fill="#fc0"/><circle cx="7" cy="5.5" r="2.5" fill="#010066"/>`,PH:()=>H(['#0038a8','#ce1126'])+`<polygon points="0,0 13,10 0,20" fill="#fff"/>`,KZ:()=>`<rect width="30" height="20" fill="#00afca"/><circle cx="15" cy="9" r="4" fill="#fec50c"/>`};
function fallbackFlag(code) {
  const hue = [...String(code)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;
  return `<svg class="fl" viewBox="0 0 30 20"><rect width="30" height="20" fill="hsl(${hue} 62% 42%)"/></svg>`;
}
function flag(code) {
  const k = String(code || "XX").toUpperCase();
  if (typeof FL[k] === "function") {
    try { return `<svg class="fl" viewBox="0 0 30 20" preserveAspectRatio="none">${FL[k]()}</svg>`; }
    catch (err) { return fallbackFlag(k); }
  }
  return fallbackFlag(k);
}

const HP = [
  ["Delhi", 77.2, 28.6],
  ["Mumbai", 72.9, 19.1],
  ["Bengaluru", 77.6, 13],
  ["Chennai", 80.3, 13.1],
  ["Kolkata", 88.4, 22.6],
  ["Hyderabad", 78.5, 17.4]
];

const SEV = {
  DoS: ["CRITICAL", "sev-c", "#FF4057"],
  DNS: ["CRITICAL", "sev-c", "#FF4057"],
  RDP: ["HIGH", "sev-h", "#FF9D42"],
  SSH: ["HIGH", "sev-h", "#1677FF"],
  SQL: ["HIGH", "sev-h", "#FF9D42"],
  SMB: ["HIGH", "sev-h", "#FF9D42"],
  TELNET: ["MEDIUM", "sev-m", "#E6B15A"],
  EMAIL: ["MEDIUM", "sev-m", "#E6B15A"],
  AUTH: ["MEDIUM", "sev-m", "#E6B15A"],
  HTTP: ["LOW", "sev-l", "#00D9FF"],
  HTTPS: ["LOW", "sev-l", "#00D9FF"],
  FTP: ["LOW", "sev-l", "#00D9FF"],
  ICMP: ["LOW", "sev-l", "#00D9FF"]
};

const LFC = "72px minmax(118px,.95fr) minmax(110px,1.1fr) 64px 78px";
const CVC = "72px minmax(140px,1.2fr) 28px minmax(120px,1fr)";
const typeCounts = {};
const typeColor = {};
const countryCounts = {};
const countryNames = {};
const countryAttacks = {};
const ticks = [];
const arcs = [];

function liveKeys(obj) {
  return Object.keys(obj || {}).filter((key) => key && key !== "null" && key !== "None");
}
function severity(protocol, color) {
  const known = SEV[protocol];
  if (known) return known;
  return ["MEDIUM", "sev-m", color || "#E6B15A"];
}
function level(n) {
  if (n == null) return ["—", "sev-l"];
  if (n >= 800) return ["CRITICAL", "sev-c"];
  if (n >= 200) return ["HIGH", "sev-h"];
  if (n >= 60) return ["MEDIUM", "sev-m"];
  return ["LOW", "sev-l"];
}
function bumpRate() {
  const now = Date.now();
  ticks.push(now);
  while (ticks.length && now - ticks[0] > 60000) ticks.shift();
  $("rate").textContent = ticks.length + "/min";
}
function addRow(id, html, cols, cap, cls) {
  const box = $(id);
  const row = document.createElement("div");
  row.className = "r nw " + (cls || "");
  row.style.gridTemplateColumns = cols;
  row.innerHTML = html;
  box.insertBefore(row, box.children[1] || null);
  while (box.children.length > cap + 1) box.lastChild.remove();
}
function targetCity(ip) {
  let hash = 0;
  const text = String(ip || "");
  for (let i = 0; i < text.length; i++) hash = (hash + text.charCodeAt(i) * (i + 1)) % HP.length;
  return HP[hash];
}
function renderBar() {
  const ranked = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const rows = ranked.slice(0, 5).map(([name, count]) => [name, count, typeColor[name] || "#00D9FF"]);
  while (rows.length < 5) rows.push(["—", 0, "#8293AA"]);
  $("bar").innerHTML = rows.map(([name, count, color]) =>
    `<div class="bx"><span class="sw" style="--c:${color}"></span><i class="cn">${fmt(count)}</i><div class="tk"></div><div class="bb">${esc(name)}</div></div>`
  ).join("");
}
function renderTop(countries, ips, countryToCode, ipToCode) {
  const topIps = Object.entries(ips || {})
    .filter(([ip]) => ip && ip !== "null" && ip !== "None")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const mx = topIps[0] ? topIps[0][1] : 1;
  $("tib").innerHTML = `<div class="hd" style="grid-template-columns:64px minmax(0,1fr) 88px"><span>COUNT</span><span>SOURCE IP</span><span>SHARE</span></div>` +
    topIps.map(([ip, count]) =>
      `<div class="r" style="grid-template-columns:64px minmax(0,1fr) 88px"><span class="num">${fmt(count)}</span><span class="fc">${flag(ipToCode[ip])}<span class="mono">${esc(ip)}</span></span><span class="meter" title="${fmt(count)} events"><i style="width:${Math.max(8, Math.round(count / mx * 100))}%"></i></span></div>`
    ).join("");

  const topCountries = Object.entries(countries || {})
    .filter(([name]) => name && name !== "null" && name !== "None")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  const mc = topCountries[0] ? topCountries[0][1] : 1;
  $("tcb").innerHTML = `<div class="hd" style="grid-template-columns:64px minmax(0,1fr) 88px"><span>COUNT</span><span>COUNTRY</span><span>SHARE</span></div>` +
    topCountries.map(([name, count], i) =>
      `<div class="r${i < 3 ? " rank" + (i + 1) : ""}" style="grid-template-columns:64px minmax(0,1fr) 88px"><span class="num">${fmt(count)}</span><span class="fc">${flag(countryToCode[name])}<span>${esc(name)}</span></span><span class="meter"><i style="width:${Math.max(8, Math.round(count / mc * 100))}%"></i></span></div>`
    ).join("");
}
function intelHTML(name, isState) {
  const key = isState ? "India" : name;
  const code = isState ? "IN" : (Object.entries(countryNames).find(([, n]) => n.toLowerCase() === String(name || "").toLowerCase()) || [])[0];
  const attacks = countryCounts[key] != null ? countryCounts[key] : (code ? countryCounts[code] : null);
  const mix = countryAttacks[key] || countryAttacks[code] || null;
  let top = "—";
  if (mix) {
    const ranked = Object.entries(mix).sort((a, b) => b[1] - a[1]);
    if (ranked[0]) top = ranked[0][0];
  }
  const lv = level(attacks);
  const fl = code && FL[code] ? flag(code) : (isState ? flag("IN") : "");
  return `<div class="tip-k">${isState ? "INDIA · STATE / UT" : "COUNTRY INTELLIGENCE"}</div><div class="tip-h">${fl}<strong>${esc(String(name || "").toUpperCase())}</strong></div><div class="tip-row"><span>Attack volume</span><b>${attacks == null ? "—" : fmt(attacks)}</b></div><div class="tip-row"><span>Top attack</span><b>${esc(top)}</b></div><div class="tip-row"><span>Threat level</span><b class="${lv[1]}">${lv[0]}</b></div>`;
}
function place(el, x, y) {
  el.classList.add("on");
  const w = el.offsetWidth || 268;
  const h = el.offsetHeight || 160;
  let left = x + 14;
  let top = y + 14;
  if (left + w > innerWidth - 8) left = Math.max(8, x - w - 14);
  if (top + h > innerHeight - 8) top = Math.max(8, y - h - 14);
  el.style.left = left + "px";
  el.style.top = top + "px";
}
function onTraffic(msg) {
  const lat = Number(msg.src_lat);
  const lon = Number(msg.src_long);
  const iso = String(msg.iso_code || "XX").toUpperCase();
  const country = msg.country || iso;
  const city = msg.city || "";
  const ip = msg.src_ip || "";
  const proto = msg.protocol || "OTHER";
  const attack = msg.type2 || "Unknown-Attack";
  const cve = msg.type3 || "";
  const color = msg.color || "#00D9FF";
  const when = msg.event_time || ts();
  const clock = when.length >= 19 ? when.slice(11) : when;
  const date = when.length >= 10 ? when.slice(0, 10) : "";
  const sev = severity(proto, color);
  const hp = targetCity(ip);

  countryCounts[country] = (countryCounts[country] || 0) + 1;
  countryNames[iso] = country;
  if (!countryAttacks[country]) countryAttacks[country] = {};
  countryAttacks[country][attack] = (countryAttacks[country][attack] || 0) + 1;

  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const origin = [lon, lat];
    const dest = [hp[1], hp[2]];
    arcs.push({
      o: origin,
      h: dest,
      col: sev[2] || color,
      t0: performance.now(),
      it: d3.geoInterpolate(origin, dest),
      d: d3.geoDistance(origin, dest),
      c: iso,
      ip,
      city: hp[0],
      attack,
      proto,
      sev
    });
    if (arcs.length > 40) arcs.splice(0, arcs.length - 40);
    $("ban").classList.add("on");
    $("bc").textContent = cve;
    $("bk").textContent = iso + " → " + hp[0].toUpperCase();
  }

  bumpRate();
  addRow(
    "lfb",
    `<span class="mono">${esc(clock)}<small>${esc(date)}</small></span><span class="mono">${esc(ip)}</span><span class="fc">${flag(iso)}<span>${esc(country)}${city ? `<small>${esc(city)}</small>` : ""}</span></span><span class="svc">${esc(proto)}</span><span class="th ${sev[1]}">${sev[0]}</span>`,
    LFC, 40, "t2"
  );
  addRow(
    "cvb",
    `<span class="mono">${esc(clock)}<small>${esc(date)}</small></span><span class="mono cve"><i class="pip ${sev[1]}"></i>${esc(cve)}</span><span>${flag(iso)}</span><span class="mono">${esc(ip)}</span>`,
    CVC, 40
  );

  typeCounts[attack] = (typeCounts[attack] || 0) + 1;
  typeColor[attack] = sev[2] || color;
  renderBar();
  $("sa").textContent = fmt(msg.event_count || 0);
  $("sc").textContent = fmt(liveKeys(msg.countries_tracked).length);
  $("si").textContent = fmt(liveKeys(msg.ips_tracked).length);
  $("sync").textContent = clock || ts().slice(11);
  renderTop(msg.countries_tracked, msg.ips_tracked, msg.country_to_code || {}, msg.ip_to_code || {});
}

let webSock;
function connect() {
  const proto = location.protocol === "https:" ? "wss://" : "ws://";
  webSock = new WebSocket(proto + location.host + "/websocket");
  webSock.onopen = () => { $("conn").innerHTML = `<i class="pulse" aria-hidden="true"></i>LIVE THREAT GLOBE`; };
  webSock.onclose = () => {
    $("conn").innerHTML = `<i class="pulse" aria-hidden="true"></i>RECONNECTING`;
    setTimeout(connect, 1500);
  };
  webSock.onerror = () => { try { webSock.close(); } catch (err) {} };
  webSock.onmessage = (event) => {
    let msg;
    try { msg = JSON.parse(event.data); } catch (err) { return; }
    if (!msg || (msg.type && msg.type !== "Traffic")) return;
    onTraffic(msg);
  };
}

const cv = $("cv");
const ctx = cv.getContext("2d");
let topoReady = false;
let ctry = [];
let land, brd, sts, stB, inO, inL, inC, grat;
const sph = { type: "Sphere" };
const nameShort = {
  "United States of America": "USA",
  "Dem. Rep. Congo": "DR Congo",
  "Central African Rep.": "C. African Rep.",
  "Bosnia and Herz.": "Bosnia"
};
let pa, pb, path;
let W, Hh, GR, CX, CY, dpr;
let zoom = 1;
let rot = [-72, -20];
let auto = true;
let drag = null;
let resume = 0;
let stars;
let last = 0;
let hov = null;
let tgt = null;
const ZMAX = 8;
const ZMIN = 0.7;
const clampL = (v) => Math.max(-65, Math.min(65, v));

function resize() {
  W = document.documentElement.clientWidth || innerWidth;
  Hh = document.documentElement.clientHeight || innerHeight;
  dpr = devicePixelRatio || 1;
  cv.width = W * dpr;
  cv.height = Hh * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const narrow = W < 1180;
  const topH = ($("top") && $("top").offsetHeight) || 66;
  const bot = narrow ? 156 : 124;
  const pw = narrow ? 0 : Math.min(520, Math.max(400, W * 0.26));
  document.documentElement.style.setProperty("--chrome", (topH + 10) + "px");
  GR = Math.max(120, Math.min((W - (narrow ? 28 : pw * 2 + 40)) / 2, (Hh - topH - bot) / 2.02));
  CX = W / 2;
  CY = (topH + 10 + Hh - bot) / 2;
  if (!narrow) {
    $("L").classList.remove("open");
    $("Rt").classList.remove("open");
    $("shade").classList.remove("on");
  }
  stars = document.createElement("canvas");
  stars.width = Math.max(1, W);
  stars.height = Math.max(1, Hh);
  const starCtx = stars.getContext("2d");
  if (document.documentElement.dataset.theme !== "light") {
    for (let i = 0; i < 380; i++) {
      starCtx.fillStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.55})`;
      const r = Math.random() < 0.08 ? 1.4 : 0.7;
      starCtx.fillRect(Math.random() * W, Math.random() * Hh, r, r);
    }
  }
}
function flyTo(r, z) {
  tgt = { r, z };
  resume = performance.now() + 9000;
}
function themeColors() {
  const light = document.documentElement.dataset.theme === "light";
  if (light) {
    return {
      stars: 0, sky0: "#e7eef6", sky1: "#f6f4ef",
      at0: "rgba(16,120,170,.22)", at1: "rgba(80,150,190,.08)",
      oc0: "#c5daf2", oc1: "#8eafd0", land: "#d5dece",
      coast: "rgba(40,68,88,.38)", brd: "rgba(28,48,68,.45)", brd2: "rgba(255,255,255,.9)",
      india: "#7eae8c", hov: "rgba(8,122,150,.28)", hovI: "rgba(12,138,98,.34)",
      edge: "#0C8A62", grid: "rgba(40,80,120,.22)",
      sh0: "rgba(255,255,255,.2)", sh1: "rgba(20,40,70,.1)", sh2: "rgba(12,28,48,.28)",
      label: "rgba(16,34,54,.78)", on: "#102033", city: "#087A96"
    };
  }
  return {
    stars: 1,
    at0: "rgba(0,170,214,.34)", at1: "rgba(0,90,160,.1)",
    oc0: "#16344f", oc1: "#07111c", land: "#24384c",
    coast: "rgba(150,196,224,.34)", brd: "rgba(3,8,16,.75)", brd2: "rgba(190,216,234,.58)",
    india: "#1c4d62", hov: "rgba(0,217,255,.22)", hovI: "rgba(32,214,160,.32)",
    edge: "#20D6A0", grid: "rgba(160,198,224,.16)",
    sh0: "rgba(0,0,0,0)", sh1: "rgba(0,8,18,.34)", sh2: "rgba(0,0,0,.8)",
    label: "rgba(216,230,242,.64)", on: "#f4fbff", city: "#20D6A0"
  };
}
function frame(now) {
  const dt = Math.min(60, now - last);
  last = now;
  if (tgt) {
    const k = 1 - Math.pow(0.88, dt / 16);
    const d0 = ((tgt.r[0] - rot[0]) % 360 + 540) % 360 - 180;
    rot[0] += d0 * k;
    rot[1] += (tgt.r[1] - rot[1]) * k;
    zoom += (tgt.z - zoom) * k;
    if (Math.abs(d0) < 0.05 && Math.abs(tgt.z - zoom) < 0.005) tgt = null;
  } else if (auto && !drag && now > resume) {
    rot[0] += dt * 0.003;
  }

  const sc = GR * zoom;
  if (topoReady) {
    pa.rotate([rot[0], rot[1]]).scale(sc).translate([CX, CY]);
    pb.rotate([rot[0], rot[1]]).scale(sc).translate([CX, CY]);
  }
  const cen = [-rot[0], -rot[1]];
  const C = themeColors();
  ctx.clearRect(0, 0, W, Hh);
  if (C.stars) ctx.drawImage(stars, 0, 0);
  else {
    const sky = ctx.createLinearGradient(0, 0, 0, Hh);
    sky.addColorStop(0, C.sky0);
    sky.addColorStop(1, C.sky1);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, Hh);
  }

  let g = ctx.createRadialGradient(CX, CY, sc * 0.9, CX, CY, sc * 1.45);
  g.addColorStop(0, C.at0);
  g.addColorStop(0.42, C.at1);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(CX, CY, sc * 1.45, 0, 7);
  ctx.fill();

  if (!topoReady) {
    requestAnimationFrame(frame);
    return;
  }

  ctx.beginPath();
  path(sph);
  g = ctx.createRadialGradient(CX - sc * 0.3, CY - sc * 0.34, sc * 0.12, CX, CY, sc);
  g.addColorStop(0, C.oc0);
  g.addColorStop(1, C.oc1);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.beginPath();
  path(grat);
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 0.55;
  ctx.stroke();
  ctx.beginPath();
  path(land);
  ctx.fillStyle = C.land;
  ctx.fill();
  ctx.strokeStyle = C.coast;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  if (hov && !hov.st) {
    ctx.beginPath();
    path(hov.f);
    ctx.fillStyle = C.hov;
    ctx.fill();
  }
  ctx.beginPath();
  path(brd);
  ctx.strokeStyle = C.brd;
  ctx.lineWidth = Math.min(3, 1.6 + zoom * 0.2);
  ctx.stroke();
  ctx.strokeStyle = C.brd2;
  ctx.lineWidth = Math.min(1.5, 0.75 + zoom * 0.1);
  ctx.stroke();
  ctx.beginPath();
  path(inL);
  ctx.fillStyle = C.india;
  ctx.fill();
  if (hov && hov.st) {
    ctx.beginPath();
    path(hov.f);
    ctx.fillStyle = C.hovI;
    ctx.fill();
  }
  ctx.beginPath();
  path(stB);
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = Math.min(1.1, 0.45 + zoom * 0.12);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  path(inO);
  ctx.strokeStyle = C.edge;
  ctx.lineWidth = Math.min(2, 1 + zoom * 0.12);
  ctx.shadowColor = C.edge;
  ctx.shadowBlur = 7;
  ctx.stroke();
  ctx.restore();
  g = ctx.createRadialGradient(CX - sc * 0.32, CY - sc * 0.35, sc * 0.08, CX, CY, sc);
  g.addColorStop(0, C.sh0);
  g.addColorStop(0.6, C.sh1);
  g.addColorStop(1, C.sh2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(CX, CY, sc, 0, 7);
  ctx.fill();

  const vis = (ll) => Math.cos(d3.geoDistance(ll, cen)) > 0;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (zoom < 1.7) {
    if (vis(inC)) {
      const p = pb(inC);
      ctx.font = "600 12px Inter,sans-serif";
      ctx.fillStyle = C.label;
      ctx.fillText("INDIA", p[0], p[1]);
    }
  } else {
    sts.forEach((state) => {
      if (!vis(state.c)) return;
      const px = state.a * sc * sc;
      if (px < 1500) return;
      const p = pb(state.c);
      const fs = Math.max(9, Math.min(13, Math.sqrt(px) / 7));
      ctx.font = `${fs}px "JetBrains Mono",monospace`;
      ctx.fillStyle = hov && hov.f === state ? C.on : C.label;
      ctx.fillText(state.properties.name.toUpperCase(), p[0], p[1]);
    });
  }
  ctry.forEach((country) => {
    if (!vis(country.c)) return;
    const px = country.a * sc * sc;
    if (px < (zoom < 1.7 ? 9000 : 4000)) return;
    const p = pb(country.c);
    const fs = Math.max(9, Math.min(12, Math.sqrt(px) / 9));
    ctx.font = `${fs}px "JetBrains Mono",monospace`;
    ctx.fillStyle = hov && hov.f === country ? C.on : C.label;
    ctx.fillText((nameShort[country.properties.name] || country.properties.name).toUpperCase(), p[0], p[1]);
  });
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  HP.forEach((city) => {
    const ll = [city[1], city[2]];
    if (!vis(ll)) return;
    const p = pb(ll);
    const pulse = (now / 1400) % 1;
    ctx.fillStyle = C.city;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 2.6, 0, 7);
    ctx.fill();
    ctx.strokeStyle = C.city;
    ctx.globalAlpha = 0.45 * (1 - pulse);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 4 + 12 * pulse, 0, 7);
    ctx.stroke();
    ctx.globalAlpha = 1;
    if (zoom >= 2.2) {
      ctx.font = '10px "JetBrains Mono",monospace';
      ctx.fillStyle = C.on;
      ctx.fillText(city[0], p[0] + 6, p[1] + 12);
    }
  });

  for (let i = arcs.length - 1; i >= 0; i--) {
    const arc = arcs[i];
    const age = now - arc.t0;
    if (age > 2000) {
      arcs.splice(i, 1);
      continue;
    }
    const head = Math.min(1, age / 900);
    const alpha = age < 900 ? 1 : Math.max(0, 1 - (age - 900) / 1100);
    const height = 0.1 + 0.3 * arc.d / Math.PI;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = arc.col;
    ctx.fillStyle = arc.col;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = arc.col;
    ctx.shadowBlur = 8;
    let pen = false, hx = 0, hy = 0, hv = false;
    const steps = 44;
    ctx.beginPath();
    for (let j = 0; j <= steps; j++) {
      const t = head * j / steps;
      const ll = arc.it(t);
      const lift = 1 + height * Math.sin(Math.PI * t);
      const p = pb(ll);
      const x = CX + (p[0] - CX) * lift;
      const y = CY + (p[1] - CY) * lift;
      const facing = Math.cos(d3.geoDistance(ll, cen));
      const visible = facing > 0 || Math.hypot(x - CX, y - CY) > sc;
      if (visible) {
        if (pen) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
        pen = true;
      } else pen = false;
      hx = x; hy = y; hv = visible;
    }
    ctx.stroke();
    if (head < 1 && hv) {
      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, 7);
      ctx.fill();
    }
    if (vis(arc.o)) {
      const p = pb(arc.o);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 3, 0, 7);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = '11px "JetBrains Mono",monospace';
      ctx.fillStyle = C.on;
      ctx.fillText(arc.c, p[0] + 6, p[1] - 6);
    }
    ctx.shadowBlur = 0;
    if (age > 900 && vis(arc.h)) {
      const p = pb(arc.h);
      for (let ring = 0; ring < 2; ring++) {
        const q = (age - 900 - ring * 200) / 1000;
        if (q > 0 && q < 1) {
          ctx.globalAlpha = (1 - q) * 0.9;
          ctx.strokeStyle = arc.col;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 4 + 26 * q, 0, 7);
          ctx.stroke();
        }
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  requestAnimationFrame(frame);
}

const inBox = (b, ll) => ll[1] >= b[0][1] && ll[1] <= b[1][1] && ll[0] >= b[0][0] && ll[0] <= b[1][0];
function pick(x, y) {
  if (!topoReady) return null;
  const ll = pa.invert([x, y]);
  if (!ll || d3.geoDistance(ll, [-rot[0], -rot[1]]) > Math.PI / 2 - 0.01) return null;
  for (const state of sts) {
    if (inBox(state.b, ll) && d3.geoContains(state, ll)) return { f: state, st: 1 };
  }
  for (const country of ctry) {
    if (d3.geoContains(country, ll)) return { f: country, st: 0 };
  }
  return null;
}
function hitArc(x, y) {
  const now = performance.now();
  const cen = [-rot[0], -rot[1]];
  let best = null;
  let bd = 14;
  for (const a of arcs) {
    const age = now - a.t0;
    if (age > 1900) continue;
    const hd = Math.min(1, age / 900);
    for (let j = 0; j <= 12; j++) {
      const l = a.it(hd * j / 12);
      if (Math.cos(d3.geoDistance(l, cen)) <= 0) continue;
      const p = pb(l);
      const dist = Math.hypot(p[0] - x, p[1] - y);
      if (dist < bd) {
        bd = dist;
        best = a;
      }
    }
  }
  return best;
}
function showArc(a, x, y) {
  const sev = a.sev || ["MEDIUM", "sev-m"];
  $("insp-b").innerHTML = `<div class="tip-k">ATTACK PATH</div><div class="tip-h"><strong>${esc(a.c)} → ${esc(String(a.city || "INDIA").toUpperCase())}</strong></div><div class="tip-row"><span>Source IP</span><b>${esc(a.ip || "—")}</b></div><div class="tip-row"><span>Attack type</span><b>${esc(a.attack || "—")}</b></div><div class="tip-row"><span>Service</span><b>${esc(a.proto || "—")}</b></div><div class="tip-row"><span>Severity</span><b class="${sev[1]}">${sev[0]}</b></div>`;
  place($("insp"), x, y);
}
function focusHit(h) {
  if (!h) return;
  if (h.st) {
    const c = h.f.c;
    const size = Math.max(h.f.b[1][0] - h.f.b[0][0], h.f.b[1][1] - h.f.b[0][1]);
    flyTo([-c[0], -c[1]], Math.max(2.4, Math.min(ZMAX, 40 / Math.max(size, 1))));
  } else {
    const c = d3.geoCentroid(h.f);
    flyTo([-c[0], -c[1]], Math.min(ZMAX, Math.max(zoom * 1.35, 1.8)));
  }
}
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("cp-theme", t); } catch (err) {}
  const light = t === "light";
  $("theme").setAttribute("aria-pressed", String(light));
  $("theme").setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  resize();
}
function syncFs() {
  const on = !!document.fullscreenElement;
  $("fs").classList.toggle("on", on);
  $("fs").setAttribute("aria-pressed", String(on));
  $("fs").setAttribute("aria-label", on ? "Exit fullscreen" : "Enter fullscreen");
  $("fs").querySelector(".i-enter").style.display = on ? "none" : "";
  $("fs").querySelector(".i-exit").style.display = on ? "" : "none";
}
function drawers(which) {
  $("L").classList.toggle("open", which === "L");
  $("Rt").classList.toggle("open", which === "Rt");
  $("shade").classList.toggle("on", which === "L" || which === "Rt");
  document.querySelectorAll("#dock button").forEach((b) => b.classList.toggle("on", b.dataset.panel === (which || "globe")));
}
function bindChrome() {
  resize();
  addEventListener("resize", resize);
  cv.addEventListener("wheel", (event) => {
    event.preventDefault();
    tgt = null;
    zoom = Math.min(ZMAX, Math.max(ZMIN, zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1)));
  }, { passive: false });
  cv.addEventListener("pointerdown", (event) => {
    tgt = null;
    drag = [event.clientX, event.clientY, rot[0], rot[1]];
    cv.setPointerCapture(event.pointerId);
    cv.style.cursor = "grabbing";
    $("tip").classList.remove("on");
  });
  cv.addEventListener("pointermove", (event) => {
    const tip = $("tip");
    if (drag) {
      rot[0] = drag[2] + (event.clientX - drag[0]) * 0.3 / zoom;
      rot[1] = clampL(drag[3] - (event.clientY - drag[1]) * 0.3 / zoom);
      return;
    }
    if (event.pointerType !== "mouse") return;
    hov = pick(event.clientX, event.clientY);
    if (hov) {
      tip.innerHTML = intelHTML(hov.f.properties.name, !!hov.st);
      place(tip, event.clientX, event.clientY);
      cv.style.cursor = "pointer";
    } else {
      tip.classList.remove("on");
      cv.style.cursor = "grab";
    }
  });
  cv.addEventListener("pointerleave", () => {
    hov = null;
    $("tip").classList.remove("on");
  });
  cv.addEventListener("pointerup", (event) => {
    const moved = drag ? Math.hypot(event.clientX - drag[0], event.clientY - drag[1]) : 99;
    drag = null;
    resume = performance.now() + 2500;
    cv.style.cursor = "grab";
    if (moved > 6) return;
    const a = hitArc(event.clientX, event.clientY);
    if (a) {
      showArc(a, event.clientX, event.clientY);
      return;
    }
    $("insp").classList.remove("on");
    focusHit(pick(event.clientX, event.clientY));
  });
  cv.addEventListener("pointercancel", () => {
    drag = null;
    resume = performance.now() + 2500;
    cv.style.cursor = "grab";
  });
  $("zi").onclick = () => flyTo([rot[0], rot[1]], Math.min(ZMAX, (tgt ? tgt.z : zoom) * 1.35));
  $("zo").onclick = () => flyTo([rot[0], rot[1]], Math.max(ZMIN, (tgt ? tgt.z : zoom) / 1.35));
  $("b1").onclick = () => flyTo([-72, -20], 1);
  $("fi").onclick = () => { if (inC) flyTo([-inC[0], -inC[1]], 2.7); };
  $("rt").onclick = () => {
    auto = !auto;
    $("rt").classList.toggle("on", auto);
    $("rt").setAttribute("aria-pressed", String(auto));
  };
  try {
    const saved = localStorage.getItem("cp-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  } catch (err) {}
  $("theme").onclick = () => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
  $("fs").onclick = () => {
    const p = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    if (p && p.catch) p.catch(() => {});
  };
  document.addEventListener("fullscreenchange", syncFs);
  document.querySelectorAll("#dock button").forEach((b) => b.onclick = () => drawers(b.dataset.panel));
  $("shade").onclick = () => drawers("globe");
  $("insp-x").onclick = () => $("insp").classList.remove("on");
}
function initTopo(topo) {
  const isIndia = (geometry) => geometry.properties.name === "India";
  ctry = topojson.feature(topo, topo.objects.countries).features.filter((feature) => !isIndia(feature));
  land = topojson.merge(topo, topo.objects.countries.geometries.filter((geometry) => !isIndia(geometry)));
  brd = topojson.mesh(topo, topo.objects.countries, (a, b) => a !== b && !isIndia(a) && !isIndia(b));
  sts = topojson.feature(topo, topo.objects.states).features;
  stB = topojson.mesh(topo, topo.objects.states, (a, b) => a !== b);
  inO = topojson.mesh(topo, topo.objects.states, (a, b) => a === b);
  inL = topojson.merge(topo, topo.objects.states.geometries);
  sts.forEach((state) => {
    state.c = d3.geoCentroid(state);
    state.a = d3.geoArea(state);
    state.b = d3.geoBounds(state);
  });
  const fixRing = (polygon) => d3.geoArea({ type: "Polygon", coordinates: polygon }) > 2 * Math.PI
    ? polygon.map((ring) => ring.slice().reverse())
    : polygon;
  ctry.forEach((country) => {
    const geometry = country.geometry;
    if (geometry.type === "Polygon") geometry.coordinates = fixRing(geometry.coordinates);
    else if (geometry.type === "MultiPolygon") geometry.coordinates = geometry.coordinates.map(fixRing);
  });
  ctry.forEach((country) => {
    const geometry = country.geometry;
    const big = geometry.type === "MultiPolygon"
      ? {
        type: "Polygon",
        coordinates: geometry.coordinates.reduce((best, polygon) =>
          d3.geoArea({ type: "Polygon", coordinates: polygon }) > d3.geoArea({ type: "Polygon", coordinates: best }) ? polygon : best)
      }
      : geometry;
    country.c = d3.geoCentroid(big);
    country.a = d3.geoArea(big);
  });
  pa = d3.geoOrthographic().clipAngle(90).precision(0.5);
  pb = d3.geoOrthographic().clipAngle(null);
  path = d3.geoPath(pa, ctx);
  grat = d3.geoGraticule().step([20, 20]);
  inC = d3.geoCentroid(inL);
  topoReady = true;
  setTimeout(() => {
    const boot = $("boot");
    if (boot) boot.classList.add("off");
    setTimeout(() => boot && boot.remove(), 420);
  }, 180);
}

renderBar();
renderTop({}, {}, {}, {});
bindChrome();
requestAnimationFrame(frame);
fetch("/static/topo.json")
  .then((response) => response.json())
  .then(initTopo)
  .catch(() => {
    $("conn").innerHTML = `<i class="pulse" aria-hidden="true"></i>MAP DATA MISSING`;
    const boot = $("boot");
    if (boot) boot.remove();
  });
connect();
