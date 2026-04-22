var _devBuildVer = "1.0.0";

// Register Ultraviolet service worker so iframe `/service/<base64>` URLs proxy.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/uv/sw.js', { scope: '/service/' })
    .catch(function (e) { console.warn('[uv] sw register failed:', e); });
}

// ═══════════════════════════════════════════════════════════════════════
//  BOT BRIDGE — posts login / game-open / song-play / heartbeat events
//  to the Discord bot HTTP server (index.js /event, /heartbeat, /login-check).
//  Configure the endpoint:  localStorage.setItem('botUrl','https://your-bot')
// ═══════════════════════════════════════════════════════════════════════
(function BotBridgeInit() {
  var BOT_URL = localStorage.getItem('botUrl') || 'http://localhost:3000';
  var currentEmail = null;
  var lastSentLogin = null;
  var heartbeatTimer = null;

  function post(path, body) {
    return fetch(BOT_URL + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {}),
      mode: 'cors',
      keepalive: true,
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  function event(type, detail) {
    if (!currentEmail) return;
    post('/event', { email: currentEmail, type: type, detail: detail || '' });
  }

  function heartbeat() {
    if (!currentEmail) return;
    post('/heartbeat', { email: currentEmail });
  }

  function setUser(email) {
    email = (email || '').trim().toLowerCase();
    if (!email || email === currentEmail) return;
    currentEmail = email;
    if (lastSentLogin !== email) {
      event('login', navigator.userAgent.slice(0, 80));
      lastSentLogin = email;
    }
    if (!heartbeatTimer) {
      heartbeat();
      heartbeatTimer = setInterval(heartbeat, 45_000);
    }
  }

  function clearUser() {
    if (currentEmail) { event('logout', ''); }
    currentEmail = null; lastSentLogin = null;
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  // Scrape email from auth UI rendered by index.html (updateProfileUI writes it)
  function pollEmail() {
    var el = document.getElementById('auth-useremail') || document.querySelector('.user-email');
    var txt = el && el.textContent && el.textContent.indexOf('@') !== -1 ? el.textContent.trim() : null;
    if (txt) setUser(txt); else if (currentEmail && !txt) clearUser();
  }
  // MutationObserver replaces setInterval — zero idle CPU cost
  (function(){
    var _obs=new MutationObserver(pollEmail);
    function _watch(){
      pollEmail();
      var t=document.getElementById('auth-section')||document.getElementById('profile-section')||document.body;
      _obs.observe(t,{childList:true,subtree:true,characterData:true});
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_watch);
    else _watch();
  })();

  // Relay events from iframe srcdocs (games, music) via postMessage
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || d.__bot !== true) return;
    if (d.type === 'game-open') event('game-open', d.detail || '');
    else if (d.type === 'song-play') event('song-play', d.detail || '');
    else if (d.type === 'app-open') event('app-open', d.detail || '');
  });

  // Fire app-open when a window is opened from the parent OS
  var _origOpen = window.openWindow;
  if (typeof _origOpen === 'function') {
    window.openWindow = function (id) {
      event('app-open', id || '');
      return _origOpen.apply(this, arguments);
    };
  }

  window.BotBridge = { event: event, heartbeat: heartbeat, setUser: setUser, clearUser: clearUser,
    get email() { return currentEmail; }, get url() { return BOT_URL; } };

  window.addEventListener('beforeunload', function () {
    if (currentEmail) navigator.sendBeacon && navigator.sendBeacon(BOT_URL + '/event',
      new Blob([JSON.stringify({ email: currentEmail, type: 'logout', detail: '' })], { type: 'application/json' }));
  });
})();

var _ico = function(svg){ return 'data:image/svg+xml,' + encodeURIComponent(svg); };
var APPS = {
    'cine': {title:'Hub', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1a1a2e"/><rect x="8" y="8" width="14" height="14" rx="3" fill="#9090b0"/><rect x="26" y="8" width="14" height="14" rx="3" fill="#7070a0"/><rect x="8" y="26" width="14" height="14" rx="3" fill="#7070a0"/><rect x="26" y="26" width="14" height="14" rx="3" fill="#5050a0"/></svg>')},
    'term': {title:'Music', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0f1a28"/><path d="M20 34V16l20-4v7" stroke="#8aa0c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="14" cy="34" r="6" fill="none" stroke="#8aa0c0" stroke-width="2.5"/><circle cx="34" cy="19" r="6" fill="none" stroke="#8aa0c0" stroke-width="2.5"/></svg>')},
    'files': {title:'Games', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0d1520"/><rect x="5" y="16" width="38" height="19" rx="7" fill="none" stroke="#8090a8" stroke-width="2"/><line x1="17" y1="22" x2="17" y2="29" stroke="#a0b0c0" stroke-width="2.5" stroke-linecap="round"/><line x1="13" y1="25.5" x2="21" y2="25.5" stroke="#a0b0c0" stroke-width="2.5" stroke-linecap="round"/><circle cx="31" cy="22" r="2" fill="#8090a8"/><circle cx="35" cy="25.5" r="2" fill="#8090a8"/><circle cx="31" cy="29" r="2" fill="#8090a8"/><circle cx="27" cy="25.5" r="2" fill="#8090a8"/></svg>')},
    'web': {title:'Browser', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#101520"/><circle cx="24" cy="24" r="16" fill="none" stroke="#7080a0" stroke-width="2"/><ellipse cx="24" cy="24" rx="7" ry="16" fill="none" stroke="#7080a0" stroke-width="1.5"/><line x1="8" y1="24" x2="40" y2="24" stroke="#7080a0" stroke-width="1.5"/><line x1="11" y1="17" x2="37" y2="17" stroke="#505870" stroke-width="1"/><line x1="11" y1="31" x2="37" y2="31" stroke="#505870" stroke-width="1"/></svg>')},
    'settings': {title:'Settings', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#141414"/><circle cx="24" cy="24" r="6" fill="none" stroke="#909090" stroke-width="2.5"/><path d="M24 8v4M24 36v4M8 24h4M36 24h4M12.7 12.7l2.8 2.8M32.5 32.5l2.8 2.8M12.7 35.3l2.8-2.8M32.5 15.5l2.8-2.8" stroke="#909090" stroke-width="2.5" stroke-linecap="round"/></svg>')},
    'discord': {title:'Discord', internal:true, pinned:false, icon:'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'},
    'roblox': {title:'Roblox', internal:true, pinned:false, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KvNyFWMg_bjo_q_1IVLKFWbfCeonn2qDow&s'},
    'youtube': {title:'YouTube', internal:true, pinned:false, icon:'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'},
    'ciniai': {title:'Intellectual AI', internal:true, pinned:false, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#080e1c"/><circle cx="24" cy="24" r="7" fill="#1e3060" stroke="#4060b0" stroke-width="1.5"/><circle cx="24" cy="24" r="3" fill="#6090e0"/><circle cx="24" cy="9" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="24" cy="39" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="9" cy="24" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="39" cy="24" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="13.5" cy="13.5" r="2.5" fill="#2040a0" opacity="0.6"/><circle cx="34.5" cy="13.5" r="2.5" fill="#2040a0" opacity="0.6"/><circle cx="13.5" cy="34.5" r="2.5" fill="#2040a0" opacity="0.6"/><circle cx="34.5" cy="34.5" r="2.5" fill="#2040a0" opacity="0.6"/><line x1="24" y1="17" x2="24" y2="12.5" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/><line x1="24" y1="31" x2="24" y2="35.5" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/><line x1="17" y1="24" x2="12.5" y2="24" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/><line x1="31" y1="24" x2="35.5" y2="24" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/></svg>')},
    'Geforce': {title:'GeForce NOW', internal:true, pinned:false, icon:'https://play-lh.googleusercontent.com/_-b_HQXrVyyhZSHj_BoE9u_-cxkcHDH_yLX5rDjJsFMIfsCNQs9F3QP4JvEFcWaSIz0=w240-h480-rw'},
    'anime': {title:'Anime', internal:true, pinned:false, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0d0a18"/><circle cx="18" cy="22" r="3.2" fill="#fff"/><circle cx="30" cy="22" r="3.2" fill="#fff"/><circle cx="18" cy="22" r="1.4" fill="#0d0a18"/><circle cx="30" cy="22" r="1.4" fill="#0d0a18"/><path d="M14 30 Q24 38 34 30" stroke="#ff5d8f" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M9 16 Q14 11 19 14 M29 14 Q34 11 39 16" stroke="#ff5d8f" stroke-width="2" stroke-linecap="round" fill="none"/></svg>')},
};

var savedPins = localStorage.getItem('intel_pins_v2');
if(savedPins){var p=JSON.parse(savedPins);for(var k in p){if(APPS[k])APPS[k].pinned=p[k];}}
function syncPins(){var obj={};for(var k in APPS)obj[k]=APPS[k].pinned;localStorage.setItem('intel_pins_v2',JSON.stringify(obj));if(window.saveToCloud)window.saveToCloud();}

var wallpaperRegistry = {
    "css-space":  {id:"css-space",  name:"Deep Space",  url:"__css__", css:"radial-gradient(ellipse at 20% 50%, #0d0d2b 0%, #000 70%)",  locked:false},
    "css-forest": {id:"css-forest", name:"Dark Forest",  url:"__css__", css:"radial-gradient(ellipse at bottom, #0a1a0a 0%, #000 70%)",   locked:false},
    "css-ocean":  {id:"css-ocean",  name:"Deep Ocean",   url:"__css__", css:"radial-gradient(ellipse at top, #001a2e 0%, #000 70%)",      locked:false},
    "css-fire":   {id:"css-fire",   name:"Ember",        url:"__css__", css:"radial-gradient(ellipse at bottom right, #1a0500 0%, #000 70%)", locked:false},
    "css-purple": {id:"css-purple", name:"Nebula",       url:"__css__", css:"radial-gradient(ellipse at center, #0d001a 0%, #000 70%)",   locked:false},
    "css-ice":    {id:"css-ice",    name:"Frost",        url:"__css__", css:"radial-gradient(ellipse at top left, #001020 0%, #000 70%)", locked:false},
    "blackhole":  {id:"blackhole",  name:"Blue Void",    url:"__blackhole__", locked:false},
};

var sysConfig = JSON.parse(localStorage.getItem('intel_sys_config'))||{};
if(sysConfig.optBg===undefined)sysConfig.optBg=true;
if(sysConfig.shortBoot===undefined)sysConfig.shortBoot=false;
if(sysConfig.wpLoop===undefined)sysConfig.wpLoop=false;
if(sysConfig.idleLock===undefined)sysConfig.idleLock=false;
if(sysConfig.redirectConfirm===undefined)sysConfig.redirectConfirm=false;
if(!sysConfig.panicKey)sysConfig.panicKey='`';
if(!sysConfig.homeWallpaper)sysConfig.homeWallpaper='blackhole';
if(!sysConfig.lockWallpaper)sysConfig.lockWallpaper='css-ocean';
if(!sysConfig.cloak)sysConfig.cloak='none';

window.updateSysSetting=function(key,value){sysConfig[key]=value;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));if(key==='optBg')applySystemSettings();if(window.saveToCloud)window.saveToCloud();};
var BLOOKET_GATEWAYS = ["bees","mining","laser","coco","defense2","defense","brawl","dinos","cafe","factory","racing","rush","classic"];
function blooketMask(url){try{var h=new URL(url).hostname;var b64=btoa(h);return BLOOKET_GATEWAYS.map(function(g){return"https://"+g+".blooket.com/gs/"+b64+"/";})[Math.floor(Math.random()*BLOOKET_GATEWAYS.length)];}catch(e){return url;}}
var cloaks={none:{title:"Intellectual OS",icon:""},google:{title:"Google",icon:"https://www.google.com/favicon.ico"},drive:{title:"My Drive - Google Drive",icon:"https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"},canvas:{title:"Dashboard",icon:"https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico"},classroom:{title:"Classes",icon:"https://ssl.gstatic.com/classroom/favicon.png"},bees:{title:"Blooket",icon:"https://bees.blooket.com/favicon.ico",url:"https://bees.blooket.com/gs/Z24tbWF0aC5kZXY="},mining:{title:"Blooket",icon:"https://mining.blooket.com/favicon.ico",url:"https://mining.blooket.com/gs/Z24tbWF0aC5kZXY="},laser:{title:"Blooket",icon:"https://laser.blooket.com/favicon.ico",url:"https://laser.blooket.com/gs/Z24tbWF0aC5kZXY="},coco:{title:"Blooket",icon:"https://coco.blooket.com/favicon.ico",url:"https://coco.blooket.com/gs/Z24tbWF0aC5kZXY="},defense2:{title:"Blooket",icon:"https://defense2.blooket.com/favicon.ico",url:"https://defense2.blooket.com/gs/Z24tbWF0aC5kZXY="},defense:{title:"Blooket",icon:"https://defense.blooket.com/favicon.ico",url:"https://defense.blooket.com/gs/Z24tbWF0aC5kZXY="},brawl:{title:"Blooket",icon:"https://brawl.blooket.com/favicon.ico",url:"https://brawl.blooket.com/gs/Z24tbWF0aC5kZXY="},dinos:{title:"Blooket",icon:"https://dinos.blooket.com/favicon.ico",url:"https://dinos.blooket.com/gs/Z24tbWF0aC5kZXY="},cafe:{title:"Blooket",icon:"https://cafe.blooket.com/favicon.ico",url:"https://cafe.blooket.com/gs/Z24tbWF0aC5kZXY="},factory:{title:"Blooket",icon:"https://factory.blooket.com/favicon.ico",url:"https://factory.blooket.com/gs/Z24tbWF0aC5kZXY="},racing:{title:"Blooket",icon:"https://racing.blooket.com/favicon.ico",url:"https://racing.blooket.com/gs/Z24tbWF0aC5kZXY="},rush:{title:"Blooket",icon:"https://rush.blooket.com/favicon.ico",url:"https://rush.blooket.com/gs/Z24tbWF0aC5kZXY="},classic:{title:"Blooket",icon:"https://classic.blooket.com/favicon.ico",url:"https://classic.blooket.com/gs/Z24tbWF0aC5kZXY="}};
window.updateCloak=function(key){sysConfig.cloak=key;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));applyCloak();};
function applyCloak(){var k=sysConfig.cloak||'none',sel=cloaks[k],icons=document.querySelectorAll("link[rel*='icon']");for(var i=0;i<icons.length;i++)icons[i].remove();if(sel&&k!=='none'){document.title=sel.title;var n=document.createElement('link');n.type='image/x-icon';n.rel='shortcut icon';n.href=sel.icon;document.getElementsByTagName('head')[0].appendChild(n);}else{document.title="Intellectual OS";}}
// applyCloak is called on load and whenever updateCloak() is invoked — no polling needed

var isDesktopActive=false,bootActive=true,enterCount=0,highestZ=500,activeWindowId=null,isMediaPlaying=false,activeCtxId=null;
var isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// Mobile / ChromeOS access enabled — warning suppressed. Hide the modal if the
// HTML left it visible. Add a `mobile` body class so CSS can adapt where needed.
(function(){var mw=document.getElementById('mobile-warning');if(mw){if(mw.close)try{mw.close();}catch(e){}mw.style.display='none';}if(isMobile)document.body.classList.add('mobile');})();

document.addEventListener("DOMContentLoaded",function(){
    var _bi=document.getElementById('bg-img');if(_bi)_bi.style.display='none';
    var _li=document.getElementById('lock-img');if(_li)_li.style.display='none';applyCloak();document.getElementById('boot-layer').style.display='block';renderUI();initWallpapers();setupAppContextMenu();loadDesktop();updateSidebarData();if(sysConfig.accentColor)applyAccentColor(sysConfig.accentColor);setupWallpaperUpload();});

// ── BOOT ─────────────────────────────────────────────────────────────────────
function startBootSequence(){
    if(sysConfig.shortBoot){skipBootSequence();return;}
    var bc=document.getElementById('boot-content');
    bc.style.opacity='0';
    setTimeout(function(){bc.style.display='none';},400);

    var bl=document.getElementById('boot-layer');
    var wrap=document.createElement('div');
    wrap.id='cinematic-boot';
    wrap.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;overflow:hidden;';

    wrap.innerHTML=`
      <div id="cb-logo" style="text-align:center;opacity:0;transform:translateY(24px);transition:opacity 1.2s cubic-bezier(0.2,0.8,0.2,1),transform 1.2s cubic-bezier(0.2,0.8,0.2,1);">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:clamp(1.4rem,4vw,2.8rem);letter-spacing:1px;color:#fff;text-shadow:0 0 60px rgba(255,255,255,0.15);margin-bottom:8px;">INTELLECTUAL</div>
        <div style="font-family:'Inter',sans-serif;font-size:clamp(.7rem,1.5vw,1rem);letter-spacing:1px;color:rgba(255,255,255,0.3);text-transform:uppercase;">Operating System &nbsp;// V2</div>
      </div>
      <div id="cb-bar-wrap" style="margin-top:60px;width:min(320px,60vw);opacity:0;transition:opacity .8s ease .6s;">
        <div style="position:relative;height:1px;background:rgba(255,255,255,0.08);border-radius:1px;overflow:visible;margin-bottom:18px;">
          <div id="cb-fill" style="position:absolute;top:0;left:0;height:100%;width:0%;background:#fff;border-radius:1px;transition:width .06s linear;box-shadow:0 0 12px rgba(255,255,255,0.6);"></div>
          <div id="cb-glow" style="position:absolute;top:-2px;left:0%;width:4px;height:5px;background:rgba(255,255,255,0.9);border-radius:2px;filter:blur(2px);transition:left .06s linear;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div id="cb-msg" style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.5px;color:rgba(255,255,255,0.25);text-transform:uppercase;transition:opacity .4s ease;">Starting...</div>
          <div id="cb-pct" style="font-family:'Space Grotesk',sans-serif;font-size:11px;color:rgba(255,255,255,0.2);">0%</div>
        </div>
      </div>
      <div id="cb-ver" style="position:absolute;bottom:30px;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.5px;color:rgba(255,255,255,0.1);opacity:0;transition:opacity 1s ease 1s;">BUILD ${_devBuildVer}</div>
    `;
    bl.appendChild(wrap);

    var MSGS=['Starting...','Loading apps','Mounting','Almost ready','Ready'];
    var pct=0, mi=0, lastMsg=0;

    setTimeout(function(){
        document.getElementById('cb-logo').style.opacity='1';
        document.getElementById('cb-logo').style.transform='translateY(0)';
        document.getElementById('cb-bar-wrap').style.opacity='1';
        document.getElementById('cb-ver').style.opacity='1';
    },100);

    var iv=setInterval(function(){
        pct+=0.9;
        var p=Math.min(pct,100);
        var fill=document.getElementById('cb-fill');
        var glow=document.getElementById('cb-glow');
        var pctEl=document.getElementById('cb-pct');
        var msgEl=document.getElementById('cb-msg');
        if(fill)fill.style.width=p+'%';
        if(glow)glow.style.left=Math.max(0,p-0.5)+'%';
        if(pctEl)pctEl.textContent=Math.floor(p)+'%';
        var mi2=Math.floor((p/100)*MSGS.length);
        if(mi2!==lastMsg&&mi2<MSGS.length){
            lastMsg=mi2;
            if(msgEl){
                msgEl.style.opacity='0';
                setTimeout(function(){msgEl.textContent=MSGS[mi2];msgEl.style.opacity='1';},200);
            }
        }
        if(p>=100){
            clearInterval(iv);
            setTimeout(function(){
                wrap.style.transition='opacity .8s ease';
                wrap.style.opacity='0';
                setTimeout(function(){if(bootActive)skipBootSequence();},800);
            },600);
        }
    },18);
}

function skipBootSequence(){if(!bootActive)return;bootActive=false;var lay=document.getElementById('boot-layer');if(lay){lay.style.opacity='0';document.getElementById('lock-screen').classList.add('active');setTimeout(function(){lay.style.display='none';},600);updateClock();}}
document.addEventListener('keydown',function(e){if(bootActive&&e.key==='Enter'){enterCount++;if(enterCount>=2)skipBootSequence();setTimeout(function(){enterCount=0;},500);}if(e.key&&sysConfig.panicKey&&e.key.toLowerCase()===sysConfig.panicKey.toLowerCase())window.location.href="https://google.com";});

// ── WALLPAPERS ────────────────────────────────────────────────────────────────
var customWallpapers = JSON.parse(localStorage.getItem('intel_custom_wp') || '{}');

// Merge custom wallpapers into registry on load
for(var _ck in customWallpapers){ wallpaperRegistry[_ck] = customWallpapers[_ck]; }

window.addCustomWallpaper = function(name, url, type){
    if(!name||!url) return;
    var id = 'custom_' + Date.now();
    var wp = {id:id, name:name, url:url, locked:false, custom:true};
    if(type==='css') wp.css = url; // treat as CSS if flagged
    wallpaperRegistry[id] = wp;
    customWallpapers[id] = wp;
    localStorage.setItem('intel_custom_wp', JSON.stringify(customWallpapers));
    showNotification("Wallpaper added", '"'+name+'" is now available in Wallpaper Protocols.');
    if(window.saveToCloud)window.saveToCloud();
    return id;
};

function applyWallpaperCSS(wp,target){
    if(!wp)return;
    var da=document.getElementById('desktop-area'),ls=document.getElementById('lock-screen');
    var bv=document.getElementById('bg-video'),bi=document.getElementById('bg-img');
    var lv=document.getElementById('lock-video'),li=document.getElementById('lock-img');
    var bhc=document.getElementById('blackhole-canvas');
    if(wp.url==='__blackhole__'){
        if(target==='home'){bv.style.display='none';bi.style.display='none';da.style.background='transparent';if(bhc)bhc.style.display='block';}
        return;
    }
    if(bhc&&target==='home')bhc.style.display='none';
    if(wp.url==='__css__'||wp.css){
        var cssVal=wp.css||'#000';
        if(target==='home'){bv.style.display='none';bi.style.display='none';da.style.background=cssVal;}
        else{lv.style.display='none';li.style.display='none';ls.style.background=cssVal;}
    } else {
        var isImg=wp.url.startsWith('data:image/')||wp.url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i);
        var vEl=target==='home'?bv:lv, iEl=target==='home'?bi:li;
        if(isImg){
            vEl.style.display='none';iEl.style.display='block';iEl.src=wp.url;
            iEl.onerror=function(){iEl.style.display='none';if(target==='home')da.style.background='#000';else ls.style.background='#000';};
        }else{
            iEl.style.display='none';vEl.style.display='block';vEl.src=wp.url;vEl.load();
            vEl.onerror=function(){vEl.style.display='none';if(target==='home')da.style.background='#000';else ls.style.background='#000';};
            if(target==='home'&&isDesktopActive&&!sysConfig.optBg)vEl.play().catch(function(){});
        }
    }
}

function initWallpapers(){
    document.getElementById('desktop-area').style.background='transparent';
    document.getElementById('lock-screen').style.background='radial-gradient(ellipse at top, #001a2e 0%, #000 70%)';
    applyWallpaperCSS(wallpaperRegistry[sysConfig.homeWallpaper]||wallpaperRegistry['blackhole'],'home');
    applyWallpaperCSS(wallpaperRegistry[sysConfig.lockWallpaper]||wallpaperRegistry['css-ocean'],'lock');
    var chk=document.getElementById('wp-loop-chk');if(chk)chk.checked=sysConfig.wpLoop;
    applyAccentColor(sysConfig.accentColor||'#ffffff');
}

function applyAccentColor(color){
    sysConfig.accentColor=color;
    document.documentElement.style.setProperty('--accent-main',color);
    // derive muted version
    document.documentElement.style.setProperty('--accent-glow',color+'33');
    localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));
    if(window.saveToCloud)window.saveToCloud();
}

function setWallpaper(k){
    var d=wallpaperRegistry[k];if(!d)return;
    if(window.wpMode==='home'||window.wpMode==='both'){applyWallpaperCSS(d,'home');sysConfig.homeWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}
    if(window.wpMode==='lock'||window.wpMode==='both'){applyWallpaperCSS(d,'lock');sysConfig.lockWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}
    if(window.saveToCloud)window.saveToCloud();
}
window.wpMode='both';

function openWallpaperMenu(){
    var m=document.getElementById('wallpaper-menu');
    if(!m)return;
    if(m.showModal)m.showModal();else m.style.display='flex';
    m.classList.add('open');
    _renderWpGallery();
    // Ensure gallery tab is active on open
    var galleryBtn=document.querySelector('.wp-tab[data-tab="gallery"]');
    if(galleryBtn)switchWpTab(galleryBtn,'gallery');
}

function _renderWpGallery(){
    var gu=document.getElementById('wp-grid-unlocked');
    if(!gu)return;
    gu.innerHTML='';
    var activeKey=window.wpMode==='lock'?sysConfig.lockWallpaper:sysConfig.homeWallpaper;
    for(var k in wallpaperRegistry){
        (function(key){
            var d=wallpaperRegistry[key];
            var c=document.createElement('div');
            c.className='wp-card'+(key===activeKey?' active-wp':'');
            c.setAttribute('data-key',key);
            var inner='';
            if(d.url==='__css__'||d.css){
                inner='<div style="width:100%;height:100%;background:'+(d.css||'#111')+'"></div>';
            }else if(d.url.startsWith('data:image/')||d.url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i)){
                inner='<img src="'+d.url+'" alt="'+d.name+'" loading="lazy" onerror="this.parentElement.style.background=\'#111\'">';
            }else{
                inner='<video src="'+d.url+'" preload="none" playsinline muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>';
            }
            inner+='<div class="wp-info">'+d.name+'</div>';
            c.innerHTML=inner;
            if(d.custom){
                var del=document.createElement('button');
                del.className='wp-del-btn';
                del.innerHTML='<i class="fas fa-trash"></i>';
                del.onclick=function(e){
                    e.stopPropagation();
                    delete wallpaperRegistry[key];delete customWallpapers[key];
                    localStorage.setItem('intel_custom_wp',JSON.stringify(customWallpapers));
                    _renderWpGallery();
                };
                c.appendChild(del);
            }
            c.onclick=function(){
                setWallpaper(key);
                document.querySelectorAll('.wp-card').forEach(function(x){x.classList.remove('active-wp');});
                this.classList.add('active-wp');
            };
            gu.appendChild(c);
        })(k);
    }
}

function closeWallpaperMenu(){
    var m=document.getElementById('wallpaper-menu');
    if(!m)return;
    m.classList.remove('open');
    setTimeout(function(){if(m.close)m.close();else m.style.display='none';},300);
}

function switchWpTab(btn,tab){
    document.querySelectorAll('.wp-tab').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.wp-tab-content').forEach(function(c){c.classList.remove('active');});
    btn.classList.add('active');
    var content=document.getElementById('wp-tab-'+tab);
    if(content)content.classList.add('active');
    if(tab==='gallery')_renderWpGallery();
}

window.setWpTarget=function(btn,target){
    window.wpMode=target;
    document.querySelectorAll('.wp-target-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    _renderWpGallery();
};

function addWpFromUrl(){
    var name=(document.getElementById('wp-url-name').value||'').trim();
    var url=(document.getElementById('wp-url-link').value||'').trim();
    if(!name||!url){showNotification('Missing info','Please enter both a name and a URL.');return;}
    addCustomWallpaper(name,url);
    document.getElementById('wp-url-name').value='';
    document.getElementById('wp-url-link').value='';
    var galleryBtn=document.querySelector('.wp-tab[data-tab="gallery"]');
    if(galleryBtn)switchWpTab(galleryBtn,'gallery');
}

function compressAndAddWallpaper(file,name){
    var img=new Image(),reader=new FileReader();
    reader.onload=function(e){
        img.onload=function(){
            var canvas=document.createElement('canvas');
            var MAX_W=1920,MAX_H=1080,w=img.width,h=img.height;
            if(w>MAX_W){h=Math.round(h*MAX_W/w);w=MAX_W;}
            if(h>MAX_H){w=Math.round(w*MAX_H/h);h=MAX_H;}
            canvas.width=w;canvas.height=h;
            canvas.getContext('2d').drawImage(img,0,0,w,h);
            var dataUrl=canvas.toDataURL('image/jpeg',0.85);
            addCustomWallpaper(name,dataUrl);
            var galleryBtn=document.querySelector('.wp-tab[data-tab="gallery"]');
            if(galleryBtn)switchWpTab(galleryBtn,'gallery');
            showNotification('Wallpaper saved','"'+name+'" has been added to your gallery.');
        };
        img.src=e.target.result;
    };
    reader.readAsDataURL(file);
}

function setupWallpaperUpload(){
    var fileInput=document.getElementById('wp-file-input');
    var dropZone=document.getElementById('wp-drop-zone');
    if(!fileInput||!dropZone)return;
    fileInput.addEventListener('change',function(){
        var file=this.files[0];
        if(!file)return;
        var name=file.name.replace(/\.[^.]+$/,'').replace(/[_\-]/g,' ');
        compressAndAddWallpaper(file,name);
        this.value='';
    });
    dropZone.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('drag-over');});
    dropZone.addEventListener('dragleave',function(){this.classList.remove('drag-over');});
    dropZone.addEventListener('drop',function(e){
        e.preventDefault();this.classList.remove('drag-over');
        var file=e.dataTransfer.files[0];
        if(file&&file.type.startsWith('image/')){
            var name=file.name.replace(/\.[^.]+$/,'').replace(/[_\-]/g,' ');
            compressAndAddWallpaper(file,name);
        }
    });
}

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function updateClock(){var n=new Date(),dArr=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'],mArr=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'],hrs=n.getHours().toString().padStart(2,'0'),min=n.getMinutes().toString().padStart(2,'0'),dName=dArr[n.getDay()],dNum=n.getDate().toString().padStart(2,'0'),yr=n.getFullYear();var lDay=document.getElementById('lock-day-large'),lDat=document.getElementById('lock-date'),lTim=document.getElementById('lock-time'),hDay=document.getElementById('lbl-day');if(lDay)lDay.innerText=dName;if(hDay)hDay.innerText=dName;if(lDat)lDat.innerText=dNum+' '+mArr[n.getMonth()]+', '+yr+'.';if(lTim)lTim.innerText='- '+hrs+':'+min+' -';}
setInterval(updateClock,1000);

// ── LOCK / UNLOCK ─────────────────────────────────────────────────────────────
var welcomeShown=false;
window.unlockSystem=function(){var scr=document.getElementById('lock-screen');scr.classList.add('slide-up');setTimeout(function(){scr.classList.remove('active');isDesktopActive=true;if(!welcomeShown){showNotification("Welcome back","Right-click the desktop to change your wallpaper.");welcomeShown=true;}},600);resetIdle();};
var idleTime=0;
function resetIdle(){idleTime=0;}
document.addEventListener('mousemove',resetIdle);document.addEventListener('keypress',resetIdle);
setInterval(function(){idleTime++;var scr=document.getElementById('lock-screen');if(sysConfig.idleLock&&idleTime>=180&&!scr.classList.contains('active')&&!bootActive){if(!isMediaPlaying){isDesktopActive=false;scr.classList.remove('slide-up');scr.classList.add('active');}else idleTime=0;}},1000);
function applySystemSettings(){var bv=document.getElementById('bg-video');if(sysConfig.optBg&&bv)bv.pause();else if(!sysConfig.optBg&&bv&&bv.src&&isDesktopActive)bv.play().catch(function(){});}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function showNotification(title,msg){var c=document.getElementById('toast-container'),t=document.createElement('div');t.className='toast-notification';t.innerHTML='<div class="toast-header"><div class="toast-app-info"><div class="toast-icon"><i class="fas fa-bell"></i></div><span>System</span></div><i class="fas fa-times toast-close"></i></div><div class="toast-title">'+title+'</div><div class="toast-body">'+msg+'</div>';c.appendChild(t);setTimeout(function(){t.classList.add('show');},100);t.onclick=function(){t.classList.remove('show');setTimeout(function(){t.remove();},400);};setTimeout(t.onclick,6000);}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function updateSidebarData(){try{var sp=JSON.parse(localStorage.getItem('intel_music_cache'));if(sp){var k=Object.keys(sp);if(k.length>0){document.getElementById('spotify-track-name').innerText=sp[k[k.length-1]].title||"Liked Song";if(sp[k[k.length-1]].cover)document.getElementById('spotify-album-art').src=sp[k[k.length-1]].cover;}}}catch(e){}}
setInterval(updateSidebarData,5000);
window.launchLastPlayed=function(){toggleApp('files');};window.resumeSpotify=function(){toggleApp('term');};window.openUpdateLog=function(){var u=document.getElementById('update-modal');if(u&&u.showModal)u.showModal();else if(u)u.style.display='flex';};

// ── UI RENDER ─────────────────────────────────────────────────────────────────
function renderUI(){
  var dock=document.getElementById('dock-container');
  var _startSVG='<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.78)"/><rect x="11" y="1" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.52)"/><rect x="1" y="11" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.52)"/><rect x="11" y="11" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.30)"/></svg>';
  var _gridSVG='<svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(255,255,255,0.45)"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg>';
  var dHTML='<div class="dock-item dock-start" onclick="toggleStartMenu()"><div class="dock-icon-wrap">'+_startSVG+'</div><span class="dock-label">Start</span></div><div class="dock-sep"></div><div class="dock-item" onclick="toggleAppDrawer()"><div class="dock-icon-wrap">'+_gridSVG+'</div><span class="dock-label">All Apps</span></div><div class="dock-sep"></div>';
  var pHTML='';
  for(var id in APPS){if(APPS[id].pinned){dHTML+='<div class="dock-item" data-id="'+id+'" onmousedown="DragSystem.start(event,this,\'dock\',\''+id+'\')" onclick="toggleApp(\''+id+'\')" oncontextmenu="openDockCtx(event,\''+id+'\')"><div class="dock-icon-wrap"><img src="'+APPS[id].icon+'"></div><span class="dock-label">'+APPS[id].title+'</span></div>';pHTML+='<div class="pinned-item" onclick="toggleApp(\''+id+'\')"><img src="'+APPS[id].icon+'"><span>'+APPS[id].title+'</span></div>';}}
  dock.innerHTML=dHTML;document.getElementById('pinned-grid').innerHTML=pHTML;populateDrawer();
}

window.openCreditsModal=function(){
  var m=document.getElementById('credits-modal');if(!m)return;
  m.style.display='flex';
  requestAnimationFrame(function(){requestAnimationFrame(function(){m.classList.add('open');});});
  var sm=document.getElementById('start-menu');
  if(sm){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}
};
window.closeCreditsModal=function(){
  var m=document.getElementById('credits-modal');if(!m)return;
  m.classList.remove('open');setTimeout(function(){m.style.display='none';},220);
};
function openDockCtx(e,id){e.preventDefault();e.stopPropagation();hideAllCtx();activeCtxId=id;var m=document.getElementById('dock-ctx-menu');if(m){m.style.display='block';m.style.left=e.pageX+'px';m.style.top=e.pageY+'px';}}
function openDrawerCtx(e,id){e.preventDefault();e.stopPropagation();hideAllCtx();activeCtxId=id;var m=document.getElementById('drawer-ctx-menu');if(m){m.style.display='block';m.style.left=e.pageX+'px';m.style.top=e.pageY+'px';}}
document.getElementById('ctx-pin-app').onclick=function(){if(activeCtxId&&APPS[activeCtxId]){APPS[activeCtxId].pinned=true;syncPins();renderUI();}hideAllCtx();};
document.getElementById('ctx-unpin-app').onclick=function(){if(activeCtxId&&APPS[activeCtxId]){APPS[activeCtxId].pinned=false;syncPins();renderUI();}hideAllCtx();};
function hideAllCtx(){['app-context-menu','desktop-context-menu','drawer-ctx-menu','dock-ctx-menu'].forEach(function(x){var m=document.getElementById(x);if(m)m.style.display='none';});}
document.addEventListener('click',hideAllCtx);
function populateDrawer(){var g=document.getElementById('drawer-grid');g.innerHTML='';for(var key in APPS){var a=APPS[key],d=document.createElement('div');d.className='drawer-item';d.dataset.id=key;d.innerHTML='<img src="'+a.icon+'" style="pointer-events:none;"><span>'+a.title+'</span>';d.onmousedown=function(e){DragSystem.start(e,this,'drawer',this.dataset.id);};d.onclick=function(e){if(!DragSystem.isDragMove){toggleApp(this.dataset.id);toggleAppDrawer();}};d.oncontextmenu=function(e){openDrawerCtx(e,this.dataset.id);};g.appendChild(d);}}
function filterDrawer(val){document.querySelectorAll('.drawer-item').forEach(function(it){it.style.display=it.innerText.toLowerCase().includes(val.toLowerCase())?'flex':'none';});}
function toggleAppDrawer(){var d=document.getElementById('app-drawer');if(d.classList.contains('open')){d.classList.remove('open');setTimeout(function(){d.style.display='none';},300);}else{d.style.display='block';setTimeout(function(){d.classList.add('open');},10);}}
function toggleStartMenu(){var sm=document.getElementById('start-menu');if(sm.classList.contains('open')){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}else{sm.style.display='flex';setTimeout(function(){sm.classList.add('open');},10);}}
document.addEventListener('click',function(e){var sm=document.getElementById('start-menu');if(sm&&!sm.contains(e.target)&&!e.target.closest('.dock-item')){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}});
var sInp=document.getElementById('start-search-input');if(sInp)sInp.addEventListener('keydown',function(e){if(e.key==='Enter'){var q=this.value.trim();if(wallpaperRegistry[q]){setWallpaper(q);this.value='';this.blur();}}});


function getSettingsHTML() {
  var keys = ['optBg','shortBoot','idleLock','redirectConfirm'];
  var labels = ['Optimized background','Fast boot','Auto-lock','Redirect warning'];
  var descs = ['Disables animated background','Skip the startup animation','Lock after 3 minutes','Helps block GoGuardian'];
  var rows = '';
  for (var i = 0; i < keys.length; i++) {
    rows += '<div class="c"><div class="ci"><strong>' + labels[i] + '</strong><small>' + descs[i] + '</small></div>' +
      '<label class="tog"><input type="checkbox" id="c' + i + '" data-key="' + keys[i] + '" onchange="W(this)"><span class="ts"></span></label></div>';
  }
  var colors = ['#fff','#4f8ef7','#f74f4f','#4ff78e','#f7c14f','#c14ff7','#ff6b35','#1db954'];
  var swatches = '';
  for (var j = 0; j < colors.length; j++) {
    swatches += '<div class="sw" style="background:' + colors[j] + '" onclick="AC(this)"></div>';
  }
  var html = '';
  html += '<style>';
  html += 'body{background:#000;overflow-y:auto;height:auto;min-height:100vh;font-family:Inter,sans-serif;color:#fff;font-size:14px}';
  html += '.w{padding:20px;max-width:500px;margin:0 auto}';
  html += '.h{font-size:.7rem;font-weight:700;color:#444;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:12px;margin-top:22px;text-transform:uppercase;letter-spacing:.5px}';
  html += '.h:first-child{margin-top:0}';
  html += '.c{background:#0d0d0d;border:1px solid #111;padding:12px 14px;border-radius:8px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;gap:12px}';
  html += '.ci{display:flex;flex-direction:column;gap:2px}strong{font-size:13px;font-weight:600}small{font-size:11px;color:#333;display:block}';
  html += '.tog{position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0}.tog input{opacity:0;width:0;height:0}';
  html += '.ts{position:absolute;cursor:pointer;inset:0;background:#1a1a1a;border-radius:20px;transition:.25s;border:1px solid #222}';
  html += '.ts:before{position:absolute;content:"";height:13px;width:13px;left:3px;bottom:3px;background:#333;transition:.25s;border-radius:50%}';
  html += 'input:checked+.ts{background:#fff;border-color:#fff}input:checked+.ts:before{transform:translateX(16px);background:#000}';
  html += 'select{background:#111;color:#fff;border:1px solid #1a1a1a;padding:5px 8px;border-radius:5px;outline:none;font-size:12px;font-family:inherit}';
  html += '.pk{width:34px;height:26px;background:#111;border:1px solid #1a1a1a;color:#fff;text-align:center;font-size:.9rem;font-weight:600;outline:none;border-radius:4px}';
  html += '.sw{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;display:inline-block;margin-right:5px;vertical-align:middle;transition:.15s}';
  html += '.sw:hover{border-color:#fff}.inp{background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 10px;border-radius:5px;outline:none;font-size:12px}';
  html += '</style>';
  html += '<div class="w">';
  html += '<div class="h">Performance</div>' + rows;
  html += '<div class="h">Privacy</div>';
  html += '<div class="c"><div class="ci"><strong>Tab disguise</strong><small>Make this tab look like another site</small></div>';
      html += '<select id="clk" onchange="window.parent.updateCloak(this.value)">';
      html += '<option value="none">None</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option>';
      html += '<option value="bees">Blooket (Bees)</option><option value="mining">Blooket (Mining)</option><option value="laser">Blooket (Laser)</option><option value="coco">Blooket (Coco)</option><option value="defense2">Blooket (Defense 2)</option><option value="defense">Blooket (Defense)</option><option value="brawl">Blooket (Brawl)</option><option value="dinos">Blooket (Dinos)</option><option value="cafe">Blooket (Cafe)</option><option value="factory">Blooket (Factory)</option><option value="racing">Blooket (Racing)</option><option value="rush">Blooket (Rush)</option><option value="classic">Blooket (Classic)</option>';
      html += '</select></div>';
  html += '<div class="c"><div class="ci"><strong>Panic key</strong><small>Press to instantly close the tab</small></div>';
  html += '<input class="pk" type="text" id="pk" maxlength="1" oninput="window.parent.updateSysSetting(\'panicKey\',this.value)"></div>';
  html += '<div class="h">Appearance</div>';
  html += '<div class="c" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="ci"><strong>Accent color</strong><small>Changes highlights across the OS</small></div>';
  html += '<div style="margin-top:8px">' + swatches + '</div></div>';
  html += '<div class="c" style="flex-direction:column;align-items:flex-start;gap:8px"><div class="ci"><strong>Custom wallpaper</strong><small>Add any image or video URL</small></div>';
  html += '<div style="display:flex;gap:6px;width:100%;margin-top:4px">';
  html += '<input class="inp" id="wn" type="text" placeholder="Name" style="width:100px">';
  html += '<input class="inp" id="wu" type="text" placeholder="URL" style="flex:1;min-width:100px">';
  html += '<button onclick="AW()" style="background:#fff;color:#000;border:none;padding:7px 14px;border-radius:5px;font-weight:700;font-size:12px;cursor:pointer">Add</button>';
  html += '</div></div></div>';
  return html;
}

function getSettingsScript() {
  return 'var K=["optBg","shortBoot","idleLock","redirectConfirm"];' +
    '(function(){' +
    '  var p=window.parent.sysConfig;' +
    '  for(var i=0;i<K.length;i++){' +
    '    var cb=document.getElementById("c"+i);' +
    '    if(cb){cb.checked=!!p[K[i]];var t=cb.nextElementSibling;t.style.background=cb.checked?"#fff":"#1a1a1a";t.style.borderColor=cb.checked?"#fff":"#222";}' +
    '  }' +
    '  var cl=document.getElementById("clk");if(cl)cl.value=p.cloak||"none";' +
    '  var pk=document.getElementById("pk");if(pk)pk.value=p.panicKey||"";' +
    '})();' +
    'function W(cb){var k=cb.getAttribute("data-key");var v=cb.checked;window.parent.updateSysSetting(k,v);var t=cb.nextElementSibling;t.style.background=v?"#fff":"#1a1a1a";t.style.borderColor=v?"#fff":"#222";}' +
    'function AC(el){window.parent.applyAccentColor(el.style.background);}' +
    'function P(v){window.parent.updateSysSetting("panicKey",v);}' +
    'function AW(){var n=document.getElementById("wn").value.trim(),u=document.getElementById("wu").value.trim();if(!n||!u)return;window.parent.addCustomWallpaper(n,u);document.getElementById("wn").value="";document.getElementById("wu").value="";}';
}


function getAppSrcdoc(id) {
  var H = '<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%;overflow:hidden;background:#000;color:#fff;font-family:Inter,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}button,input,select{font-family:inherit;cursor:pointer}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}</style></head><body>';
  var T = '</body></html>';

  /* =====================================================================
     GAMES — GN-MATH POWERED, CINE-OS STYLE GUI
  ===================================================================== */
  if (id === 'files') { return H + `
<style>
body{background:#000}
#root{height:100vh;display:flex;flex-direction:column}

/* NAV */
#nav{height:40px;background:rgba(6,6,6,1);border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;padding:0 16px;gap:0;flex-shrink:0}
.nt{padding:0 14px;height:100%;display:flex;align-items:center;font-size:10px;font-weight:700;color:#383838;border-bottom:1.5px solid transparent;cursor:pointer;white-space:nowrap;user-select:none;transition:color .15s;letter-spacing:.8px;text-transform:uppercase}
.nt:hover{color:#777}
.nt.on{color:#fff;border-bottom-color:#fff}
#nav-r{margin-left:auto;display:flex;align-items:center;gap:14px}
#clk{font-size:11px;font-weight:600;color:#2a2a2a}
#nav-search-btn{display:flex;align-items:center;gap:5px;color:#383838;cursor:pointer;font-size:11px;transition:.15s;font-weight:600;letter-spacing:.3px}
#nav-search-btn:hover{color:#888}

/* MAIN SCROLL */
#main{flex:1;overflow-y:auto;overflow-x:hidden}
#main::-webkit-scrollbar{width:4px}
#main::-webkit-scrollbar-thumb{background:#111}

/* HERO */
#hero{padding:36px 24px 24px}
#hero h1{font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-.3px}
#hero p{font-size:13px;color:#444;margin-bottom:20px}
.hero-btn{display:inline-flex;align-items:center;gap:8px;background:#1a1a1a;border:1px solid #2a2a2a;color:#ccc;padding:9px 18px;border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s;user-select:none}
.hero-btn:hover{background:#222;border-color:#444;color:#fff}

/* YOUR GAMES */
#your-wrap{padding:0 24px;margin-top:28px}
#your-lbl{font-size:14px;font-weight:700;color:#fff;text-decoration:underline;text-underline-offset:3px;margin-bottom:14px}
#your-row{display:flex;gap:10px;flex-wrap:wrap}
.yc{width:120px;height:120px;border-radius:12px;overflow:hidden;border:1px solid #1e1e1e;cursor:pointer;position:relative;flex-shrink:0;transition:.2s;background:#0a0a0a}
.yc:hover{border-color:#3a3a3a;transform:scale(1.04)}
.yc img{width:100%;height:100%;object-fit:cover}
.yc-lbl{position:absolute;bottom:0;left:0;right:0;padding:16px 8px 7px;background:linear-gradient(transparent,rgba(0,0,0,.9));font-size:10px;font-weight:700;color:#fff}
.yc-add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border-style:dashed;border-color:#1e1e1e;background:#050505}
.yc-add:hover{border-color:#3a3a3a;background:#0d0d0d}
.add-plus{font-size:22px;font-weight:300;color:#333;line-height:1}
.add-lbl{font-size:10px;font-weight:600;color:#333}

/* GAME SECTIONS */
.sec{margin-top:28px}
.sec-lbl{font-size:14px;font-weight:700;color:#fff;padding:0 24px;margin-bottom:14px}
.row-wrap{position:relative}
.row{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 24px 10px;scroll-behavior:smooth}
.row::-webkit-scrollbar{height:0}
.arr{position:absolute;top:50%;transform:translateY(-62%);width:30px;height:30px;background:rgba(0,0,0,.9);border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;font-size:17px;color:#666;opacity:0;pointer-events:none;transition:.15s;user-select:none}
.row-wrap:hover .arr{opacity:1;pointer-events:all}
.arr:hover{color:#fff;border-color:#555}
.al{left:6px}.ar{right:6px}

/* GAME CARD */
.gc{flex-shrink:0;width:150px;border-radius:10px;overflow:hidden;cursor:pointer;scroll-snap-align:start;background:#111;border:1px solid #1a1a1a;transition:.2s;position:relative}
.gc:hover{transform:translateY(-4px) scale(1.02);border-color:#333;box-shadow:0 10px 28px rgba(0,0,0,.7)}
.gc-art{width:100%;height:106px;object-fit:cover;display:block;background:#111}
.gc-art-fallback{width:100%;height:106px;background:linear-gradient(135deg,#111,#1a1a1a);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#2a2a2a;text-align:center;padding:8px;line-height:1.4}
.gc-info{padding:8px 10px 10px}
.gc-name{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.gc-genre{font-size:10px;color:#444;font-weight:500}

/* FULL GRID */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:9px;padding:0 24px 28px}

/* LOADING STATE */
#loading{display:flex;align-items:center;justify-content:center;height:200px;color:#333;font-size:13px;font-weight:500}

/* LAUNCHER */
#launcher{display:none;position:fixed;inset:0;z-index:1000;background:#000;flex-direction:column}
#ll-load{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
#ll-name{font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:700;color:#fff;letter-spacing:.3px}
#ll-sub{font-size:10px;color:#2a2a2a;letter-spacing:1.5px;text-transform:uppercase;font-weight:700}
#ll-track{width:200px;height:1px;background:#161616;border-radius:1px;overflow:hidden;margin-top:6px}
#ll-fill{height:100%;width:0%;background:#fff;border-radius:1px;transition:width .06s}
#ll-pct{font-size:10px;color:#252525;font-weight:700;letter-spacing:.5px}
#ll-frame{flex:1;border:none;display:none;width:100%;height:100%}
#ll-x{position:absolute;top:12px;right:12px;background:rgba(14,14,14,.95);border:1px solid rgba(255,255,255,.07);color:#555;height:28px;padding:0 14px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;z-index:10;transition:all .15s;gap:7px}
#ll-x:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.15)}

/* SEARCH OVERLAY */
#srch{display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.96);backdrop-filter:blur(16px);flex-direction:column;padding:36px 24px}
#srch.open{display:flex}
#srch-row{display:flex;gap:8px;max-width:480px;margin-bottom:24px}
#srch-in{flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:10px 14px;border-radius:8px;outline:none;font-size:14px;font-weight:500}
#srch-in:focus{border-color:#2a2a2a}
#srch-in::placeholder{color:#2a2a2a}
#srch-x{background:#111;border:1px solid #1e1e1e;color:#555;padding:8px 16px;border-radius:7px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;transition:.15s}
#srch-x:hover{background:#fff;color:#000;border-color:#fff}
#srch-res{display:flex;flex-wrap:wrap;gap:8px;overflow-y:auto}

/* ADD MODAL */
#addm{display:none;position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);align-items:center;justify-content:center}
#addm.open{display:flex}
.add-box{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:12px;padding:24px;width:390px;max-width:90vw}
.add-box h3{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:700;margin-bottom:16px}
.add-box input{width:100%;background:#111;border:1px solid #1a1a1a;color:#fff;padding:9px 12px;border-radius:6px;outline:none;font-size:13px;margin-bottom:9px;transition:.15s}
.add-box input:focus{border-color:#2a2a2a}
.add-box input::placeholder{color:#222}
.add-actions{display:flex;gap:8px;margin-top:4px}
.btn-p{background:#fff;color:#000;border:none;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:700;transition:.15s}
.btn-p:hover{background:#ddd}
.btn-s{background:#1a1a1a;color:#555;border:1px solid #1e1e1e;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600}
.btn-s:hover{color:#aaa;border-color:#333}
</style>

<div id="root">
  <div id="nav">
    <div class="nt on" onclick="showTab('home',this)">Home</div>
    <div class="nt" onclick="showTab('library',this)">Game Library</div>
    <div class="nt" onclick="showTab('store',this)">Play Store</div>
    <div id="nav-r">
      <div id="nav-search-btn" onclick="openSearch()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Search
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.8" style="cursor:pointer"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.8" style="cursor:pointer"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <div id="clk"></div>
    </div>
  </div>

  <div id="main">
    <div id="tab-home">
      <div id="hero">
        <h1>Upload Title</h1>
        <p>Install package via URL — saves to your library automatically.</p>
        <div class="hero-btn" onclick="openAdd()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Install Media
        </div>
      </div>
      <div id="your-wrap">
        <div id="your-lbl">Your Games</div>
        <div id="your-row">
          <div class="yc yc-add" onclick="openAdd()">
            <div class="add-plus">+</div>
            <div class="add-lbl">ADD</div>
          </div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">Featured Ports</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rf',-1)">&#8249;</div>
          <div class="row" id="rf"></div>
          <div class="arr ar" onclick="scr('rf',1)">&#8250;</div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">Classic Arcade</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rc',-1)">&#8249;</div>
          <div class="row" id="rc"></div>
          <div class="arr ar" onclick="scr('rc',1)">&#8250;</div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">Try Something New!</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rn',-1)">&#8249;</div>
          <div class="row" id="rn"></div>
          <div class="arr ar" onclick="scr('rn',1)">&#8250;</div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">What We Recommend</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rr',-1)">&#8249;</div>
          <div class="row" id="rr"></div>
          <div class="arr ar" onclick="scr('rr',1)">&#8250;</div>
        </div>
      </div>
      <div id="loading" id="load-msg">Loading games from GN-Math...</div>
    </div>
    <div id="tab-library" style="display:none;padding-top:24px">
      <div style="padding:0 24px 14px;font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:600">All Games</div>
      <div class="grid" id="lib-grid"></div>
    </div>
    <div id="tab-store" style="display:none;padding-top:24px">
      <div style="padding:0 24px 14px;font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:600">Browse</div>
      <div class="grid" id="store-grid"></div>
    </div>
  </div>
</div>

<!-- LAUNCHER -->
<div id="launcher">
  <div id="ll-load">
    <div id="ll-name">Loading...</div>
    <div id="ll-sub">INTELLECTUAL OS</div>
    <div id="ll-track"><div id="ll-fill"></div></div>
    <div id="ll-pct">0%</div>
  </div>
  <iframe id="ll-frame" allow="autoplay;fullscreen;gamepad;clipboard-write" allowfullscreen></iframe>
  <div id="ll-x" onclick="closeLaunch()"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>CLOSE</div>
</div>

<!-- SEARCH -->
<div id="srch">
  <div id="srch-row">
    <input id="srch-in" type="text" placeholder="Search games..." oninput="doSearch(this.value)" autofocus>
    <button id="srch-x" onclick="closeSearch()">Done</button>
  </div>
  <div id="srch-res"></div>
</div>

<!-- ADD MODAL -->
<div id="addm">
  <div class="add-box">
    <h3>Add a game</h3>
    <input id="an" placeholder="Title">
    <input id="au" placeholder="URL">
    <input id="ai" placeholder="Cover image URL (optional)">
    <div class="add-actions">
      <button class="btn-p" onclick="saveGame()">Save</button>
      <button class="btn-s" onclick="closeAdd()">Cancel</button>
    </div>
  </div>
</div>

<script>
var COVER = 'https://cdn.jsdelivr.net/gh/gn-math/covers@main';
var HTML  = 'https://cdn.jsdelivr.net/gh/gn-math/html@main';
var ZONES_URL = 'https://cdn.jsdelivr.net/gh/gn-math/assets@master/zones.json';

var zones = [];
var saved = JSON.parse(localStorage.getItem('ios_g') || '[]');

// Direct-URL ports from multiple unblocker CDNs. These merge with gn-math zones
// so they show up in search, library, featured rows, etc. Covers are optional.
// ═══════════════════════════════════════════════════════════════════════
// GAME LIBRARY — Auto-discovered from GitHub web-port repositories
// Merges games from multiple sources into a unified library
// ═══════════════════════════════════════════════════════════════════════

// Base URLs for web-port repositories (GitHub Pages)
var WEB_PORT_BASES = [
  'https://qza23223.github.io/web-port/',
  'https://shinydubs.github.io/web-port/',
  'https://kwalton2011.github.io/web-port/',
  'https://royal-v-rr.github.io/web-port/',
];

// Base URLs for google-class repositories
var GOOGLE_CLASS_BASES = [
  'https://genizy.github.io/google-class/',
  'https://epickfr.github.io/google-class/',
];

// Known game paths for web-port repos (discovered from folder structure)
var WEB_PORT_GAMES = [
  { id:'wp-slope',         name:'Slope',              path:'slope/',           genre:'Running' },
  { id:'wp-1v1lol',        name:'1v1.LOL',            path:'1v1lol/',          genre:'Shooter' },
  { id:'wp-retrobowl',     name:'Retro Bowl',         path:'retro-bowl/',      genre:'Sports' },
  { id:'wp-drivemad',      name:'Drive Mad',          path:'drive-mad/',       genre:'Racing' },
  { id:'wp-smashkarts',    name:'Smash Karts',        path:'smash-karts/',     genre:'Shooter' },
  { id:'wp-bitlife',       name:'BitLife',            path:'bitlife/',         genre:'Simulation' },
  { id:'wp-cookieclicker', name:'Cookie Clicker',     path:'cookie-clicker/',  genre:'Idle' },
  { id:'wp-stickmanhook',  name:'Stickman Hook',      path:'stickman-hook/',   genre:'Platform' },
  { id:'wp-geometrydash',  name:'Geometry Dash',      path:'geometry-dash/',   genre:'Platform' },
  { id:'wp-tunnelrush',    name:'Tunnel Rush',        path:'tunnel-rush/',     genre:'Running' },
  { id:'wp-motox3m',       name:'Moto X3M',           path:'moto-x3m/',        genre:'Racing' },
  { id:'wp-happywheels',   name:'Happy Wheels',       path:'happy-wheels/',    genre:'Platform' },
  { id:'wp-paperio2',      name:'Paper.io 2',         path:'paperio-2/',       genre:'Arcade' },
  { id:'wp-clusterrush',   name:'Cluster Rush',       path:'cluster-rush/',    genre:'Running' },
  { id:'wp-hardestgame',   name:'Worlds Hardest Game',path:'worlds-hardest-game/', genre:'Arcade' },
  { id:'wp-run3',          name:'Run 3',              path:'run-3/',           genre:'Running' },
  { id:'wp-templerun2',    name:'Temple Run 2',       path:'temple-run-2/',    genre:'Running' },
  { id:'wp-crossyroad',    name:'Crossy Road',        path:'crossy-road/',     genre:'Arcade' },
  { id:'wp-fnf',           name:'Friday Night Funkin',path:'friday-night-funkin/', genre:'Music' },
  { id:'wp-subwaysurf',    name:'Subway Surfers',     path:'subway-surfers/',  genre:'Running' },
  { id:'wp-vex7',          name:'Vex 7',              path:'vex7/',            genre:'Platform' },
  { id:'wp-vex6',          name:'Vex 6',              path:'vex6/',            genre:'Platform' },
  { id:'wp-basketbros',    name:'Basket Bros',        path:'basket-bros/',     genre:'Sports' },
  { id:'wp-tombofmask',    name:'Tomb of the Mask',   path:'tomb-of-the-mask/',genre:'Arcade' },
  { id:'wp-bloxorz',       name:'Bloxorz',            path:'bloxorz/',         genre:'Puzzle' },
  { id:'wp-papalouie',     name:'Papa Louie',         path:'papa-louie/',      genre:'Simulation' },
  { id:'wp-fireboywatergirl', name:'Fireboy & Watergirl', path:'fireboy-watergirl/', genre:'Puzzle' },
  { id:'wp-badicecream',   name:'Bad Ice Cream',      path:'bad-ice-cream/',   genre:'Arcade' },
  { id:'wp-amongus',       name:'Among Us',           path:'among-us/',        genre:'Social' },
  { id:'wp-agar',          name:'Agar.io',            path:'agar-io/',         genre:'Arcade' },
];

// Known game paths for google-class repos
var GOOGLE_CLASS_GAMES = [
  { id:'gc-chess',         name:'Chess.com',          path:'chess/',           genre:'Board' },
  { id:'gc-checkers',      name:'Checkers',           path:'checkers/',        genre:'Board' },
  { id:'gc-backgammon',    name:'Backgammon',         path:'backgammon/',      genre:'Board' },
  { id:'gc-go',            name:'Go',                 path:'go/',              genre:'Board' },
  { id:'gc-reversi',       name:'Reversi',            path:'reversi/',         genre:'Board' },
  { id:'gc-connect4',      name:'Connect 4',          path:'connect4/',        genre:'Board' },
  { id:'gc-tictactoe',     name:'Tic Tac Toe',        path:'tictactoe/',       genre:'Board' },
  { id:'gc-mancala',       name:'Mancala',            path:'mancala/',         genre:'Board' },
  { id:'gc-dominoes',      name:'Dominoes',           path:'dominoes/',        genre:'Board' },
];

// Build full URLs for web-port games
function buildWebPortGames() {
  var games = [];
  var seen = {};
  
  WEB_PORT_GAMES.forEach(function(g) {
    WEB_PORT_BASES.forEach(function(base) {
      var id = g.id + '-' + base.split('/')[2].split('.')[0];
      if (seen[id]) return;
      seen[id] = true;
      games.push({
        id: id,
        name: g.name,
        url: base + g.path,
        cover: base + g.path + 'icon.png',
        genre: g.genre || 'Arcade'
      });
    });
  });
  
  return games;
}

// Build full URLs for google-class games
function buildGoogleClassGames() {
  var games = [];
  var seen = {};
  
  GOOGLE_CLASS_GAMES.forEach(function(g) {
    GOOGLE_CLASS_BASES.forEach(function(base) {
      var id = g.id + '-' + base.split('/')[2].split('.')[0];
      if (seen[id]) return;
      seen[id] = true;
      games.push({
        id: id,
        name: g.name,
        url: base + g.path,
        cover: base + g.path + 'icon.png',
        genre: g.genre || 'Board'
      });
    });
  });
  
  return games;
}

// Pre-build the game library (will be merged with EXTRA_PORTS)
var BUILT_WEBPORT_GAMES = buildWebPortGames();
var BUILT_GOOGLECLASS_GAMES = buildGoogleClassGames();

var EXTRA_PORTS = [
  // Web-Port Games (from GitHub repositories)
].concat(BUILT_WEBPORT_GAMES).concat(BUILT_GOOGLECLASS_GAMES).concat([
  // 3kh0 mirrors
  { id:'x3k-slope',       name:'Slope',                url:'https://3kh0-lite.global.ssl.fastly.net/projects/slope/',              cover:'https://3kh0-lite.global.ssl.fastly.net/projects/slope/icon.png' },
  { id:'x3k-1v1',         name:'1v1.LOL',              url:'https://3kh0-lite.global.ssl.fastly.net/projects/1v1lol/',             cover:'https://3kh0-lite.global.ssl.fastly.net/projects/1v1lol/icon.png' },
  { id:'x3k-retrobowl',   name:'Retro Bowl',           url:'https://3kh0-lite.global.ssl.fastly.net/projects/retro-bowl/',         cover:'https://3kh0-lite.global.ssl.fastly.net/projects/retro-bowl/icon.png' },
  { id:'x3k-drivemad',    name:'Drive Mad',            url:'https://3kh0-lite.global.ssl.fastly.net/projects/drive-mad/',          cover:'https://3kh0-lite.global.ssl.fastly.net/projects/drive-mad/icon.png' },
  { id:'x3k-smashkarts',  name:'Smash Karts',          url:'https://3kh0-lite.global.ssl.fastly.net/projects/smash-karts/',        cover:'https://3kh0-lite.global.ssl.fastly.net/projects/smash-karts/icon.png' },
  { id:'x3k-bitlife',     name:'BitLife',              url:'https://3kh0-lite.global.ssl.fastly.net/projects/bitlife/',            cover:'https://3kh0-lite.global.ssl.fastly.net/projects/bitlife/icon.png' },
  { id:'x3k-cookie',      name:'Cookie Clicker',       url:'https://3kh0-lite.global.ssl.fastly.net/projects/cookie-clicker/',     cover:'https://3kh0-lite.global.ssl.fastly.net/projects/cookie-clicker/icon.png' },
  { id:'x3k-stick',       name:'Stickman Hook',        url:'https://3kh0-lite.global.ssl.fastly.net/projects/stickman-hook/',      cover:'https://3kh0-lite.global.ssl.fastly.net/projects/stickman-hook/icon.png' },
  { id:'x3k-geo',         name:'Geometry Dash',        url:'https://3kh0-lite.global.ssl.fastly.net/projects/geometry-dash/',      cover:'https://3kh0-lite.global.ssl.fastly.net/projects/geometry-dash/icon.png' },
  { id:'x3k-tunnel',      name:'Tunnel Rush',          url:'https://3kh0-lite.global.ssl.fastly.net/projects/tunnel-rush/',        cover:'https://3kh0-lite.global.ssl.fastly.net/projects/tunnel-rush/icon.png' },
  { id:'x3k-moto',        name:'Moto X3M',             url:'https://3kh0-lite.global.ssl.fastly.net/projects/moto-x3m/',           cover:'https://3kh0-lite.global.ssl.fastly.net/projects/moto-x3m/icon.png' },
  { id:'x3k-happy',       name:'Happy Wheels',         url:'https://3kh0-lite.global.ssl.fastly.net/projects/happy-wheels/',       cover:'https://3kh0-lite.global.ssl.fastly.net/projects/happy-wheels/icon.png' },
  { id:'x3k-paper',       name:'Paper.io 2',           url:'https://3kh0-lite.global.ssl.fastly.net/projects/paperio-2/',          cover:'https://3kh0-lite.global.ssl.fastly.net/projects/paperio-2/icon.png' },
  { id:'x3k-clusterrush', name:'Cluster Rush',         url:'https://3kh0-lite.global.ssl.fastly.net/projects/cluster-rush/',       cover:'https://3kh0-lite.global.ssl.fastly.net/projects/cluster-rush/icon.png' },
  { id:'x3k-hardestgame', name:'Worlds Hardest Game',  url:'https://3kh0-lite.global.ssl.fastly.net/projects/worlds-hardest-game/',cover:'https://3kh0-lite.global.ssl.fastly.net/projects/worlds-hardest-game/icon.png' },
  { id:'x3k-run3',        name:'Run 3',                url:'https://3kh0-lite.global.ssl.fastly.net/projects/run-3/',              cover:'https://3kh0-lite.global.ssl.fastly.net/projects/run-3/icon.png' },
  { id:'x3k-temple',      name:'Temple Run 2',         url:'https://3kh0-lite.global.ssl.fastly.net/projects/temple-run-2/',       cover:'https://3kh0-lite.global.ssl.fastly.net/projects/temple-run-2/icon.png' },
  { id:'x3k-crossy',      name:'Crossy Road',          url:'https://3kh0-lite.global.ssl.fastly.net/projects/crossy-road/',        cover:'https://3kh0-lite.global.ssl.fastly.net/projects/crossy-road/icon.png' },
  { id:'x3k-fnf',         name:'Friday Night Funkin',  url:'https://3kh0-lite.global.ssl.fastly.net/projects/friday-night-funkin/',cover:'https://3kh0-lite.global.ssl.fastly.net/projects/friday-night-funkin/icon.png' },

  // Eaglercraft (Minecraft) — multiple mirrors
  { id:'mc-1.8.8',        name:'Eaglercraft 1.8.8',    url:'https://eaglercraft.com/mc/1.8.8/',                                    cover:'https://eaglercraft.com/icon.png' },
  { id:'mc-1.5.2',        name:'Eaglercraft 1.5.2',    url:'https://eaglercraft.com/mc/1.5.2/',                                    cover:'https://eaglercraft.com/icon.png' },

  // DOS classics via js-dos
  { id:'dos-doom',        name:'Doom',                 url:'https://js-dos.com/games/doom.exe.html',                               cover:'https://js-dos.com/images/doom.png' },
  { id:'dos-wolf3d',      name:'Wolfenstein 3D',       url:'https://js-dos.com/games/wolf3d.exe.html',                             cover:'https://js-dos.com/images/wolf3d.png' },
  { id:'dos-prince',      name:'Prince of Persia',     url:'https://js-dos.com/games/prince.exe.html',                             cover:'https://js-dos.com/images/prince.png' },
  { id:'dos-simcity',     name:'SimCity',              url:'https://js-dos.com/games/simcity.exe.html',                            cover:'https://js-dos.com/images/simcity.png' },

  // Ruffle (Flash)
  { id:'flash-supermario',name:'Super Mario Flash',    url:'https://ruffle.rs/demo/?url=https://files.ruffle.rs/demo/super-mario-63.swf' },
  { id:'flash-stickwar',  name:'Stick War',            url:'https://ruffle.rs/demo/?url=https://files.ruffle.rs/demo/stick-war.swf' },
]);
zones = EXTRA_PORTS.slice();  // seed before fetch resolves so UI isn't empty

// Curated ports — matched against gn-math zones by name keyword
var FEATURED_KEYS = [
  'eaglercraft','minecraft','doom','retro bowl','slope','drive mad',
  '1v1','basket bros','cookie clicker','stickman hook','vex 7','vex 6',
  'tomb of the mask','geometry dash','tunnel rush','moto x3m','happy wheels',
  'bloxorz','run 3','papa','subway surfers','cluster rush','bitlife',
  'smash karts','among us','crossy road','temple run','bad ice cream',
  'fireboy','worlds hardest','friday night funkin','paper.io','agar'
];
var CLASSIC_KEYS = [
  'pac-man','pacman','tetris','space invaders','snake','pong','asteroids',
  'frogger','galaga','centipede','breakout','mario','sonic','contra',
  'donkey kong','street fighter','mortal kombat','zelda','metroid','kirby'
];

function pickBy(keys) {
  var seen = {}, out = [];
  for (var i=0;i<keys.length;i++) {
    var k = keys[i].toLowerCase();
    for (var j=0;j<zones.length;j++) {
      var z = zones[j];
      if (seen[z.id]) continue;
      if ((z.name||'').toLowerCase().indexOf(k) !== -1) {
        out.push(z); seen[z.id] = 1; break;
      }
    }
  }
  return out;
}

// Load GN-Math zones
fetch(ZONES_URL + '?t=' + Date.now())
  .then(function(r){ return r.json(); })
  .then(function(data){
    var gn = data.filter(function(z){ return z.url; });
    zones = EXTRA_PORTS.concat(gn);
    document.getElementById('loading').style.display = 'none';
    buildHome();
  })
  .catch(function(){
    // still show the curated ports even if zones.json fetch fails
    document.getElementById('loading').style.display = 'none';
    zones = EXTRA_PORTS.slice();
    buildHome();
  });

function getUrl(z) {
  if (!z || !z.url) return '#';
  if (z.url.startsWith('http')) return z.url;
  return z.url.replace('{HTML_URL}', HTML).replace('{COVER_URL}', COVER);
}

function getCover(z) {
  if (!z) return '';
  if (z.cover && z.cover.startsWith('http')) return z.cover;
  if (z.cover) return z.cover.replace('{COVER_URL}', COVER).replace('{HTML_URL}', HTML);
  return COVER + '/' + z.id + '.jpg';
}

function card(z, w) {
  w = w || 150;
  var url = getUrl(z);
  var cover = getCover(z);
  var name = (z.name || 'Game').replace(/'/g, '&#39;');
  return '<div class="gc" style="width:'+w+'px" onclick="launch(\''+encodeURIComponent(url)+'\',\''+name+'\')">' +
    '<img class="gc-art" src="'+cover+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" loading="lazy">' +
    '<div class="gc-art-fallback" style="display:none">'+name+'</div>' +
    '<div class="gc-info"><div class="gc-name">'+name+'</div></div></div>';
}

function userCard(g) {
  var name = (g.name || 'Game').replace(/'/g, '&#39;');
  return '<div class="yc" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+name+'\')"><img src="'+g.img+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"><div class="yc-lbl">'+name+'</div></div>';
}

function buildHome() {
  var sh = zones.slice().sort(function(){ return Math.random()-.5; });
  var featured = pickBy(FEATURED_KEYS);
  var classic = pickBy(CLASSIC_KEYS);
  // fallback: if curated picks empty (zones feed changed), use random slice
  if (!featured.length) featured = sh.slice(0,16);
  if (!classic.length) classic = sh.slice(16,32);
  document.getElementById('rf').innerHTML = featured.map(function(z){ return card(z); }).join('');
  document.getElementById('rc').innerHTML = classic.map(function(z){ return card(z); }).join('');
  document.getElementById('rn').innerHTML = sh.slice(0,16).map(function(z){ return card(z); }).join('');
  document.getElementById('rr').innerHTML = sh.slice(16,32).map(function(z){ return card(z); }).join('');
  buildYour();
}

function buildYour() {
  var add = '<div class="yc yc-add" onclick="openAdd()"><div class="add-plus">+</div><div class="add-lbl">ADD</div></div>';
  document.getElementById('your-row').innerHTML = add + saved.map(userCard).join('');
}

function showTab(name, el) {
  ['home','library','store'].forEach(function(t){ document.getElementById('tab-'+t).style.display='none'; });
  document.querySelectorAll('.nt').forEach(function(t){ t.classList.remove('on'); });
  document.getElementById('tab-'+name).style.display='block';
  el.classList.add('on');
  if (name === 'library') {
    var pri = pickBy(FEATURED_KEYS.concat(CLASSIC_KEYS));
    var priIds = {}; pri.forEach(function(z){ priIds[z.id]=1; });
    var rest = zones.filter(function(z){ return !priIds[z.id]; });
    var lib = pri.concat(rest).slice(0,80);
    document.getElementById('lib-grid').innerHTML = saved.map(function(g){
      return '<div class="gc" style="width:145px" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+g.name.replace(/'/g,'&#39;')+'\')">' +
        '<img class="gc-art" src="'+g.img+'" onerror="this.style.display=\'none\'"><div class="gc-info"><div class="gc-name">'+g.name+'</div></div></div>';
    }).join('') + lib.map(function(z){ return card(z,145); }).join('');
  }
  if (name === 'store') {
    document.getElementById('store-grid').innerHTML = zones.map(function(z){ return card(z,145); }).join('');
  }
}

function scr(id,d){ document.getElementById(id).scrollBy({left:d*340,behavior:'smooth'}); }

function launch(urlEnc, name) {
  var url = decodeURIComponent(urlEnc);
  if (!url || url === '#') return;
  try { parent.postMessage({ __bot: true, type: 'game-open', detail: name }, '*'); } catch(e){}
  var l=document.getElementById('launcher');
  var ll=document.getElementById('ll-load');
  var lf=document.getElementById('ll-frame');
  l.style.display='flex'; ll.style.display='flex'; lf.style.display='none';
  document.getElementById('ll-name').textContent = name;
  document.getElementById('ll-fill').style.width = '0%';
  document.getElementById('ll-pct').textContent = '0%';
  var p=0, iv=setInterval(function(){
    p+=Math.random()*5+2; if(p>90)p=90;
    document.getElementById('ll-fill').style.width=p+'%';
    document.getElementById('ll-pct').textContent=Math.floor(p)+'%';
  },120);
  lf.onload=function(){
    clearInterval(iv);
    document.getElementById('ll-fill').style.width='100%';
    document.getElementById('ll-pct').textContent='100%';
    setTimeout(function(){ll.style.display='none';lf.style.display='block';},400);
  };
  lf.src = url;
}
function closeLaunch(){ document.getElementById('launcher').style.display='none'; document.getElementById('ll-frame').src=''; }

function openSearch(){ document.getElementById('srch').classList.add('open'); setTimeout(function(){document.getElementById('srch-in').focus();},50); }
function closeSearch(){ document.getElementById('srch').classList.remove('open'); }
function doSearch(q) {
  q=q.toLowerCase();
  var all=zones.concat(saved.map(function(g){return {name:g.name,url:g.url,img:g.img};}));
  var res=q?all.filter(function(z){return(z.name||'').toLowerCase().includes(q);}):all;
  document.getElementById('srch-res').innerHTML=res.slice(0,40).map(function(z){
    return z.id ? card(z,145) : '<div class="gc" style="width:145px" onclick="launch(\''+encodeURIComponent(z.url)+'\',\''+z.name+'\')"><div class="gc-art-fallback" style="display:flex">'+z.name+'</div><div class="gc-info"><div class="gc-name">'+z.name+'</div></div></div>';
  }).join('');
}

function openAdd(){ document.getElementById('addm').classList.add('open'); document.getElementById('an').focus(); }
function closeAdd(){ document.getElementById('addm').classList.remove('open'); ['an','au','ai'].forEach(function(i){document.getElementById(i).value='';}); }
function saveGame(){
  var n=document.getElementById('an').value.trim();
  var u=document.getElementById('au').value.trim();
  var img=document.getElementById('ai').value.trim();
  if(!n||!u)return;
  if(!u.startsWith('http'))u='https://'+u;
  saved.push({name:n,url:u,img:img||''});
  localStorage.setItem('ios_g',JSON.stringify(saved));
  buildYour(); closeAdd();
}

(function tick(){ var d=new Date(),h=d.getHours().toString().padStart(2,'0'),m=d.getMinutes().toString().padStart(2,'0'); document.getElementById('clk').textContent=h+':'+m; setTimeout(tick,30000); })();

document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeLaunch();closeSearch();closeAdd();}});
document.getElementById('addm').onclick=function(e){if(e.target===this)closeAdd();};
document.getElementById('srch').onclick=function(e){if(e.target===this)closeSearch();};
</script>
` + T; }

  /* =====================================================================
     HUB — MOVIE/VIDEO GUI
  ===================================================================== */
  if (id === 'cine') { return H + `
<style>
body{background:#000;overflow:hidden}
#hub{height:100vh;display:flex;flex-direction:column}
/* NAV */
#hn{position:absolute;top:0;left:0;right:0;z-index:20;padding:14px 26px;display:flex;align-items:center;gap:22px;background:linear-gradient(rgba(0,0,0,.85),transparent)}
.brand{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:700;flex-shrink:0}
.nl{font-size:13px;font-weight:500;color:rgba(255,255,255,.55);cursor:pointer;transition:.15s;white-space:nowrap;user-select:none}
.nl:hover,.nl.on{color:#fff}
#hs{margin-left:auto;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12);color:#fff;padding:6px 13px;border-radius:5px;outline:none;font-size:13px;width:155px;transition:.2s}
#hs:focus{border-color:rgba(255,255,255,.25);width:210px}
/* HERO */
#hero{position:relative;height:52vh;flex-shrink:0}
#hero-bg{position:absolute;inset:0;background:#06080e}
#hero-frame{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}
#hero-ol{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.85) 0%,rgba(0,0,0,.2) 60%,transparent 100%)}
#hero-c{position:absolute;bottom:36px;left:28px;max-width:44%}
#hero-t{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.1rem,2.3vw,1.8rem);font-weight:700;margin-bottom:8px;text-shadow:0 2px 10px rgba(0,0,0,.8)}
#hero-d{font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:16px}
.hb{padding:9px 20px;border:none;border-radius:5px;font-weight:700;font-size:13px;cursor:pointer;transition:.15s}
.hp{background:#fff;color:#000;margin-right:8px}.hp:hover{background:#ddd}
.hi{background:rgba(60,60,60,.7);color:#fff;border:1px solid rgba(255,255,255,.2)}.hi:hover{background:rgba(80,80,80,.9)}
/* ROWS */
#rows{flex:1;overflow-y:auto;padding-bottom:28px}
#rows::-webkit-scrollbar{width:3px}
#rows::-webkit-scrollbar-thumb{background:#1a1a1a}
.row-sec{margin-top:24px}
.row-lbl{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:600;padding:0 26px;margin-bottom:11px}
.card-row{display:flex;gap:7px;padding:3px 26px 8px;overflow-x:auto;scroll-snap-type:x mandatory}
.card-row::-webkit-scrollbar{display:none}
.vc{flex-shrink:0;width:172px;border-radius:7px;overflow:hidden;cursor:pointer;scroll-snap-align:start;background:#111;border:1px solid #1a1a1a;transition:.22s}
.vc:hover{transform:scale(1.04);border-color:#2e2e2e;box-shadow:0 8px 24px rgba(0,0,0,.7)}
.vc-art{width:100%;height:100px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:rgba(255,255,255,.2);padding:8px;text-align:center;line-height:1.4}
.vc-info{padding:8px 10px 10px}
.vc-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.vc-sub{font-size:10px;color:#444}
/* PASTE MODAL */
#pm{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);backdrop-filter:blur(12px);z-index:100;align-items:center;justify-content:center;flex-direction:column;gap:14px;text-align:center;padding:30px}
#pm.open{display:flex}
#pm h3{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:600}
#pm p{color:#444;font-size:13px;max-width:320px;line-height:1.6}
#pu{background:#111;border:1px solid #222;color:#fff;padding:9px 14px;border-radius:6px;outline:none;font-size:13px;width:100%;max-width:380px}
</style>
<div id="hub">
  <div id="hero">
    <div id="hero-bg"></div>
    <iframe id="hero-frame" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
    <div id="hero-ol"></div>
    <div id="hn">
      <div class="brand">Intellectual Hub</div>
      ${['Home','Anime','Action','Music','Gaming','Movies'].map(function(x,i){return '<span class="nl'+(i===0?' on':'')+'" onclick="showCat(\''+x.toLowerCase()+'\',this)">'+x+'</span>';}).join('')}
      <input id="hs" type="text" placeholder="Search..." onkeydown="if(event.key==='Enter')doS(this.value)">
    </div>
    <div id="hero-c">
      <div id="hero-t">Intellectual Hub</div>
      <div id="hero-d">Paste any YouTube URL to watch it here without leaving the OS.</div>
      <div>
        <button class="hb hp" onclick="openPM()">&#9654; Paste URL</button>
        <button class="hb hi" onclick="document.getElementById('rows').scrollTop+=300">Browse</button>
      </div>
    </div>
  </div>
  <div id="rows"><div id="all-rows"></div></div>
</div>
<div id="pm">
  <h3>Play a video</h3>
  <p>Paste any YouTube link to watch it directly in the hub.</p>
  <input id="pu" type="text" placeholder="https://youtube.com/watch?v=...">
  <div style="display:flex;gap:8px">
    <button style="background:#fff;color:#000;border:none;padding:9px 20px;border-radius:5px;font-weight:700;font-size:13px;cursor:pointer" onclick="playUrl()">Play</button>
    <button style="background:#1a1a1a;color:#555;border:1px solid #1e1e1e;padding:9px 20px;border-radius:5px;font-weight:600;font-size:13px;cursor:pointer" onclick="closePM()">Cancel</button>
  </div>
</div>
<script>
var BG=['#06080e','#0e0608','#060e08','#080610','#100608','#060a10'];
var CATS={
  home:{l:'Trending',i:[{t:'Lo-Fi Radio',id:'5qap5aO4i9A'},{t:'Phonk Mix',id:'Lmc3Q5pOFW0'},{t:'Anime AMV',id:'8MJ7HMFbSCg'},{t:'FPS Highlights',id:'g6gGPnv4Wgo'},{t:'Minecraft',id:'gKNJKce1p8M'},{t:'Chill Beats',id:'lTRiuFIWV54'},{t:'City Nights',id:'BHACKCNDMW8'},{t:'Hip-Hop',id:'f02mOEt11OQ'},{t:'R&B Mix',id:'BEljvkEHhvA'}]},
  anime:{l:'Anime',i:[{t:'AMV Phonk',id:'Lmc3Q5pOFW0'},{t:'AMV Epic',id:'8MJ7HMFbSCg'},{t:'JJK Mix',id:'BEljvkEHhvA'},{t:'One Piece',id:'aaIJb8bRy78'},{t:'Naruto AMV',id:'gKNJKce1p8M'},{t:'Demon Slayer',id:'5mSFGN0VLuU'},{t:'Bleach AMV',id:'f02mOEt11OQ'},{t:'Attack on Titan',id:'BHACKCNDMW8'}]},
  action:{l:'Action',i:[{t:'FPS Clips',id:'g6gGPnv4Wgo'},{t:'Warzone',id:'f02mOEt11OQ'},{t:'Minecraft',id:'gKNJKce1p8M'},{t:'Speedrun',id:'5qap5aO4i9A'},{t:'Battle Royale',id:'BEljvkEHhvA'},{t:'Retro Gaming',id:'BHACKCNDMW8'},{t:'Pro Clips',id:'Lmc3Q5pOFW0'},{t:'Highlights',id:'lTRiuFIWV54'}]},
  music:{l:'Music',i:[{t:'Lo-Fi Radio',id:'5qap5aO4i9A'},{t:'Phonk Drive',id:'Lmc3Q5pOFW0'},{t:'Chill Beats',id:'lTRiuFIWV54'},{t:'Hip-Hop',id:'f02mOEt11OQ'},{t:'Trap Mix',id:'BEljvkEHhvA'},{t:'R&B Vibes',id:'5mSFGN0VLuU'},{t:'Pop Hits',id:'BHACKCNDMW8'},{t:'EDM',id:'gKNJKce1p8M'}]},
  gaming:{l:'Gaming',i:[{t:'Minecraft',id:'gKNJKce1p8M'},{t:'FPS',id:'g6gGPnv4Wgo'},{t:'Retro',id:'BHACKCNDMW8'},{t:'Speedrun',id:'5qap5aO4i9A'},{t:'Warzone',id:'f02mOEt11OQ'},{t:'Roblox',id:'lTRiuFIWV54'},{t:'Highlights',id:'BEljvkEHhvA'},{t:'Funny',id:'Lmc3Q5pOFW0'}]},
  movies:{l:'Movies & Shows',i:[{t:'Action Movies',id:'g6gGPnv4Wgo'},{t:'Anime Full',id:'8MJ7HMFbSCg'},{t:'Documentary',id:'BHACKCNDMW8'},{t:'Comedy Clips',id:'lTRiuFIWV54'},{t:'Drama',id:'BEljvkEHhvA'},{t:'Sci-Fi',id:'5qap5aO4i9A'},{t:'Horror',id:'f02mOEt11OQ'},{t:'Romance',id:'5mSFGN0VLuU'}]}
};
function buildRows(k){
  var html=''; var keys=k?[k]:Object.keys(CATS);
  keys.forEach(function(ck){
    var c=CATS[ck];
    html+='<div class="row-sec"><div class="row-lbl">'+c.l+'</div><div class="card-row">'+
      c.i.map(function(x,i){return'<div class="vc" onclick="pv(\''+x.id+'\',\''+x.t+'\')"><div class="vc-art" style="background:'+BG[i%BG.length]+'">'+x.t+'</div><div class="vc-info"><div class="vc-name">'+x.t+'</div><div class="vc-sub">YouTube</div></div></div>';}).join('')+
      '</div></div>';
  });
  document.getElementById('all-rows').innerHTML=html;
}
function showCat(k,el){document.querySelectorAll('.nl').forEach(function(l){l.classList.remove('on');});el.classList.add('on');buildRows(k==='home'?null:k);}
function pv(id,t){
  document.getElementById('hero-bg').style.display='none';
  var f=document.getElementById('hero-frame');f.style.display='block';
  f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';
  document.getElementById('hero-t').textContent=t;
  document.getElementById('hero-d').textContent='Now playing in hub.';
  closePM();
}
function gv(s){s=(s||'').trim();var m=s.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/ ]{11})/);return m?m[1]:(s.length===11?s:null);}
function playUrl(){var v=gv(document.getElementById('pu').value);if(!v){alert('Paste a valid YouTube URL');return;}pv(v,'Video');}
function openPM(){document.getElementById('pm').classList.add('open');document.getElementById('pu').focus();}
function closePM(){document.getElementById('pm').classList.remove('open');}
function doS(q){buildRows();if(q)document.getElementById('all-rows').insertAdjacentHTML('afterbegin','<div style="padding:22px;font-size:13px;color:#333">Search YouTube for "'+q+'", copy the URL, then use Paste URL to watch it here.</div>');}
document.getElementById('pm').onclick=function(e){if(e.target===this)closePM();};
document.addEventListener('keydown',function(e){if(e.key==='Escape')closePM();});
buildRows();
</script>` + T; }

  /* =====================================================================
     MUSIC — YouTube + SoundCloud (playback prefers YouTube)
  ===================================================================== */
  if (id === 'term') { return H + `
<style>
body{background:#0a0a0a;overflow:hidden;color:#fff}
#mu{height:100vh;display:flex;flex-direction:column}
#mu-tabs{display:flex;border-bottom:1px solid #161616;background:#0a0a0a;flex-shrink:0}
.mu-tb{flex:1;padding:13px 0;text-align:center;font-size:13px;font-weight:700;letter-spacing:.4px;cursor:pointer;color:#555;transition:.15s;border-bottom:2px solid transparent}
.mu-tb.on{color:#fff;border-bottom-color:#cc0000}
.mu-tb.sc.on{border-bottom-color:#ff5500}
.mu-tb:hover{color:#bbb}
#mu-body{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0}
.mu-view{flex:1;overflow-y:auto;padding:20px;display:none}
.mu-view.on{display:block}
.mu-view::-webkit-scrollbar{width:4px}.mu-view::-webkit-scrollbar-thumb{background:#222}
.mu-row{display:flex;gap:8px;margin-bottom:18px}
.mu-inp{flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:10px 14px;border-radius:6px;outline:none;font-size:13px}
.mu-inp:focus{border-color:#2a2a2a}
.mu-btn{border:none;color:#fff;padding:10px 18px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer}
.mu-btn.yt{background:#cc0000}.mu-btn.yt:hover{background:#e50000}
.mu-btn.sc{background:#ff5500}.mu-btn.sc:hover{background:#ff6e1f}
.mu-sec{font-size:1.05rem;font-weight:800;margin:18px 0 12px}
.mu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.mu-card{background:#111;border:1px solid #161616;border-radius:8px;overflow:hidden;cursor:pointer;transition:.15s}
.mu-card:hover{background:#181818;border-color:#222}
.mu-thumb{aspect-ratio:16/9;background:#1a1a1a;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.mu-thumb img{width:100%;height:100%;object-fit:cover}
.mu-ptri{position:absolute;width:40px;height:40px;background:rgba(0,0,0,.7);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:.15s}
.mu-card:hover .mu-ptri{opacity:1}
.mu-card-t{padding:10px 12px 4px;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mu-card-s{padding:0 12px 10px;font-size:11px;color:#888}
.mu-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.mu-chip{background:#111;border:1px solid #1a1a1a;padding:7px 14px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer}
.mu-chip:hover{background:#181818}
#mu-player{height:240px;flex-shrink:0;background:#000;border-top:1px solid #161616;display:flex;flex-direction:column}
#mu-pl-hd{padding:8px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#888}
#mu-pl-ti{font-weight:700;color:#fff;font-size:13px;max-width:60%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mu-pl-src{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600}
.mu-dot{width:7px;height:7px;border-radius:50%;background:#cc0000}
.mu-dot.sc{background:#ff5500}
#mu-pl-body{flex:1;position:relative;background:#000}
#mu-yt,#mu-sc{position:absolute;inset:0;width:100%;height:100%;border:none}
#mu-sc{display:none}
#mu-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#333;font-size:13px;font-weight:600}
</style>
<div id="mu">
  <div id="mu-tabs">
    <div class="mu-tb on" data-v="yt" onclick="muTab('yt')">YouTube</div>
    <div class="mu-tb sc" data-v="sc" onclick="muTab('sc')">SoundCloud</div>
  </div>
  <div id="mu-body">
    <div id="mu-v-yt" class="mu-view on">
      <div class="mu-row">
        <input id="mu-yt-q" class="mu-inp" placeholder="Search YouTube or paste a video URL..." onkeydown="if(event.key==='Enter')muYtGo()">
        <button class="mu-btn yt" onclick="muYtGo()">Play</button>
      </div>
      <div class="mu-chips">${['Lo-Fi','Hip-Hop','Pop','Rock','Phonk','R&B','Electronic','Jazz','K-Pop','Classical'].map(function(g){return '<div class="mu-chip" onclick="muYtSearch(\''+g+' mix\')">'+g+'</div>';}).join('')}</div>
      <div class="mu-sec">Featured</div>
      <div class="mu-grid" id="mu-yt-grid"></div>
    </div>
    <div id="mu-v-sc" class="mu-view">
      <div class="mu-row">
        <input id="mu-sc-q" class="mu-inp" placeholder="Paste a SoundCloud URL..." onkeydown="if(event.key==='Enter')muScGo()">
        <button class="mu-btn sc" onclick="muScGo()">Play</button>
      </div>
      <div class="mu-chips">${[['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap'],['Lo-Fi','https://soundcloud.com/lofimusic'],['Pop','https://soundcloud.com/charts/top?genre=pop'],['R&B','https://soundcloud.com/charts/top?genre=rnb'],['Electronic','https://soundcloud.com/charts/top?genre=electronic'],['Rock','https://soundcloud.com/charts/top?genre=rock'],['Indie','https://soundcloud.com/charts/top?genre=alternative'],['Jazz','https://soundcloud.com/charts/top?genre=jazz']].map(function(x){return '<div class="mu-chip" onclick="muScLoad(\''+x[1]+'\',\''+x[0]+'\')">'+x[0]+'</div>';}).join('')}</div>
      <div class="mu-sec">SoundCloud Charts</div>
      <div class="mu-grid" id="mu-sc-grid"></div>
    </div>
    <div id="mu-player">
      <div id="mu-pl-hd">
        <div id="mu-pl-ti">Nothing playing</div>
        <div id="mu-pl-src"><span class="mu-dot"></span><span id="mu-pl-srct">YouTube</span></div>
      </div>
      <div id="mu-pl-body">
        <div id="mu-empty">Pick a track to start playing</div>
        <iframe id="mu-yt" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
        <iframe id="mu-sc" allow="autoplay"></iframe>
      </div>
    </div>
  </div>
</div>
<script>
var MU_YT_FEAT=[
  {t:"Lo-Fi Radio · Chill Beats",a:"Chillhop",id:"jfKfPfyJRdk"},
  {t:"Phonk Mix 2025",a:"Phonk",id:"Lmc3Q5pOFW0"},
  {t:"Hip-Hop Hits",a:"Various",id:"f02mOEt11OQ"},
  {t:"Chill Vibes",a:"Various",id:"lTRiuFIWV54"},
  {t:"R&B Slow Jams",a:"Various",id:"BEljvkEHhvA"},
  {t:"Study Beats",a:"Lo-Fi",id:"5mSFGN0VLuU"},
  {t:"Pop Top Hits",a:"Various",id:"WvLlw7N9vXY"},
  {t:"EDM Mix",a:"Various",id:"fLexgOxsZu0"}
];
var MU_SC_FEAT=[
  {t:"Top 50 Global",a:"Charts",url:"https://soundcloud.com/charts/top"},
  {t:"New & Hot",a:"Trending",url:"https://soundcloud.com/charts/new"},
  {t:"Lo-Fi",a:"Playlist",url:"https://soundcloud.com/lofimusic"},
  {t:"Hip-Hop & Rap",a:"Genre",url:"https://soundcloud.com/charts/top?genre=hiphoprap"},
  {t:"Electronic",a:"Genre",url:"https://soundcloud.com/charts/top?genre=electronic"},
  {t:"Pop",a:"Genre",url:"https://soundcloud.com/charts/top?genre=pop"},
  {t:"R&B",a:"Genre",url:"https://soundcloud.com/charts/top?genre=rnb"},
  {t:"Indie",a:"Genre",url:"https://soundcloud.com/charts/top?genre=alternative"}
];
function muTab(v){
  document.querySelectorAll('.mu-tb').forEach(function(t){t.classList.toggle('on',t.dataset.v===v);});
  document.querySelectorAll('.mu-view').forEach(function(s){s.classList.remove('on');});
  document.getElementById('mu-v-'+v).classList.add('on');
}
function muEsc(s){return String(s).replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");}
function muBuildYT(){
  document.getElementById('mu-yt-grid').innerHTML=MU_YT_FEAT.map(function(d){
    return '<div class="mu-card" onclick="muYtPlay(\''+d.id+'\',\''+muEsc(d.t)+'\',\''+muEsc(d.a)+'\')"><div class="mu-thumb"><img src="https://i.ytimg.com/vi/'+d.id+'/mqdefault.jpg" onerror="this.style.display=\'none\'"><div class="mu-ptri"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div></div><div class="mu-card-t">'+d.t+'</div><div class="mu-card-s">'+d.a+'</div></div>';
  }).join('');
}
function muBuildSC(){
  document.getElementById('mu-sc-grid').innerHTML=MU_SC_FEAT.map(function(d){
    return '<div class="mu-card" onclick="muScLoad(\''+d.url+'\',\''+muEsc(d.t)+'\')"><div class="mu-thumb" style="background:linear-gradient(135deg,#ff5500,#ff8c00);color:#fff;font-weight:800;font-size:12px;letter-spacing:1px;text-align:center;padding:8px">'+d.t.toUpperCase()+'</div><div class="mu-card-t">'+d.t+'</div><div class="mu-card-s">'+d.a+'</div></div>';
  }).join('');
}
function muExtractYT(s){
  s=(s||'').trim();
  if(/^[A-Za-z0-9_-]{11}$/.test(s))return s;
  var m=s.match(/(?:youtube\\.com\\/(?:watch\\?v=|embed\\/|v\\/|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
  return m?m[1]:null;
}
function muYtPlay(id,t,a){
  document.getElementById('mu-empty').style.display='none';
  var sc=document.getElementById('mu-sc');sc.style.display='none';sc.src='';
  var p=document.getElementById('mu-yt');p.style.display='block';
  p.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';
  document.getElementById('mu-pl-ti').textContent=t;
  document.getElementById('mu-pl-srct').textContent='YouTube · '+(a||'');
  document.querySelector('#mu-pl-src .mu-dot').classList.remove('sc');
}
function muYtGo(){
  var raw=document.getElementById('mu-yt-q').value.trim();if(!raw)return;
  var id=muExtractYT(raw);if(id){muYtPlay(id,'Video','YouTube');return;}
  muYtSearch(raw);
}
function muYtSearch(q){
  document.getElementById('mu-empty').style.display='none';
  var sc=document.getElementById('mu-sc');sc.style.display='none';sc.src='';
  var p=document.getElementById('mu-yt');p.style.display='block';
  p.src='/service/'+btoa('https://www.youtube.com/results?search_query='+encodeURIComponent(q));
  document.getElementById('mu-pl-ti').textContent='Search: '+q;
  document.getElementById('mu-pl-srct').textContent='YouTube · pick a video';
  document.querySelector('#mu-pl-src .mu-dot').classList.remove('sc');
}
function muScLoad(url,t){
  if(!url)return;
  document.getElementById('mu-empty').style.display='none';
  var yt=document.getElementById('mu-yt');yt.style.display='none';yt.src='';
  var p=document.getElementById('mu-sc');p.style.display='block';
  p.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%23ff5500&auto_play=true&show_comments=false&hide_related=true&visual=true';
  document.getElementById('mu-pl-ti').textContent=t||'SoundCloud';
  document.getElementById('mu-pl-srct').textContent='SoundCloud';
  document.querySelector('#mu-pl-src .mu-dot').classList.add('sc');
}
function muScGo(){
  var v=document.getElementById('mu-sc-q').value.trim();if(!v)return;
  if(!/^https?:\\/\\//.test(v))v='https://soundcloud.com/'+v.replace(/^\\//,'');
  muScLoad(v,'Custom');
}
muBuildYT();muBuildSC();
</script>` + T; }

  /* =====================================================================
     DISCORD — invite card with purple glow + real QR
  ===================================================================== */
  if (id === 'discord') { return H + `
<style>
body{overflow:hidden;background:#000}
#dc{height:100vh;display:flex;flex-direction:column}
#dc-bar{display:flex;align-items:center;gap:10px;padding:8px 14px;background:#0a0a0a;border-bottom:1px solid #161616;flex-shrink:0}
.dc-t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700;color:#fff}
.dc-sub{font-size:11px;color:#444}
.dc-b{margin-left:auto;background:#5865f2;border:none;color:#fff;padding:6px 14px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer}
.dc-b:hover{background:#4752c4}
#dc-frame{flex:1;border:none;background:#000;width:100%}
</style>
<div id="dc">
  <div id="dc-bar">
    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" style="width:18px;height:18px">
    <div class="dc-t">Discord</div>
    <span class="dc-sub">Routing through built-in proxy</span>
    <button class="dc-b" onclick="window.open('https://discord.gg/Sduv8uDjxF','_blank','noopener,noreferrer')">Join Server</button>
  </div>
  <iframe id="dc-frame" src="" allow="autoplay;fullscreen;clipboard-write;camera;microphone"></iframe>
</div>
<script>document.getElementById('dc-frame').src='/service/'+btoa('https://discord.com/app');<\/script>` + T; }

  /* =====================================================================
     BROWSER
  ===================================================================== */
  if (id === 'web') { return H + `<style>body{overflow:hidden}#b{height:100vh;display:flex;flex-direction:column}#t{padding:8px 10px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;gap:6px;align-items:center;flex-shrink:0}.nb{background:#111;border:1px solid #1a1a1a;color:#666;width:26px;height:26px;border-radius:50%;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.12s}.nb:hover{color:#aaa}#url{flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 13px;border-radius:18px;outline:none;font-size:13px;font-weight:500;transition:.2s}#url:focus{border-color:#2a2a2a}#go{background:#fff;color:#000;border:none;padding:7px 15px;border-radius:18px;font-weight:700;font-size:13px;cursor:pointer;flex-shrink:0}#go:hover{background:#ddd}#pbar{padding:6px 12px;background:#060606;border-bottom:1px solid #0d0d0d;display:flex;align-items:center;gap:7px;flex-shrink:0}#pdot{width:6px;height:6px;border-radius:50%;background:#4a7;flex-shrink:0}#plbl{font-size:10px;font-weight:600;color:#2a2a2a;flex-shrink:0;text-transform:uppercase;letter-spacing:.5px}#pin{flex:1;background:transparent;border:none;color:#2a2a2a;font-size:11px;outline:none}#bd{flex:1;position:relative}#ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:30px;text-align:center}#mf{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}</style><div id="b"><div id="t"><div class="nb" onclick="bk()">&#8249;</div><div class="nb" onclick="fw()">&#8250;</div><div class="nb" onclick="rl()">&#8635;</div><input id="url" type="text" placeholder="Search or enter a URL..." onkeydown="if(event.key==='Enter')go()"><button id="go" onclick="go()">Go</button></div><div id="pbar"><div id="pdot"></div><span id="plbl">Proxy</span><input id="pin" type="text" value="Built-in proxy active" readonly></div><div id="bd"><div id="ph"><div style="font-size:1.6rem;color:#111">&#128274;</div><div style="font-size:.85rem;font-weight:600;color:#111">Enter a URL to browse</div><div style="font-size:12px;color:#0d0d0d;max-width:240px;line-height:1.7;margin-top:4px">Your Webshare proxies are built into the server. All sites route through them automatically.</div></div><iframe id="mf" allow="autoplay;fullscreen;clipboard-write;camera;microphone" allowfullscreen></iframe></div></div><script>function go(){var raw=document.getElementById("url").value.trim();if(!raw)return;var url=raw.startsWith("http")?raw:(raw.includes(".")&&!raw.includes(" ")?"https://"+raw:"https://www.google.com/search?q="+encodeURIComponent(raw));var f=document.getElementById("mf");document.getElementById("ph").style.display="none";f.style.display="block";f.src="/service/"+btoa(url);}function bk(){try{document.getElementById("mf").contentWindow.history.back();}catch(e){}}function fw(){try{document.getElementById("mf").contentWindow.history.forward();}catch(e){}}function rl(){var f=document.getElementById("mf");if(f.src&&f.src!=="about:blank")f.src=f.src;}<\/script>` + T; }

  /* =====================================================================
     ROBLOX — proxy through built-in server
  ===================================================================== */
  if (id === 'roblox') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}#f{flex:1;border:none}</style><div id="r"><div id="h"><div class="t">Roblox</div><span style="font-size:11px;color:#333;margin-left:8px">Routing through built-in proxy</span></div><iframe id="f" src="" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>document.getElementById("f").src="/service/"+btoa("https://www.roblox.com");<\/script>` + T; }

  /* =====================================================================
     GEFORCE NOW — proxy through built-in server
  ===================================================================== */
  if (id === 'Geforce') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}#f{flex:1;border:none}</style><div id="r"><div id="h"><div class="t">GeForce Now</div><span style="font-size:11px;color:#333;margin-left:8px">Routing through built-in proxy</span></div><iframe id="f" src="" allow="autoplay;fullscreen;gamepad"></iframe></div><script>document.getElementById("f").src="/service/"+btoa("https://play.geforcenow.com");<\/script>` + T; }

  /* =====================================================================
     ANIME — 9animetv.to via built-in proxy
  ===================================================================== */
  if (id === 'anime') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}#f{flex:1;border:none;background:#000}</style><div id="r"><div id="h"><div class="t">Anime</div><span style="font-size:11px;color:#333;margin-left:8px">9animetv.to · routing through built-in proxy</span></div><iframe id="f" src="" allow="autoplay;fullscreen;encrypted-media;picture-in-picture"></iframe></div><script>document.getElementById("f").src="/service/"+btoa("https://9animetv.to/home");<\/script>` + T; }

  /* =====================================================================
     AI
  ===================================================================== */
  if (id === 'ciniai') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap}.ttl{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}.tabs{display:flex;gap:5px;flex-wrap:wrap}.tab{background:#111;border:1px solid #1a1a1a;color:#555;padding:4px 13px;border-radius:14px;font-size:12px;font-weight:600;cursor:pointer;transition:.12s}.tab:hover{color:#aaa}.tab.on{background:#fff;color:#000;border-color:#fff}#f{flex:1;border:none;background:#111}</style><div id="r"><div id="h"><div class="ttl">AI</div><div class="tabs">${[['ChatGPT','gpt','https://chat.openai.com'],['Claude','cld','https://claude.ai'],['Gemini','gem','https://gemini.google.com'],['Perplexity','perp','https://perplexity.ai']].map(function(x){return'<div id="t-'+x[1]+'" class="tab" onclick="load(\''+x[2]+'\',\''+x[1]+'\')">'+x[0]+'</div>';}).join('')}</div></div><iframe id="f" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>var c='',cu='';function load(url,key){c=key;cu=url;document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});var t=document.getElementById('t-'+key);if(t)t.classList.add('on');document.getElementById('f').src='/service/'+btoa(url);}load('https://chat.openai.com','gpt');<\/script>` + T; }

  /* =====================================================================
     SETTINGS
  ===================================================================== */
  if (id === 'settings') {
    var rows = ['optBg|Optimized background|Disables animated background','shortBoot|Fast boot|Skip the startup animation','idleLock|Auto-lock|Lock after 3 minutes','redirectConfirm|Redirect warning|Helps block GoGuardian'].map(function(r) {
      var p=r.split('|');
      return '<div class="c"><div class="ci"><strong>'+p[1]+'</strong><small>'+p[2]+'</small></div><label class="tog"><input type="checkbox" id="c-'+p[0]+'" data-key="'+p[0]+'" onchange="W(this)"><span class="ts"></span></label></div>';
    }).join('');
    var swatches = ['#fff','#4f8ef7','#f74f4f','#4ff78e','#f7c14f','#c14ff7','#ff6b35','#1db954'].map(function(c){
      return '<div class="sw" style="background:'+c+'" onclick="window.parent.applyAccentColor(\''+c+'\')"></div>';
    }).join('');
    return H + '<style>body{overflow-y:auto;height:auto;min-height:100vh}.w{padding:20px;max-width:500px;margin:0 auto}.h{font-size:.7rem;font-weight:700;color:#444;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:12px;margin-top:22px;text-transform:uppercase;letter-spacing:.5px}.h:first-child{margin-top:0}.c{background:#0d0d0d;border:1px solid #111;padding:12px 14px;border-radius:8px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;gap:12px}.ci{display:flex;flex-direction:column;gap:2px}strong{font-size:13px;font-weight:600}small{font-size:11px;color:#333;display:block}.tog{position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0}.tog input{opacity:0;width:0;height:0}.ts{position:absolute;cursor:pointer;inset:0;background:#1a1a1a;border-radius:20px;transition:.25s;border:1px solid #222}.ts:before{position:absolute;content:"";height:13px;width:13px;left:3px;bottom:3px;background:#333;transition:.25s;border-radius:50%}input:checked+.ts{background:#fff;border-color:#fff}input:checked+.ts:before{transform:translateX(16px);background:#000}select{background:#111;color:#fff;border:1px solid #1a1a1a;padding:5px 8px;border-radius:5px;outline:none;font-size:12px;font-family:Inter,sans-serif}.pk{width:34px;height:26px;background:#111;border:1px solid #1a1a1a;color:#fff;text-align:center;font-size:.9rem;font-weight:600;outline:none;border-radius:4px}.sw{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;display:inline-block;margin-right:5px;vertical-align:middle;transition:.15s}.sw:hover{border-color:#fff}.inp{background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 10px;border-radius:5px;outline:none;font-size:12px}</style>' +
      '<div class="w"><div class="h">Performance</div>'+rows+
      '<div class="h">Privacy</div>'+
      '<div class="c"><div class="ci"><strong>Tab disguise</strong><small>Make this tab look like another site</small></div><select id="clk" onchange="window.parent.updateCloak(this.value)"><option value="none">None</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option></select></div>'+
      '<div class="c"><div class="ci"><strong>Panic key</strong><small>Press to instantly close the tab</small></div><input class="pk" type="text" id="pk" maxlength="1" oninput="window.parent.updateSysSetting(\'panicKey\',this.value)"></div>'+
      '<div class="h">Appearance</div>'+
      '<div class="c" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="ci"><strong>Accent color</strong><small>Changes highlights across the OS</small></div><div style="margin-top:8px">'+swatches+'</div></div>'+
      '<div class="c" style="flex-direction:column;align-items:flex-start;gap:8px"><div class="ci"><strong>Custom wallpaper</strong><small>Add any image or video URL</small></div><div style="display:flex;gap:6px;width:100%;margin-top:4px"><input class="inp" id="wn" type="text" placeholder="Name" style="width:100px"><input class="inp" id="wu" type="text" placeholder="URL" style="flex:1;min-width:100px"><button onclick="AW()" style="background:#fff;color:#000;border:none;padding:7px 14px;border-radius:5px;font-weight:700;font-size:12px;cursor:pointer">Add</button></div></div></div>'+
      '<script>(function(){var p=window.parent.sysConfig;["optBg","shortBoot","idleLock","redirectConfirm"].forEach(function(k){var cb=document.getElementById("c-"+k);if(cb){cb.checked=!!p[k];syncT(cb);}});var cl=document.getElementById("clk");if(cl)cl.value=p.cloak||"none";var pk=document.getElementById("pk");if(pk)pk.value=p.panicKey||"";})();function W(cb){var k=cb.getAttribute("data-key");window.parent.updateSysSetting(k,cb.checked);syncT(cb);}function syncT(cb){var t=cb.nextElementSibling;t.style.background=cb.checked?"#fff":"#1a1a1a";t.style.borderColor=cb.checked?"#fff":"#222";}function AW(){var n=document.getElementById("wn").value.trim(),u=document.getElementById("wu").value.trim();if(!n||!u)return;window.parent.addCustomWallpaper(n,u);document.getElementById("wn").value="";document.getElementById("wu").value="";}<\/script>' + T;
  }

  return H + '<div style="height:100%;display:flex;align-items:center;justify-content:center"><p style="color:#1e1e1e;font-size:13px;font-weight:600">App not configured</p></div>' + T;
}

// ── WINDOWS ───────────────────────────────────────────────────────────────────
function toggleApp(id){var w=document.getElementById('win-'+id);if(w){if(w.classList.contains('minimized')){w.classList.remove('minimized');w.classList.add('active');w.style.zIndex=++highestZ;activeWindowId=id;startImmersiveMode(w);}else if(activeWindowId===id){minimizeWindow(id);}else{w.style.zIndex=++highestZ;activeWindowId=id;startImmersiveMode(w);}}else{openWindow(id);}}
function openWindow(id){var sm=document.getElementById('start-menu');if(sm){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}var layer=document.getElementById('windows-layer'),win=document.getElementById('win-'+id);if(!win){var dat=APPS[id]||{title:'APP',internal:true};win=document.createElement('div');win.id='win-'+id;win.className='window header-visible';win.style.zIndex=++highestZ;win.innerHTML='<div class="win-header" onmousedown="DragSystem.startWinDrag(event,\''+id+'\')"><div class="win-title">'+dat.title+'</div><div class="win-controls"><div class="win-btn btn-min" onclick="minimizeWindow(\''+id+'\')"></div><div class="win-btn btn-close" onclick="closeWindow(\''+id+'\')"></div></div></div><div class="win-body"><iframe id="frame-'+id+'"></iframe></div>';layer.appendChild(win);requestAnimationFrame(function(){requestAnimationFrame(function(){win.classList.add('active');});});var f=document.getElementById('frame-'+id);if(f)f.srcdoc=getAppSrcdoc(id);}else{win.classList.remove('minimized');win.classList.add('active');win.style.zIndex=++highestZ;}activeWindowId=id;startImmersiveMode(win);}
function closeWindow(id){var w=document.getElementById('win-'+id);if(w){w.classList.remove('active');setTimeout(function(){if(w.parentNode)w.remove();},230);}if(activeWindowId===id)activeWindowId=null;endImmersiveMode();}
function minimizeWindow(id){var w=document.getElementById('win-'+id);if(w){var dock=document.getElementById('dock-container');if(dock){var dr=dock.getBoundingClientRect(),wr=w.getBoundingClientRect();w.style.setProperty('--min-tx',(dr.left+dr.width/2-(wr.left+wr.width/2))+'px');w.style.setProperty('--min-ty',(dr.top-wr.top)+'px');}w.classList.add('minimized');w.classList.remove('active');if(activeWindowId===id)activeWindowId=null;}endImmersiveMode();}
function startImmersiveMode(win){document.getElementById('dock-container').classList.add('dock-hidden');win.classList.remove('header-visible');}
function endImmersiveMode(){var aw=document.querySelectorAll('.window.active:not(.minimized)');if(aw.length===0){document.getElementById('dock-container').classList.remove('dock-hidden');activeWindowId=null;}else{var t=aw[aw.length-1];activeWindowId=t.id.replace('win-','');t.style.zIndex=++highestZ;startImmersiveMode(t);}}
var dockTimer,dEl=document.getElementById('dock-container');
document.getElementById('bottom-trigger').addEventListener('mouseenter',function(){dEl.classList.remove('dock-hidden');clearTimeout(dockTimer);});
dEl.addEventListener('mouseleave',function(){if(document.querySelectorAll('.window.active:not(.minimized)').length>0)dockTimer=setTimeout(function(){dEl.classList.add('dock-hidden');},1000);});
dEl.addEventListener('mouseenter',function(){clearTimeout(dockTimer);});
document.getElementById('top-trigger').addEventListener('mouseenter',function(){if(activeWindowId){var w=document.getElementById('win-'+activeWindowId);if(w&&!w.classList.contains('minimized'))w.classList.add('header-visible');}});
document.addEventListener('mouseover',function(e){if(e.target.closest('.win-header')){if(activeWindowId){var w=document.getElementById('win-'+activeWindowId);if(w)w.classList.add('header-visible');}}else if(activeWindowId&&!e.target.closest('#top-trigger')){var w=document.getElementById('win-'+activeWindowId);if(w)w.classList.remove('header-visible');}});

// ── DESKTOP ───────────────────────────────────────────────────────────────────
var desktopLayout=JSON.parse(localStorage.getItem('intel_desktop_v2'))||[];
function saveDesktop(){localStorage.setItem('intel_desktop_v2',JSON.stringify(desktopLayout));loadDesktop();if(window.saveToCloud)window.saveToCloud();}
function loadDesktop(){var c=document.getElementById('desktop-area');document.querySelectorAll('.desktop-app').forEach(function(e){e.remove();});desktopLayout.forEach(function(item,idx){var d=document.createElement('div');d.className='desktop-app';d.style.left=item.x+'px';d.style.top=item.y+'px';d.setAttribute('data-idx',idx);if(item.type==='folder'){var gHTML='<div class="d-folder-grid">';item.apps.slice(0,4).forEach(function(a){if(APPS[a])gHTML+='<img src="'+APPS[a].icon+'">';});gHTML+='</div>';if(!item.hideName)gHTML+='<div class="d-label">'+(item.customName||'Folder')+'</div>';d.innerHTML=gHTML;d.onclick=function(ev){if(DragSystem.isDragMove)return;ev.stopPropagation();if(!this.classList.contains('expanded-folder')){closeAllFolders();expandFolder(this,item,idx);}};}else{var a=APPS[item.id];if(a){d.innerHTML='<img src="'+(item.customIcon||a.icon)+'" class="d-icon">'+(item.hideName?'':'<div class="d-label">'+(item.customName||a.title)+'</div>');d.ondblclick=function(ev){ev.stopPropagation();toggleApp(item.id);};}}d.onmousedown=function(ev){ev.stopPropagation();if(ev.button===0)DragSystem.start(ev,d,'desktop',idx);};d.oncontextmenu=function(ev){ev.preventDefault();ev.stopPropagation();hideAllCtx();var m=document.getElementById('app-context-menu');if(m){m.style.display='block';m.style.left=ev.pageX+'px';m.style.top=ev.pageY+'px';m.setAttribute('data-target-idx',idx);}};c.appendChild(d);});}
function expandFolder(el,dat,idx){el.classList.add('expanded-folder');var h='<div class="folder-header">'+(dat.customName||'Folder')+' <i class="fas fa-times" onclick="closeAllFolders(event)"></i></div><div class="folder-grid-expanded">';dat.apps.forEach(function(aId){var info=APPS[aId];if(info)h+='<div class="f-app" onclick="event.stopPropagation();toggleApp(\''+aId+'\')"><img src="'+info.icon+'"><span>'+info.title+'</span></div>';});h+='</div>';el.innerHTML=h;setTimeout(function(){var rect=el.getBoundingClientRect();document.querySelectorAll('.desktop-app:not(.expanded-folder)').forEach(function(s){var sr=s.getBoundingClientRect();if(!(rect.right<sr.left||rect.left>sr.right||rect.bottom<sr.top||rect.top>sr.bottom)){s.style.transform='translateY('+(rect.bottom-sr.top+20)+'px)';s.setAttribute('data-pushed','true');}});},50);}
function closeAllFolders(ev){if(ev)ev.stopPropagation();document.querySelectorAll('.expanded-folder').forEach(function(o){o.classList.remove('expanded-folder');});document.querySelectorAll('.desktop-app[data-pushed="true"]').forEach(function(j){j.style.transform='';j.removeAttribute('data-pushed');});setTimeout(loadDesktop,250);}
function setupAppContextMenu(){var m=document.getElementById('app-context-menu');if(!m)return;m.innerHTML='<li class="ctx-item" id="ctx-rename" role="menuitem" tabindex="0"><i class="fas fa-edit fa-fw"></i> Rename</li><li class="ctx-item" id="ctx-hidename" role="menuitem" tabindex="0"><i class="fas fa-eye-slash fa-fw"></i> Toggle Name</li><li class="ctx-item" id="ctx-changeicon" role="menuitem" tabindex="0"><i class="fas fa-image fa-fw"></i> Change Icon</li><li class="ctx-separator"></li><li class="ctx-item" id="ctx-delete" role="menuitem" tabindex="0"><i class="fas fa-trash fa-fw" style="color:#aaa"></i> Remove</li>';document.getElementById('ctx-rename').onclick=function(){var i=m.getAttribute('data-target-idx'),nm=prompt("New name:",desktopLayout[i].customName||"");if(nm!==null){desktopLayout[i].customName=nm.trim()||"App";saveDesktop();}m.style.display='none';};document.getElementById('ctx-hidename').onclick=function(){var i=m.getAttribute('data-target-idx');desktopLayout[i].hideName=!desktopLayout[i].hideName;saveDesktop();m.style.display='none';};document.getElementById('ctx-changeicon').onclick=function(){var i=m.getAttribute('data-target-idx'),url=prompt("Image URL for icon:");if(url){desktopLayout[i].customIcon=url;saveDesktop();}m.style.display='none';};document.getElementById('ctx-delete').onclick=function(){var i=m.getAttribute('data-target-idx');desktopLayout.splice(i,1);saveDesktop();m.style.display='none';};}
document.addEventListener('contextmenu',function(e){var ids=['desktop-area','windows-layer','bg-video','bg-img','snow-fx'];if(ids.includes(e.target.id)||e.target.tagName==='BODY'||e.target.closest('#right-sidebar')){e.preventDefault();hideAllCtx();var m=document.getElementById('desktop-context-menu');if(m){m.style.display='block';var x=e.pageX,y=e.pageY;if(x+200>window.innerWidth)x=window.innerWidth-200;if(y+100>window.innerHeight)y=window.innerHeight-100;m.style.left=x+'px';m.style.top=y+'px';}}});
window.toggleDesktopSize=function(l){document.getElementById('desktop-area').classList[l?'add':'remove']('desktop-large-mode');document.getElementById('desktop-context-menu').style.display='none';};

// ── DRAG SYSTEM ───────────────────────────────────────────────────────────────
var DragSystem={dragging:false,startPos:{x:0,y:0},sourceType:null,sourceEl:null,idx:null,appId:null,proxy:document.getElementById('drag-proxy'),pImg:document.getElementById('proxy-img'),badge:document.getElementById('folder-badge'),init:function(){window.addEventListener('mousemove',function(e){DragSystem.move(e);});window.addEventListener('mouseup',function(e){DragSystem.end(e);});},start:function(e,el,type,id){this.startPos={x:e.clientX,y:e.clientY};this.sourceType=type;this.sourceEl=el;this.isDragMove=false;if(type==='drawer'||type==='dock')this.appId=id;else if(type==='desktop'){this.idx=id;this.sourceEl.style.opacity='0.5';}},startWinDrag:function(e,id){this.startPos={x:e.clientX,y:e.clientY};this.sourceType='window';this.sourceEl=document.getElementById('win-'+id);this.isDragMove=false;},move:function(e){if(!this.sourceEl)return;var dx=Math.abs(e.clientX-this.startPos.x),dy=Math.abs(e.clientY-this.startPos.y);if(dx>3||dy>3){this.dragging=true;this.isDragMove=true;if(this.sourceType==='desktop'||this.sourceType==='drawer'||this.sourceType==='dock'){if(this.sourceType==='drawer')toggleAppDrawer();this.proxy.style.display='block';this.proxy.style.left=(e.clientX-25)+'px';this.proxy.style.top=(e.clientY-25)+'px';if(this.sourceType==='drawer'||this.sourceType==='dock'){if(APPS[this.appId])this.pImg.src=APPS[this.appId].icon;}else{var itm=desktopLayout[this.idx];if(itm.type==='app'&&APPS[itm.id])this.pImg.src=APPS[itm.id].icon;else{this.pImg.src='';this.badge.style.display='flex';this.badge.innerText=itm.apps.length;}}}}},end:function(e){if(!this.sourceEl)return;if(!this.isDragMove&&this.sourceType==='desktop'){this.reset();return;}if(!this.dragging){this.reset();return;}if(this.sourceType==='desktop'||this.sourceType==='drawer'||this.sourceType==='dock'){var nx=Math.round((e.clientX-40)/90)*90,ny=Math.round((e.clientY-40)/100)*100;if(e.clientY>window.innerHeight-80){if(this.sourceType==='desktop')desktopLayout.splice(this.idx,1);}else{var tIdx=-1;document.querySelectorAll('.desktop-app').forEach(function(a){if(a!==DragSystem.sourceEl){var r=a.getBoundingClientRect();if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom)tIdx=a.dataset.idx;}});if(tIdx>-1){var targ=desktopLayout[tIdx],drp=(DragSystem.sourceType==='drawer'||DragSystem.sourceType==='dock')?[DragSystem.appId]:(desktopLayout[DragSystem.idx].type==='app'?[desktopLayout[DragSystem.idx].id]:desktopLayout[DragSystem.idx].apps);if(targ.type==='app'){targ.type='folder';targ.apps=[targ.id].concat(drp);delete targ.id;}else{targ.apps.push.apply(targ.apps,drp);}if(DragSystem.sourceType==='desktop')desktopLayout.splice(DragSystem.idx,1);}else{if(DragSystem.sourceType==='drawer'||DragSystem.sourceType==='dock')desktopLayout.push({type:'app',id:DragSystem.appId,x:nx,y:ny});else{desktopLayout[DragSystem.idx].x=nx;desktopLayout[DragSystem.idx].y=ny;}}}saveDesktop();}this.reset();},reset:function(){this.dragging=false;if(this.sourceEl)this.sourceEl.style.opacity='1';this.sourceEl=null;this.proxy.style.display='none';this.badge.style.display='none';}};
DragSystem.init();

// Dock hover handled by CSS only — no JS needed

// ── SNOW ──────────────────────────────────────────────────────────────────────
var cvsSnow=document.getElementById('snow-fx');
if(cvsSnow){var ctxSnow=cvsSnow.getContext('2d');cvsSnow.width=window.innerWidth;cvsSnow.height=window.innerHeight;var flakes=[];for(var f=0;f<30;f++)flakes.push({x:Math.random()*cvsSnow.width,y:Math.random()*cvsSnow.height,r:Math.random()*2,s:Math.random()+0.5});(function ds(){setTimeout(function(){requestAnimationFrame(ds);},sysConfig.optBg?500:16);if(sysConfig.optBg||cvsSnow.style.display==='none')return;if(isDesktopActive){ctxSnow.clearRect(0,0,cvsSnow.width,cvsSnow.height);ctxSnow.fillStyle="rgba(255,255,255,0.25)";ctxSnow.beginPath();for(var i=0;i<flakes.length;i++){var fl=flakes[i];ctxSnow.moveTo(fl.x+fl.r,fl.y);ctxSnow.arc(fl.x,fl.y,fl.r,0,Math.PI*2);fl.y+=fl.s;if(fl.y>cvsSnow.height)fl.y=0;}ctxSnow.fill();}})();}

// ── CIRI ──────────────────────────────────────────────────────────────────────
var isCiriActive=false,holdTimer=null,hasBootCiri=false;
window.closeCiri=function(){document.body.classList.remove('ciri-active');isCiriActive=false;};
function checkApiKey(){var st=document.getElementById('status-text'),si=document.getElementById('status-icon');if(!st)return;if(localStorage.getItem('ciri_key')){st.textContent="Secure";st.className="secure";si.innerHTML='<svg class="secure-svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>';}else{st.textContent="Unstable";st.className="unstable";si.innerHTML='<svg class="unstable-svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';}}
checkApiKey();
window.autoGrow=function(el){el.style.height="5px";el.style.height=(el.scrollHeight)+"px";};
window.addEventListener('keydown',function(e){if(e.altKey&&(e.code==='KeyS'||e.key.toLowerCase()==='s')){if(!holdTimer&&!isCiriActive){holdTimer=setTimeout(function(){document.body.classList.add('ciri-active');isCiriActive=true;var cInp=document.getElementById('chat-input');if(!hasBootCiri){var bs=document.getElementById('ciri-boot-screen');if(bs)bs.style.display='flex';setTimeout(function(){document.getElementById('boot-ciri-text').classList.add('typing');},300);setTimeout(function(){document.getElementById('boot-sub-text').classList.add('show');},1100);setTimeout(function(){document.getElementById('boot-loader').style.opacity='1';setTimeout(function(){document.getElementById('boot-status-text').textContent="Ready.";document.getElementById('boot-spinner').style.display='none';setTimeout(function(){bs.style.filter='blur(10px)';bs.style.opacity='0';setTimeout(function(){bs.style.display='none';hasBootCiri=true;if(cInp)cInp.focus();},800);},1800);},1000);},2200);}else{setTimeout(function(){if(cInp)cInp.focus();},100);}},2000);}}else if(e.code==='Escape'&&isCiriActive){closeCiri();}});
window.addEventListener('keyup',function(e){if(e.code==='KeyS'||e.key.toLowerCase()==='s'||e.key==='Alt'){clearTimeout(holdTimer);holdTimer=null;}});

// ── MEDIA PLAYER ──────────────────────────────────────────────────────────────
var aMedia=null,nHide,cNoti=document.getElementById('cine-noti');
function showNoti(){if(!cNoti)return;cNoti.classList.add('active');cNoti.classList.remove('minimized');var rb=document.getElementById('restore-btn');if(rb)rb.classList.remove('visible');resetNH();}
function hideNoti(){if(!cNoti)return;cNoti.classList.remove('active');cNoti.classList.remove('minimized');var rb=document.getElementById('restore-btn');if(rb)rb.classList.remove('visible');clearTimeout(nHide);}
function resetNH(){clearTimeout(nHide);if(cNoti&&cNoti.classList.contains('active')&&!cNoti.classList.contains('minimized')){nHide=setTimeout(function(){cNoti.classList.add('minimized');setTimeout(function(){var rb=document.getElementById('restore-btn');if(rb)rb.classList.add('visible');},300);},5000);}}
if(cNoti){cNoti.addEventListener('mouseenter',function(){clearTimeout(nHide);});cNoti.addEventListener('mouseleave',resetNH);var mn=document.getElementById('minimize-noti-btn');if(mn)mn.onclick=function(){cNoti.classList.add('minimized');setTimeout(function(){var rb=document.getElementById('restore-btn');if(rb)rb.classList.add('visible');},300);};var rbtn=document.getElementById('restore-btn');if(rbtn)rbtn.onclick=function(){this.classList.remove('visible');cNoti.classList.remove('minimized');resetNH();};var clbtn=document.getElementById('close-noti-btn');if(clbtn)clbtn.onclick=function(){if(aMedia)aMedia.pause();hideNoti();};}
setInterval(function(){var fnd=null;document.querySelectorAll('audio,video').forEach(function(m){if(!m.paused&&!m.muted&&m.volume>0&&!['bg-video','lock-video','boot-video'].includes(m.id))fnd=m;});document.querySelectorAll('iframe').forEach(function(ifr){try{var idc=ifr.contentDocument||ifr.contentWindow.document;if(idc)idc.querySelectorAll('audio,video').forEach(function(m){if(!m.paused&&!m.muted&&m.volume>0)fnd=m;});}catch(e){}});isMediaPlaying=!!fnd;if(fnd!==aMedia){if(fnd){aMedia=fnd;setupM();showNoti();}else{aMedia=null;hideNoti();}}if(aMedia){var ct=document.getElementById('current-time');if(ct)ct.textContent=fmtT(aMedia.currentTime);if(isFinite(aMedia.duration)&&aMedia.duration>0){var pf=document.getElementById('progress-fill');if(pf)pf.style.width=((aMedia.currentTime/aMedia.duration)*100)+'%';var tt=document.getElementById('total-time');if(tt)tt.textContent=fmtT(aMedia.duration);}}},1000);
function setupM(){if(!aMedia)return;var nt=document.getElementById('noti-title');if(nt)nt.innerText=aMedia.title||"Web Media Playing";var pp=document.getElementById('play-pause');if(pp)pp.onclick=function(){aMedia.paused?aMedia.play():aMedia.pause();resetNH();};aMedia.addEventListener('play',function(){document.getElementById('icon-play').classList.add('hidden-svg');document.getElementById('icon-pause').classList.add('visible-svg');showNoti();});aMedia.addEventListener('pause',function(){var ipl=document.getElementById('icon-play'),ipa=document.getElementById('icon-pause');if(ipl){ipl.classList.remove('hidden-svg');ipl.classList.add('visible-svg');}if(ipa){ipa.classList.remove('visible-svg');ipa.classList.add('hidden-svg');}});var sb=document.getElementById('skip-back');if(sb)sb.onclick=function(){if(isFinite(aMedia.currentTime))aMedia.currentTime=Math.max(0,aMedia.currentTime-15);resetNH();};var sf=document.getElementById('skip-forward');if(sf)sf.onclick=function(){if(isFinite(aMedia.duration)&&aMedia.duration>0)aMedia.currentTime=Math.min(aMedia.duration,aMedia.currentTime+15);resetNH();};var pha=document.getElementById('progress-hit-area');if(pha)pha.onclick=function(e){if(isFinite(aMedia.duration)&&aMedia.duration>0){var r=this.getBoundingClientRect();aMedia.currentTime=((e.clientX-r.left)/r.width)*aMedia.duration;}resetNH();};}
function fmtT(s){if(isNaN(s)||!isFinite(s))return"0:00";return Math.floor(s/60)+":"+(Math.floor(s%60)).toString().padStart(2,'0');}
(function(){var cv=document.getElementById('visualizer');if(!cv)return;var cx=cv.getContext('2d');cv.height=14;var _vW=0;(function drawFV(){requestAnimationFrame(drawFV);if(!cv.parentElement)return;var nw=cv.parentElement.clientWidth;if(nw!==_vW){cv.width=nw;_vW=nw;}cx.clearRect(0,0,_vW,14);if(!(aMedia&&!aMedia.paused))return;var bL=32,bW=(_vW/bL)*2,xP=0;cx.fillStyle="#fff";cx.beginPath();for(var i=0;i<bL;i++){var bH=Math.random()*14;try{cx.roundRect(xP,14-bH,bW-1.5,bH,2);}catch(e){cx.rect(xP,14-bH,bW-1.5,bH);}xP+=bW;}cx.fill();})();})();

// ── FPS ───────────────────────────────────────────────────────────────────────
var fLT=performance.now(),fFr=0,fLC=0;
(function chkFps(){requestAnimationFrame(chkFps);var nw=performance.now();fFr++;if(nw-fLT>=1000){var cFps=fFr,fv=document.getElementById('fps-val');if(fv)fv.innerText=cFps;if(cFps<=20){fLC++;if(fLC>=5&&!sysConfig.optBg){sysConfig.optBg=true;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));showNotification("Performance","Background video paused to improve performance.");}}else{fLC=0;}fFr=0;fLT=nw;}})();

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-DEVTOOLS PROTECTION
// ═══════════════════════════════════════════════════════════════════════════
(function antiDevTools(){
    var isOpen=false;
    var lastAlert=0;
    var ALERT_COOLDOWN=3000;

    function detectDevTools(){
        // Check if DevTools is open by measuring threshold difference
        var widthThreshold=window.outerWidth-window.innerWidth>160;
        var heightThreshold=window.outerHeight-window.innerHeight>160;
        return widthThreshold||heightThreshold;
    }

    function blurContent(){
        document.body.style.filter='blur(20px)';
        document.body.style.webkitFilter='blur(20px)';
        document.body.style.transition='filter 0.1s';
    }

    function clearContent(){
        // Replace all text with gibberish
        var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
        var node;
        while(node=walker.nextNode()){
            if(node.textContent.trim().length>0&&node.parentElement.tagName!=='SCRIPT'&&node.parentElement.tagName!=='STYLE'){
                node.textContent=node.textContent.replace(/[a-zA-Z0-9]/g,function(){return String.fromCharCode(33+Math.random()*93);});
            }
        }
        // Also obfuscate images
        document.querySelectorAll('img,canvas,video').forEach(function(el){
            el.style.display='none';
        });
    }

    function showWarning(){
        var now=Date.now();
        if(now-lastAlert<ALERT_COOLDOWN)return;
        lastAlert=now;
        var overlay=document.createElement('div');
        overlay.id='devtools-warning';
        overlay.style.cssText='position:fixed;inset:0;z-index:999999;background:#000;color:#ff0000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;font-size:14px;text-align:center;padding:20px;';
        overlay.innerHTML='<div style="font-size:48px;margin-bottom:20px">⚠️</div><div style="font-size:18px;font-weight:bold;margin-bottom:10px">DEVELOPER TOOLS DETECTED</div><div style="color:#888;margin-bottom:20px;max-width:400px">Access to developer tools is not permitted. Please close the developer tools to continue.</div><div style="color:#555;font-size:12px">This page will reload in <span id="devtools-countdown">5</span> seconds...</div>';
        document.body.appendChild(overlay);

        var countdown=5;
        var interval=setInterval(function(){
            countdown--;
            var el=document.getElementById('devtools-countdown');
            if(el)el.textContent=countdown;
            if(countdown<=0){
                clearInterval(interval);
                location.reload();
            }
        },1000);

        // Remove warning if DevTools closed
        var checkClosed=setInterval(function(){
            if(!detectDevTools()){
                clearInterval(checkClosed);
                clearInterval(interval);
                if(overlay.parentNode)overlay.parentNode.removeChild(overlay);
                document.body.style.filter='';
                document.body.style.webkitFilter='';
                location.reload();
            }
        },500);
    }

    // Detect DevTools opening
    var checkInterval=setInterval(function(){
        if(detectDevTools()&&!isOpen){
            isOpen=true;
            blurContent();
            setTimeout(function(){clearContent();showWarning();},100);
        }else if(!detectDevTools()&&isOpen){
            isOpen=false;
            document.body.style.filter='';
            document.body.style.webkitFilter='';
            location.reload();
        }
    },500);

    // Prevent right-click
    document.addEventListener('contextmenu',function(e){
        e.preventDefault();
        return false;
    },true);

    // Prevent common DevTools keyboard shortcuts
    document.addEventListener('keydown',function(e){
        // F12
        if(e.key==='F12'){e.preventDefault();return false;}
        // Ctrl+Shift+I
        if(e.ctrlKey&&e.shiftKey&&e.key==='I'){e.preventDefault();return false;}
        // Ctrl+Shift+J
        if(e.ctrlKey&&e.shiftKey&&e.key==='J'){e.preventDefault();return false;}
        // Ctrl+Shift+C
        if(e.ctrlKey&&e.shiftKey&&e.key==='C'){e.preventDefault();return false;}
        // Ctrl+U (view source)
        if(e.ctrlKey&&e.key==='u'){e.preventDefault();return false;}
        // Ctrl+S (save page)
        if(e.ctrlKey&&e.key==='s'){e.preventDefault();return false;}
    },true);

    // Prevent drag and drop (can be used to extract content)
    document.addEventListener('dragstart',function(e){e.preventDefault();},true);
    document.addEventListener('drop',function(e){e.preventDefault();},true);

    // Disable selection
    document.addEventListener('selectstart',function(e){
        if(e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){
            e.preventDefault();
        }
    },true);

    // Obfuscate on copy attempt
    document.addEventListener('copy',function(e){
        e.preventDefault();
        if(e.clipboardData){
            e.clipboardData.setData('text/plain','Access denied.');
        }
    },true);

    // Console obfuscation
    var originalConsole=console.log;
    console.log=function(){
        // Silently do nothing or log fake data
    };
    console.error=console.log;
    console.warn=console.log;
    console.info=console.log;
    console.debug=console.log;
})();

window.onbeforeunload=function(e){if(sysConfig.redirectConfirm){var msg="Are you sure you want to leave this page?";e.returnValue=msg;return msg;}};

// ── CLOCK ─────────────────────────────────────────────────────────────────────
(function tickClock(){
    var days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
    var months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    function update(){
        var n=new Date();
        var raw=n.getHours();
        var ampm=raw>=12?'PM':'AM';
        var h=raw%12||12;
        var m=n.getMinutes().toString().padStart(2,'0');
        var ct=document.getElementById('clock-time');
        var cd=document.getElementById('clock-date');
        if(ct)ct.textContent=h+':'+m+' '+ampm;
        if(cd)cd.textContent=days[n.getDay()]+', '+months[n.getMonth()]+' '+n.getDate();
    }
    update();
    setInterval(update,1000);
})();

// ── BLACK HOLE ────────────────────────────────────────────────────────────────
(function(){
    var canvas=document.getElementById('blackhole-canvas');
    if(!canvas)return;
    var ctx=canvas.getContext('2d');
    var w,h,cx,cy,R,angle=0,stars=[];

    function resize(){
        w=canvas.width=window.innerWidth;
        h=canvas.height=window.innerHeight;
        cx=w/2; cy=h/2;
        R=Math.min(w,h)*0.145;
        stars=[];
        for(var i=0;i<340;i++)stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.2,a:Math.random()*0.8+0.1,d:Math.random()*0.006-0.003});
    }

    function draw(){
        if(document.hidden||canvas.style.display==='none')return;
        if(sysConfig.optBg){
            setTimeout(function(){if(!document.hidden)requestAnimationFrame(draw);},500);
        } else {
            requestAnimationFrame(draw);
        }

        // Space background
        var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*0.75);
        bg.addColorStop(0,'#000c20');
        bg.addColorStop(0.4,'#000510');
        bg.addColorStop(1,'#000003');
        ctx.fillStyle=bg;
        ctx.fillRect(0,0,w,h);

        // Stars
        ctx.save();
        for(var i=0;i<stars.length;i++){
            var s=stars[i];
            s.a+=s.d; if(s.a>0.9||s.a<0.05)s.d*=-1;
            var dx=s.x-cx,dy=s.y-cy,dist=Math.sqrt(dx*dx+dy*dy);
            var fade=Math.min(1,Math.max(0,(dist-R*2)/(R*5)));
            ctx.globalAlpha=s.a*fade;
            ctx.fillStyle='#b8d4ff';
            ctx.beginPath();
            ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.restore();

        // Outer nebula haze
        var haze=ctx.createRadialGradient(cx,cy,R*2,cx,cy,R*14);
        haze.addColorStop(0,'rgba(0,40,160,0.08)');
        haze.addColorStop(0.4,'rgba(0,20,80,0.04)');
        haze.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=haze;
        ctx.fillRect(0,0,w,h);

        // Accretion disk rings
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(angle*0.18);
        var diskColors=[
            ['rgba(200,225,255,0.55)','rgba(80,150,255,0.25)'],
            ['rgba(60,130,255,0.45)','rgba(20,70,200,0.18)'],
            ['rgba(30,90,220,0.30)','rgba(10,40,160,0.10)'],
            ['rgba(15,60,180,0.18)','rgba(5,25,120,0.05)'],
            ['rgba(8,40,140,0.10)','rgba(0,15,80,0.03)']
        ];
        for(var d=0;d<diskColors.length;d++){
            var rIn=R*(1.25+d*0.6),rOut=R*(1.85+d*0.7);
            ctx.save();
            ctx.scale(1,0.24);
            var dg=ctx.createRadialGradient(0,0,rIn,0,0,rOut);
            dg.addColorStop(0,'rgba(0,0,0,0)');
            dg.addColorStop(0.25,diskColors[d][0]);
            dg.addColorStop(0.65,diskColors[d][1]);
            dg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(0,0,rOut,0,Math.PI*2);
            ctx.fillStyle=dg;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();

        // Gravitational shadow
        var shadow=ctx.createRadialGradient(cx,cy,R*0.4,cx,cy,R*4.5);
        shadow.addColorStop(0,'rgba(0,0,0,1)');
        shadow.addColorStop(0.35,'rgba(0,4,18,0.96)');
        shadow.addColorStop(0.65,'rgba(0,5,20,0.55)');
        shadow.addColorStop(0.85,'rgba(0,4,15,0.20)');
        shadow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=shadow;
        ctx.beginPath();
        ctx.arc(cx,cy,R*4.5,0,Math.PI*2);
        ctx.fill();

        // Event horizon
        ctx.fillStyle='#000';
        ctx.beginPath();
        ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.fill();

        // Photon ring glow
        var pg=ctx.createRadialGradient(cx,cy,R*0.9,cx,cy,R*1.35);
        pg.addColorStop(0,'rgba(0,0,0,0)');
        pg.addColorStop(0.5,'rgba(140,200,255,0.75)');
        pg.addColorStop(0.7,'rgba(80,160,255,0.40)');
        pg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=pg;
        ctx.beginPath();
        ctx.arc(cx,cy,R*1.35,0,Math.PI*2);
        ctx.fill();

        // Crisp photon ring line
        ctx.beginPath();
        ctx.arc(cx,cy,R*1.06,0,Math.PI*2);
        ctx.strokeStyle='rgba(200,230,255,0.9)';
        ctx.lineWidth=1.5;
        ctx.stroke();

        // Outer lensing rings
        for(var lr=0;lr<4;lr++){
            ctx.beginPath();
            ctx.arc(cx,cy,R*(1.35+lr*0.38),0,Math.PI*2);
            ctx.strokeStyle='rgba(40,110,255,'+(0.18-lr*0.04)+')';
            ctx.lineWidth=1;
            ctx.stroke();
        }

        // Re-stamp event horizon (ensure solid black center)
        ctx.fillStyle='#000';
        ctx.beginPath();
        ctx.arc(cx,cy,R*0.99,0,Math.PI*2);
        ctx.fill();

        angle+=0.6;
    }

    window.addEventListener('resize',resize);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(draw);});
    resize();
    draw();
})();

/* =============================================================
   Enhancement layer: window manager, dock magnification, quick
   settings, Spotify PKCE client, music app.
   ============================================================= */
(function () {
  'use strict';

  window.startImmersiveMode = function (win) {
    if (win) win.classList.remove('header-visible');
  };
  window.endImmersiveMode = function () {};

  const WM = {
    topZ: 1000,
    focused: null,
    spawnN: 0,

    init() {
      const layer = document.getElementById('windows-layer');
      if (!layer) return;
      new MutationObserver((muts) => {
        muts.forEach((m) => m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.classList.contains('window')) this.upgrade(n);
        }));
      }).observe(layer, { childList: true });

      layer.querySelectorAll('.window').forEach((w) => this.upgrade(w));

      const preview = document.createElement('div');
      preview.id = 'wm-snap-preview';
      document.body.appendChild(preview);
      this.preview = preview;

      window.addEventListener('resize', () => {
        document.querySelectorAll('.window').forEach((w) => this.clampToViewport(w));
      });

      document.addEventListener('mousedown', (ev) => {
        if (ev.button !== 0) return;
        const header = ev.target.closest ? ev.target.closest('.win-header') : null;
        if (!header) return;
        if (ev.target.closest('.win-btn')) return;
        const win = header.closest('.window');
        if (!win) return;
        if (!win.dataset.wmUpgraded) this.upgrade(win);
        this.focus(win);
        this.startDrag(ev, win);
      }, true);
    },

    upgrade(win) {
      if (win.dataset.wmUpgraded) return;
      win.dataset.wmUpgraded = '1';

      this.placeWindow(win);

      ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach((dir) => {
        const h = document.createElement('div');
        h.className = 'win-resize ' + dir;
        h.addEventListener('mousedown', (ev) => this.startResize(ev, win, dir));
        win.appendChild(h);
      });

      const controls = win.querySelector('.win-controls');
      if (controls && !controls.querySelector('.btn-max')) {
        const max = document.createElement('div');
        max.className = 'win-btn btn-max';
        max.title = 'Maximize';
        max.addEventListener('click', (ev) => {
          ev.stopPropagation();
          win.classList.toggle('maximized');
        });
        controls.appendChild(max);
      }

      const header = win.querySelector('.win-header');
      if (header) {
        header.onmousedown = (ev) => {
          if (ev.target.closest('.win-btn')) return;
          this.startDrag(ev, win);
        };
        header.ondblclick = () => win.classList.toggle('maximized');
      }

      win.addEventListener('mousedown', () => this.focus(win), true);
      this.focus(win);
    },

    placeWindow(win) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ww = Math.min(960, Math.round(vw * 0.7));
      const wh = Math.min(620, Math.round(vh * 0.7));
      const cascade = (this.spawnN++ % 6) * 28;
      const wx = Math.round((vw - ww) / 2) + cascade;
      const wy = Math.round((vh - wh) / 2) + cascade;
      win.style.setProperty('--ww', ww + 'px');
      win.style.setProperty('--wh', wh + 'px');
      win.style.setProperty('--wx', wx + 'px');
      win.style.setProperty('--wy', wy + 'px');
    },

    focus(win) {
      if (this.focused && this.focused !== win) this.focused.classList.remove('focused');
      this.focused = win;
      win.classList.add('focused');
      win.style.zIndex = ++this.topZ;
      window.activeWindowId = (win.id || '').replace('win-', '');
    },

    clampToViewport(win) {
      const r = win.getBoundingClientRect();
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      if (r.left > maxX) win.style.setProperty('--wx', maxX + 'px');
      if (r.top > maxY) win.style.setProperty('--wy', maxY + 'px');
    },

    startDrag(ev, win) {
      if (win.classList.contains('maximized')) {
        win.classList.remove('maximized');
        const ww = parseFloat(getComputedStyle(win).getPropertyValue('--ww')) || 800;
        win.style.setProperty('--wx', (ev.clientX - ww / 2) + 'px');
        win.style.setProperty('--wy', Math.max(0, ev.clientY - 20) + 'px');
      }
      const r = win.getBoundingClientRect();
      const ox = ev.clientX - r.left;
      const oy = ev.clientY - r.top;

      const onMove = (e) => {
        const nx = e.clientX - ox;
        const ny = Math.max(0, e.clientY - oy);
        win.style.setProperty('--wx', nx + 'px');
        win.style.setProperty('--wy', ny + 'px');
        this.updateSnapPreview(e);
      };
      const onUp = (e) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.applySnap(win, e);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      ev.preventDefault();
    },

    startResize(ev, win, dir) {
      win.classList.remove('maximized');
      const r = win.getBoundingClientRect();
      const sx = ev.clientX, sy = ev.clientY;
      const sw = r.width, sh = r.height, sl = r.left, st = r.top;

      const onMove = (e) => {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        let nw = sw, nh = sh, nl = sl, nt = st;
        if (dir.includes('e')) nw = Math.max(380, sw + dx);
        if (dir.includes('s')) nh = Math.max(260, sh + dy);
        if (dir.includes('w')) { nw = Math.max(380, sw - dx); nl = sl + (sw - nw); }
        if (dir.includes('n')) { nh = Math.max(260, sh - dy); nt = st + (sh - nh); }
        win.style.setProperty('--ww', nw + 'px');
        win.style.setProperty('--wh', nh + 'px');
        win.style.setProperty('--wx', nl + 'px');
        win.style.setProperty('--wy', nt + 'px');
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      ev.preventDefault();
      ev.stopPropagation();
    },

    snapZone(e) {
      const T = 18;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (e.clientY < T) return 'top';
      if (e.clientX < T) return 'left';
      if (e.clientX > vw - T) return 'right';
      if (e.clientY > vh - T) return 'bottom';
      return null;
    },

    snapRect(zone) {
      const vw = window.innerWidth;
      const vh = window.innerHeight - 90;
      if (zone === 'top')    return { x: 0, y: 0, w: vw, h: vh };
      if (zone === 'left')   return { x: 0, y: 0, w: vw / 2, h: vh };
      if (zone === 'right')  return { x: vw / 2, y: 0, w: vw / 2, h: vh };
      if (zone === 'bottom') return { x: vw / 4, y: vh / 2, w: vw / 2, h: vh / 2 };
      return null;
    },

    updateSnapPreview(e) {
      const zone = this.snapZone(e);
      if (!zone) { this.preview.classList.remove('show'); return; }
      const r = this.snapRect(zone);
      this.preview.style.left = r.x + 'px';
      this.preview.style.top = r.y + 'px';
      this.preview.style.width = r.w + 'px';
      this.preview.style.height = r.h + 'px';
      this.preview.classList.add('show');
    },

    applySnap(win, e) {
      this.preview.classList.remove('show');
      const zone = this.snapZone(e);
      if (!zone) return;
      const r = this.snapRect(zone);
      win.style.setProperty('--wx', r.x + 'px');
      win.style.setProperty('--wy', r.y + 'px');
      win.style.setProperty('--ww', r.w + 'px');
      win.style.setProperty('--wh', r.h + 'px');
    },
  };

  const Dock = {
    init() {
      const dock = document.getElementById('dock-container');
      if (!dock) return;
      dock.addEventListener('mousemove', (e) => this.onMove(e, dock));
      dock.addEventListener('mouseleave', () => this.reset(dock));
      setInterval(() => this.syncIndicators(dock), 500);
    },

    onMove(e, dock) {
      const items = dock.querySelectorAll('.dock-item');
      items.forEach((it) => {
        it.classList.remove('mag-lv1', 'mag-lv2', 'mag-lv3');
        const r = it.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = Math.abs(e.clientX - cx);
        if (d < 30) it.classList.add('mag-lv3');
        else if (d < 60) it.classList.add('mag-lv2');
        else if (d < 100) it.classList.add('mag-lv1');
      });
    },

    reset(dock) {
      dock.querySelectorAll('.dock-item').forEach((it) =>
        it.classList.remove('mag-lv1', 'mag-lv2', 'mag-lv3')
      );
    },

    syncIndicators(dock) {
      const openIds = new Set();
      document.querySelectorAll('.window').forEach((w) => {
        if (!w.classList.contains('minimized')) openIds.add((w.id || '').replace('win-', ''));
      });
      const activeId = window.activeWindowId;
      dock.querySelectorAll('.dock-item').forEach((it) => {
        const id = it.dataset.appId || it.getAttribute('data-id') || '';
        it.classList.toggle('running', openIds.has(id));
        it.classList.toggle('active-window', id === activeId);
      });
    },
  };

  const ACCENTS = [
    { id: 'blue',    c: '#3b82f6', g: 'rgba(59, 130, 246, 0.55)' },
    { id: 'cyan',    c: '#06b6d4', g: 'rgba(6, 182, 212, 0.55)' },
    { id: 'green',   c: '#10b981', g: 'rgba(16, 185, 129, 0.55)' },
    { id: 'purple',  c: '#a855f7', g: 'rgba(168, 85, 247, 0.55)' },
    { id: 'pink',    c: '#ec4899', g: 'rgba(236, 72, 153, 0.55)' },
    { id: 'orange',  c: '#f97316', g: 'rgba(249, 115, 22, 0.55)' },
  ];

  const QS = {
    state: JSON.parse(localStorage.getItem('qs_state') || '{}'),

    init() {
      const btn = document.createElement('button');
      btn.id = 'quick-settings-btn';
      btn.innerHTML = '<i class="fas fa-sliders-h"></i>';
      btn.title = 'Quick settings';
      document.body.appendChild(btn);

      const panel = document.createElement('div');
      panel.id = 'quick-settings-panel';
      panel.innerHTML = `
        <div class="qs-section">
          <div class="qs-label">Accent</div>
          <div class="qs-accent-row">
            ${ACCENTS.map(a => `<div class="qs-accent" data-id="${a.id}" style="background:${a.c}"></div>`).join('')}
          </div>
        </div>
        <div class="qs-section">
          <div class="qs-label">Brightness</div>
          <input type="range" class="qs-slider" id="qs-brightness" min="50" max="110" step="1">
        </div>
        <div class="qs-section">
          <div class="qs-label">Performance</div>
          <div class="qs-perf">
            <button data-perf="balanced">Balanced</button>
            <button data-perf="low">Low power</button>
            <button data-perf="max">Max fps</button>
          </div>
        </div>`;
      document.body.appendChild(panel);

      btn.onclick = (e) => { e.stopPropagation(); panel.classList.toggle('open'); };
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
      });

      panel.querySelectorAll('.qs-accent').forEach((el) => {
        el.onclick = () => this.setAccent(el.dataset.id);
      });
      const b = panel.querySelector('#qs-brightness');
      b.value = Math.round(((this.state.brightness || 1) * 100));
      b.oninput = () => this.setBrightness(b.value / 100);
      panel.querySelectorAll('.qs-perf button').forEach((el) => {
        el.onclick = () => this.setPerf(el.dataset.perf);
      });

      this.setAccent(this.state.accent || 'blue', true);
      this.setBrightness(this.state.brightness || 1, true);
      this.setPerf(this.state.perf || 'balanced', true);
    },

    save() { localStorage.setItem('qs_state', JSON.stringify(this.state)); },

    setAccent(id, silent) {
      const a = ACCENTS.find((x) => x.id === id) || ACCENTS[0];
      document.documentElement.style.setProperty('--accent', a.c);
      document.documentElement.style.setProperty('--accent-glow', a.g);
      document.querySelectorAll('.qs-accent').forEach((el) => {
        el.classList.toggle('selected', el.dataset.id === a.id);
      });
      this.state.accent = a.id;
      if (!silent) this.save();
    },

    setBrightness(v, silent) {
      document.documentElement.style.setProperty('--sys-brightness', v);
      this.state.brightness = v;
      if (!silent) this.save();
    },

    setPerf(mode, silent) {
      document.querySelectorAll('.qs-perf button').forEach((el) => {
        el.classList.toggle('active', el.dataset.perf === mode);
      });
      const bh = document.getElementById('blackhole-canvas');
      const snow = document.getElementById('snow-fx');
      const body = document.body;
      body.classList.remove('perf-low', 'perf-balanced', 'perf-max');
      body.classList.add('perf-' + mode);
      if (mode === 'low') {
        if (bh) bh.style.display = 'none';
        if (snow) snow.style.display = 'none';
        if (window.sysConfig) { window.sysConfig.optBg = true; localStorage.setItem('intel_sys_config', JSON.stringify(window.sysConfig)); }
        if (typeof applySystemSettings === 'function') applySystemSettings();
      } else if (mode === 'max') {
        if (snow) snow.style.display = '';
        if (window.sysConfig) { window.sysConfig.optBg = false; localStorage.setItem('intel_sys_config', JSON.stringify(window.sysConfig)); }
        if (typeof applySystemSettings === 'function') applySystemSettings();
      } else {
        if (snow) snow.style.display = '';
      }
      this.state.perf = mode;
      if (!silent) this.save();
    },
  };

  const SPOTIFY_CLIENT_ID = 'ccc86d1c9b6942ed9629a72638b27527';
  const SPOTIFY_REDIRECT_URI = location.origin + '/';
  const SPOTIFY_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-top-read',
  ].join(' ');

  function b64url(bytes) {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return new Uint8Array(buf);
  }
  function randStr(n) {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return b64url(a);
  }

  const Spotify = {
    token: null,
    expiresAt: 0,
    refreshing: null,
    deviceId: null,
    player: null,
    listeners: new Set(),

    async init() {
      try {
        const saved = JSON.parse(localStorage.getItem('sp_tok') || 'null');
        if (saved?.access_token && saved.expiresAt > Date.now() + 30_000) {
          this.token = saved.access_token;
          this.expiresAt = saved.expiresAt;
        }
      } catch {}

      const qp = new URLSearchParams(location.search);
      if (qp.get('code') && qp.get('state')) {
        const savedState = localStorage.getItem('sp_state');
        if (qp.get('state') !== savedState) {
          console.warn('[spotify] state mismatch');
        } else {
          await this.exchangeCode(qp.get('code'));
        }
        history.replaceState(null, '', location.pathname);
      } else if (qp.get('error')) {
        console.warn('[spotify] auth error:', qp.get('error'));
        history.replaceState(null, '', location.pathname);
      }

      if (!this.token) await this.tryRefresh();

      this.ensureSDK();
      this.notify();
    },

    async login() {
      const verifier = randStr(64);
      const challenge = b64url(await sha256(verifier));
      const state = randStr(16);
      localStorage.setItem('sp_verifier', verifier);
      localStorage.setItem('sp_state', state);
      const p = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        state,
      });
      location.href = 'https://accounts.spotify.com/authorize?' + p.toString();
    },

    async exchangeCode(code) {
      const verifier = localStorage.getItem('sp_verifier');
      if (!verifier) return;
      const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier,
      });
      const r = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const d = await r.json();
      localStorage.removeItem('sp_verifier');
      localStorage.removeItem('sp_state');
      if (!r.ok) { console.error('[spotify] token exchange failed', d); return; }
      this.setToken(d.access_token, d.expires_in, d.refresh_token);
    },

    setToken(t, expSec, refresh) {
      this.token = t;
      this.expiresAt = Date.now() + (expSec - 60) * 1000;
      localStorage.setItem('sp_tok', JSON.stringify({ access_token: t, expiresAt: this.expiresAt }));
      if (refresh) localStorage.setItem('sp_refresh', refresh);
      this.notify();
    },

    logout() {
      this.token = null;
      this.expiresAt = 0;
      localStorage.removeItem('sp_tok');
      localStorage.removeItem('sp_refresh');
      if (this.player) { try { this.player.disconnect(); } catch {} }
      this.player = null;
      this.deviceId = null;
      this.notify();
    },

    async tryRefresh() {
      const refresh = localStorage.getItem('sp_refresh');
      if (!refresh) return null;
      if (this.refreshing) return this.refreshing;
      this.refreshing = (async () => {
        try {
          const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh,
            client_id: SPOTIFY_CLIENT_ID,
          });
          const r = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          });
          const d = await r.json();
          if (!r.ok) {
            localStorage.removeItem('sp_refresh');
            localStorage.removeItem('sp_tok');
            return null;
          }
          this.setToken(d.access_token, d.expires_in, d.refresh_token);
          return d.access_token;
        } catch { return null; }
      })();
      const t = await this.refreshing;
      this.refreshing = null;
      return t;
    },

    async getToken() {
      if (this.token && Date.now() < this.expiresAt) return this.token;
      return this.tryRefresh();
    },

    async api(path, opts = {}) {
      const t = await this.getToken();
      if (!t) throw new Error('not_logged_in');
      const r = await fetch('https://api.spotify.com/v1' + path, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + t },
      });
      if (r.status === 401) { await this.tryRefresh(); return this.api(path, opts); }
      if (r.status === 204) return null;
      return r.json();
    },

    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    notify() { this.listeners.forEach((f) => { try { f(); } catch {} }); },

    ensureSDK() {
      if (window.Spotify?.Player) { this.setupPlayer(); return; }
      if (document.getElementById('spotify-sdk-js')) return;
      window.onSpotifyWebPlaybackSDKReady = () => this.setupPlayer();
      const s = document.createElement('script');
      s.id = 'spotify-sdk-js';
      s.src = 'https://sdk.scdn.co/spotify-player.js';
      document.head.appendChild(s);
    },

    async setupPlayer() {
      const t = await this.getToken();
      if (!t || !window.Spotify?.Player) return;
      if (this.player) return;

      this.player = new window.Spotify.Player({
        name: 'Intellectual OS',
        getOAuthToken: async (cb) => cb(await this.getToken()),
        volume: 0.7,
      });

      this.player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        this.notify();
      });
      this.player.addListener('not_ready', () => { this.deviceId = null; });
      this.player.addListener('player_state_changed', () => this.notify());
      this.player.addListener('initialization_error', ({ message }) => console.error('[spotify init]', message));
      this.player.addListener('authentication_error', ({ message }) => console.error('[spotify auth]', message));
      this.player.addListener('account_error', ({ message }) => console.error('[spotify account]', message));

      this.player.connect();
    },

    async playUris(uris, contextUri) {
      const t = await this.getToken();
      if (!t || !this.deviceId) return;
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify(contextUri ? { context_uri: contextUri, offset: { position: 0 } } : { uris }),
      });
    },

    togglePlay()  { this.player?.togglePlay(); },
    next()        { this.player?.nextTrack(); },
    previous()    { this.player?.previousTrack(); },
    seek(ms)      { this.player?.seek(ms); },

    async getState() { return this.player ? this.player.getCurrentState() : null; },
  };

  window.Spotify_Client = Spotify;

  const MUSIC_APP_ID = 'spotify';

  function ensureMusicApp() {
    if (window.APPS && !window.APPS[MUSIC_APP_ID]) {
      window.APPS[MUSIC_APP_ID] = {
        title: 'Spotify',
        icon: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
        internal: true,
        pinned: true,
      };
    }
  }

  function renderMusicApp(win) {
    const body = win.querySelector('.win-body');
    if (!body) return;
    body.innerHTML = `<div id="spotify-app-root"></div>`;
    const root = body.querySelector('#spotify-app-root');

    const paint = async () => {
      const token = await Spotify.getToken();
      if (!token) { root.innerHTML = loginHTML(); wireLogin(root); return; }
      root.innerHTML = shellHTML();
      loadPlaylists(root);
      wireNowPlaying(root);
    };

    const unsub = Spotify.onChange(paint);
    win.addEventListener('remove', () => unsub());
    paint();
  }

  function loginHTML() {
    return `
      <div class="sp-login-screen">
        <h2>Sign in with Spotify</h2>
        <p>Connect your Spotify Premium account to stream your library right inside Intellectual OS.</p>
        <button class="sp-btn" id="sp-login-btn">Continue to Spotify</button>
      </div>`;
  }

  function wireLogin(root) {
    const b = root.querySelector('#sp-login-btn');
    if (b) b.onclick = () => Spotify.login();
  }

  function shellHTML() {
    return `
      <aside class="sp-sidebar">
        <h3>Library</h3>
        <div id="sp-lib"></div>
        <h3>Playlists</h3>
        <div id="sp-playlists"><div class="sp-pl" style="color:#666">Loading…</div></div>
      </aside>
      <main class="sp-main">
        <div class="sp-topbar">
          <div id="sp-title" style="font-size:20px;font-weight:800">Liked Songs</div>
          <button class="sp-btn ghost" id="sp-logout">Log out</button>
        </div>
        <div class="sp-tracklist" id="sp-tracks"><div style="color:#666;padding:20px">Pick a playlist on the left.</div></div>
        <div class="sp-nowbar">
          <div class="sp-now-track">
            <img id="sp-now-art" src="" alt="">
            <div class="sp-now-info">
              <div class="t" id="sp-now-title">Nothing playing</div>
              <div class="a" id="sp-now-artist"></div>
            </div>
          </div>
          <div class="sp-controls">
            <button id="sp-prev"><i class="fas fa-backward-step"></i></button>
            <button class="play" id="sp-play"><i class="fas fa-play"></i></button>
            <button id="sp-next"><i class="fas fa-forward-step"></i></button>
          </div>
          <div style="position:relative">
            <canvas class="sp-viz" id="sp-viz"></canvas>
            <div class="sp-progress">
              <span id="sp-cur">0:00</span>
              <div class="bar" id="sp-bar"><div class="fill" id="sp-fill"></div></div>
              <span id="sp-tot">0:00</span>
            </div>
          </div>
        </div>
      </main>`;
  }

  async function loadPlaylists(root) {
    try {
      const lib = root.querySelector('#sp-lib');
      lib.innerHTML =
        `<div class="sp-pl active" data-kind="liked">❤ Liked Songs</div>` +
        `<div class="sp-pl" data-kind="top">🔥 Top Tracks</div>`;

      const data = await Spotify.api('/me/playlists?limit=50');
      const list = root.querySelector('#sp-playlists');
      list.innerHTML = (data?.items || []).map((p) =>
        `<div class="sp-pl" data-kind="playlist" data-id="${p.id}" data-uri="${p.uri}" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</div>`
      ).join('') || '<div class="sp-pl" style="color:#666">No playlists</div>';

      root.querySelectorAll('.sp-pl').forEach((el) => {
        el.onclick = () => {
          root.querySelectorAll('.sp-pl').forEach((x) => x.classList.remove('active'));
          el.classList.add('active');
          const k = el.dataset.kind;
          if (k === 'liked') loadLiked(root);
          else if (k === 'top') loadTop(root);
          else if (k === 'playlist') loadPlaylist(root, el.dataset.id, el.dataset.uri, el.textContent);
        };
      });

      const logout = root.querySelector('#sp-logout');
      if (logout) logout.onclick = () => Spotify.logout();

      loadLiked(root);
    } catch (e) {
      console.error('[spotify] playlists', e);
    }
  }

  async function loadLiked(root) {
    root.querySelector('#sp-title').textContent = 'Liked Songs';
    const d = await Spotify.api('/me/tracks?limit=50');
    renderTracks(root, (d?.items || []).map((x) => x.track), null);
  }

  async function loadTop(root) {
    root.querySelector('#sp-title').textContent = 'Top Tracks';
    const d = await Spotify.api('/me/top/tracks?limit=50');
    renderTracks(root, d?.items || [], null);
  }

  async function loadPlaylist(root, id, uri, name) {
    root.querySelector('#sp-title').textContent = name;
    const d = await Spotify.api(`/playlists/${id}/tracks?limit=100`);
    renderTracks(root, (d?.items || []).map((x) => x.track).filter(Boolean), uri);
  }

  function renderTracks(root, tracks, contextUri) {
    const list = root.querySelector('#sp-tracks');
    if (!tracks?.length) { list.innerHTML = '<div style="color:#666;padding:20px">No tracks.</div>'; return; }
    list.innerHTML = tracks.map((t, i) => {
      const art = t.album?.images?.at(-1)?.url || '';
      const artists = (t.artists || []).map((a) => a.name).join(', ');
      return `<div class="sp-track" data-idx="${i}">
        <span>${i + 1}</span>
        <img src="${art}" alt="">
        <div><div class="tr-name">${escapeHTML(t.name)}</div><div class="tr-artist">${escapeHTML(artists)}</div></div>
        <div class="tr-artist">${fmtMs(t.duration_ms)}</div>
        <span><i class="fas fa-play"></i></span>
      </div>`;
    }).join('');
    list.querySelectorAll('.sp-track').forEach((el) => {
      el.ondblclick = () => play(tracks, +el.dataset.idx, contextUri);
    });
  }

  async function play(tracks, idx, contextUri) {
    if (!Spotify.deviceId) {
      alert('Spotify player is still connecting. Try again in a second (Premium account required).');
      return;
    }
    try {
      const t = tracks[idx];
      const label = t ? `${t.name} — ${(t.artists || []).map((a) => a.name).join(', ')}` : '';
      if (window.BotBridge) window.BotBridge.event('song-play', label.slice(0, 140));
    } catch (e) {}
    if (contextUri) {
      const t = await Spotify.getToken();
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${Spotify.deviceId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_uri: contextUri, offset: { position: idx } }),
      });
    } else {
      await Spotify.playUris(tracks.slice(idx).map((x) => x.uri));
    }
  }

  function wireNowPlaying(root) {
    const el = (id) => root.querySelector(id);
    el('#sp-play').onclick = () => Spotify.togglePlay();
    el('#sp-next').onclick = () => Spotify.next();
    el('#sp-prev').onclick = () => Spotify.previous();
    el('#sp-bar').onclick = async (e) => {
      const st = await Spotify.getState();
      if (!st) return;
      const r = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - r.left) / r.width;
      Spotify.seek(Math.max(0, Math.min(st.duration, Math.round(pct * st.duration))));
    };

    const canvas = el('#sp-viz');
    const vc = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 40;

    const tick = async () => {
      if (!root.isConnected) return;
      const st = await Spotify.getState();
      if (st && !st.paused) {
        const t = st.track_window?.current_track;
        if (t) {
          el('#sp-now-art').src = t.album?.images?.[0]?.url || '';
          el('#sp-now-title').textContent = t.name || '';
          el('#sp-now-artist').textContent = (t.artists || []).map((a) => a.name).join(', ');
        }
        el('#sp-cur').textContent = fmtMs(st.position);
        el('#sp-tot').textContent = fmtMs(st.duration);
        el('#sp-fill').style.width = ((st.position / st.duration) * 100).toFixed(1) + '%';
        el('#sp-play').innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        el('#sp-play').innerHTML = '<i class="fas fa-play"></i>';
      }
      drawViz(vc, canvas, st && !st.paused);
      requestAnimationFrame(tick);
    };
    tick();
  }

  let vizT = 0;
  function drawViz(cx, canvas, playing) {
    const w = canvas.width = canvas.parentElement.clientWidth || 200;
    const h = canvas.height;
    cx.clearRect(0, 0, w, h);
    if (!playing) return;
    vizT += 0.08;
    cx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
    const bars = 40;
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const n = Math.sin(vizT + i * 0.4) * 0.5 + Math.sin(vizT * 2.3 + i * 0.7) * 0.5 + 1;
      const bh = Math.max(2, n * (h * 0.4));
      cx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
    }
  }

  function fmtMs(ms) {
    if (!ms || !isFinite(ms)) return '0:00';
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const origOpenWindow = window.openWindow;
  if (typeof origOpenWindow === 'function') {
    window.openWindow = function (id) {
      const result = origOpenWindow.apply(this, arguments);
      const win = document.getElementById('win-' + id);
      if (win) {
        WM.upgrade(win);
        WM.focus(win);
      }
      if (id === MUSIC_APP_ID || id === 'music' || id === 'term') {
        if (win) setTimeout(() => renderMusicApp(win), 30);
      }
      return result;
    };
  }

  function boot() {
    ensureMusicApp();
    WM.init();
    Dock.init();
    QS.init();
    Spotify.init();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
var _devBuildVer = "1.0.0";

// Register Ultraviolet service worker so iframe `/service/<base64>` URLs proxy.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/uv/sw.js', { scope: '/service/' })
    .catch(function (e) { console.warn('[uv] sw register failed:', e); });
}

// ═══════════════════════════════════════════════════════════════════════
//  BOT BRIDGE — posts login / game-open / song-play / heartbeat events
//  to the Discord bot HTTP server (index.js /event, /heartbeat, /login-check).
//  Configure the endpoint:  localStorage.setItem('botUrl','https://your-bot')
// ═══════════════════════════════════════════════════════════════════════
(function BotBridgeInit() {
  var BOT_URL = localStorage.getItem('botUrl') || 'http://localhost:3000';
  var currentEmail = null;
  var lastSentLogin = null;
  var heartbeatTimer = null;

  function post(path, body) {
    return fetch(BOT_URL + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {}),
      mode: 'cors',
      keepalive: true,
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  function event(type, detail) {
    if (!currentEmail) return;
    post('/event', { email: currentEmail, type: type, detail: detail || '' });
  }

  function heartbeat() {
    if (!currentEmail) return;
    post('/heartbeat', { email: currentEmail });
  }

  function setUser(email) {
    email = (email || '').trim().toLowerCase();
    if (!email || email === currentEmail) return;
    currentEmail = email;
    if (lastSentLogin !== email) {
      event('login', navigator.userAgent.slice(0, 80));
      lastSentLogin = email;
    }
    if (!heartbeatTimer) {
      heartbeat();
      heartbeatTimer = setInterval(heartbeat, 45_000);
    }
  }

  function clearUser() {
    if (currentEmail) { event('logout', ''); }
    currentEmail = null; lastSentLogin = null;
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  // Scrape email from auth UI rendered by index.html (updateProfileUI writes it)
  function pollEmail() {
    var el = document.getElementById('auth-useremail') || document.querySelector('.user-email');
    var txt = el && el.textContent && el.textContent.indexOf('@') !== -1 ? el.textContent.trim() : null;
    if (txt) setUser(txt); else if (currentEmail && !txt) clearUser();
  }
  // MutationObserver replaces setInterval — zero idle CPU cost
  (function(){
    var _obs=new MutationObserver(pollEmail);
    function _watch(){
      pollEmail();
      var t=document.getElementById('auth-section')||document.getElementById('profile-section')||document.body;
      _obs.observe(t,{childList:true,subtree:true,characterData:true});
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_watch);
    else _watch();
  })();

  // Relay events from iframe srcdocs (games, music) via postMessage
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || typeof d !== 'object' || d.__bot !== true) return;
    if (d.type === 'game-open') event('game-open', d.detail || '');
    else if (d.type === 'song-play') event('song-play', d.detail || '');
    else if (d.type === 'app-open') event('app-open', d.detail || '');
  });

  // Fire app-open when a window is opened from the parent OS
  var _origOpen = window.openWindow;
  if (typeof _origOpen === 'function') {
    window.openWindow = function (id) {
      event('app-open', id || '');
      return _origOpen.apply(this, arguments);
    };
  }

  window.BotBridge = { event: event, heartbeat: heartbeat, setUser: setUser, clearUser: clearUser,
    get email() { return currentEmail; }, get url() { return BOT_URL; } };

  window.addEventListener('beforeunload', function () {
    if (currentEmail) navigator.sendBeacon && navigator.sendBeacon(BOT_URL + '/event',
      new Blob([JSON.stringify({ email: currentEmail, type: 'logout', detail: '' })], { type: 'application/json' }));
  });
})();

var _ico = function(svg){ return 'data:image/svg+xml,' + encodeURIComponent(svg); };
var APPS = {
    'cine': {title:'Hub', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#1a1a2e"/><rect x="8" y="8" width="14" height="14" rx="3" fill="#9090b0"/><rect x="26" y="8" width="14" height="14" rx="3" fill="#7070a0"/><rect x="8" y="26" width="14" height="14" rx="3" fill="#7070a0"/><rect x="26" y="26" width="14" height="14" rx="3" fill="#5050a0"/></svg>')},
    'term': {title:'Music', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0f1a28"/><path d="M20 34V16l20-4v7" stroke="#8aa0c0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="14" cy="34" r="6" fill="none" stroke="#8aa0c0" stroke-width="2.5"/><circle cx="34" cy="19" r="6" fill="none" stroke="#8aa0c0" stroke-width="2.5"/></svg>')},
    'files': {title:'Games', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0d1520"/><rect x="5" y="16" width="38" height="19" rx="7" fill="none" stroke="#8090a8" stroke-width="2"/><line x1="17" y1="22" x2="17" y2="29" stroke="#a0b0c0" stroke-width="2.5" stroke-linecap="round"/><line x1="13" y1="25.5" x2="21" y2="25.5" stroke="#a0b0c0" stroke-width="2.5" stroke-linecap="round"/><circle cx="31" cy="22" r="2" fill="#8090a8"/><circle cx="35" cy="25.5" r="2" fill="#8090a8"/><circle cx="31" cy="29" r="2" fill="#8090a8"/><circle cx="27" cy="25.5" r="2" fill="#8090a8"/></svg>')},
    'web': {title:'Browser', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#101520"/><circle cx="24" cy="24" r="16" fill="none" stroke="#7080a0" stroke-width="2"/><ellipse cx="24" cy="24" rx="7" ry="16" fill="none" stroke="#7080a0" stroke-width="1.5"/><line x1="8" y1="24" x2="40" y2="24" stroke="#7080a0" stroke-width="1.5"/><line x1="11" y1="17" x2="37" y2="17" stroke="#505870" stroke-width="1"/><line x1="11" y1="31" x2="37" y2="31" stroke="#505870" stroke-width="1"/></svg>')},
    'settings': {title:'Settings', internal:true, pinned:true, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#141414"/><circle cx="24" cy="24" r="6" fill="none" stroke="#909090" stroke-width="2.5"/><path d="M24 8v4M24 36v4M8 24h4M36 24h4M12.7 12.7l2.8 2.8M32.5 32.5l2.8 2.8M12.7 35.3l2.8-2.8M32.5 15.5l2.8-2.8" stroke="#909090" stroke-width="2.5" stroke-linecap="round"/></svg>')},
    'discord': {title:'Discord', internal:true, pinned:false, icon:'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png'},
    'roblox': {title:'Roblox', internal:true, pinned:false, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KvNyFWMg_bjo_q_1IVLKFWbfCeonn2qDow&s'},
    'youtube': {title:'YouTube', internal:true, pinned:false, icon:'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg'},
    'ciniai': {title:'Intellectual AI', internal:true, pinned:false, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#080e1c"/><circle cx="24" cy="24" r="7" fill="#1e3060" stroke="#4060b0" stroke-width="1.5"/><circle cx="24" cy="24" r="3" fill="#6090e0"/><circle cx="24" cy="9" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="24" cy="39" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="9" cy="24" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="39" cy="24" r="3.5" fill="#3050a0" opacity="0.85"/><circle cx="13.5" cy="13.5" r="2.5" fill="#2040a0" opacity="0.6"/><circle cx="34.5" cy="13.5" r="2.5" fill="#2040a0" opacity="0.6"/><circle cx="13.5" cy="34.5" r="2.5" fill="#2040a0" opacity="0.6"/><circle cx="34.5" cy="34.5" r="2.5" fill="#2040a0" opacity="0.6"/><line x1="24" y1="17" x2="24" y2="12.5" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/><line x1="24" y1="31" x2="24" y2="35.5" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/><line x1="17" y1="24" x2="12.5" y2="24" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/><line x1="31" y1="24" x2="35.5" y2="24" stroke="#4060b0" stroke-width="1.5" opacity="0.8"/></svg>')},
    'Geforce': {title:'GeForce NOW', internal:true, pinned:false, icon:'https://play-lh.googleusercontent.com/_-b_HQXrVyyhZSHj_BoE9u_-cxkcHDH_yLX5rDjJsFMIfsCNQs9F3QP4JvEFcWaSIz0=w240-h480-rw'},
    'anime': {title:'Anime', internal:true, pinned:false, icon: _ico('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#0d0a18"/><circle cx="18" cy="22" r="3.2" fill="#fff"/><circle cx="30" cy="22" r="3.2" fill="#fff"/><circle cx="18" cy="22" r="1.4" fill="#0d0a18"/><circle cx="30" cy="22" r="1.4" fill="#0d0a18"/><path d="M14 30 Q24 38 34 30" stroke="#ff5d8f" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M9 16 Q14 11 19 14 M29 14 Q34 11 39 16" stroke="#ff5d8f" stroke-width="2" stroke-linecap="round" fill="none"/></svg>')},
};

var savedPins = localStorage.getItem('intel_pins_v2');
if(savedPins){var p=JSON.parse(savedPins);for(var k in p){if(APPS[k])APPS[k].pinned=p[k];}}
function syncPins(){var obj={};for(var k in APPS)obj[k]=APPS[k].pinned;localStorage.setItem('intel_pins_v2',JSON.stringify(obj));if(window.saveToCloud)window.saveToCloud();}

var wallpaperRegistry = {
    "css-space":  {id:"css-space",  name:"Deep Space",  url:"__css__", css:"radial-gradient(ellipse at 20% 50%, #0d0d2b 0%, #000 70%)",  locked:false},
    "css-forest": {id:"css-forest", name:"Dark Forest",  url:"__css__", css:"radial-gradient(ellipse at bottom, #0a1a0a 0%, #000 70%)",   locked:false},
    "css-ocean":  {id:"css-ocean",  name:"Deep Ocean",   url:"__css__", css:"radial-gradient(ellipse at top, #001a2e 0%, #000 70%)",      locked:false},
    "css-fire":   {id:"css-fire",   name:"Ember",        url:"__css__", css:"radial-gradient(ellipse at bottom right, #1a0500 0%, #000 70%)", locked:false},
    "css-purple": {id:"css-purple", name:"Nebula",       url:"__css__", css:"radial-gradient(ellipse at center, #0d001a 0%, #000 70%)",   locked:false},
    "css-ice":    {id:"css-ice",    name:"Frost",        url:"__css__", css:"radial-gradient(ellipse at top left, #001020 0%, #000 70%)", locked:false},
    "blackhole":  {id:"blackhole",  name:"Blue Void",    url:"__blackhole__", locked:false},
};

var sysConfig = JSON.parse(localStorage.getItem('intel_sys_config'))||{};
if(sysConfig.optBg===undefined)sysConfig.optBg=true;
if(sysConfig.shortBoot===undefined)sysConfig.shortBoot=false;
if(sysConfig.wpLoop===undefined)sysConfig.wpLoop=false;
if(sysConfig.idleLock===undefined)sysConfig.idleLock=false;
if(sysConfig.redirectConfirm===undefined)sysConfig.redirectConfirm=false;
if(!sysConfig.panicKey)sysConfig.panicKey='`';
if(!sysConfig.homeWallpaper)sysConfig.homeWallpaper='blackhole';
if(!sysConfig.lockWallpaper)sysConfig.lockWallpaper='css-ocean';
if(!sysConfig.cloak)sysConfig.cloak='none';

window.updateSysSetting=function(key,value){sysConfig[key]=value;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));if(key==='optBg')applySystemSettings();if(window.saveToCloud)window.saveToCloud();};
var cloaks={none:{title:"Intellectual OS",icon:""},google:{title:"Google",icon:"https://www.google.com/favicon.ico"},drive:{title:"My Drive - Google Drive",icon:"https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"},canvas:{title:"Dashboard",icon:"https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico"},classroom:{title:"Classes",icon:"https://ssl.gstatic.com/classroom/favicon.png"}};
window.updateCloak=function(key){sysConfig.cloak=key;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));applyCloak();};
function applyCloak(){var k=sysConfig.cloak||'none',sel=cloaks[k],icons=document.querySelectorAll("link[rel*='icon']");for(var i=0;i<icons.length;i++)icons[i].remove();if(sel&&k!=='none'){document.title=sel.title;var n=document.createElement('link');n.type='image/x-icon';n.rel='shortcut icon';n.href=sel.icon;document.getElementsByTagName('head')[0].appendChild(n);}else{document.title="Intellectual OS";}}
// applyCloak is called on load and whenever updateCloak() is invoked — no polling needed

var isDesktopActive=false,bootActive=true,enterCount=0,highestZ=500,activeWindowId=null,isMediaPlaying=false,activeCtxId=null;
var isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// Mobile / ChromeOS access enabled — warning suppressed. Hide the modal if the
// HTML left it visible. Add a `mobile` body class so CSS can adapt where needed.
(function(){var mw=document.getElementById('mobile-warning');if(mw){if(mw.close)try{mw.close();}catch(e){}mw.style.display='none';}if(isMobile)document.body.classList.add('mobile');})();

document.addEventListener("DOMContentLoaded",function(){
    var _bi=document.getElementById('bg-img');if(_bi)_bi.style.display='none';
    var _li=document.getElementById('lock-img');if(_li)_li.style.display='none';applyCloak();document.getElementById('boot-layer').style.display='block';renderUI();initWallpapers();setupAppContextMenu();loadDesktop();updateSidebarData();if(sysConfig.accentColor)applyAccentColor(sysConfig.accentColor);setupWallpaperUpload();});

// ── BOOT ─────────────────────────────────────────────────────────────────────
function startBootSequence(){
    if(sysConfig.shortBoot){skipBootSequence();return;}
    var bc=document.getElementById('boot-content');
    bc.style.opacity='0';
    setTimeout(function(){bc.style.display='none';},400);

    var bl=document.getElementById('boot-layer');
    var wrap=document.createElement('div');
    wrap.id='cinematic-boot';
    wrap.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;overflow:hidden;';

    wrap.innerHTML=`
      <div id="cb-logo" style="text-align:center;opacity:0;transform:translateY(24px);transition:opacity 1.2s cubic-bezier(0.2,0.8,0.2,1),transform 1.2s cubic-bezier(0.2,0.8,0.2,1);">
        <div style="font-family:'Space Grotesk',sans-serif;font-size:clamp(1.4rem,4vw,2.8rem);letter-spacing:1px;color:#fff;text-shadow:0 0 60px rgba(255,255,255,0.15);margin-bottom:8px;">INTELLECTUAL</div>
        <div style="font-family:'Inter',sans-serif;font-size:clamp(.7rem,1.5vw,1rem);letter-spacing:1px;color:rgba(255,255,255,0.3);text-transform:uppercase;">Operating System &nbsp;// V2</div>
      </div>
      <div id="cb-bar-wrap" style="margin-top:60px;width:min(320px,60vw);opacity:0;transition:opacity .8s ease .6s;">
        <div style="position:relative;height:1px;background:rgba(255,255,255,0.08);border-radius:1px;overflow:visible;margin-bottom:18px;">
          <div id="cb-fill" style="position:absolute;top:0;left:0;height:100%;width:0%;background:#fff;border-radius:1px;transition:width .06s linear;box-shadow:0 0 12px rgba(255,255,255,0.6);"></div>
          <div id="cb-glow" style="position:absolute;top:-2px;left:0%;width:4px;height:5px;background:rgba(255,255,255,0.9);border-radius:2px;filter:blur(2px);transition:left .06s linear;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div id="cb-msg" style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.5px;color:rgba(255,255,255,0.25);text-transform:uppercase;transition:opacity .4s ease;">Starting...</div>
          <div id="cb-pct" style="font-family:'Space Grotesk',sans-serif;font-size:11px;color:rgba(255,255,255,0.2);">0%</div>
        </div>
      </div>
      <div id="cb-ver" style="position:absolute;bottom:30px;font-family:'Inter',sans-serif;font-size:10px;letter-spacing:0.5px;color:rgba(255,255,255,0.1);opacity:0;transition:opacity 1s ease 1s;">BUILD ${_devBuildVer}</div>
    `;
    bl.appendChild(wrap);

    var MSGS=['Starting...','Loading apps','Mounting','Almost ready','Ready'];
    var pct=0, mi=0, lastMsg=0;

    setTimeout(function(){
        document.getElementById('cb-logo').style.opacity='1';
        document.getElementById('cb-logo').style.transform='translateY(0)';
        document.getElementById('cb-bar-wrap').style.opacity='1';
        document.getElementById('cb-ver').style.opacity='1';
    },100);

    var iv=setInterval(function(){
        pct+=0.9;
        var p=Math.min(pct,100);
        var fill=document.getElementById('cb-fill');
        var glow=document.getElementById('cb-glow');
        var pctEl=document.getElementById('cb-pct');
        var msgEl=document.getElementById('cb-msg');
        if(fill)fill.style.width=p+'%';
        if(glow)glow.style.left=Math.max(0,p-0.5)+'%';
        if(pctEl)pctEl.textContent=Math.floor(p)+'%';
        var mi2=Math.floor((p/100)*MSGS.length);
        if(mi2!==lastMsg&&mi2<MSGS.length){
            lastMsg=mi2;
            if(msgEl){
                msgEl.style.opacity='0';
                setTimeout(function(){msgEl.textContent=MSGS[mi2];msgEl.style.opacity='1';},200);
            }
        }
        if(p>=100){
            clearInterval(iv);
            setTimeout(function(){
                wrap.style.transition='opacity .8s ease';
                wrap.style.opacity='0';
                setTimeout(function(){if(bootActive)skipBootSequence();},800);
            },600);
        }
    },18);
}

function skipBootSequence(){if(!bootActive)return;bootActive=false;var lay=document.getElementById('boot-layer');if(lay){lay.style.opacity='0';document.getElementById('lock-screen').classList.add('active');setTimeout(function(){lay.style.display='none';},600);updateClock();}}
document.addEventListener('keydown',function(e){if(bootActive&&e.key==='Enter'){enterCount++;if(enterCount>=2)skipBootSequence();setTimeout(function(){enterCount=0;},500);}if(e.key&&sysConfig.panicKey&&e.key.toLowerCase()===sysConfig.panicKey.toLowerCase())window.location.href="https://google.com";});

// ── WALLPAPERS ────────────────────────────────────────────────────────────────
var customWallpapers = JSON.parse(localStorage.getItem('intel_custom_wp') || '{}');

// Merge custom wallpapers into registry on load
for(var _ck in customWallpapers){ wallpaperRegistry[_ck] = customWallpapers[_ck]; }

window.addCustomWallpaper = function(name, url, type){
    if(!name||!url) return;
    var id = 'custom_' + Date.now();
    var wp = {id:id, name:name, url:url, locked:false, custom:true};
    if(type==='css') wp.css = url; // treat as CSS if flagged
    wallpaperRegistry[id] = wp;
    customWallpapers[id] = wp;
    localStorage.setItem('intel_custom_wp', JSON.stringify(customWallpapers));
    showNotification("Wallpaper added", '"'+name+'" is now available in Wallpaper Protocols.');
    if(window.saveToCloud)window.saveToCloud();
    return id;
};

function applyWallpaperCSS(wp,target){
    if(!wp)return;
    var da=document.getElementById('desktop-area'),ls=document.getElementById('lock-screen');
    var bv=document.getElementById('bg-video'),bi=document.getElementById('bg-img');
    var lv=document.getElementById('lock-video'),li=document.getElementById('lock-img');
    var bhc=document.getElementById('blackhole-canvas');
    if(wp.url==='__blackhole__'){
        if(target==='home'){bv.style.display='none';bi.style.display='none';da.style.background='transparent';if(bhc)bhc.style.display='block';}
        return;
    }
    if(bhc&&target==='home')bhc.style.display='none';
    if(wp.url==='__css__'||wp.css){
        var cssVal=wp.css||'#000';
        if(target==='home'){bv.style.display='none';bi.style.display='none';da.style.background=cssVal;}
        else{lv.style.display='none';li.style.display='none';ls.style.background=cssVal;}
    } else {
        var isImg=wp.url.startsWith('data:image/')||wp.url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i);
        var vEl=target==='home'?bv:lv, iEl=target==='home'?bi:li;
        if(isImg){
            vEl.style.display='none';iEl.style.display='block';iEl.src=wp.url;
            iEl.onerror=function(){iEl.style.display='none';if(target==='home')da.style.background='#000';else ls.style.background='#000';};
        }else{
            iEl.style.display='none';vEl.style.display='block';vEl.src=wp.url;vEl.load();
            vEl.onerror=function(){vEl.style.display='none';if(target==='home')da.style.background='#000';else ls.style.background='#000';};
            if(target==='home'&&isDesktopActive&&!sysConfig.optBg)vEl.play().catch(function(){});
        }
    }
}

function initWallpapers(){
    document.getElementById('desktop-area').style.background='transparent';
    document.getElementById('lock-screen').style.background='radial-gradient(ellipse at top, #001a2e 0%, #000 70%)';
    applyWallpaperCSS(wallpaperRegistry[sysConfig.homeWallpaper]||wallpaperRegistry['blackhole'],'home');
    applyWallpaperCSS(wallpaperRegistry[sysConfig.lockWallpaper]||wallpaperRegistry['css-ocean'],'lock');
    var chk=document.getElementById('wp-loop-chk');if(chk)chk.checked=sysConfig.wpLoop;
    applyAccentColor(sysConfig.accentColor||'#ffffff');
}

function applyAccentColor(color){
    sysConfig.accentColor=color;
    document.documentElement.style.setProperty('--accent-main',color);
    // derive muted version
    document.documentElement.style.setProperty('--accent-glow',color+'33');
    localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));
    if(window.saveToCloud)window.saveToCloud();
}

function setWallpaper(k){
    var d=wallpaperRegistry[k];if(!d)return;
    if(window.wpMode==='home'||window.wpMode==='both'){applyWallpaperCSS(d,'home');sysConfig.homeWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}
    if(window.wpMode==='lock'||window.wpMode==='both'){applyWallpaperCSS(d,'lock');sysConfig.lockWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}
    if(window.saveToCloud)window.saveToCloud();
}
window.wpMode='both';

function openWallpaperMenu(){
    var m=document.getElementById('wallpaper-menu');
    if(!m)return;
    if(m.showModal)m.showModal();else m.style.display='flex';
    m.classList.add('open');
    _renderWpGallery();
    // Ensure gallery tab is active on open
    var galleryBtn=document.querySelector('.wp-tab[data-tab="gallery"]');
    if(galleryBtn)switchWpTab(galleryBtn,'gallery');
}

function _renderWpGallery(){
    var gu=document.getElementById('wp-grid-unlocked');
    if(!gu)return;
    gu.innerHTML='';
    var activeKey=window.wpMode==='lock'?sysConfig.lockWallpaper:sysConfig.homeWallpaper;
    for(var k in wallpaperRegistry){
        (function(key){
            var d=wallpaperRegistry[key];
            var c=document.createElement('div');
            c.className='wp-card'+(key===activeKey?' active-wp':'');
            c.setAttribute('data-key',key);
            var inner='';
            if(d.url==='__css__'||d.css){
                inner='<div style="width:100%;height:100%;background:'+(d.css||'#111')+'"></div>';
            }else if(d.url.startsWith('data:image/')||d.url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i)){
                inner='<img src="'+d.url+'" alt="'+d.name+'" loading="lazy" onerror="this.parentElement.style.background=\'#111\'">';
            }else{
                inner='<video src="'+d.url+'" preload="none" playsinline muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>';
            }
            inner+='<div class="wp-info">'+d.name+'</div>';
            c.innerHTML=inner;
            if(d.custom){
                var del=document.createElement('button');
                del.className='wp-del-btn';
                del.innerHTML='<i class="fas fa-trash"></i>';
                del.onclick=function(e){
                    e.stopPropagation();
                    delete wallpaperRegistry[key];delete customWallpapers[key];
                    localStorage.setItem('intel_custom_wp',JSON.stringify(customWallpapers));
                    _renderWpGallery();
                };
                c.appendChild(del);
            }
            c.onclick=function(){
                setWallpaper(key);
                document.querySelectorAll('.wp-card').forEach(function(x){x.classList.remove('active-wp');});
                this.classList.add('active-wp');
            };
            gu.appendChild(c);
        })(k);
    }
}

function closeWallpaperMenu(){
    var m=document.getElementById('wallpaper-menu');
    if(!m)return;
    m.classList.remove('open');
    setTimeout(function(){if(m.close)m.close();else m.style.display='none';},300);
}

function switchWpTab(btn,tab){
    document.querySelectorAll('.wp-tab').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.wp-tab-content').forEach(function(c){c.classList.remove('active');});
    btn.classList.add('active');
    var content=document.getElementById('wp-tab-'+tab);
    if(content)content.classList.add('active');
    if(tab==='gallery')_renderWpGallery();
}

window.setWpTarget=function(btn,target){
    window.wpMode=target;
    document.querySelectorAll('.wp-target-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    _renderWpGallery();
};

function addWpFromUrl(){
    var name=(document.getElementById('wp-url-name').value||'').trim();
    var url=(document.getElementById('wp-url-link').value||'').trim();
    if(!name||!url){showNotification('Missing info','Please enter both a name and a URL.');return;}
    addCustomWallpaper(name,url);
    document.getElementById('wp-url-name').value='';
    document.getElementById('wp-url-link').value='';
    var galleryBtn=document.querySelector('.wp-tab[data-tab="gallery"]');
    if(galleryBtn)switchWpTab(galleryBtn,'gallery');
}

function compressAndAddWallpaper(file,name){
    var img=new Image(),reader=new FileReader();
    reader.onload=function(e){
        img.onload=function(){
            var canvas=document.createElement('canvas');
            var MAX_W=1920,MAX_H=1080,w=img.width,h=img.height;
            if(w>MAX_W){h=Math.round(h*MAX_W/w);w=MAX_W;}
            if(h>MAX_H){w=Math.round(w*MAX_H/h);h=MAX_H;}
            canvas.width=w;canvas.height=h;
            canvas.getContext('2d').drawImage(img,0,0,w,h);
            var dataUrl=canvas.toDataURL('image/jpeg',0.85);
            addCustomWallpaper(name,dataUrl);
            var galleryBtn=document.querySelector('.wp-tab[data-tab="gallery"]');
            if(galleryBtn)switchWpTab(galleryBtn,'gallery');
            showNotification('Wallpaper saved','"'+name+'" has been added to your gallery.');
        };
        img.src=e.target.result;
    };
    reader.readAsDataURL(file);
}

function setupWallpaperUpload(){
    var fileInput=document.getElementById('wp-file-input');
    var dropZone=document.getElementById('wp-drop-zone');
    if(!fileInput||!dropZone)return;
    fileInput.addEventListener('change',function(){
        var file=this.files[0];
        if(!file)return;
        var name=file.name.replace(/\.[^.]+$/,'').replace(/[_\-]/g,' ');
        compressAndAddWallpaper(file,name);
        this.value='';
    });
    dropZone.addEventListener('dragover',function(e){e.preventDefault();this.classList.add('drag-over');});
    dropZone.addEventListener('dragleave',function(){this.classList.remove('drag-over');});
    dropZone.addEventListener('drop',function(e){
        e.preventDefault();this.classList.remove('drag-over');
        var file=e.dataTransfer.files[0];
        if(file&&file.type.startsWith('image/')){
            var name=file.name.replace(/\.[^.]+$/,'').replace(/[_\-]/g,' ');
            compressAndAddWallpaper(file,name);
        }
    });
}

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function updateClock(){var n=new Date(),dArr=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'],mArr=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'],hrs=n.getHours().toString().padStart(2,'0'),min=n.getMinutes().toString().padStart(2,'0'),dName=dArr[n.getDay()],dNum=n.getDate().toString().padStart(2,'0'),yr=n.getFullYear();var lDay=document.getElementById('lock-day-large'),lDat=document.getElementById('lock-date'),lTim=document.getElementById('lock-time'),hDay=document.getElementById('lbl-day');if(lDay)lDay.innerText=dName;if(hDay)hDay.innerText=dName;if(lDat)lDat.innerText=dNum+' '+mArr[n.getMonth()]+', '+yr+'.';if(lTim)lTim.innerText='- '+hrs+':'+min+' -';}
setInterval(updateClock,1000);

// ── LOCK / UNLOCK ─────────────────────────────────────────────────────────────
var welcomeShown=false;
window.unlockSystem=function(){var scr=document.getElementById('lock-screen');scr.classList.add('slide-up');setTimeout(function(){scr.classList.remove('active');isDesktopActive=true;if(!welcomeShown){showNotification("Welcome back","Right-click the desktop to change your wallpaper.");welcomeShown=true;}},600);resetIdle();};
var idleTime=0;
function resetIdle(){idleTime=0;}
document.addEventListener('mousemove',resetIdle);document.addEventListener('keypress',resetIdle);
setInterval(function(){idleTime++;var scr=document.getElementById('lock-screen');if(sysConfig.idleLock&&idleTime>=180&&!scr.classList.contains('active')&&!bootActive){if(!isMediaPlaying){isDesktopActive=false;scr.classList.remove('slide-up');scr.classList.add('active');}else idleTime=0;}},1000);
function applySystemSettings(){var bv=document.getElementById('bg-video');if(sysConfig.optBg&&bv)bv.pause();else if(!sysConfig.optBg&&bv&&bv.src&&isDesktopActive)bv.play().catch(function(){});}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function showNotification(title,msg){var c=document.getElementById('toast-container'),t=document.createElement('div');t.className='toast-notification';t.innerHTML='<div class="toast-header"><div class="toast-app-info"><div class="toast-icon"><i class="fas fa-bell"></i></div><span>System</span></div><i class="fas fa-times toast-close"></i></div><div class="toast-title">'+title+'</div><div class="toast-body">'+msg+'</div>';c.appendChild(t);setTimeout(function(){t.classList.add('show');},100);t.onclick=function(){t.classList.remove('show');setTimeout(function(){t.remove();},400);};setTimeout(t.onclick,6000);}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function updateSidebarData(){try{var sp=JSON.parse(localStorage.getItem('intel_music_cache'));if(sp){var k=Object.keys(sp);if(k.length>0){document.getElementById('spotify-track-name').innerText=sp[k[k.length-1]].title||"Liked Song";if(sp[k[k.length-1]].cover)document.getElementById('spotify-album-art').src=sp[k[k.length-1]].cover;}}}catch(e){}}
setInterval(updateSidebarData,5000);
window.launchLastPlayed=function(){toggleApp('files');};window.resumeSpotify=function(){toggleApp('term');};window.openUpdateLog=function(){var u=document.getElementById('update-modal');if(u&&u.showModal)u.showModal();else if(u)u.style.display='flex';};

// ── UI RENDER ─────────────────────────────────────────────────────────────────
function renderUI(){var dock=document.getElementById('dock-container'),dHTML='<div class="dock-item" onclick="toggleStartMenu()"><img src="https://missionsupport.archden.org/wp-content/uploads/2022/02/windows11-icon.png"></div><div class="dock-sep"></div><div class="dock-item" onclick="toggleAppDrawer()"><svg width="24" height="24" viewBox="0 0 24 24" fill="#aaa"><path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/></svg></div><div class="dock-sep"></div>',pHTML='';for(var id in APPS){if(APPS[id].pinned){dHTML+='<div class="dock-item" data-id="'+id+'" onmousedown="DragSystem.start(event,this,\'dock\',\''+id+'\')" onclick="toggleApp(\''+id+'\')" oncontextmenu="openDockCtx(event,\''+id+'\')"><img src="'+APPS[id].icon+'"></div>';pHTML+='<div class="pinned-item" onclick="toggleApp(\''+id+'\')"><img src="'+APPS[id].icon+'"><span>'+APPS[id].title+'</span></div>';}}dock.innerHTML=dHTML;document.getElementById('pinned-grid').innerHTML=pHTML;populateDrawer();}
function openDockCtx(e,id){e.preventDefault();e.stopPropagation();hideAllCtx();activeCtxId=id;var m=document.getElementById('dock-ctx-menu');if(m){m.style.display='block';m.style.left=e.pageX+'px';m.style.top=e.pageY+'px';}}
function openDrawerCtx(e,id){e.preventDefault();e.stopPropagation();hideAllCtx();activeCtxId=id;var m=document.getElementById('drawer-ctx-menu');if(m){m.style.display='block';m.style.left=e.pageX+'px';m.style.top=e.pageY+'px';}}
document.getElementById('ctx-pin-app').onclick=function(){if(activeCtxId&&APPS[activeCtxId]){APPS[activeCtxId].pinned=true;syncPins();renderUI();}hideAllCtx();};
document.getElementById('ctx-unpin-app').onclick=function(){if(activeCtxId&&APPS[activeCtxId]){APPS[activeCtxId].pinned=false;syncPins();renderUI();}hideAllCtx();};
function hideAllCtx(){['app-context-menu','desktop-context-menu','drawer-ctx-menu','dock-ctx-menu'].forEach(function(x){var m=document.getElementById(x);if(m)m.style.display='none';});}
document.addEventListener('click',hideAllCtx);
function populateDrawer(){var g=document.getElementById('drawer-grid');g.innerHTML='';for(var key in APPS){var a=APPS[key],d=document.createElement('div');d.className='drawer-item';d.dataset.id=key;d.innerHTML='<img src="'+a.icon+'" style="pointer-events:none;"><span>'+a.title+'</span>';d.onmousedown=function(e){DragSystem.start(e,this,'drawer',this.dataset.id);};d.onclick=function(e){if(!DragSystem.isDragMove){toggleApp(this.dataset.id);toggleAppDrawer();}};d.oncontextmenu=function(e){openDrawerCtx(e,this.dataset.id);};g.appendChild(d);}}
function filterDrawer(val){document.querySelectorAll('.drawer-item').forEach(function(it){it.style.display=it.innerText.toLowerCase().includes(val.toLowerCase())?'flex':'none';});}
function toggleAppDrawer(){var d=document.getElementById('app-drawer');if(d.classList.contains('open')){d.classList.remove('open');setTimeout(function(){d.style.display='none';},300);}else{d.style.display='block';setTimeout(function(){d.classList.add('open');},10);}}
function toggleStartMenu(){var sm=document.getElementById('start-menu');if(sm.classList.contains('open')){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}else{sm.style.display='flex';setTimeout(function(){sm.classList.add('open');},10);}}
document.addEventListener('click',function(e){var sm=document.getElementById('start-menu');if(sm&&!sm.contains(e.target)&&!e.target.closest('.dock-item')){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}});
var sInp=document.getElementById('start-search-input');if(sInp)sInp.addEventListener('keydown',function(e){if(e.key==='Enter'){var q=this.value.trim();if(wallpaperRegistry[q]){setWallpaper(q);this.value='';this.blur();}}});


function getSettingsHTML() {
  var keys = ['optBg','shortBoot','idleLock','redirectConfirm'];
  var labels = ['Optimized background','Fast boot','Auto-lock','Redirect warning'];
  var descs = ['Disables animated background','Skip the startup animation','Lock after 3 minutes','Helps block GoGuardian'];
  var rows = '';
  for (var i = 0; i < keys.length; i++) {
    rows += '<div class="c"><div class="ci"><strong>' + labels[i] + '</strong><small>' + descs[i] + '</small></div>' +
      '<label class="tog"><input type="checkbox" id="c' + i + '" data-key="' + keys[i] + '" onchange="W(this)"><span class="ts"></span></label></div>';
  }
  var colors = ['#fff','#4f8ef7','#f74f4f','#4ff78e','#f7c14f','#c14ff7','#ff6b35','#1db954'];
  var swatches = '';
  for (var j = 0; j < colors.length; j++) {
    swatches += '<div class="sw" style="background:' + colors[j] + '" onclick="AC(this)"></div>';
  }
  var html = '';
  html += '<style>';
  html += 'body{background:#000;overflow-y:auto;height:auto;min-height:100vh;font-family:Inter,sans-serif;color:#fff;font-size:14px}';
  html += '.w{padding:20px;max-width:500px;margin:0 auto}';
  html += '.h{font-size:.7rem;font-weight:700;color:#444;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:12px;margin-top:22px;text-transform:uppercase;letter-spacing:.5px}';
  html += '.h:first-child{margin-top:0}';
  html += '.c{background:#0d0d0d;border:1px solid #111;padding:12px 14px;border-radius:8px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;gap:12px}';
  html += '.ci{display:flex;flex-direction:column;gap:2px}strong{font-size:13px;font-weight:600}small{font-size:11px;color:#333;display:block}';
  html += '.tog{position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0}.tog input{opacity:0;width:0;height:0}';
  html += '.ts{position:absolute;cursor:pointer;inset:0;background:#1a1a1a;border-radius:20px;transition:.25s;border:1px solid #222}';
  html += '.ts:before{position:absolute;content:"";height:13px;width:13px;left:3px;bottom:3px;background:#333;transition:.25s;border-radius:50%}';
  html += 'input:checked+.ts{background:#fff;border-color:#fff}input:checked+.ts:before{transform:translateX(16px);background:#000}';
  html += 'select{background:#111;color:#fff;border:1px solid #1a1a1a;padding:5px 8px;border-radius:5px;outline:none;font-size:12px;font-family:inherit}';
  html += '.pk{width:34px;height:26px;background:#111;border:1px solid #1a1a1a;color:#fff;text-align:center;font-size:.9rem;font-weight:600;outline:none;border-radius:4px}';
  html += '.sw{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;display:inline-block;margin-right:5px;vertical-align:middle;transition:.15s}';
  html += '.sw:hover{border-color:#fff}.inp{background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 10px;border-radius:5px;outline:none;font-size:12px}';
  html += '</style>';
  html += '<div class="w">';
  html += '<div class="h">Performance</div>' + rows;
  html += '<div class="h">Privacy</div>';
  html += '<div class="c"><div class="ci"><strong>Tab disguise</strong><small>Make this tab look like another site</small></div>';
  html += '<select id="clk" onchange="window.parent.updateCloak(this.value)">';
  html += '<option value="none">None</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option>';
  html += '</select></div>';
  html += '<div class="c"><div class="ci"><strong>Panic key</strong><small>Press to instantly close the tab</small></div>';
  html += '<input class="pk" type="text" id="pk" maxlength="1" oninput="window.parent.updateSysSetting(\'panicKey\',this.value)"></div>';
  html += '<div class="h">Appearance</div>';
  html += '<div class="c" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="ci"><strong>Accent color</strong><small>Changes highlights across the OS</small></div>';
  html += '<div style="margin-top:8px">' + swatches + '</div></div>';
  html += '<div class="c" style="flex-direction:column;align-items:flex-start;gap:8px"><div class="ci"><strong>Custom wallpaper</strong><small>Add any image or video URL</small></div>';
  html += '<div style="display:flex;gap:6px;width:100%;margin-top:4px">';
  html += '<input class="inp" id="wn" type="text" placeholder="Name" style="width:100px">';
  html += '<input class="inp" id="wu" type="text" placeholder="URL" style="flex:1;min-width:100px">';
  html += '<button onclick="AW()" style="background:#fff;color:#000;border:none;padding:7px 14px;border-radius:5px;font-weight:700;font-size:12px;cursor:pointer">Add</button>';
  html += '</div></div></div>';
  return html;
}

function getSettingsScript() {
  return 'var K=["optBg","shortBoot","idleLock","redirectConfirm"];' +
    '(function(){' +
    '  var p=window.parent.sysConfig;' +
    '  for(var i=0;i<K.length;i++){' +
    '    var cb=document.getElementById("c"+i);' +
    '    if(cb){cb.checked=!!p[K[i]];var t=cb.nextElementSibling;t.style.background=cb.checked?"#fff":"#1a1a1a";t.style.borderColor=cb.checked?"#fff":"#222";}' +
    '  }' +
    '  var cl=document.getElementById("clk");if(cl)cl.value=p.cloak||"none";' +
    '  var pk=document.getElementById("pk");if(pk)pk.value=p.panicKey||"";' +
    '})();' +
    'function W(cb){var k=cb.getAttribute("data-key");var v=cb.checked;window.parent.updateSysSetting(k,v);var t=cb.nextElementSibling;t.style.background=v?"#fff":"#1a1a1a";t.style.borderColor=v?"#fff":"#222";}' +
    'function AC(el){window.parent.applyAccentColor(el.style.background);}' +
    'function P(v){window.parent.updateSysSetting("panicKey",v);}' +
    'function AW(){var n=document.getElementById("wn").value.trim(),u=document.getElementById("wu").value.trim();if(!n||!u)return;window.parent.addCustomWallpaper(n,u);document.getElementById("wn").value="";document.getElementById("wu").value="";}';
}


function getAppSrcdoc(id) {
  var H = '<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%;overflow:hidden;background:#000;color:#fff;font-family:Inter,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}button,input,select{font-family:inherit;cursor:pointer}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:3px}</style></head><body>';
  var T = '</body></html>';

  /* =====================================================================
     GAMES — GN-MATH POWERED, CINE-OS STYLE GUI
  ===================================================================== */
  if (id === 'files') { return H + `
<style>
body{background:#000}
#root{height:100vh;display:flex;flex-direction:column}

/* NAV */
#nav{height:40px;background:rgba(6,6,6,1);border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;padding:0 16px;gap:0;flex-shrink:0}
.nt{padding:0 14px;height:100%;display:flex;align-items:center;font-size:10px;font-weight:700;color:#383838;border-bottom:1.5px solid transparent;cursor:pointer;white-space:nowrap;user-select:none;transition:color .15s;letter-spacing:.8px;text-transform:uppercase}
.nt:hover{color:#777}
.nt.on{color:#fff;border-bottom-color:#fff}
#nav-r{margin-left:auto;display:flex;align-items:center;gap:14px}
#clk{font-size:11px;font-weight:600;color:#2a2a2a}
#nav-search-btn{display:flex;align-items:center;gap:5px;color:#383838;cursor:pointer;font-size:11px;transition:.15s;font-weight:600;letter-spacing:.3px}
#nav-search-btn:hover{color:#888}

/* MAIN SCROLL */
#main{flex:1;overflow-y:auto;overflow-x:hidden}
#main::-webkit-scrollbar{width:4px}
#main::-webkit-scrollbar-thumb{background:#111}

/* HERO */
#hero{padding:36px 24px 24px}
#hero h1{font-family:'Space Grotesk',sans-serif;font-size:2.2rem;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-.3px}
#hero p{font-size:13px;color:#444;margin-bottom:20px}
.hero-btn{display:inline-flex;align-items:center;gap:8px;background:#1a1a1a;border:1px solid #2a2a2a;color:#ccc;padding:9px 18px;border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s;user-select:none}
.hero-btn:hover{background:#222;border-color:#444;color:#fff}

/* YOUR GAMES */
#your-wrap{padding:0 24px;margin-top:28px}
#your-lbl{font-size:14px;font-weight:700;color:#fff;text-decoration:underline;text-underline-offset:3px;margin-bottom:14px}
#your-row{display:flex;gap:10px;flex-wrap:wrap}
.yc{width:120px;height:120px;border-radius:12px;overflow:hidden;border:1px solid #1e1e1e;cursor:pointer;position:relative;flex-shrink:0;transition:.2s;background:#0a0a0a}
.yc:hover{border-color:#3a3a3a;transform:scale(1.04)}
.yc img{width:100%;height:100%;object-fit:cover}
.yc-lbl{position:absolute;bottom:0;left:0;right:0;padding:16px 8px 7px;background:linear-gradient(transparent,rgba(0,0,0,.9));font-size:10px;font-weight:700;color:#fff}
.yc-add{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border-style:dashed;border-color:#1e1e1e;background:#050505}
.yc-add:hover{border-color:#3a3a3a;background:#0d0d0d}
.add-plus{font-size:22px;font-weight:300;color:#333;line-height:1}
.add-lbl{font-size:10px;font-weight:600;color:#333}

/* GAME SECTIONS */
.sec{margin-top:28px}
.sec-lbl{font-size:14px;font-weight:700;color:#fff;padding:0 24px;margin-bottom:14px}
.row-wrap{position:relative}
.row{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 24px 10px;scroll-behavior:smooth}
.row::-webkit-scrollbar{height:0}
.arr{position:absolute;top:50%;transform:translateY(-62%);width:30px;height:30px;background:rgba(0,0,0,.9);border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;font-size:17px;color:#666;opacity:0;pointer-events:none;transition:.15s;user-select:none}
.row-wrap:hover .arr{opacity:1;pointer-events:all}
.arr:hover{color:#fff;border-color:#555}
.al{left:6px}.ar{right:6px}

/* GAME CARD */
.gc{flex-shrink:0;width:150px;border-radius:10px;overflow:hidden;cursor:pointer;scroll-snap-align:start;background:#111;border:1px solid #1a1a1a;transition:.2s;position:relative}
.gc:hover{transform:translateY(-4px) scale(1.02);border-color:#333;box-shadow:0 10px 28px rgba(0,0,0,.7)}
.gc-art{width:100%;height:106px;object-fit:cover;display:block;background:#111}
.gc-art-fallback{width:100%;height:106px;background:linear-gradient(135deg,#111,#1a1a1a);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#2a2a2a;text-align:center;padding:8px;line-height:1.4}
.gc-info{padding:8px 10px 10px}
.gc-name{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.gc-genre{font-size:10px;color:#444;font-weight:500}

/* FULL GRID */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:9px;padding:0 24px 28px}

/* LOADING STATE */
#loading{display:flex;align-items:center;justify-content:center;height:200px;color:#333;font-size:13px;font-weight:500}

/* LAUNCHER */
#launcher{display:none;position:fixed;inset:0;z-index:1000;background:#000;flex-direction:column}
#ll-load{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
#ll-name{font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:700;color:#fff;letter-spacing:.3px}
#ll-sub{font-size:10px;color:#2a2a2a;letter-spacing:1.5px;text-transform:uppercase;font-weight:700}
#ll-track{width:200px;height:1px;background:#161616;border-radius:1px;overflow:hidden;margin-top:6px}
#ll-fill{height:100%;width:0%;background:#fff;border-radius:1px;transition:width .06s}
#ll-pct{font-size:10px;color:#252525;font-weight:700;letter-spacing:.5px}
#ll-frame{flex:1;border:none;display:none;width:100%;height:100%}
#ll-x{position:absolute;top:12px;right:12px;background:rgba(14,14,14,.95);border:1px solid rgba(255,255,255,.07);color:#555;height:28px;padding:0 14px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;z-index:10;transition:all .15s;gap:7px}
#ll-x:hover{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.15)}

/* SEARCH OVERLAY */
#srch{display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.96);backdrop-filter:blur(16px);flex-direction:column;padding:36px 24px}
#srch.open{display:flex}
#srch-row{display:flex;gap:8px;max-width:480px;margin-bottom:24px}
#srch-in{flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:10px 14px;border-radius:8px;outline:none;font-size:14px;font-weight:500}
#srch-in:focus{border-color:#2a2a2a}
#srch-in::placeholder{color:#2a2a2a}
#srch-x{background:#111;border:1px solid #1e1e1e;color:#555;padding:8px 16px;border-radius:7px;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;transition:.15s}
#srch-x:hover{background:#fff;color:#000;border-color:#fff}
#srch-res{display:flex;flex-wrap:wrap;gap:8px;overflow-y:auto}

/* ADD MODAL */
#addm{display:none;position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);align-items:center;justify-content:center}
#addm.open{display:flex}
.add-box{background:#0d0d0d;border:1px solid #1a1a1a;border-radius:12px;padding:24px;width:390px;max-width:90vw}
.add-box h3{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:700;margin-bottom:16px}
.add-box input{width:100%;background:#111;border:1px solid #1a1a1a;color:#fff;padding:9px 12px;border-radius:6px;outline:none;font-size:13px;margin-bottom:9px;transition:.15s}
.add-box input:focus{border-color:#2a2a2a}
.add-box input::placeholder{color:#222}
.add-actions{display:flex;gap:8px;margin-top:4px}
.btn-p{background:#fff;color:#000;border:none;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:700;transition:.15s}
.btn-p:hover{background:#ddd}
.btn-s{background:#1a1a1a;color:#555;border:1px solid #1e1e1e;padding:9px 18px;border-radius:6px;font-size:13px;font-weight:600}
.btn-s:hover{color:#aaa;border-color:#333}
</style>

<div id="root">
  <div id="nav">
    <div class="nt on" onclick="showTab('home',this)">Home</div>
    <div class="nt" onclick="showTab('library',this)">Game Library</div>
    <div class="nt" onclick="showTab('store',this)">Play Store</div>
    <div id="nav-r">
      <div id="nav-search-btn" onclick="openSearch()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Search
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.8" style="cursor:pointer"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.8" style="cursor:pointer"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <div id="clk"></div>
    </div>
  </div>

  <div id="main">
    <div id="tab-home">
      <div id="hero">
        <h1>Upload Title</h1>
        <p>Install package via URL — saves to your library automatically.</p>
        <div class="hero-btn" onclick="openAdd()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Install Media
        </div>
      </div>
      <div id="your-wrap">
        <div id="your-lbl">Your Games</div>
        <div id="your-row">
          <div class="yc yc-add" onclick="openAdd()">
            <div class="add-plus">+</div>
            <div class="add-lbl">ADD</div>
          </div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">Featured Ports</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rf',-1)">&#8249;</div>
          <div class="row" id="rf"></div>
          <div class="arr ar" onclick="scr('rf',1)">&#8250;</div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">Classic Arcade</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rc',-1)">&#8249;</div>
          <div class="row" id="rc"></div>
          <div class="arr ar" onclick="scr('rc',1)">&#8250;</div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">Try Something New!</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rn',-1)">&#8249;</div>
          <div class="row" id="rn"></div>
          <div class="arr ar" onclick="scr('rn',1)">&#8250;</div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-lbl">What We Recommend</div>
        <div class="row-wrap">
          <div class="arr al" onclick="scr('rr',-1)">&#8249;</div>
          <div class="row" id="rr"></div>
          <div class="arr ar" onclick="scr('rr',1)">&#8250;</div>
        </div>
      </div>
      <div id="loading" id="load-msg">Loading games from GN-Math...</div>
    </div>
    <div id="tab-library" style="display:none;padding-top:24px">
      <div style="padding:0 24px 14px;font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:600">All Games</div>
      <div class="grid" id="lib-grid"></div>
    </div>
    <div id="tab-store" style="display:none;padding-top:24px">
      <div style="padding:0 24px 14px;font-family:'Space Grotesk',sans-serif;font-size:.95rem;font-weight:600">Browse</div>
      <div class="grid" id="store-grid"></div>
    </div>
  </div>
</div>

<!-- LAUNCHER -->
<div id="launcher">
  <div id="ll-load">
    <div id="ll-name">Loading...</div>
    <div id="ll-sub">INTELLECTUAL OS</div>
    <div id="ll-track"><div id="ll-fill"></div></div>
    <div id="ll-pct">0%</div>
  </div>
  <iframe id="ll-frame" allow="autoplay;fullscreen;gamepad;clipboard-write" allowfullscreen></iframe>
  <div id="ll-x" onclick="closeLaunch()"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>CLOSE</div>
</div>

<!-- SEARCH -->
<div id="srch">
  <div id="srch-row">
    <input id="srch-in" type="text" placeholder="Search games..." oninput="doSearch(this.value)" autofocus>
    <button id="srch-x" onclick="closeSearch()">Done</button>
  </div>
  <div id="srch-res"></div>
</div>

<!-- ADD MODAL -->
<div id="addm">
  <div class="add-box">
    <h3>Add a game</h3>
    <input id="an" placeholder="Title">
    <input id="au" placeholder="URL">
    <input id="ai" placeholder="Cover image URL (optional)">
    <div class="add-actions">
      <button class="btn-p" onclick="saveGame()">Save</button>
      <button class="btn-s" onclick="closeAdd()">Cancel</button>
    </div>
  </div>
</div>

<script>
var COVER = 'https://cdn.jsdelivr.net/gh/gn-math/covers@main';
var HTML  = 'https://cdn.jsdelivr.net/gh/gn-math/html@main';
var ZONES_URL = 'https://cdn.jsdelivr.net/gh/gn-math/assets@master/zones.json';

var zones = [];
var saved = JSON.parse(localStorage.getItem('ios_g') || '[]');

// Direct-URL ports from multiple unblocker CDNs. These merge with gn-math zones
// so they show up in search, library, featured rows, etc. Covers are optional.
var EXTRA_PORTS = [
  // 3kh0 mirrors
  { id:'x3k-slope',       name:'Slope',                url:'https://3kh0-lite.global.ssl.fastly.net/projects/slope/',              cover:'https://3kh0-lite.global.ssl.fastly.net/projects/slope/icon.png' },
  { id:'x3k-1v1',         name:'1v1.LOL',              url:'https://3kh0-lite.global.ssl.fastly.net/projects/1v1lol/',             cover:'https://3kh0-lite.global.ssl.fastly.net/projects/1v1lol/icon.png' },
  { id:'x3k-retrobowl',   name:'Retro Bowl',           url:'https://3kh0-lite.global.ssl.fastly.net/projects/retro-bowl/',         cover:'https://3kh0-lite.global.ssl.fastly.net/projects/retro-bowl/icon.png' },
  { id:'x3k-drivemad',    name:'Drive Mad',            url:'https://3kh0-lite.global.ssl.fastly.net/projects/drive-mad/',          cover:'https://3kh0-lite.global.ssl.fastly.net/projects/drive-mad/icon.png' },
  { id:'x3k-smashkarts',  name:'Smash Karts',          url:'https://3kh0-lite.global.ssl.fastly.net/projects/smash-karts/',        cover:'https://3kh0-lite.global.ssl.fastly.net/projects/smash-karts/icon.png' },
  { id:'x3k-bitlife',     name:'BitLife',              url:'https://3kh0-lite.global.ssl.fastly.net/projects/bitlife/',            cover:'https://3kh0-lite.global.ssl.fastly.net/projects/bitlife/icon.png' },
  { id:'x3k-cookie',      name:'Cookie Clicker',       url:'https://3kh0-lite.global.ssl.fastly.net/projects/cookie-clicker/',     cover:'https://3kh0-lite.global.ssl.fastly.net/projects/cookie-clicker/icon.png' },
  { id:'x3k-stick',       name:'Stickman Hook',        url:'https://3kh0-lite.global.ssl.fastly.net/projects/stickman-hook/',      cover:'https://3kh0-lite.global.ssl.fastly.net/projects/stickman-hook/icon.png' },
  { id:'x3k-geo',         name:'Geometry Dash',        url:'https://3kh0-lite.global.ssl.fastly.net/projects/geometry-dash/',      cover:'https://3kh0-lite.global.ssl.fastly.net/projects/geometry-dash/icon.png' },
  { id:'x3k-tunnel',      name:'Tunnel Rush',          url:'https://3kh0-lite.global.ssl.fastly.net/projects/tunnel-rush/',        cover:'https://3kh0-lite.global.ssl.fastly.net/projects/tunnel-rush/icon.png' },
  { id:'x3k-moto',        name:'Moto X3M',             url:'https://3kh0-lite.global.ssl.fastly.net/projects/moto-x3m/',           cover:'https://3kh0-lite.global.ssl.fastly.net/projects/moto-x3m/icon.png' },
  { id:'x3k-happy',       name:'Happy Wheels',         url:'https://3kh0-lite.global.ssl.fastly.net/projects/happy-wheels/',       cover:'https://3kh0-lite.global.ssl.fastly.net/projects/happy-wheels/icon.png' },
  { id:'x3k-paper',       name:'Paper.io 2',           url:'https://3kh0-lite.global.ssl.fastly.net/projects/paperio-2/',          cover:'https://3kh0-lite.global.ssl.fastly.net/projects/paperio-2/icon.png' },
  { id:'x3k-clusterrush', name:'Cluster Rush',         url:'https://3kh0-lite.global.ssl.fastly.net/projects/cluster-rush/',       cover:'https://3kh0-lite.global.ssl.fastly.net/projects/cluster-rush/icon.png' },
  { id:'x3k-hardestgame', name:'Worlds Hardest Game',  url:'https://3kh0-lite.global.ssl.fastly.net/projects/worlds-hardest-game/',cover:'https://3kh0-lite.global.ssl.fastly.net/projects/worlds-hardest-game/icon.png' },
  { id:'x3k-run3',        name:'Run 3',                url:'https://3kh0-lite.global.ssl.fastly.net/projects/run-3/',              cover:'https://3kh0-lite.global.ssl.fastly.net/projects/run-3/icon.png' },
  { id:'x3k-temple',      name:'Temple Run 2',         url:'https://3kh0-lite.global.ssl.fastly.net/projects/temple-run-2/',       cover:'https://3kh0-lite.global.ssl.fastly.net/projects/temple-run-2/icon.png' },
  { id:'x3k-crossy',      name:'Crossy Road',          url:'https://3kh0-lite.global.ssl.fastly.net/projects/crossy-road/',        cover:'https://3kh0-lite.global.ssl.fastly.net/projects/crossy-road/icon.png' },
  { id:'x3k-fnf',         name:'Friday Night Funkin',  url:'https://3kh0-lite.global.ssl.fastly.net/projects/friday-night-funkin/',cover:'https://3kh0-lite.global.ssl.fastly.net/projects/friday-night-funkin/icon.png' },

  // Eaglercraft (Minecraft) — multiple mirrors
  { id:'mc-1.8.8',        name:'Eaglercraft 1.8.8',    url:'https://eaglercraft.com/mc/1.8.8/',                                    cover:'https://eaglercraft.com/icon.png' },
  { id:'mc-1.5.2',        name:'Eaglercraft 1.5.2',    url:'https://eaglercraft.com/mc/1.5.2/',                                    cover:'https://eaglercraft.com/icon.png' },

  // DOS classics via js-dos
  { id:'dos-doom',        name:'Doom',                 url:'https://js-dos.com/games/doom.exe.html',                               cover:'https://js-dos.com/images/doom.png' },
  { id:'dos-wolf3d',      name:'Wolfenstein 3D',       url:'https://js-dos.com/games/wolf3d.exe.html',                             cover:'https://js-dos.com/images/wolf3d.png' },
  { id:'dos-prince',      name:'Prince of Persia',     url:'https://js-dos.com/games/prince.exe.html',                             cover:'https://js-dos.com/images/prince.png' },
  { id:'dos-simcity',     name:'SimCity',              url:'https://js-dos.com/games/simcity.exe.html',                            cover:'https://js-dos.com/images/simcity.png' },

  // Ruffle (Flash)
  { id:'flash-supermario',name:'Super Mario Flash',    url:'https://ruffle.rs/demo/?url=https://files.ruffle.rs/demo/super-mario-63.swf' },
  { id:'flash-stickwar',  name:'Stick War',            url:'https://ruffle.rs/demo/?url=https://files.ruffle.rs/demo/stick-war.swf' },
];
zones = EXTRA_PORTS.slice();  // seed before fetch resolves so UI isn't empty

// Curated ports — matched against gn-math zones by name keyword
var FEATURED_KEYS = [
  'eaglercraft','minecraft','doom','retro bowl','slope','drive mad',
  '1v1','basket bros','cookie clicker','stickman hook','vex 7','vex 6',
  'tomb of the mask','geometry dash','tunnel rush','moto x3m','happy wheels',
  'bloxorz','run 3','papa','subway surfers','cluster rush','bitlife',
  'smash karts','among us','crossy road','temple run','bad ice cream',
  'fireboy','worlds hardest','friday night funkin','paper.io','agar'
];
var CLASSIC_KEYS = [
  'pac-man','pacman','tetris','space invaders','snake','pong','asteroids',
  'frogger','galaga','centipede','breakout','mario','sonic','contra',
  'donkey kong','street fighter','mortal kombat','zelda','metroid','kirby'
];

function pickBy(keys) {
  var seen = {}, out = [];
  for (var i=0;i<keys.length;i++) {
    var k = keys[i].toLowerCase();
    for (var j=0;j<zones.length;j++) {
      var z = zones[j];
      if (seen[z.id]) continue;
      if ((z.name||'').toLowerCase().indexOf(k) !== -1) {
        out.push(z); seen[z.id] = 1; break;
      }
    }
  }
  return out;
}

// Load GN-Math zones
fetch(ZONES_URL + '?t=' + Date.now())
  .then(function(r){ return r.json(); })
  .then(function(data){
    var gn = data.filter(function(z){ return z.url; });
    zones = EXTRA_PORTS.concat(gn);
    document.getElementById('loading').style.display = 'none';
    buildHome();
  })
  .catch(function(){
    // still show the curated ports even if zones.json fetch fails
    document.getElementById('loading').style.display = 'none';
    zones = EXTRA_PORTS.slice();
    buildHome();
  });

function getUrl(z) {
  if (!z || !z.url) return '#';
  if (z.url.startsWith('http')) return z.url;
  return z.url.replace('{HTML_URL}', HTML).replace('{COVER_URL}', COVER);
}

function getCover(z) {
  if (!z) return '';
  if (z.cover && z.cover.startsWith('http')) return z.cover;
  if (z.cover) return z.cover.replace('{COVER_URL}', COVER).replace('{HTML_URL}', HTML);
  return COVER + '/' + z.id + '.jpg';
}

function card(z, w) {
  w = w || 150;
  var url = getUrl(z);
  var cover = getCover(z);
  var name = (z.name || 'Game').replace(/'/g, '&#39;');
  return '<div class="gc" style="width:'+w+'px" onclick="launch(\''+encodeURIComponent(url)+'\',\''+name+'\')">' +
    '<img class="gc-art" src="'+cover+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" loading="lazy">' +
    '<div class="gc-art-fallback" style="display:none">'+name+'</div>' +
    '<div class="gc-info"><div class="gc-name">'+name+'</div></div></div>';
}

function userCard(g) {
  var name = (g.name || 'Game').replace(/'/g, '&#39;');
  return '<div class="yc" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+name+'\')"><img src="'+g.img+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"><div class="yc-lbl">'+name+'</div></div>';
}

function buildHome() {
  var sh = zones.slice().sort(function(){ return Math.random()-.5; });
  var featured = pickBy(FEATURED_KEYS);
  var classic = pickBy(CLASSIC_KEYS);
  // fallback: if curated picks empty (zones feed changed), use random slice
  if (!featured.length) featured = sh.slice(0,16);
  if (!classic.length) classic = sh.slice(16,32);
  document.getElementById('rf').innerHTML = featured.map(function(z){ return card(z); }).join('');
  document.getElementById('rc').innerHTML = classic.map(function(z){ return card(z); }).join('');
  document.getElementById('rn').innerHTML = sh.slice(0,16).map(function(z){ return card(z); }).join('');
  document.getElementById('rr').innerHTML = sh.slice(16,32).map(function(z){ return card(z); }).join('');
  buildYour();
}

function buildYour() {
  var add = '<div class="yc yc-add" onclick="openAdd()"><div class="add-plus">+</div><div class="add-lbl">ADD</div></div>';
  document.getElementById('your-row').innerHTML = add + saved.map(userCard).join('');
}

function showTab(name, el) {
  ['home','library','store'].forEach(function(t){ document.getElementById('tab-'+t).style.display='none'; });
  document.querySelectorAll('.nt').forEach(function(t){ t.classList.remove('on'); });
  document.getElementById('tab-'+name).style.display='block';
  el.classList.add('on');
  if (name === 'library') {
    var pri = pickBy(FEATURED_KEYS.concat(CLASSIC_KEYS));
    var priIds = {}; pri.forEach(function(z){ priIds[z.id]=1; });
    var rest = zones.filter(function(z){ return !priIds[z.id]; });
    var lib = pri.concat(rest).slice(0,80);
    document.getElementById('lib-grid').innerHTML = saved.map(function(g){
      return '<div class="gc" style="width:145px" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+g.name.replace(/'/g,'&#39;')+'\')">' +
        '<img class="gc-art" src="'+g.img+'" onerror="this.style.display=\'none\'"><div class="gc-info"><div class="gc-name">'+g.name+'</div></div></div>';
    }).join('') + lib.map(function(z){ return card(z,145); }).join('');
  }
  if (name === 'store') {
    document.getElementById('store-grid').innerHTML = zones.map(function(z){ return card(z,145); }).join('');
  }
}

function scr(id,d){ document.getElementById(id).scrollBy({left:d*340,behavior:'smooth'}); }

function launch(urlEnc, name) {
  var url = decodeURIComponent(urlEnc);
  if (!url || url === '#') return;
  try { parent.postMessage({ __bot: true, type: 'game-open', detail: name }, '*'); } catch(e){}
  var l=document.getElementById('launcher');
  var ll=document.getElementById('ll-load');
  var lf=document.getElementById('ll-frame');
  l.style.display='flex'; ll.style.display='flex'; lf.style.display='none';
  document.getElementById('ll-name').textContent = name;
  document.getElementById('ll-fill').style.width = '0%';
  document.getElementById('ll-pct').textContent = '0%';
  var p=0, iv=setInterval(function(){
    p+=Math.random()*5+2; if(p>90)p=90;
    document.getElementById('ll-fill').style.width=p+'%';
    document.getElementById('ll-pct').textContent=Math.floor(p)+'%';
  },120);
  lf.onload=function(){
    clearInterval(iv);
    document.getElementById('ll-fill').style.width='100%';
    document.getElementById('ll-pct').textContent='100%';
    setTimeout(function(){ll.style.display='none';lf.style.display='block';},400);
  };
  lf.src = url;
}
function closeLaunch(){ document.getElementById('launcher').style.display='none'; document.getElementById('ll-frame').src=''; }

function openSearch(){ document.getElementById('srch').classList.add('open'); setTimeout(function(){document.getElementById('srch-in').focus();},50); }
function closeSearch(){ document.getElementById('srch').classList.remove('open'); }
function doSearch(q) {
  q=q.toLowerCase();
  var all=zones.concat(saved.map(function(g){return {name:g.name,url:g.url,img:g.img};}));
  var res=q?all.filter(function(z){return(z.name||'').toLowerCase().includes(q);}):all;
  document.getElementById('srch-res').innerHTML=res.slice(0,40).map(function(z){
    return z.id ? card(z,145) : '<div class="gc" style="width:145px" onclick="launch(\''+encodeURIComponent(z.url)+'\',\''+z.name+'\')"><div class="gc-art-fallback" style="display:flex">'+z.name+'</div><div class="gc-info"><div class="gc-name">'+z.name+'</div></div></div>';
  }).join('');
}

function openAdd(){ document.getElementById('addm').classList.add('open'); document.getElementById('an').focus(); }
function closeAdd(){ document.getElementById('addm').classList.remove('open'); ['an','au','ai'].forEach(function(i){document.getElementById(i).value='';}); }
function saveGame(){
  var n=document.getElementById('an').value.trim();
  var u=document.getElementById('au').value.trim();
  var img=document.getElementById('ai').value.trim();
  if(!n||!u)return;
  if(!u.startsWith('http'))u='https://'+u;
  saved.push({name:n,url:u,img:img||''});
  localStorage.setItem('ios_g',JSON.stringify(saved));
  buildYour(); closeAdd();
}

(function tick(){ var d=new Date(),h=d.getHours().toString().padStart(2,'0'),m=d.getMinutes().toString().padStart(2,'0'); document.getElementById('clk').textContent=h+':'+m; setTimeout(tick,30000); })();

document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeLaunch();closeSearch();closeAdd();}});
document.getElementById('addm').onclick=function(e){if(e.target===this)closeAdd();};
document.getElementById('srch').onclick=function(e){if(e.target===this)closeSearch();};
</script>
` + T; }

  /* =====================================================================
     HUB — MOVIE/VIDEO GUI
  ===================================================================== */
  if (id === 'cine') { return H + `
<style>
body{background:#000;overflow:hidden}
#hub{height:100vh;display:flex;flex-direction:column}
/* NAV */
#hn{position:absolute;top:0;left:0;right:0;z-index:20;padding:14px 26px;display:flex;align-items:center;gap:22px;background:linear-gradient(rgba(0,0,0,.85),transparent)}
.brand{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:700;flex-shrink:0}
.nl{font-size:13px;font-weight:500;color:rgba(255,255,255,.55);cursor:pointer;transition:.15s;white-space:nowrap;user-select:none}
.nl:hover,.nl.on{color:#fff}
#hs{margin-left:auto;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12);color:#fff;padding:6px 13px;border-radius:5px;outline:none;font-size:13px;width:155px;transition:.2s}
#hs:focus{border-color:rgba(255,255,255,.25);width:210px}
/* HERO */
#hero{position:relative;height:52vh;flex-shrink:0}
#hero-bg{position:absolute;inset:0;background:#06080e}
#hero-frame{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}
#hero-ol{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.85) 0%,rgba(0,0,0,.2) 60%,transparent 100%)}
#hero-c{position:absolute;bottom:36px;left:28px;max-width:44%}
#hero-t{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.1rem,2.3vw,1.8rem);font-weight:700;margin-bottom:8px;text-shadow:0 2px 10px rgba(0,0,0,.8)}
#hero-d{font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:16px}
.hb{padding:9px 20px;border:none;border-radius:5px;font-weight:700;font-size:13px;cursor:pointer;transition:.15s}
.hp{background:#fff;color:#000;margin-right:8px}.hp:hover{background:#ddd}
.hi{background:rgba(60,60,60,.7);color:#fff;border:1px solid rgba(255,255,255,.2)}.hi:hover{background:rgba(80,80,80,.9)}
/* ROWS */
#rows{flex:1;overflow-y:auto;padding-bottom:28px}
#rows::-webkit-scrollbar{width:3px}
#rows::-webkit-scrollbar-thumb{background:#1a1a1a}
.row-sec{margin-top:24px}
.row-lbl{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:600;padding:0 26px;margin-bottom:11px}
.card-row{display:flex;gap:7px;padding:3px 26px 8px;overflow-x:auto;scroll-snap-type:x mandatory}
.card-row::-webkit-scrollbar{display:none}
.vc{flex-shrink:0;width:172px;border-radius:7px;overflow:hidden;cursor:pointer;scroll-snap-align:start;background:#111;border:1px solid #1a1a1a;transition:.22s}
.vc:hover{transform:scale(1.04);border-color:#2e2e2e;box-shadow:0 8px 24px rgba(0,0,0,.7)}
.vc-art{width:100%;height:100px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:rgba(255,255,255,.2);padding:8px;text-align:center;line-height:1.4}
.vc-info{padding:8px 10px 10px}
.vc-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.vc-sub{font-size:10px;color:#444}
/* PASTE MODAL */
#pm{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);backdrop-filter:blur(12px);z-index:100;align-items:center;justify-content:center;flex-direction:column;gap:14px;text-align:center;padding:30px}
#pm.open{display:flex}
#pm h3{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:600}
#pm p{color:#444;font-size:13px;max-width:320px;line-height:1.6}
#pu{background:#111;border:1px solid #222;color:#fff;padding:9px 14px;border-radius:6px;outline:none;font-size:13px;width:100%;max-width:380px}
</style>
<div id="hub">
  <div id="hero">
    <div id="hero-bg"></div>
    <iframe id="hero-frame" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
    <div id="hero-ol"></div>
    <div id="hn">
      <div class="brand">Intellectual Hub</div>
      ${['Home','Anime','Action','Music','Gaming','Movies'].map(function(x,i){return '<span class="nl'+(i===0?' on':'')+'" onclick="showCat(\''+x.toLowerCase()+'\',this)">'+x+'</span>';}).join('')}
      <input id="hs" type="text" placeholder="Search..." onkeydown="if(event.key==='Enter')doS(this.value)">
    </div>
    <div id="hero-c">
      <div id="hero-t">Intellectual Hub</div>
      <div id="hero-d">Paste any YouTube URL to watch it here without leaving the OS.</div>
      <div>
        <button class="hb hp" onclick="openPM()">&#9654; Paste URL</button>
        <button class="hb hi" onclick="document.getElementById('rows').scrollTop+=300">Browse</button>
      </div>
    </div>
  </div>
  <div id="rows"><div id="all-rows"></div></div>
</div>
<div id="pm">
  <h3>Play a video</h3>
  <p>Paste any YouTube link to watch it directly in the hub.</p>
  <input id="pu" type="text" placeholder="https://youtube.com/watch?v=...">
  <div style="display:flex;gap:8px">
    <button style="background:#fff;color:#000;border:none;padding:9px 20px;border-radius:5px;font-weight:700;font-size:13px;cursor:pointer" onclick="playUrl()">Play</button>
    <button style="background:#1a1a1a;color:#555;border:1px solid #1e1e1e;padding:9px 20px;border-radius:5px;font-weight:600;font-size:13px;cursor:pointer" onclick="closePM()">Cancel</button>
  </div>
</div>
<script>
var BG=['#06080e','#0e0608','#060e08','#080610','#100608','#060a10'];
var CATS={
  home:{l:'Trending',i:[{t:'Lo-Fi Radio',id:'5qap5aO4i9A'},{t:'Phonk Mix',id:'Lmc3Q5pOFW0'},{t:'Anime AMV',id:'8MJ7HMFbSCg'},{t:'FPS Highlights',id:'g6gGPnv4Wgo'},{t:'Minecraft',id:'gKNJKce1p8M'},{t:'Chill Beats',id:'lTRiuFIWV54'},{t:'City Nights',id:'BHACKCNDMW8'},{t:'Hip-Hop',id:'f02mOEt11OQ'},{t:'R&B Mix',id:'BEljvkEHhvA'}]},
  anime:{l:'Anime',i:[{t:'AMV Phonk',id:'Lmc3Q5pOFW0'},{t:'AMV Epic',id:'8MJ7HMFbSCg'},{t:'JJK Mix',id:'BEljvkEHhvA'},{t:'One Piece',id:'aaIJb8bRy78'},{t:'Naruto AMV',id:'gKNJKce1p8M'},{t:'Demon Slayer',id:'5mSFGN0VLuU'},{t:'Bleach AMV',id:'f02mOEt11OQ'},{t:'Attack on Titan',id:'BHACKCNDMW8'}]},
  action:{l:'Action',i:[{t:'FPS Clips',id:'g6gGPnv4Wgo'},{t:'Warzone',id:'f02mOEt11OQ'},{t:'Minecraft',id:'gKNJKce1p8M'},{t:'Speedrun',id:'5qap5aO4i9A'},{t:'Battle Royale',id:'BEljvkEHhvA'},{t:'Retro Gaming',id:'BHACKCNDMW8'},{t:'Pro Clips',id:'Lmc3Q5pOFW0'},{t:'Highlights',id:'lTRiuFIWV54'}]},
  music:{l:'Music',i:[{t:'Lo-Fi Radio',id:'5qap5aO4i9A'},{t:'Phonk Drive',id:'Lmc3Q5pOFW0'},{t:'Chill Beats',id:'lTRiuFIWV54'},{t:'Hip-Hop',id:'f02mOEt11OQ'},{t:'Trap Mix',id:'BEljvkEHhvA'},{t:'R&B Vibes',id:'5mSFGN0VLuU'},{t:'Pop Hits',id:'BHACKCNDMW8'},{t:'EDM',id:'gKNJKce1p8M'}]},
  gaming:{l:'Gaming',i:[{t:'Minecraft',id:'gKNJKce1p8M'},{t:'FPS',id:'g6gGPnv4Wgo'},{t:'Retro',id:'BHACKCNDMW8'},{t:'Speedrun',id:'5qap5aO4i9A'},{t:'Warzone',id:'f02mOEt11OQ'},{t:'Roblox',id:'lTRiuFIWV54'},{t:'Highlights',id:'BEljvkEHhvA'},{t:'Funny',id:'Lmc3Q5pOFW0'}]},
  movies:{l:'Movies & Shows',i:[{t:'Action Movies',id:'g6gGPnv4Wgo'},{t:'Anime Full',id:'8MJ7HMFbSCg'},{t:'Documentary',id:'BHACKCNDMW8'},{t:'Comedy Clips',id:'lTRiuFIWV54'},{t:'Drama',id:'BEljvkEHhvA'},{t:'Sci-Fi',id:'5qap5aO4i9A'},{t:'Horror',id:'f02mOEt11OQ'},{t:'Romance',id:'5mSFGN0VLuU'}]}
};
function buildRows(k){
  var html=''; var keys=k?[k]:Object.keys(CATS);
  keys.forEach(function(ck){
    var c=CATS[ck];
    html+='<div class="row-sec"><div class="row-lbl">'+c.l+'</div><div class="card-row">'+
      c.i.map(function(x,i){return'<div class="vc" onclick="pv(\''+x.id+'\',\''+x.t+'\')"><div class="vc-art" style="background:'+BG[i%BG.length]+'">'+x.t+'</div><div class="vc-info"><div class="vc-name">'+x.t+'</div><div class="vc-sub">YouTube</div></div></div>';}).join('')+
      '</div></div>';
  });
  document.getElementById('all-rows').innerHTML=html;
}
function showCat(k,el){document.querySelectorAll('.nl').forEach(function(l){l.classList.remove('on');});el.classList.add('on');buildRows(k==='home'?null:k);}
function pv(id,t){
  document.getElementById('hero-bg').style.display='none';
  var f=document.getElementById('hero-frame');f.style.display='block';
  f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';
  document.getElementById('hero-t').textContent=t;
  document.getElementById('hero-d').textContent='Now playing in hub.';
  closePM();
}
function gv(s){s=(s||'').trim();var m=s.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/ ]{11})/);return m?m[1]:(s.length===11?s:null);}
function playUrl(){var v=gv(document.getElementById('pu').value);if(!v){alert('Paste a valid YouTube URL');return;}pv(v,'Video');}
function openPM(){document.getElementById('pm').classList.add('open');document.getElementById('pu').focus();}
function closePM(){document.getElementById('pm').classList.remove('open');}
function doS(q){buildRows();if(q)document.getElementById('all-rows').insertAdjacentHTML('afterbegin','<div style="padding:22px;font-size:13px;color:#333">Search YouTube for "'+q+'", copy the URL, then use Paste URL to watch it here.</div>');}
document.getElementById('pm').onclick=function(e){if(e.target===this)closePM();};
document.addEventListener('keydown',function(e){if(e.key==='Escape')closePM();});
buildRows();
</script>` + T; }

  /* =====================================================================
     MUSIC — YouTube + SoundCloud (playback prefers YouTube)
  ===================================================================== */
  if (id === 'term') { return H + `
<style>
body{background:#0a0a0a;overflow:hidden;color:#fff}
#mu{height:100vh;display:flex;flex-direction:column}
#mu-tabs{display:flex;border-bottom:1px solid #161616;background:#0a0a0a;flex-shrink:0}
.mu-tb{flex:1;padding:13px 0;text-align:center;font-size:13px;font-weight:700;letter-spacing:.4px;cursor:pointer;color:#555;transition:.15s;border-bottom:2px solid transparent}
.mu-tb.on{color:#fff;border-bottom-color:#cc0000}
.mu-tb.sc.on{border-bottom-color:#ff5500}
.mu-tb:hover{color:#bbb}
#mu-body{flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0}
.mu-view{flex:1;overflow-y:auto;padding:20px;display:none}
.mu-view.on{display:block}
.mu-view::-webkit-scrollbar{width:4px}.mu-view::-webkit-scrollbar-thumb{background:#222}
.mu-row{display:flex;gap:8px;margin-bottom:18px}
.mu-inp{flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:10px 14px;border-radius:6px;outline:none;font-size:13px}
.mu-inp:focus{border-color:#2a2a2a}
.mu-btn{border:none;color:#fff;padding:10px 18px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer}
.mu-btn.yt{background:#cc0000}.mu-btn.yt:hover{background:#e50000}
.mu-btn.sc{background:#ff5500}.mu-btn.sc:hover{background:#ff6e1f}
.mu-sec{font-size:1.05rem;font-weight:800;margin:18px 0 12px}
.mu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.mu-card{background:#111;border:1px solid #161616;border-radius:8px;overflow:hidden;cursor:pointer;transition:.15s}
.mu-card:hover{background:#181818;border-color:#222}
.mu-thumb{aspect-ratio:16/9;background:#1a1a1a;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.mu-thumb img{width:100%;height:100%;object-fit:cover}
.mu-ptri{position:absolute;width:40px;height:40px;background:rgba(0,0,0,.7);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:.15s}
.mu-card:hover .mu-ptri{opacity:1}
.mu-card-t{padding:10px 12px 4px;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mu-card-s{padding:0 12px 10px;font-size:11px;color:#888}
.mu-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.mu-chip{background:#111;border:1px solid #1a1a1a;padding:7px 14px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer}
.mu-chip:hover{background:#181818}
#mu-player{height:240px;flex-shrink:0;background:#000;border-top:1px solid #161616;display:flex;flex-direction:column}
#mu-pl-hd{padding:8px 14px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#888}
#mu-pl-ti{font-weight:700;color:#fff;font-size:13px;max-width:60%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mu-pl-src{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600}
.mu-dot{width:7px;height:7px;border-radius:50%;background:#cc0000}
.mu-dot.sc{background:#ff5500}
#mu-pl-body{flex:1;position:relative;background:#000}
#mu-yt,#mu-sc{position:absolute;inset:0;width:100%;height:100%;border:none}
#mu-sc{display:none}
#mu-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#333;font-size:13px;font-weight:600}
</style>
<div id="mu">
  <div id="mu-tabs">
    <div class="mu-tb on" data-v="yt" onclick="muTab('yt')">YouTube</div>
    <div class="mu-tb sc" data-v="sc" onclick="muTab('sc')">SoundCloud</div>
  </div>
  <div id="mu-body">
    <div id="mu-v-yt" class="mu-view on">
      <div class="mu-row">
        <input id="mu-yt-q" class="mu-inp" placeholder="Search YouTube or paste a video URL..." onkeydown="if(event.key==='Enter')muYtGo()">
        <button class="mu-btn yt" onclick="muYtGo()">Play</button>
      </div>
      <div class="mu-chips">${['Lo-Fi','Hip-Hop','Pop','Rock','Phonk','R&B','Electronic','Jazz','K-Pop','Classical'].map(function(g){return '<div class="mu-chip" onclick="muYtSearch(\''+g+' mix\')">'+g+'</div>';}).join('')}</div>
      <div class="mu-sec">Featured</div>
      <div class="mu-grid" id="mu-yt-grid"></div>
    </div>
    <div id="mu-v-sc" class="mu-view">
      <div class="mu-row">
        <input id="mu-sc-q" class="mu-inp" placeholder="Paste a SoundCloud URL..." onkeydown="if(event.key==='Enter')muScGo()">
        <button class="mu-btn sc" onclick="muScGo()">Play</button>
      </div>
      <div class="mu-chips">${[['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap'],['Lo-Fi','https://soundcloud.com/lofimusic'],['Pop','https://soundcloud.com/charts/top?genre=pop'],['R&B','https://soundcloud.com/charts/top?genre=rnb'],['Electronic','https://soundcloud.com/charts/top?genre=electronic'],['Rock','https://soundcloud.com/charts/top?genre=rock'],['Indie','https://soundcloud.com/charts/top?genre=alternative'],['Jazz','https://soundcloud.com/charts/top?genre=jazz']].map(function(x){return '<div class="mu-chip" onclick="muScLoad(\''+x[1]+'\',\''+x[0]+'\')">'+x[0]+'</div>';}).join('')}</div>
      <div class="mu-sec">SoundCloud Charts</div>
      <div class="mu-grid" id="mu-sc-grid"></div>
    </div>
    <div id="mu-player">
      <div id="mu-pl-hd">
        <div id="mu-pl-ti">Nothing playing</div>
        <div id="mu-pl-src"><span class="mu-dot"></span><span id="mu-pl-srct">YouTube</span></div>
      </div>
      <div id="mu-pl-body">
        <div id="mu-empty">Pick a track to start playing</div>
        <iframe id="mu-yt" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
        <iframe id="mu-sc" allow="autoplay"></iframe>
      </div>
    </div>
  </div>
</div>
<script>
var MU_YT_FEAT=[
  {t:"Lo-Fi Radio · Chill Beats",a:"Chillhop",id:"jfKfPfyJRdk"},
  {t:"Phonk Mix 2025",a:"Phonk",id:"Lmc3Q5pOFW0"},
  {t:"Hip-Hop Hits",a:"Various",id:"f02mOEt11OQ"},
  {t:"Chill Vibes",a:"Various",id:"lTRiuFIWV54"},
  {t:"R&B Slow Jams",a:"Various",id:"BEljvkEHhvA"},
  {t:"Study Beats",a:"Lo-Fi",id:"5mSFGN0VLuU"},
  {t:"Pop Top Hits",a:"Various",id:"WvLlw7N9vXY"},
  {t:"EDM Mix",a:"Various",id:"fLexgOxsZu0"}
];
var MU_SC_FEAT=[
  {t:"Top 50 Global",a:"Charts",url:"https://soundcloud.com/charts/top"},
  {t:"New & Hot",a:"Trending",url:"https://soundcloud.com/charts/new"},
  {t:"Lo-Fi",a:"Playlist",url:"https://soundcloud.com/lofimusic"},
  {t:"Hip-Hop & Rap",a:"Genre",url:"https://soundcloud.com/charts/top?genre=hiphoprap"},
  {t:"Electronic",a:"Genre",url:"https://soundcloud.com/charts/top?genre=electronic"},
  {t:"Pop",a:"Genre",url:"https://soundcloud.com/charts/top?genre=pop"},
  {t:"R&B",a:"Genre",url:"https://soundcloud.com/charts/top?genre=rnb"},
  {t:"Indie",a:"Genre",url:"https://soundcloud.com/charts/top?genre=alternative"}
];
function muTab(v){
  document.querySelectorAll('.mu-tb').forEach(function(t){t.classList.toggle('on',t.dataset.v===v);});
  document.querySelectorAll('.mu-view').forEach(function(s){s.classList.remove('on');});
  document.getElementById('mu-v-'+v).classList.add('on');
}
function muEsc(s){return String(s).replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'");}
function muBuildYT(){
  document.getElementById('mu-yt-grid').innerHTML=MU_YT_FEAT.map(function(d){
    return '<div class="mu-card" onclick="muYtPlay(\''+d.id+'\',\''+muEsc(d.t)+'\',\''+muEsc(d.a)+'\')"><div class="mu-thumb"><img src="https://i.ytimg.com/vi/'+d.id+'/mqdefault.jpg" onerror="this.style.display=\'none\'"><div class="mu-ptri"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div></div><div class="mu-card-t">'+d.t+'</div><div class="mu-card-s">'+d.a+'</div></div>';
  }).join('');
}
function muBuildSC(){
  document.getElementById('mu-sc-grid').innerHTML=MU_SC_FEAT.map(function(d){
    return '<div class="mu-card" onclick="muScLoad(\''+d.url+'\',\''+muEsc(d.t)+'\')"><div class="mu-thumb" style="background:linear-gradient(135deg,#ff5500,#ff8c00);color:#fff;font-weight:800;font-size:12px;letter-spacing:1px;text-align:center;padding:8px">'+d.t.toUpperCase()+'</div><div class="mu-card-t">'+d.t+'</div><div class="mu-card-s">'+d.a+'</div></div>';
  }).join('');
}
function muExtractYT(s){
  s=(s||'').trim();
  if(/^[A-Za-z0-9_-]{11}$/.test(s))return s;
  var m=s.match(/(?:youtube\\.com\\/(?:watch\\?v=|embed\\/|v\\/|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
  return m?m[1]:null;
}
function muYtPlay(id,t,a){
  document.getElementById('mu-empty').style.display='none';
  var sc=document.getElementById('mu-sc');sc.style.display='none';sc.src='';
  var p=document.getElementById('mu-yt');p.style.display='block';
  p.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';
  document.getElementById('mu-pl-ti').textContent=t;
  document.getElementById('mu-pl-srct').textContent='YouTube · '+(a||'');
  document.querySelector('#mu-pl-src .mu-dot').classList.remove('sc');
}
function muYtGo(){
  var raw=document.getElementById('mu-yt-q').value.trim();if(!raw)return;
  var id=muExtractYT(raw);if(id){muYtPlay(id,'Video','YouTube');return;}
  muYtSearch(raw);
}
function muYtSearch(q){
  document.getElementById('mu-empty').style.display='none';
  var sc=document.getElementById('mu-sc');sc.style.display='none';sc.src='';
  var p=document.getElementById('mu-yt');p.style.display='block';
  p.src='/service/'+btoa('https://www.youtube.com/results?search_query='+encodeURIComponent(q));
  document.getElementById('mu-pl-ti').textContent='Search: '+q;
  document.getElementById('mu-pl-srct').textContent='YouTube · pick a video';
  document.querySelector('#mu-pl-src .mu-dot').classList.remove('sc');
}
function muScLoad(url,t){
  if(!url)return;
  document.getElementById('mu-empty').style.display='none';
  var yt=document.getElementById('mu-yt');yt.style.display='none';yt.src='';
  var p=document.getElementById('mu-sc');p.style.display='block';
  p.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%23ff5500&auto_play=true&show_comments=false&hide_related=true&visual=true';
  document.getElementById('mu-pl-ti').textContent=t||'SoundCloud';
  document.getElementById('mu-pl-srct').textContent='SoundCloud';
  document.querySelector('#mu-pl-src .mu-dot').classList.add('sc');
}
function muScGo(){
  var v=document.getElementById('mu-sc-q').value.trim();if(!v)return;
  if(!/^https?:\\/\\//.test(v))v='https://soundcloud.com/'+v.replace(/^\\//,'');
  muScLoad(v,'Custom');
}
muBuildYT();muBuildSC();
</script>` + T; }

  /* =====================================================================
     DISCORD — invite card with purple glow + real QR
  ===================================================================== */
  if (id === 'discord') { return H + `
<style>
body{overflow:hidden;background:#000}
#dc{height:100vh;display:flex;flex-direction:column}
#dc-bar{display:flex;align-items:center;gap:10px;padding:8px 14px;background:#0a0a0a;border-bottom:1px solid #161616;flex-shrink:0}
.dc-t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700;color:#fff}
.dc-sub{font-size:11px;color:#444}
.dc-b{margin-left:auto;background:#5865f2;border:none;color:#fff;padding:6px 14px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer}
.dc-b:hover{background:#4752c4}
#dc-frame{flex:1;border:none;background:#000;width:100%}
</style>
<div id="dc">
  <div id="dc-bar">
    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" style="width:18px;height:18px">
    <div class="dc-t">Discord</div>
    <span class="dc-sub">Routing through built-in proxy</span>
    <button class="dc-b" onclick="window.open('https://discord.gg/Sduv8uDjxF','_blank','noopener,noreferrer')">Join Server</button>
  </div>
  <iframe id="dc-frame" src="" allow="autoplay;fullscreen;clipboard-write;camera;microphone"></iframe>
</div>
<script>document.getElementById('dc-frame').src='/service/'+btoa('https://discord.com/app');<\/script>` + T; }

  /* =====================================================================
     BROWSER
  ===================================================================== */
  if (id === 'web') { return H + `<style>body{overflow:hidden}#b{height:100vh;display:flex;flex-direction:column}#t{padding:8px 10px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;gap:6px;align-items:center;flex-shrink:0}.nb{background:#111;border:1px solid #1a1a1a;color:#666;width:26px;height:26px;border-radius:50%;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.12s}.nb:hover{color:#aaa}#url{flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 13px;border-radius:18px;outline:none;font-size:13px;font-weight:500;transition:.2s}#url:focus{border-color:#2a2a2a}#go{background:#fff;color:#000;border:none;padding:7px 15px;border-radius:18px;font-weight:700;font-size:13px;cursor:pointer;flex-shrink:0}#go:hover{background:#ddd}#pbar{padding:6px 12px;background:#060606;border-bottom:1px solid #0d0d0d;display:flex;align-items:center;gap:7px;flex-shrink:0}#pdot{width:6px;height:6px;border-radius:50%;background:#4a7;flex-shrink:0}#plbl{font-size:10px;font-weight:600;color:#2a2a2a;flex-shrink:0;text-transform:uppercase;letter-spacing:.5px}#pin{flex:1;background:transparent;border:none;color:#2a2a2a;font-size:11px;outline:none}#bd{flex:1;position:relative}#ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:30px;text-align:center}#mf{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}</style><div id="b"><div id="t"><div class="nb" onclick="bk()">&#8249;</div><div class="nb" onclick="fw()">&#8250;</div><div class="nb" onclick="rl()">&#8635;</div><input id="url" type="text" placeholder="Search or enter a URL..." onkeydown="if(event.key==='Enter')go()"><button id="go" onclick="go()">Go</button></div><div id="pbar"><div id="pdot"></div><span id="plbl">Proxy</span><input id="pin" type="text" value="Built-in proxy active" readonly></div><div id="bd"><div id="ph"><div style="font-size:1.6rem;color:#111">&#128274;</div><div style="font-size:.85rem;font-weight:600;color:#111">Enter a URL to browse</div><div style="font-size:12px;color:#0d0d0d;max-width:240px;line-height:1.7;margin-top:4px">Your Webshare proxies are built into the server. All sites route through them automatically.</div></div><iframe id="mf" allow="autoplay;fullscreen;clipboard-write;camera;microphone" allowfullscreen></iframe></div></div><script>function go(){var raw=document.getElementById("url").value.trim();if(!raw)return;var url=raw.startsWith("http")?raw:(raw.includes(".")&&!raw.includes(" ")?"https://"+raw:"https://www.google.com/search?q="+encodeURIComponent(raw));var f=document.getElementById("mf");document.getElementById("ph").style.display="none";f.style.display="block";f.src="/service/"+btoa(url);}function bk(){try{document.getElementById("mf").contentWindow.history.back();}catch(e){}}function fw(){try{document.getElementById("mf").contentWindow.history.forward();}catch(e){}}function rl(){var f=document.getElementById("mf");if(f.src&&f.src!=="about:blank")f.src=f.src;}<\/script>` + T; }

  /* =====================================================================
     ROBLOX — proxy through built-in server
  ===================================================================== */
  if (id === 'roblox') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}#f{flex:1;border:none}</style><div id="r"><div id="h"><div class="t">Roblox</div><span style="font-size:11px;color:#333;margin-left:8px">Routing through built-in proxy</span></div><iframe id="f" src="" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>document.getElementById("f").src="/service/"+btoa("https://www.roblox.com");<\/script>` + T; }

  /* =====================================================================
     GEFORCE NOW — proxy through built-in server
  ===================================================================== */
  if (id === 'Geforce') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}#f{flex:1;border:none}</style><div id="r"><div id="h"><div class="t">GeForce Now</div><span style="font-size:11px;color:#333;margin-left:8px">Routing through built-in proxy</span></div><iframe id="f" src="" allow="autoplay;fullscreen;gamepad"></iframe></div><script>document.getElementById("f").src="/service/"+btoa("https://play.geforcenow.com");<\/script>` + T; }

  /* =====================================================================
     ANIME — 9animetv.to via built-in proxy
  ===================================================================== */
  if (id === 'anime') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.t{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}#f{flex:1;border:none;background:#000}</style><div id="r"><div id="h"><div class="t">Anime</div><span style="font-size:11px;color:#333;margin-left:8px">9animetv.to · routing through built-in proxy</span></div><iframe id="f" src="" allow="autoplay;fullscreen;encrypted-media;picture-in-picture"></iframe></div><script>document.getElementById("f").src="/service/"+btoa("https://9animetv.to/home");<\/script>` + T; }

  /* =====================================================================
     AI
  ===================================================================== */
  if (id === 'ciniai') { return H + `<style>body{overflow:hidden}#r{height:100vh;display:flex;flex-direction:column}#h{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap}.ttl{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:700}.tabs{display:flex;gap:5px;flex-wrap:wrap}.tab{background:#111;border:1px solid #1a1a1a;color:#555;padding:4px 13px;border-radius:14px;font-size:12px;font-weight:600;cursor:pointer;transition:.12s}.tab:hover{color:#aaa}.tab.on{background:#fff;color:#000;border-color:#fff}#f{flex:1;border:none;background:#111}</style><div id="r"><div id="h"><div class="ttl">AI</div><div class="tabs">${[['ChatGPT','gpt','https://chat.openai.com'],['Claude','cld','https://claude.ai'],['Gemini','gem','https://gemini.google.com'],['Perplexity','perp','https://perplexity.ai']].map(function(x){return'<div id="t-'+x[1]+'" class="tab" onclick="load(\''+x[2]+'\',\''+x[1]+'\')">'+x[0]+'</div>';}).join('')}</div></div><iframe id="f" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>var c='',cu='';function load(url,key){c=key;cu=url;document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});var t=document.getElementById('t-'+key);if(t)t.classList.add('on');document.getElementById('f').src='/service/'+btoa(url);}load('https://chat.openai.com','gpt');<\/script>` + T; }

  /* =====================================================================
     SETTINGS
  ===================================================================== */
  if (id === 'settings') {
    var rows = ['optBg|Optimized background|Disables animated background','shortBoot|Fast boot|Skip the startup animation','idleLock|Auto-lock|Lock after 3 minutes','redirectConfirm|Redirect warning|Helps block GoGuardian'].map(function(r) {
      var p=r.split('|');
      return '<div class="c"><div class="ci"><strong>'+p[1]+'</strong><small>'+p[2]+'</small></div><label class="tog"><input type="checkbox" id="c-'+p[0]+'" data-key="'+p[0]+'" onchange="W(this)"><span class="ts"></span></label></div>';
    }).join('');
    var swatches = ['#fff','#4f8ef7','#f74f4f','#4ff78e','#f7c14f','#c14ff7','#ff6b35','#1db954'].map(function(c){
      return '<div class="sw" style="background:'+c+'" onclick="window.parent.applyAccentColor(\''+c+'\')"></div>';
    }).join('');
    return H + '<style>body{overflow-y:auto;height:auto;min-height:100vh}.w{padding:20px;max-width:500px;margin:0 auto}.h{font-size:.7rem;font-weight:700;color:#444;border-bottom:1px solid #111;padding-bottom:8px;margin-bottom:12px;margin-top:22px;text-transform:uppercase;letter-spacing:.5px}.h:first-child{margin-top:0}.c{background:#0d0d0d;border:1px solid #111;padding:12px 14px;border-radius:8px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;gap:12px}.ci{display:flex;flex-direction:column;gap:2px}strong{font-size:13px;font-weight:600}small{font-size:11px;color:#333;display:block}.tog{position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0}.tog input{opacity:0;width:0;height:0}.ts{position:absolute;cursor:pointer;inset:0;background:#1a1a1a;border-radius:20px;transition:.25s;border:1px solid #222}.ts:before{position:absolute;content:"";height:13px;width:13px;left:3px;bottom:3px;background:#333;transition:.25s;border-radius:50%}input:checked+.ts{background:#fff;border-color:#fff}input:checked+.ts:before{transform:translateX(16px);background:#000}select{background:#111;color:#fff;border:1px solid #1a1a1a;padding:5px 8px;border-radius:5px;outline:none;font-size:12px;font-family:Inter,sans-serif}.pk{width:34px;height:26px;background:#111;border:1px solid #1a1a1a;color:#fff;text-align:center;font-size:.9rem;font-weight:600;outline:none;border-radius:4px}.sw{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;display:inline-block;margin-right:5px;vertical-align:middle;transition:.15s}.sw:hover{border-color:#fff}.inp{background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 10px;border-radius:5px;outline:none;font-size:12px}</style>' +
      '<div class="w"><div class="h">Performance</div>'+rows+
      '<div class="h">Privacy</div>'+
      '<div class="c"><div class="ci"><strong>Tab disguise</strong><small>Make this tab look like another site</small></div><select id="clk" onchange="window.parent.updateCloak(this.value)"><option value="none">None</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option></select></div>'+
      '<div class="c"><div class="ci"><strong>Panic key</strong><small>Press to instantly close the tab</small></div><input class="pk" type="text" id="pk" maxlength="1" oninput="window.parent.updateSysSetting(\'panicKey\',this.value)"></div>'+
      '<div class="h">Appearance</div>'+
      '<div class="c" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="ci"><strong>Accent color</strong><small>Changes highlights across the OS</small></div><div style="margin-top:8px">'+swatches+'</div></div>'+
      '<div class="c" style="flex-direction:column;align-items:flex-start;gap:8px"><div class="ci"><strong>Custom wallpaper</strong><small>Add any image or video URL</small></div><div style="display:flex;gap:6px;width:100%;margin-top:4px"><input class="inp" id="wn" type="text" placeholder="Name" style="width:100px"><input class="inp" id="wu" type="text" placeholder="URL" style="flex:1;min-width:100px"><button onclick="AW()" style="background:#fff;color:#000;border:none;padding:7px 14px;border-radius:5px;font-weight:700;font-size:12px;cursor:pointer">Add</button></div></div></div>'+
      '<script>(function(){var p=window.parent.sysConfig;["optBg","shortBoot","idleLock","redirectConfirm"].forEach(function(k){var cb=document.getElementById("c-"+k);if(cb){cb.checked=!!p[k];syncT(cb);}});var cl=document.getElementById("clk");if(cl)cl.value=p.cloak||"none";var pk=document.getElementById("pk");if(pk)pk.value=p.panicKey||"";})();function W(cb){var k=cb.getAttribute("data-key");window.parent.updateSysSetting(k,cb.checked);syncT(cb);}function syncT(cb){var t=cb.nextElementSibling;t.style.background=cb.checked?"#fff":"#1a1a1a";t.style.borderColor=cb.checked?"#fff":"#222";}function AW(){var n=document.getElementById("wn").value.trim(),u=document.getElementById("wu").value.trim();if(!n||!u)return;window.parent.addCustomWallpaper(n,u);document.getElementById("wn").value="";document.getElementById("wu").value="";}<\/script>' + T;
  }

  return H + '<div style="height:100%;display:flex;align-items:center;justify-content:center"><p style="color:#1e1e1e;font-size:13px;font-weight:600">App not configured</p></div>' + T;
}

// ── WINDOWS ───────────────────────────────────────────────────────────────────
function toggleApp(id){var w=document.getElementById('win-'+id);if(w){if(w.classList.contains('minimized')){w.classList.remove('minimized');w.classList.add('active');w.style.zIndex=++highestZ;activeWindowId=id;startImmersiveMode(w);}else if(activeWindowId===id){minimizeWindow(id);}else{w.style.zIndex=++highestZ;activeWindowId=id;startImmersiveMode(w);}}else{openWindow(id);}}
function openWindow(id){var sm=document.getElementById('start-menu');if(sm){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}var layer=document.getElementById('windows-layer'),win=document.getElementById('win-'+id);if(!win){var dat=APPS[id]||{title:'APP',internal:true};win=document.createElement('div');win.id='win-'+id;win.className='window header-visible';win.style.zIndex=++highestZ;win.innerHTML='<div class="win-header" onmousedown="DragSystem.startWinDrag(event,\''+id+'\')"><div class="win-title">'+dat.title+'</div><div class="win-controls"><div class="win-btn btn-min" onclick="minimizeWindow(\''+id+'\')"></div><div class="win-btn btn-close" onclick="closeWindow(\''+id+'\')"></div></div></div><div class="win-body"><iframe id="frame-'+id+'"></iframe></div>';layer.appendChild(win);requestAnimationFrame(function(){requestAnimationFrame(function(){win.classList.add('active');});});var f=document.getElementById('frame-'+id);if(f)f.srcdoc=getAppSrcdoc(id);}else{win.classList.remove('minimized');win.classList.add('active');win.style.zIndex=++highestZ;}activeWindowId=id;startImmersiveMode(win);}
function closeWindow(id){var w=document.getElementById('win-'+id);if(w){w.classList.remove('active');setTimeout(function(){if(w.parentNode)w.remove();},230);}if(activeWindowId===id)activeWindowId=null;endImmersiveMode();}
function minimizeWindow(id){var w=document.getElementById('win-'+id);if(w){var dock=document.getElementById('dock-container');if(dock){var dr=dock.getBoundingClientRect(),wr=w.getBoundingClientRect();w.style.setProperty('--min-tx',(dr.left+dr.width/2-(wr.left+wr.width/2))+'px');w.style.setProperty('--min-ty',(dr.top-wr.top)+'px');}w.classList.add('minimized');w.classList.remove('active');if(activeWindowId===id)activeWindowId=null;}endImmersiveMode();}
function startImmersiveMode(win){document.getElementById('dock-container').classList.add('dock-hidden');win.classList.remove('header-visible');}
function endImmersiveMode(){var aw=document.querySelectorAll('.window.active:not(.minimized)');if(aw.length===0){document.getElementById('dock-container').classList.remove('dock-hidden');activeWindowId=null;}else{var t=aw[aw.length-1];activeWindowId=t.id.replace('win-','');t.style.zIndex=++highestZ;startImmersiveMode(t);}}
var dockTimer,dEl=document.getElementById('dock-container');
document.getElementById('bottom-trigger').addEventListener('mouseenter',function(){dEl.classList.remove('dock-hidden');clearTimeout(dockTimer);});
dEl.addEventListener('mouseleave',function(){if(document.querySelectorAll('.window.active:not(.minimized)').length>0)dockTimer=setTimeout(function(){dEl.classList.add('dock-hidden');},1000);});
dEl.addEventListener('mouseenter',function(){clearTimeout(dockTimer);});
document.getElementById('top-trigger').addEventListener('mouseenter',function(){if(activeWindowId){var w=document.getElementById('win-'+activeWindowId);if(w&&!w.classList.contains('minimized'))w.classList.add('header-visible');}});
document.addEventListener('mouseover',function(e){if(e.target.closest('.win-header')){if(activeWindowId){var w=document.getElementById('win-'+activeWindowId);if(w)w.classList.add('header-visible');}}else if(activeWindowId&&!e.target.closest('#top-trigger')){var w=document.getElementById('win-'+activeWindowId);if(w)w.classList.remove('header-visible');}});

// ── DESKTOP ───────────────────────────────────────────────────────────────────
var desktopLayout=JSON.parse(localStorage.getItem('intel_desktop_v2'))||[];
function saveDesktop(){localStorage.setItem('intel_desktop_v2',JSON.stringify(desktopLayout));loadDesktop();if(window.saveToCloud)window.saveToCloud();}
function loadDesktop(){var c=document.getElementById('desktop-area');document.querySelectorAll('.desktop-app').forEach(function(e){e.remove();});desktopLayout.forEach(function(item,idx){var d=document.createElement('div');d.className='desktop-app';d.style.left=item.x+'px';d.style.top=item.y+'px';d.setAttribute('data-idx',idx);if(item.type==='folder'){var gHTML='<div class="d-folder-grid">';item.apps.slice(0,4).forEach(function(a){if(APPS[a])gHTML+='<img src="'+APPS[a].icon+'">';});gHTML+='</div>';if(!item.hideName)gHTML+='<div class="d-label">'+(item.customName||'Folder')+'</div>';d.innerHTML=gHTML;d.onclick=function(ev){if(DragSystem.isDragMove)return;ev.stopPropagation();if(!this.classList.contains('expanded-folder')){closeAllFolders();expandFolder(this,item,idx);}};}else{var a=APPS[item.id];if(a){d.innerHTML='<img src="'+(item.customIcon||a.icon)+'" class="d-icon">'+(item.hideName?'':'<div class="d-label">'+(item.customName||a.title)+'</div>');d.ondblclick=function(ev){ev.stopPropagation();toggleApp(item.id);};}}d.onmousedown=function(ev){ev.stopPropagation();if(ev.button===0)DragSystem.start(ev,d,'desktop',idx);};d.oncontextmenu=function(ev){ev.preventDefault();ev.stopPropagation();hideAllCtx();var m=document.getElementById('app-context-menu');if(m){m.style.display='block';m.style.left=ev.pageX+'px';m.style.top=ev.pageY+'px';m.setAttribute('data-target-idx',idx);}};c.appendChild(d);});}
function expandFolder(el,dat,idx){el.classList.add('expanded-folder');var h='<div class="folder-header">'+(dat.customName||'Folder')+' <i class="fas fa-times" onclick="closeAllFolders(event)"></i></div><div class="folder-grid-expanded">';dat.apps.forEach(function(aId){var info=APPS[aId];if(info)h+='<div class="f-app" onclick="event.stopPropagation();toggleApp(\''+aId+'\')"><img src="'+info.icon+'"><span>'+info.title+'</span></div>';});h+='</div>';el.innerHTML=h;setTimeout(function(){var rect=el.getBoundingClientRect();document.querySelectorAll('.desktop-app:not(.expanded-folder)').forEach(function(s){var sr=s.getBoundingClientRect();if(!(rect.right<sr.left||rect.left>sr.right||rect.bottom<sr.top||rect.top>sr.bottom)){s.style.transform='translateY('+(rect.bottom-sr.top+20)+'px)';s.setAttribute('data-pushed','true');}});},50);}
function closeAllFolders(ev){if(ev)ev.stopPropagation();document.querySelectorAll('.expanded-folder').forEach(function(o){o.classList.remove('expanded-folder');});document.querySelectorAll('.desktop-app[data-pushed="true"]').forEach(function(j){j.style.transform='';j.removeAttribute('data-pushed');});setTimeout(loadDesktop,250);}
function setupAppContextMenu(){var m=document.getElementById('app-context-menu');if(!m)return;m.innerHTML='<li class="ctx-item" id="ctx-rename" role="menuitem" tabindex="0"><i class="fas fa-edit fa-fw"></i> Rename</li><li class="ctx-item" id="ctx-hidename" role="menuitem" tabindex="0"><i class="fas fa-eye-slash fa-fw"></i> Toggle Name</li><li class="ctx-item" id="ctx-changeicon" role="menuitem" tabindex="0"><i class="fas fa-image fa-fw"></i> Change Icon</li><li class="ctx-separator"></li><li class="ctx-item" id="ctx-delete" role="menuitem" tabindex="0"><i class="fas fa-trash fa-fw" style="color:#aaa"></i> Remove</li>';document.getElementById('ctx-rename').onclick=function(){var i=m.getAttribute('data-target-idx'),nm=prompt("New name:",desktopLayout[i].customName||"");if(nm!==null){desktopLayout[i].customName=nm.trim()||"App";saveDesktop();}m.style.display='none';};document.getElementById('ctx-hidename').onclick=function(){var i=m.getAttribute('data-target-idx');desktopLayout[i].hideName=!desktopLayout[i].hideName;saveDesktop();m.style.display='none';};document.getElementById('ctx-changeicon').onclick=function(){var i=m.getAttribute('data-target-idx'),url=prompt("Image URL for icon:");if(url){desktopLayout[i].customIcon=url;saveDesktop();}m.style.display='none';};document.getElementById('ctx-delete').onclick=function(){var i=m.getAttribute('data-target-idx');desktopLayout.splice(i,1);saveDesktop();m.style.display='none';};}
document.addEventListener('contextmenu',function(e){var ids=['desktop-area','windows-layer','bg-video','bg-img','snow-fx'];if(ids.includes(e.target.id)||e.target.tagName==='BODY'||e.target.closest('#right-sidebar')){e.preventDefault();hideAllCtx();var m=document.getElementById('desktop-context-menu');if(m){m.style.display='block';var x=e.pageX,y=e.pageY;if(x+200>window.innerWidth)x=window.innerWidth-200;if(y+100>window.innerHeight)y=window.innerHeight-100;m.style.left=x+'px';m.style.top=y+'px';}}});
window.toggleDesktopSize=function(l){document.getElementById('desktop-area').classList[l?'add':'remove']('desktop-large-mode');document.getElementById('desktop-context-menu').style.display='none';};

// ── DRAG SYSTEM ───────────────────────────────────────────────────────────────
var DragSystem={dragging:false,startPos:{x:0,y:0},sourceType:null,sourceEl:null,idx:null,appId:null,proxy:document.getElementById('drag-proxy'),pImg:document.getElementById('proxy-img'),badge:document.getElementById('folder-badge'),init:function(){window.addEventListener('mousemove',function(e){DragSystem.move(e);});window.addEventListener('mouseup',function(e){DragSystem.end(e);});},start:function(e,el,type,id){this.startPos={x:e.clientX,y:e.clientY};this.sourceType=type;this.sourceEl=el;this.isDragMove=false;if(type==='drawer'||type==='dock')this.appId=id;else if(type==='desktop'){this.idx=id;this.sourceEl.style.opacity='0.5';}},startWinDrag:function(e,id){this.startPos={x:e.clientX,y:e.clientY};this.sourceType='window';this.sourceEl=document.getElementById('win-'+id);this.isDragMove=false;},move:function(e){if(!this.sourceEl)return;var dx=Math.abs(e.clientX-this.startPos.x),dy=Math.abs(e.clientY-this.startPos.y);if(dx>3||dy>3){this.dragging=true;this.isDragMove=true;if(this.sourceType==='desktop'||this.sourceType==='drawer'||this.sourceType==='dock'){if(this.sourceType==='drawer')toggleAppDrawer();this.proxy.style.display='block';this.proxy.style.left=(e.clientX-25)+'px';this.proxy.style.top=(e.clientY-25)+'px';if(this.sourceType==='drawer'||this.sourceType==='dock'){if(APPS[this.appId])this.pImg.src=APPS[this.appId].icon;}else{var itm=desktopLayout[this.idx];if(itm.type==='app'&&APPS[itm.id])this.pImg.src=APPS[itm.id].icon;else{this.pImg.src='';this.badge.style.display='flex';this.badge.innerText=itm.apps.length;}}}}},end:function(e){if(!this.sourceEl)return;if(!this.isDragMove&&this.sourceType==='desktop'){this.reset();return;}if(!this.dragging){this.reset();return;}if(this.sourceType==='desktop'||this.sourceType==='drawer'||this.sourceType==='dock'){var nx=Math.round((e.clientX-40)/90)*90,ny=Math.round((e.clientY-40)/100)*100;if(e.clientY>window.innerHeight-80){if(this.sourceType==='desktop')desktopLayout.splice(this.idx,1);}else{var tIdx=-1;document.querySelectorAll('.desktop-app').forEach(function(a){if(a!==DragSystem.sourceEl){var r=a.getBoundingClientRect();if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom)tIdx=a.dataset.idx;}});if(tIdx>-1){var targ=desktopLayout[tIdx],drp=(DragSystem.sourceType==='drawer'||DragSystem.sourceType==='dock')?[DragSystem.appId]:(desktopLayout[DragSystem.idx].type==='app'?[desktopLayout[DragSystem.idx].id]:desktopLayout[DragSystem.idx].apps);if(targ.type==='app'){targ.type='folder';targ.apps=[targ.id].concat(drp);delete targ.id;}else{targ.apps.push.apply(targ.apps,drp);}if(DragSystem.sourceType==='desktop')desktopLayout.splice(DragSystem.idx,1);}else{if(DragSystem.sourceType==='drawer'||DragSystem.sourceType==='dock')desktopLayout.push({type:'app',id:DragSystem.appId,x:nx,y:ny});else{desktopLayout[DragSystem.idx].x=nx;desktopLayout[DragSystem.idx].y=ny;}}}saveDesktop();}this.reset();},reset:function(){this.dragging=false;if(this.sourceEl)this.sourceEl.style.opacity='1';this.sourceEl=null;this.proxy.style.display='none';this.badge.style.display='none';}};
DragSystem.init();

// Dock hover handled by CSS only — no JS needed

// ── SNOW ──────────────────────────────────────────────────────────────────────
var cvsSnow=document.getElementById('snow-fx');
if(cvsSnow){var ctxSnow=cvsSnow.getContext('2d');cvsSnow.width=window.innerWidth;cvsSnow.height=window.innerHeight;var flakes=[];for(var f=0;f<30;f++)flakes.push({x:Math.random()*cvsSnow.width,y:Math.random()*cvsSnow.height,r:Math.random()*2,s:Math.random()+0.5});(function ds(){setTimeout(function(){requestAnimationFrame(ds);},sysConfig.optBg?500:16);if(sysConfig.optBg||cvsSnow.style.display==='none')return;if(isDesktopActive){ctxSnow.clearRect(0,0,cvsSnow.width,cvsSnow.height);ctxSnow.fillStyle="rgba(255,255,255,0.25)";ctxSnow.beginPath();for(var i=0;i<flakes.length;i++){var fl=flakes[i];ctxSnow.moveTo(fl.x+fl.r,fl.y);ctxSnow.arc(fl.x,fl.y,fl.r,0,Math.PI*2);fl.y+=fl.s;if(fl.y>cvsSnow.height)fl.y=0;}ctxSnow.fill();}})();}

// ── CIRI ──────────────────────────────────────────────────────────────────────
var isCiriActive=false,holdTimer=null,hasBootCiri=false;
window.closeCiri=function(){document.body.classList.remove('ciri-active');isCiriActive=false;};
function checkApiKey(){var st=document.getElementById('status-text'),si=document.getElementById('status-icon');if(!st)return;if(localStorage.getItem('ciri_key')){st.textContent="Secure";st.className="secure";si.innerHTML='<svg class="secure-svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>';}else{st.textContent="Unstable";st.className="unstable";si.innerHTML='<svg class="unstable-svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';}}
checkApiKey();
window.autoGrow=function(el){el.style.height="5px";el.style.height=(el.scrollHeight)+"px";};
window.addEventListener('keydown',function(e){if(e.altKey&&(e.code==='KeyS'||e.key.toLowerCase()==='s')){if(!holdTimer&&!isCiriActive){holdTimer=setTimeout(function(){document.body.classList.add('ciri-active');isCiriActive=true;var cInp=document.getElementById('chat-input');if(!hasBootCiri){var bs=document.getElementById('ciri-boot-screen');if(bs)bs.style.display='flex';setTimeout(function(){document.getElementById('boot-ciri-text').classList.add('typing');},300);setTimeout(function(){document.getElementById('boot-sub-text').classList.add('show');},1100);setTimeout(function(){document.getElementById('boot-loader').style.opacity='1';setTimeout(function(){document.getElementById('boot-status-text').textContent="Ready.";document.getElementById('boot-spinner').style.display='none';setTimeout(function(){bs.style.filter='blur(10px)';bs.style.opacity='0';setTimeout(function(){bs.style.display='none';hasBootCiri=true;if(cInp)cInp.focus();},800);},1800);},1000);},2200);}else{setTimeout(function(){if(cInp)cInp.focus();},100);}},2000);}}else if(e.code==='Escape'&&isCiriActive){closeCiri();}});
window.addEventListener('keyup',function(e){if(e.code==='KeyS'||e.key.toLowerCase()==='s'||e.key==='Alt'){clearTimeout(holdTimer);holdTimer=null;}});

// ── MEDIA PLAYER ──────────────────────────────────────────────────────────────
var aMedia=null,nHide,cNoti=document.getElementById('cine-noti');
function showNoti(){if(!cNoti)return;cNoti.classList.add('active');cNoti.classList.remove('minimized');var rb=document.getElementById('restore-btn');if(rb)rb.classList.remove('visible');resetNH();}
function hideNoti(){if(!cNoti)return;cNoti.classList.remove('active');cNoti.classList.remove('minimized');var rb=document.getElementById('restore-btn');if(rb)rb.classList.remove('visible');clearTimeout(nHide);}
function resetNH(){clearTimeout(nHide);if(cNoti&&cNoti.classList.contains('active')&&!cNoti.classList.contains('minimized')){nHide=setTimeout(function(){cNoti.classList.add('minimized');setTimeout(function(){var rb=document.getElementById('restore-btn');if(rb)rb.classList.add('visible');},300);},5000);}}
if(cNoti){cNoti.addEventListener('mouseenter',function(){clearTimeout(nHide);});cNoti.addEventListener('mouseleave',resetNH);var mn=document.getElementById('minimize-noti-btn');if(mn)mn.onclick=function(){cNoti.classList.add('minimized');setTimeout(function(){var rb=document.getElementById('restore-btn');if(rb)rb.classList.add('visible');},300);};var rbtn=document.getElementById('restore-btn');if(rbtn)rbtn.onclick=function(){this.classList.remove('visible');cNoti.classList.remove('minimized');resetNH();};var clbtn=document.getElementById('close-noti-btn');if(clbtn)clbtn.onclick=function(){if(aMedia)aMedia.pause();hideNoti();};}
setInterval(function(){var fnd=null;document.querySelectorAll('audio,video').forEach(function(m){if(!m.paused&&!m.muted&&m.volume>0&&!['bg-video','lock-video','boot-video'].includes(m.id))fnd=m;});document.querySelectorAll('iframe').forEach(function(ifr){try{var idc=ifr.contentDocument||ifr.contentWindow.document;if(idc)idc.querySelectorAll('audio,video').forEach(function(m){if(!m.paused&&!m.muted&&m.volume>0)fnd=m;});}catch(e){}});isMediaPlaying=!!fnd;if(fnd!==aMedia){if(fnd){aMedia=fnd;setupM();showNoti();}else{aMedia=null;hideNoti();}}if(aMedia){var ct=document.getElementById('current-time');if(ct)ct.textContent=fmtT(aMedia.currentTime);if(isFinite(aMedia.duration)&&aMedia.duration>0){var pf=document.getElementById('progress-fill');if(pf)pf.style.width=((aMedia.currentTime/aMedia.duration)*100)+'%';var tt=document.getElementById('total-time');if(tt)tt.textContent=fmtT(aMedia.duration);}}},1000);
function setupM(){if(!aMedia)return;var nt=document.getElementById('noti-title');if(nt)nt.innerText=aMedia.title||"Web Media Playing";var pp=document.getElementById('play-pause');if(pp)pp.onclick=function(){aMedia.paused?aMedia.play():aMedia.pause();resetNH();};aMedia.addEventListener('play',function(){document.getElementById('icon-play').classList.add('hidden-svg');document.getElementById('icon-pause').classList.add('visible-svg');showNoti();});aMedia.addEventListener('pause',function(){var ipl=document.getElementById('icon-play'),ipa=document.getElementById('icon-pause');if(ipl){ipl.classList.remove('hidden-svg');ipl.classList.add('visible-svg');}if(ipa){ipa.classList.remove('visible-svg');ipa.classList.add('hidden-svg');}});var sb=document.getElementById('skip-back');if(sb)sb.onclick=function(){if(isFinite(aMedia.currentTime))aMedia.currentTime=Math.max(0,aMedia.currentTime-15);resetNH();};var sf=document.getElementById('skip-forward');if(sf)sf.onclick=function(){if(isFinite(aMedia.duration)&&aMedia.duration>0)aMedia.currentTime=Math.min(aMedia.duration,aMedia.currentTime+15);resetNH();};var pha=document.getElementById('progress-hit-area');if(pha)pha.onclick=function(e){if(isFinite(aMedia.duration)&&aMedia.duration>0){var r=this.getBoundingClientRect();aMedia.currentTime=((e.clientX-r.left)/r.width)*aMedia.duration;}resetNH();};}
function fmtT(s){if(isNaN(s)||!isFinite(s))return"0:00";return Math.floor(s/60)+":"+(Math.floor(s%60)).toString().padStart(2,'0');}
(function(){var cv=document.getElementById('visualizer');if(!cv)return;var cx=cv.getContext('2d');cv.height=14;var _vW=0;(function drawFV(){requestAnimationFrame(drawFV);if(!cv.parentElement)return;var nw=cv.parentElement.clientWidth;if(nw!==_vW){cv.width=nw;_vW=nw;}cx.clearRect(0,0,_vW,14);if(!(aMedia&&!aMedia.paused))return;var bL=32,bW=(_vW/bL)*2,xP=0;cx.fillStyle="#fff";cx.beginPath();for(var i=0;i<bL;i++){var bH=Math.random()*14;try{cx.roundRect(xP,14-bH,bW-1.5,bH,2);}catch(e){cx.rect(xP,14-bH,bW-1.5,bH);}xP+=bW;}cx.fill();})();})();

// ── FPS ───────────────────────────────────────────────────────────────────────
var fLT=performance.now(),fFr=0,fLC=0;
(function chkFps(){requestAnimationFrame(chkFps);var nw=performance.now();fFr++;if(nw-fLT>=1000){var cFps=fFr,fv=document.getElementById('fps-val');if(fv)fv.innerText=cFps;if(cFps<=20){fLC++;if(fLC>=5&&!sysConfig.optBg){sysConfig.optBg=true;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));showNotification("Performance","Background video paused to improve performance.");}}else{fLC=0;}fFr=0;fLT=nw;}})();

window.onbeforeunload=function(e){if(sysConfig.redirectConfirm){var msg="Are you sure you want to leave this page?";e.returnValue=msg;return msg;}};

// ── CLOCK ─────────────────────────────────────────────────────────────────────
(function tickClock(){
    var days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
    var months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    function update(){
        var n=new Date();
        var raw=n.getHours();
        var ampm=raw>=12?'PM':'AM';
        var h=raw%12||12;
        var m=n.getMinutes().toString().padStart(2,'0');
        var ct=document.getElementById('clock-time');
        var cd=document.getElementById('clock-date');
        if(ct)ct.textContent=h+':'+m+' '+ampm;
        if(cd)cd.textContent=days[n.getDay()]+', '+months[n.getMonth()]+' '+n.getDate();
    }
    update();
    setInterval(update,1000);
})();

// ── BLACK HOLE ────────────────────────────────────────────────────────────────
(function(){
    var canvas=document.getElementById('blackhole-canvas');
    if(!canvas)return;
    var ctx=canvas.getContext('2d');
    var w,h,cx,cy,R,angle=0,stars=[];

    function resize(){
        w=canvas.width=window.innerWidth;
        h=canvas.height=window.innerHeight;
        cx=w/2; cy=h/2;
        R=Math.min(w,h)*0.145;
        stars=[];
        for(var i=0;i<340;i++)stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.2,a:Math.random()*0.8+0.1,d:Math.random()*0.006-0.003});
    }

    function draw(){
        if(document.hidden||canvas.style.display==='none')return;
        if(sysConfig.optBg){setTimeout(function(){if(!document.hidden)requestAnimationFrame(draw);},500);return;}
        requestAnimationFrame(draw);

        // Space background
        var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*0.75);
        bg.addColorStop(0,'#000c20');
        bg.addColorStop(0.4,'#000510');
        bg.addColorStop(1,'#000003');
        ctx.fillStyle=bg;
        ctx.fillRect(0,0,w,h);

        // Stars
        ctx.save();
        for(var i=0;i<stars.length;i++){
            var s=stars[i];
            s.a+=s.d; if(s.a>0.9||s.a<0.05)s.d*=-1;
            var dx=s.x-cx,dy=s.y-cy,dist=Math.sqrt(dx*dx+dy*dy);
            var fade=Math.min(1,Math.max(0,(dist-R*2)/(R*5)));
            ctx.globalAlpha=s.a*fade;
            ctx.fillStyle='#b8d4ff';
            ctx.beginPath();
            ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.restore();

        // Outer nebula haze
        var haze=ctx.createRadialGradient(cx,cy,R*2,cx,cy,R*14);
        haze.addColorStop(0,'rgba(0,40,160,0.08)');
        haze.addColorStop(0.4,'rgba(0,20,80,0.04)');
        haze.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=haze;
        ctx.fillRect(0,0,w,h);

        // Accretion disk rings
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(angle*0.18);
        var diskColors=[
            ['rgba(200,225,255,0.55)','rgba(80,150,255,0.25)'],
            ['rgba(60,130,255,0.45)','rgba(20,70,200,0.18)'],
            ['rgba(30,90,220,0.30)','rgba(10,40,160,0.10)'],
            ['rgba(15,60,180,0.18)','rgba(5,25,120,0.05)'],
            ['rgba(8,40,140,0.10)','rgba(0,15,80,0.03)']
        ];
        for(var d=0;d<diskColors.length;d++){
            var rIn=R*(1.25+d*0.6),rOut=R*(1.85+d*0.7);
            ctx.save();
            ctx.scale(1,0.24);
            var dg=ctx.createRadialGradient(0,0,rIn,0,0,rOut);
            dg.addColorStop(0,'rgba(0,0,0,0)');
            dg.addColorStop(0.25,diskColors[d][0]);
            dg.addColorStop(0.65,diskColors[d][1]);
            dg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(0,0,rOut,0,Math.PI*2);
            ctx.fillStyle=dg;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();

        // Gravitational shadow
        var shadow=ctx.createRadialGradient(cx,cy,R*0.4,cx,cy,R*4.5);
        shadow.addColorStop(0,'rgba(0,0,0,1)');
        shadow.addColorStop(0.35,'rgba(0,4,18,0.96)');
        shadow.addColorStop(0.65,'rgba(0,5,20,0.55)');
        shadow.addColorStop(0.85,'rgba(0,4,15,0.20)');
        shadow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=shadow;
        ctx.beginPath();
        ctx.arc(cx,cy,R*4.5,0,Math.PI*2);
        ctx.fill();

        // Event horizon
        ctx.fillStyle='#000';
        ctx.beginPath();
        ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.fill();

        // Photon ring glow
        var pg=ctx.createRadialGradient(cx,cy,R*0.9,cx,cy,R*1.35);
        pg.addColorStop(0,'rgba(0,0,0,0)');
        pg.addColorStop(0.5,'rgba(140,200,255,0.75)');
        pg.addColorStop(0.7,'rgba(80,160,255,0.40)');
        pg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=pg;
        ctx.beginPath();
        ctx.arc(cx,cy,R*1.35,0,Math.PI*2);
        ctx.fill();

        // Crisp photon ring line
        ctx.beginPath();
        ctx.arc(cx,cy,R*1.06,0,Math.PI*2);
        ctx.strokeStyle='rgba(200,230,255,0.9)';
        ctx.lineWidth=1.5;
        ctx.stroke();

        // Outer lensing rings
        for(var lr=0;lr<4;lr++){
            ctx.beginPath();
            ctx.arc(cx,cy,R*(1.35+lr*0.38),0,Math.PI*2);
            ctx.strokeStyle='rgba(40,110,255,'+(0.18-lr*0.04)+')';
            ctx.lineWidth=1;
            ctx.stroke();
        }

        // Re-stamp event horizon (ensure solid black center)
        ctx.fillStyle='#000';
        ctx.beginPath();
        ctx.arc(cx,cy,R*0.99,0,Math.PI*2);
        ctx.fill();

        angle+=0.6;
    }

    window.addEventListener('resize',resize);
    document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(draw);});
    resize();
    draw();
})();

/* =============================================================
   Enhancement layer: window manager, dock magnification, quick
   settings, Spotify PKCE client, music app.
   ============================================================= */
(function () {
  'use strict';

  window.startImmersiveMode = function (win) {
    if (win) win.classList.remove('header-visible');
  };
  window.endImmersiveMode = function () {};

  const WM = {
    topZ: 1000,
    focused: null,
    spawnN: 0,

    init() {
      const layer = document.getElementById('windows-layer');
      if (!layer) return;
      new MutationObserver((muts) => {
        muts.forEach((m) => m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.classList.contains('window')) this.upgrade(n);
        }));
      }).observe(layer, { childList: true });

      layer.querySelectorAll('.window').forEach((w) => this.upgrade(w));

      const preview = document.createElement('div');
      preview.id = 'wm-snap-preview';
      document.body.appendChild(preview);
      this.preview = preview;

      window.addEventListener('resize', () => {
        document.querySelectorAll('.window').forEach((w) => this.clampToViewport(w));
      });

      document.addEventListener('mousedown', (ev) => {
        if (ev.button !== 0) return;
        const header = ev.target.closest ? ev.target.closest('.win-header') : null;
        if (!header) return;
        if (ev.target.closest('.win-btn')) return;
        const win = header.closest('.window');
        if (!win) return;
        if (!win.dataset.wmUpgraded) this.upgrade(win);
        this.focus(win);
        this.startDrag(ev, win);
      }, true);
    },

    upgrade(win) {
      if (win.dataset.wmUpgraded) return;
      win.dataset.wmUpgraded = '1';

      this.placeWindow(win);

      ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach((dir) => {
        const h = document.createElement('div');
        h.className = 'win-resize ' + dir;
        h.addEventListener('mousedown', (ev) => this.startResize(ev, win, dir));
        win.appendChild(h);
      });

      const controls = win.querySelector('.win-controls');
      if (controls && !controls.querySelector('.btn-max')) {
        const max = document.createElement('div');
        max.className = 'win-btn btn-max';
        max.title = 'Maximize';
        max.addEventListener('click', (ev) => {
          ev.stopPropagation();
          win.classList.toggle('maximized');
        });
        controls.appendChild(max);
      }

      const header = win.querySelector('.win-header');
      if (header) {
        header.onmousedown = (ev) => {
          if (ev.target.closest('.win-btn')) return;
          this.startDrag(ev, win);
        };
        header.ondblclick = () => win.classList.toggle('maximized');
      }

      win.addEventListener('mousedown', () => this.focus(win), true);
      this.focus(win);
    },

    placeWindow(win) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ww = Math.min(960, Math.round(vw * 0.7));
      const wh = Math.min(620, Math.round(vh * 0.7));
      const cascade = (this.spawnN++ % 6) * 28;
      const wx = Math.round((vw - ww) / 2) + cascade;
      const wy = Math.round((vh - wh) / 2) + cascade;
      win.style.setProperty('--ww', ww + 'px');
      win.style.setProperty('--wh', wh + 'px');
      win.style.setProperty('--wx', wx + 'px');
      win.style.setProperty('--wy', wy + 'px');
    },

    focus(win) {
      if (this.focused && this.focused !== win) this.focused.classList.remove('focused');
      this.focused = win;
      win.classList.add('focused');
      win.style.zIndex = ++this.topZ;
      window.activeWindowId = (win.id || '').replace('win-', '');
    },

    clampToViewport(win) {
      const r = win.getBoundingClientRect();
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      if (r.left > maxX) win.style.setProperty('--wx', maxX + 'px');
      if (r.top > maxY) win.style.setProperty('--wy', maxY + 'px');
    },

    startDrag(ev, win) {
      if (win.classList.contains('maximized')) {
        win.classList.remove('maximized');
        const ww = parseFloat(getComputedStyle(win).getPropertyValue('--ww')) || 800;
        win.style.setProperty('--wx', (ev.clientX - ww / 2) + 'px');
        win.style.setProperty('--wy', Math.max(0, ev.clientY - 20) + 'px');
      }
      const r = win.getBoundingClientRect();
      const ox = ev.clientX - r.left;
      const oy = ev.clientY - r.top;

      const onMove = (e) => {
        const nx = e.clientX - ox;
        const ny = Math.max(0, e.clientY - oy);
        win.style.setProperty('--wx', nx + 'px');
        win.style.setProperty('--wy', ny + 'px');
        this.updateSnapPreview(e);
      };
      const onUp = (e) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        this.applySnap(win, e);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      ev.preventDefault();
    },

    startResize(ev, win, dir) {
      win.classList.remove('maximized');
      const r = win.getBoundingClientRect();
      const sx = ev.clientX, sy = ev.clientY;
      const sw = r.width, sh = r.height, sl = r.left, st = r.top;

      const onMove = (e) => {
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        let nw = sw, nh = sh, nl = sl, nt = st;
        if (dir.includes('e')) nw = Math.max(380, sw + dx);
        if (dir.includes('s')) nh = Math.max(260, sh + dy);
        if (dir.includes('w')) { nw = Math.max(380, sw - dx); nl = sl + (sw - nw); }
        if (dir.includes('n')) { nh = Math.max(260, sh - dy); nt = st + (sh - nh); }
        win.style.setProperty('--ww', nw + 'px');
        win.style.setProperty('--wh', nh + 'px');
        win.style.setProperty('--wx', nl + 'px');
        win.style.setProperty('--wy', nt + 'px');
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      ev.preventDefault();
      ev.stopPropagation();
    },

    snapZone(e) {
      const T = 18;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (e.clientY < T) return 'top';
      if (e.clientX < T) return 'left';
      if (e.clientX > vw - T) return 'right';
      if (e.clientY > vh - T) return 'bottom';
      return null;
    },

    snapRect(zone) {
      const vw = window.innerWidth;
      const vh = window.innerHeight - 90;
      if (zone === 'top')    return { x: 0, y: 0, w: vw, h: vh };
      if (zone === 'left')   return { x: 0, y: 0, w: vw / 2, h: vh };
      if (zone === 'right')  return { x: vw / 2, y: 0, w: vw / 2, h: vh };
      if (zone === 'bottom') return { x: vw / 4, y: vh / 2, w: vw / 2, h: vh / 2 };
      return null;
    },

    updateSnapPreview(e) {
      const zone = this.snapZone(e);
      if (!zone) { this.preview.classList.remove('show'); return; }
      const r = this.snapRect(zone);
      this.preview.style.left = r.x + 'px';
      this.preview.style.top = r.y + 'px';
      this.preview.style.width = r.w + 'px';
      this.preview.style.height = r.h + 'px';
      this.preview.classList.add('show');
    },

    applySnap(win, e) {
      this.preview.classList.remove('show');
      const zone = this.snapZone(e);
      if (!zone) return;
      const r = this.snapRect(zone);
      win.style.setProperty('--wx', r.x + 'px');
      win.style.setProperty('--wy', r.y + 'px');
      win.style.setProperty('--ww', r.w + 'px');
      win.style.setProperty('--wh', r.h + 'px');
    },
  };

  const Dock = {
    init() {
      const dock = document.getElementById('dock-container');
      if (!dock) return;
      dock.addEventListener('mousemove', (e) => this.onMove(e, dock));
      dock.addEventListener('mouseleave', () => this.reset(dock));
      setInterval(() => this.syncIndicators(dock), 500);
    },

    onMove(e, dock) {
      const items = dock.querySelectorAll('.dock-item');
      items.forEach((it) => {
        it.classList.remove('mag-lv1', 'mag-lv2', 'mag-lv3');
        const r = it.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const d = Math.abs(e.clientX - cx);
        if (d < 30) it.classList.add('mag-lv3');
        else if (d < 60) it.classList.add('mag-lv2');
        else if (d < 100) it.classList.add('mag-lv1');
      });
    },

    reset(dock) {
      dock.querySelectorAll('.dock-item').forEach((it) =>
        it.classList.remove('mag-lv1', 'mag-lv2', 'mag-lv3')
      );
    },

    syncIndicators(dock) {
      const openIds = new Set();
      document.querySelectorAll('.window').forEach((w) => {
        if (!w.classList.contains('minimized')) openIds.add((w.id || '').replace('win-', ''));
      });
      const activeId = window.activeWindowId;
      dock.querySelectorAll('.dock-item').forEach((it) => {
        const id = it.dataset.appId || it.getAttribute('data-id') || '';
        it.classList.toggle('running', openIds.has(id));
        it.classList.toggle('active-window', id === activeId);
      });
    },
  };

  const ACCENTS = [
    { id: 'blue',    c: '#3b82f6', g: 'rgba(59, 130, 246, 0.55)' },
    { id: 'cyan',    c: '#06b6d4', g: 'rgba(6, 182, 212, 0.55)' },
    { id: 'green',   c: '#10b981', g: 'rgba(16, 185, 129, 0.55)' },
    { id: 'purple',  c: '#a855f7', g: 'rgba(168, 85, 247, 0.55)' },
    { id: 'pink',    c: '#ec4899', g: 'rgba(236, 72, 153, 0.55)' },
    { id: 'orange',  c: '#f97316', g: 'rgba(249, 115, 22, 0.55)' },
  ];

  const QS = {
    state: JSON.parse(localStorage.getItem('qs_state') || '{}'),

    init() {
      const btn = document.createElement('button');
      btn.id = 'quick-settings-btn';
      btn.innerHTML = '<i class="fas fa-sliders-h"></i>';
      btn.title = 'Quick settings';
      document.body.appendChild(btn);

      const panel = document.createElement('div');
      panel.id = 'quick-settings-panel';
      panel.innerHTML = `
        <div class="qs-section">
          <div class="qs-label">Accent</div>
          <div class="qs-accent-row">
            ${ACCENTS.map(a => `<div class="qs-accent" data-id="${a.id}" style="background:${a.c}"></div>`).join('')}
          </div>
        </div>
        <div class="qs-section">
          <div class="qs-label">Brightness</div>
          <input type="range" class="qs-slider" id="qs-brightness" min="50" max="110" step="1">
        </div>
        <div class="qs-section">
          <div class="qs-label">Performance</div>
          <div class="qs-perf">
            <button data-perf="balanced">Balanced</button>
            <button data-perf="low">Low power</button>
            <button data-perf="max">Max fps</button>
          </div>
        </div>`;
      document.body.appendChild(panel);

      btn.onclick = (e) => { e.stopPropagation(); panel.classList.toggle('open'); };
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
      });

      panel.querySelectorAll('.qs-accent').forEach((el) => {
        el.onclick = () => this.setAccent(el.dataset.id);
      });
      const b = panel.querySelector('#qs-brightness');
      b.value = Math.round(((this.state.brightness || 1) * 100));
      b.oninput = () => this.setBrightness(b.value / 100);
      panel.querySelectorAll('.qs-perf button').forEach((el) => {
        el.onclick = () => this.setPerf(el.dataset.perf);
      });

      this.setAccent(this.state.accent || 'blue', true);
      this.setBrightness(this.state.brightness || 1, true);
      this.setPerf(this.state.perf || 'balanced', true);
    },

    save() { localStorage.setItem('qs_state', JSON.stringify(this.state)); },

    setAccent(id, silent) {
      const a = ACCENTS.find((x) => x.id === id) || ACCENTS[0];
      document.documentElement.style.setProperty('--accent', a.c);
      document.documentElement.style.setProperty('--accent-glow', a.g);
      document.querySelectorAll('.qs-accent').forEach((el) => {
        el.classList.toggle('selected', el.dataset.id === a.id);
      });
      this.state.accent = a.id;
      if (!silent) this.save();
    },

    setBrightness(v, silent) {
      document.documentElement.style.setProperty('--sys-brightness', v);
      this.state.brightness = v;
      if (!silent) this.save();
    },

    setPerf(mode, silent) {
      document.querySelectorAll('.qs-perf button').forEach((el) => {
        el.classList.toggle('active', el.dataset.perf === mode);
      });
      const bh = document.getElementById('blackhole-canvas');
      const snow = document.getElementById('snow-fx');
      const body = document.body;
      body.classList.remove('perf-low', 'perf-balanced', 'perf-max');
      body.classList.add('perf-' + mode);
      if (mode === 'low') {
        if (bh) bh.style.display = 'none';
        if (snow) snow.style.display = 'none';
        if (window.sysConfig) { window.sysConfig.optBg = true; localStorage.setItem('intel_sys_config', JSON.stringify(window.sysConfig)); }
        if (typeof applySystemSettings === 'function') applySystemSettings();
      } else if (mode === 'max') {
        if (snow) snow.style.display = '';
        if (window.sysConfig) { window.sysConfig.optBg = false; localStorage.setItem('intel_sys_config', JSON.stringify(window.sysConfig)); }
        if (typeof applySystemSettings === 'function') applySystemSettings();
      } else {
        if (snow) snow.style.display = '';
      }
      this.state.perf = mode;
      if (!silent) this.save();
    },
  };

  const SPOTIFY_CLIENT_ID = 'ccc86d1c9b6942ed9629a72638b27527';
  const SPOTIFY_REDIRECT_URI = location.origin + '/';
  const SPOTIFY_SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-top-read',
  ].join(' ');

  function b64url(bytes) {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return new Uint8Array(buf);
  }
  function randStr(n) {
    const a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return b64url(a);
  }

  const Spotify = {
    token: null,
    expiresAt: 0,
    refreshing: null,
    deviceId: null,
    player: null,
    listeners: new Set(),

    async init() {
      try {
        const saved = JSON.parse(localStorage.getItem('sp_tok') || 'null');
        if (saved?.access_token && saved.expiresAt > Date.now() + 30_000) {
          this.token = saved.access_token;
          this.expiresAt = saved.expiresAt;
        }
      } catch {}

      const qp = new URLSearchParams(location.search);
      if (qp.get('code') && qp.get('state')) {
        const savedState = localStorage.getItem('sp_state');
        if (qp.get('state') !== savedState) {
          console.warn('[spotify] state mismatch');
        } else {
          await this.exchangeCode(qp.get('code'));
        }
        history.replaceState(null, '', location.pathname);
      } else if (qp.get('error')) {
        console.warn('[spotify] auth error:', qp.get('error'));
        history.replaceState(null, '', location.pathname);
      }

      if (!this.token) await this.tryRefresh();

      this.ensureSDK();
      this.notify();
    },

    async login() {
      const verifier = randStr(64);
      const challenge = b64url(await sha256(verifier));
      const state = randStr(16);
      localStorage.setItem('sp_verifier', verifier);
      localStorage.setItem('sp_state', state);
      const p = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        state,
      });
      location.href = 'https://accounts.spotify.com/authorize?' + p.toString();
    },

    async exchangeCode(code) {
      const verifier = localStorage.getItem('sp_verifier');
      if (!verifier) return;
      const body = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        code_verifier: verifier,
      });
      const r = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const d = await r.json();
      localStorage.removeItem('sp_verifier');
      localStorage.removeItem('sp_state');
      if (!r.ok) { console.error('[spotify] token exchange failed', d); return; }
      this.setToken(d.access_token, d.expires_in, d.refresh_token);
    },

    setToken(t, expSec, refresh) {
      this.token = t;
      this.expiresAt = Date.now() + (expSec - 60) * 1000;
      localStorage.setItem('sp_tok', JSON.stringify({ access_token: t, expiresAt: this.expiresAt }));
      if (refresh) localStorage.setItem('sp_refresh', refresh);
      this.notify();
    },

    logout() {
      this.token = null;
      this.expiresAt = 0;
      localStorage.removeItem('sp_tok');
      localStorage.removeItem('sp_refresh');
      if (this.player) { try { this.player.disconnect(); } catch {} }
      this.player = null;
      this.deviceId = null;
      this.notify();
    },

    async tryRefresh() {
      const refresh = localStorage.getItem('sp_refresh');
      if (!refresh) return null;
      if (this.refreshing) return this.refreshing;
      this.refreshing = (async () => {
        try {
          const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refresh,
            client_id: SPOTIFY_CLIENT_ID,
          });
          const r = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          });
          const d = await r.json();
          if (!r.ok) {
            localStorage.removeItem('sp_refresh');
            localStorage.removeItem('sp_tok');
            return null;
          }
          this.setToken(d.access_token, d.expires_in, d.refresh_token);
          return d.access_token;
        } catch { return null; }
      })();
      const t = await this.refreshing;
      this.refreshing = null;
      return t;
    },

    async getToken() {
      if (this.token && Date.now() < this.expiresAt) return this.token;
      return this.tryRefresh();
    },

    async api(path, opts = {}) {
      const t = await this.getToken();
      if (!t) throw new Error('not_logged_in');
      const r = await fetch('https://api.spotify.com/v1' + path, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: 'Bearer ' + t },
      });
      if (r.status === 401) { await this.tryRefresh(); return this.api(path, opts); }
      if (r.status === 204) return null;
      return r.json();
    },

    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    notify() { this.listeners.forEach((f) => { try { f(); } catch {} }); },

    ensureSDK() {
      if (window.Spotify?.Player) { this.setupPlayer(); return; }
      if (document.getElementById('spotify-sdk-js')) return;
      window.onSpotifyWebPlaybackSDKReady = () => this.setupPlayer();
      const s = document.createElement('script');
      s.id = 'spotify-sdk-js';
      s.src = 'https://sdk.scdn.co/spotify-player.js';
      document.head.appendChild(s);
    },

    async setupPlayer() {
      const t = await this.getToken();
      if (!t || !window.Spotify?.Player) return;
      if (this.player) return;

      this.player = new window.Spotify.Player({
        name: 'Intellectual OS',
        getOAuthToken: async (cb) => cb(await this.getToken()),
        volume: 0.7,
      });

      this.player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        this.notify();
      });
      this.player.addListener('not_ready', () => { this.deviceId = null; });
      this.player.addListener('player_state_changed', () => this.notify());
      this.player.addListener('initialization_error', ({ message }) => console.error('[spotify init]', message));
      this.player.addListener('authentication_error', ({ message }) => console.error('[spotify auth]', message));
      this.player.addListener('account_error', ({ message }) => console.error('[spotify account]', message));

      this.player.connect();
    },

    async playUris(uris, contextUri) {
      const t = await this.getToken();
      if (!t || !this.deviceId) return;
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify(contextUri ? { context_uri: contextUri, offset: { position: 0 } } : { uris }),
      });
    },

    togglePlay()  { this.player?.togglePlay(); },
    next()        { this.player?.nextTrack(); },
    previous()    { this.player?.previousTrack(); },
    seek(ms)      { this.player?.seek(ms); },

    async getState() { return this.player ? this.player.getCurrentState() : null; },
  };

  window.Spotify_Client = Spotify;

  const MUSIC_APP_ID = 'spotify';

  function ensureMusicApp() {
    if (window.APPS && !window.APPS[MUSIC_APP_ID]) {
      window.APPS[MUSIC_APP_ID] = {
        title: 'Spotify',
        icon: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
        internal: true,
        pinned: true,
      };
    }
  }

  function renderMusicApp(win) {
    const body = win.querySelector('.win-body');
    if (!body) return;
    body.innerHTML = `<div id="spotify-app-root"></div>`;
    const root = body.querySelector('#spotify-app-root');

    const paint = async () => {
      const token = await Spotify.getToken();
      if (!token) { root.innerHTML = loginHTML(); wireLogin(root); return; }
      root.innerHTML = shellHTML();
      loadPlaylists(root);
      wireNowPlaying(root);
    };

    const unsub = Spotify.onChange(paint);
    win.addEventListener('remove', () => unsub());
    paint();
  }

  function loginHTML() {
    return `
      <div class="sp-login-screen">
        <h2>Sign in with Spotify</h2>
        <p>Connect your Spotify Premium account to stream your library right inside Intellectual OS.</p>
        <button class="sp-btn" id="sp-login-btn">Continue to Spotify</button>
      </div>`;
  }

  function wireLogin(root) {
    const b = root.querySelector('#sp-login-btn');
    if (b) b.onclick = () => Spotify.login();
  }

  function shellHTML() {
    return `
      <aside class="sp-sidebar">
        <h3>Library</h3>
        <div id="sp-lib"></div>
        <h3>Playlists</h3>
        <div id="sp-playlists"><div class="sp-pl" style="color:#666">Loading…</div></div>
      </aside>
      <main class="sp-main">
        <div class="sp-topbar">
          <div id="sp-title" style="font-size:20px;font-weight:800">Liked Songs</div>
          <button class="sp-btn ghost" id="sp-logout">Log out</button>
        </div>
        <div class="sp-tracklist" id="sp-tracks"><div style="color:#666;padding:20px">Pick a playlist on the left.</div></div>
        <div class="sp-nowbar">
          <div class="sp-now-track">
            <img id="sp-now-art" src="" alt="">
            <div class="sp-now-info">
              <div class="t" id="sp-now-title">Nothing playing</div>
              <div class="a" id="sp-now-artist"></div>
            </div>
          </div>
          <div class="sp-controls">
            <button id="sp-prev"><i class="fas fa-backward-step"></i></button>
            <button class="play" id="sp-play"><i class="fas fa-play"></i></button>
            <button id="sp-next"><i class="fas fa-forward-step"></i></button>
          </div>
          <div style="position:relative">
            <canvas class="sp-viz" id="sp-viz"></canvas>
            <div class="sp-progress">
              <span id="sp-cur">0:00</span>
              <div class="bar" id="sp-bar"><div class="fill" id="sp-fill"></div></div>
              <span id="sp-tot">0:00</span>
            </div>
          </div>
        </div>
      </main>`;
  }

  async function loadPlaylists(root) {
    try {
      const lib = root.querySelector('#sp-lib');
      lib.innerHTML =
        `<div class="sp-pl active" data-kind="liked">❤ Liked Songs</div>` +
        `<div class="sp-pl" data-kind="top">🔥 Top Tracks</div>`;

      const data = await Spotify.api('/me/playlists?limit=50');
      const list = root.querySelector('#sp-playlists');
      list.innerHTML = (data?.items || []).map((p) =>
        `<div class="sp-pl" data-kind="playlist" data-id="${p.id}" data-uri="${p.uri}" title="${escapeHTML(p.name)}">${escapeHTML(p.name)}</div>`
      ).join('') || '<div class="sp-pl" style="color:#666">No playlists</div>';

      root.querySelectorAll('.sp-pl').forEach((el) => {
        el.onclick = () => {
          root.querySelectorAll('.sp-pl').forEach((x) => x.classList.remove('active'));
          el.classList.add('active');
          const k = el.dataset.kind;
          if (k === 'liked') loadLiked(root);
          else if (k === 'top') loadTop(root);
          else if (k === 'playlist') loadPlaylist(root, el.dataset.id, el.dataset.uri, el.textContent);
        };
      });

      const logout = root.querySelector('#sp-logout');
      if (logout) logout.onclick = () => Spotify.logout();

      loadLiked(root);
    } catch (e) {
      console.error('[spotify] playlists', e);
    }
  }

  async function loadLiked(root) {
    root.querySelector('#sp-title').textContent = 'Liked Songs';
    const d = await Spotify.api('/me/tracks?limit=50');
    renderTracks(root, (d?.items || []).map((x) => x.track), null);
  }

  async function loadTop(root) {
    root.querySelector('#sp-title').textContent = 'Top Tracks';
    const d = await Spotify.api('/me/top/tracks?limit=50');
    renderTracks(root, d?.items || [], null);
  }

  async function loadPlaylist(root, id, uri, name) {
    root.querySelector('#sp-title').textContent = name;
    const d = await Spotify.api(`/playlists/${id}/tracks?limit=100`);
    renderTracks(root, (d?.items || []).map((x) => x.track).filter(Boolean), uri);
  }

  function renderTracks(root, tracks, contextUri) {
    const list = root.querySelector('#sp-tracks');
    if (!tracks?.length) { list.innerHTML = '<div style="color:#666;padding:20px">No tracks.</div>'; return; }
    list.innerHTML = tracks.map((t, i) => {
      const art = t.album?.images?.at(-1)?.url || '';
      const artists = (t.artists || []).map((a) => a.name).join(', ');
      return `<div class="sp-track" data-idx="${i}">
        <span>${i + 1}</span>
        <img src="${art}" alt="">
        <div><div class="tr-name">${escapeHTML(t.name)}</div><div class="tr-artist">${escapeHTML(artists)}</div></div>
        <div class="tr-artist">${fmtMs(t.duration_ms)}</div>
        <span><i class="fas fa-play"></i></span>
      </div>`;
    }).join('');
    list.querySelectorAll('.sp-track').forEach((el) => {
      el.ondblclick = () => play(tracks, +el.dataset.idx, contextUri);
    });
  }

  async function play(tracks, idx, contextUri) {
    if (!Spotify.deviceId) {
      alert('Spotify player is still connecting. Try again in a second (Premium account required).');
      return;
    }
    try {
      const t = tracks[idx];
      const label = t ? `${t.name} — ${(t.artists || []).map((a) => a.name).join(', ')}` : '';
      if (window.BotBridge) window.BotBridge.event('song-play', label.slice(0, 140));
    } catch (e) {}
    if (contextUri) {
      const t = await Spotify.getToken();
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${Spotify.deviceId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_uri: contextUri, offset: { position: idx } }),
      });
    } else {
      await Spotify.playUris(tracks.slice(idx).map((x) => x.uri));
    }
  }

  function wireNowPlaying(root) {
    const el = (id) => root.querySelector(id);
    el('#sp-play').onclick = () => Spotify.togglePlay();
    el('#sp-next').onclick = () => Spotify.next();
    el('#sp-prev').onclick = () => Spotify.previous();
    el('#sp-bar').onclick = async (e) => {
      const st = await Spotify.getState();
      if (!st) return;
      const r = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - r.left) / r.width;
      Spotify.seek(Math.max(0, Math.min(st.duration, Math.round(pct * st.duration))));
    };

    const canvas = el('#sp-viz');
    const vc = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 40;

    const tick = async () => {
      if (!root.isConnected) return;
      const st = await Spotify.getState();
      if (st && !st.paused) {
        const t = st.track_window?.current_track;
        if (t) {
          el('#sp-now-art').src = t.album?.images?.[0]?.url || '';
          el('#sp-now-title').textContent = t.name || '';
          el('#sp-now-artist').textContent = (t.artists || []).map((a) => a.name).join(', ');
        }
        el('#sp-cur').textContent = fmtMs(st.position);
        el('#sp-tot').textContent = fmtMs(st.duration);
        el('#sp-fill').style.width = ((st.position / st.duration) * 100).toFixed(1) + '%';
        el('#sp-play').innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        el('#sp-play').innerHTML = '<i class="fas fa-play"></i>';
      }
      drawViz(vc, canvas, st && !st.paused);
      requestAnimationFrame(tick);
    };
    tick();
  }

  let vizT = 0;
  function drawViz(cx, canvas, playing) {
    const w = canvas.width = canvas.parentElement.clientWidth || 200;
    const h = canvas.height;
    cx.clearRect(0, 0, w, h);
    if (!playing) return;
    vizT += 0.08;
    cx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1db954';
    const bars = 40;
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      const n = Math.sin(vizT + i * 0.4) * 0.5 + Math.sin(vizT * 2.3 + i * 0.7) * 0.5 + 1;
      const bh = Math.max(2, n * (h * 0.4));
      cx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
    }
  }

  function fmtMs(ms) {
    if (!ms || !isFinite(ms)) return '0:00';
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const origOpenWindow = window.openWindow;
  if (typeof origOpenWindow === 'function') {
    window.openWindow = function (id) {
      const result = origOpenWindow.apply(this, arguments);
      const win = document.getElementById('win-' + id);
      if (win) {
        WM.upgrade(win);
        WM.focus(win);
      }
      if (id === MUSIC_APP_ID || id === 'music' || id === 'term') {
        if (win) setTimeout(() => renderMusicApp(win), 30);
      }
      return result;
    };
  }

  function boot() {
    ensureMusicApp();
    WM.init();
    Dock.init();
    QS.init();
    Spotify.init();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

// ── MOUSE-FOLLOW GLOW & ELEMENT-LOCAL COORDS ─────────────────────────────────
(function(){
    var root = document.documentElement;
    var rafPending = false;
    var mx = 0, my = 0;

    window.addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(function(){
                root.style.setProperty('--mx', mx + 'px');
                root.style.setProperty('--my', my + 'px');
                rafPending = false;
            });
        }
    }, { passive: true });

    // Element-local coords for dock items (event delegation)
    var dock = document.getElementById('dock-container');
    if (dock) {
        dock.addEventListener('mousemove', function(e){
            var item = e.target.closest('.dock-item');
            if (!item) return;
            var r = item.getBoundingClientRect();
            item.style.setProperty('--lx', (e.clientX - r.left) + 'px');
            item.style.setProperty('--ly', (e.clientY - r.top)  + 'px');
        }, { passive: true });
    }
})();

// ── DOCK MAGNIFICATION (macOS-style wave effect) ──────────────────────────────
(function dockMag(){
    var dock = document.getElementById('dock-container');
    if (!dock) return;

    var MAX_SCALE = 1.55;
    var SPREAD    = 112;  // px radius of influence
    var LIFT      = 14;   // max lift in px
    var rafId     = null;
    var mouseX    = -9999;

    dock.setAttribute('data-mag', '1');

    function smoothstep(t){ return t * t * (3 - 2 * t); }

    function applyMag(){
        var items = dock.querySelectorAll('.dock-item');
        items.forEach(function(item){
            var r    = item.getBoundingClientRect();
            var cx   = r.left + r.width * 0.5;
            var dist = Math.abs(mouseX - cx);
            if (dist < SPREAD){
                var t     = smoothstep(1 - dist / SPREAD);
                var scale = 1 + (MAX_SCALE - 1) * t;
                var lift  = LIFT * t;
                item.style.setProperty('--ds', scale.toFixed(3));
                item.style.setProperty('--dl', (-lift).toFixed(1) + 'px');
            } else {
                item.style.removeProperty('--ds');
                item.style.removeProperty('--dl');
            }
        });
        rafId = null;
    }

    dock.addEventListener('mousemove', function(e){
        mouseX = e.clientX;
        if (!rafId) rafId = requestAnimationFrame(applyMag);
    }, { passive: true });

    dock.addEventListener('mouseleave', function(){
        mouseX = -9999;
        if (rafId){ cancelAnimationFrame(rafId); rafId = null; }
        dock.querySelectorAll('.dock-item').forEach(function(item){
            item.style.removeProperty('--ds');
            item.style.removeProperty('--dl');
        });
    });
})();

// ═══════════════════════════════════════════════════════════════════════════
// LINUX CONSOLE
// ═══════════════════════════════════════════════════════════════════════════
var consoleHistory = [];
var consoleHistoryIndex = -1;

function openLinuxConsole() {
    var c = document.getElementById('linux-console');
    if (!c) return;
    c.classList.add('open');
    var input = document.getElementById('console-input');
    if (input) {
        input.focus();
        if (c.querySelector('.console-output').children.length === 0) {
            printToConsole('info', 'Intellectual OS Terminal v2.0');
            printToConsole('', 'Type <span class="help-cmd">help</span> to see available commands.');
            printToConsole('', '');
        }
    }
}

function closeLinuxConsole() {
    var c = document.getElementById('linux-console');
    if (c) c.classList.remove('open');
}

function printToConsole(type, html) {
    var output = document.getElementById('console-output');
    if (!output) return;
    var line = document.createElement('div');
    if (type) line.className = type;
    line.innerHTML = html;
    output.appendChild(line);
    var body = document.getElementById('console-body');
    if (body) body.scrollTop = body.scrollHeight;
}

function printCommand(cmd) {
    printToConsole('', '<span class="prompt">user@ios:~$</span> <span class="command">' + escapeHtml(cmd) + '</span>');
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

var consoleCommands = {
    'help': function() {
        printToConsole('help-title', '\n=== Intellectual OS Terminal Commands ===\n');
        printToConsole('', '<span class="help-cmd">help</span>        - Show this help message');
        printToConsole('', '<span class="help-cmd">clear</span>        - Clear the terminal');
        printToConsole('', '<span class="help-cmd">whoami</span>       - Show current user');
        printToConsole('', '<span class="help-cmd">date</span>         - Show current date and time');
        printToConsole('', '<span class="help-cmd">uptime</span>       - Show system uptime');
        printToConsole('', '<span class="help-cmd">games</span>        - List available games');
        printToConsole('', '<span class="help-cmd">launch [name]</span> - Launch a game by name');
        printToConsole('', '<span class="help-cmd">neofetch</span>     - Show system info');
        printToConsole('', '<span class="help-cmd">cls</span>          - Alias for clear');
        printToConsole('', '<span class="help-cmd">exit</span>         - Close terminal');
        printToConsole('', '');
    },
    'clear': function() {
        var output = document.getElementById('console-output');
        if (output) output.innerHTML = '';
    },
    'cls': function() {
        consoleCommands['clear']();
    },
    'whoami': function() {
        var user = document.getElementById('profile-name');
        var name = user ? user.textContent : 'guest';
        printToConsole('success', name);
    },
    'date': function() {
        printToConsole('', new Date().toString());
    },
    'uptime': function() {
        if (!window._bootTime) window._bootTime = Date.now();
        var diff = Math.floor((Date.now() - window._bootTime) / 1000);
        var h = Math.floor(diff / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        printToConsole('success', 'up ' + h + ' hours, ' + m + ' minutes, ' + s + ' seconds');
    },
    'games': function() {
        printToConsole('help-title', '\n=== Available Games ===\n');
        var games = ['Slope', '1v1.LOL', 'Retro Bowl', 'Drive Mad', 'Smash Karts', 'BitLife', 'Cookie Clicker', 'Stickman Hook', 'Geometry Dash', 'Tunnel Rush', 'Moto X3M', 'Eaglercraft 1.8.8', 'Doom'];
        games.forEach(function(g) {
            printToConsole('', '  • ' + g);
        });
        printToConsole('', '\nUse <span class="help-cmd">launch [name]</span> to start a game.');
        printToConsole('', '');
    },
    'launch': function(args) {
        if (!args) {
            printToConsole('error', 'Usage: launch [game name]');
            printToConsole('', 'Use <span class="help-cmd">games</span> to see available games.');
            return;
        }
        var gameName = args.join(' ').toLowerCase();
        printToConsole('success', 'Launching "' + args.join(' ') + '"...');
        // Open the games app
        if (window.toggleApp) {
            setTimeout(function() { toggleApp('files'); }, 500);
        }
    },
    'neofetch': function() {
        printToConsole('', '');
        printToConsole('success', '       ████████████       ');
        printToConsole('success', '     ██████████████████   ');
        printToConsole('success', '    ████████████████████  ');
        printToConsole('success', '   ██████████████████████ ');
        printToConsole('success', '  ████████████████████████');
        printToConsole('success', ' █████████████████████████');
        printToConsole('success', ' █████████████████████████');
        printToConsole('success', '  ████████████████████████');
        printToConsole('success', '   ██████████████████████ ');
        printToConsole('success', '    ████████████████████  ');
        printToConsole('success', '     ██████████████████   ');
        printToConsole('success', '       ████████████       ');
        printToConsole('success', '');
        printToConsole('', '<span class="help-title">user@intellectual-os</span>');
        printToConsole('', '──────────────────────────');
        printToConsole('', '<span class="help-cmd">OS</span>: Intellectual OS v2.0');
        printToConsole('', '<span class="help-cmd">Host</span> Web Browser');
        printToConsole('', '<span class="help-cmd">Kernel</span>: JavaScript ES6+');
        printToConsole('', '<span class="help-cmd">Shell</span>: IOS Terminal');
        printToConsole('', '<span class="help-cmd">Resolution</span>: ' + window.innerWidth + 'x' + window.innerHeight);
        printToConsole('', '<span class="help-cmd">Theme</span>: Dark Glass');
        printToConsole('', '<span class="help-cmd">Terminal</span>: Linux Console');
        printToConsole('', '');
    },
    'exit': function() {
        closeLinuxConsole();
    }
};

function handleConsoleCommand(input) {
    var cmd = input.trim();
    if (!cmd) return;
    
    printCommand(cmd);
    consoleHistory.push(cmd);
    consoleHistoryIndex = consoleHistory.length;
    
    var parts = cmd.split(/\s+/);
    var command = parts[0].toLowerCase();
    var args = parts.slice(1);
    
    if (consoleCommands[command]) {
        consoleCommands[command](args);
    } else {
        printToConsole('error', command + ': command not found. Type <span class="help-cmd">help</span> for available commands.');
    }
}

// Console input event listeners
document.addEventListener('DOMContentLoaded', function() {
    var consoleInput = document.getElementById('console-input');
    if (consoleInput) {
        consoleInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleConsoleCommand(this.value);
                this.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (consoleHistoryIndex > 0) {
                    consoleHistoryIndex--;
                    this.value = consoleHistory[consoleHistoryIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (consoleHistoryIndex < consoleHistory.length - 1) {
                    consoleHistoryIndex++;
                    this.value = consoleHistory[consoleHistoryIndex];
                } else {
                    consoleHistoryIndex = consoleHistory.length;
                    this.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Simple tab completion
                var val = this.value.toLowerCase();
                for (var cmd in consoleCommands) {
                    if (cmd.startsWith(val)) {
                        this.value = cmd;
                        break;
                    }
                }
            }
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// QUICK GAME LAUNCHER
// ═══════════════════════════════════════════════════════════════════════════
var quickLauncherGames = [
    { name: 'Slope', id: 'x3k-slope', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/slope/icon.png' },
    { name: '1v1.LOL', id: 'x3k-1v1', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/1v1lol/icon.png' },
    { name: 'Retro Bowl', id: 'x3k-retrobowl', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/retro-bowl/icon.png' },
    { name: 'Drive Mad', id: 'x3k-drivemad', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/drive-mad/icon.png' },
    { name: 'Smash Karts', id: 'x3k-smashkarts', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/smash-karts/icon.png' },
    { name: 'Cookie Clicker', id: 'x3k-cookie', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/cookie-clicker/icon.png' },
    { name: 'Geometry Dash', id: 'x3k-geo', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/geometry-dash/icon.png' },
    { name: 'Tunnel Rush', id: 'x3k-tunnel', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/tunnel-rush/icon.png' },
    { name: 'Moto X3M', id: 'x3k-moto', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/moto-x3m/icon.png' },
    { name: 'Eaglercraft 1.8', id: 'mc-1.8.8', cover: 'https://eaglercraft.com/icon.png' },
    { name: 'Doom', id: 'dos-doom', cover: 'https://js-dos.com/images/doom.png' },
    { name: 'Stickman Hook', id: 'x3k-stick', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/stickman-hook/icon.png' },
    { name: 'BitLife', id: 'x3k-bitlife', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/bitlife/icon.png' },
    { name: 'Run 3', id: 'x3k-run3', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/run-3/icon.png' },
    { name: 'Crossy Road', id: 'x3k-crossy', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/crossy-road/icon.png' },
    { name: 'Temple Run 2', id: 'x3k-temple', cover: 'https://3kh0-lite.global.ssl.fastly.net/projects/temple-run-2/icon.png' },
];

function openQuickLauncher() {
    var ql = document.getElementById('quick-launcher');
    if (!ql) return;
    ql.classList.add('open');
    renderQuickLauncher();
    var search = document.getElementById('quick-launch-search');
    if (search) {
        setTimeout(function() { search.focus(); }, 100);
    }
}

function closeQuickLauncher() {
    var ql = document.getElementById('quick-launcher');
    if (ql) ql.classList.remove('open');
}

function renderQuickLauncher(filter) {
    var body = document.getElementById('quick-launch-body');
    if (!body) return;
    
    filter = (filter || '').toLowerCase();
    var filtered = quickLauncherGames.filter(function(g) {
        return g.name.toLowerCase().includes(filter);
    });
    
    var html = '<div class="quick-launch-section"><h3>Quick Play</h3><div class="quick-game-grid">';
    filtered.forEach(function(game) {
        html += '<div class="quick-game-card" onclick="quickLaunchGame(\'' + game.id + '\',\'' + game.name.replace(/'/g, "\\'") + '\')">';
        html += '<img src="' + game.cover + '" alt="' + game.name + '" onerror="this.src=\'https://via.placeholder.com/64?text=?\'">';
        html += '<span>' + game.name + '</span></div>';
    });
    html += '</div></div>';
    
    body.innerHTML = html;
}

function filterQuickLauncher(val) {
    renderQuickLauncher(val);
}

function quickLaunchGame(gameId, gameName) {
    closeQuickLauncher();
    
    // Build the game URL
    var gameUrls = {
        'x3k-slope': 'https://3kh0-lite.global.ssl.fastly.net/projects/slope/',
        'x3k-1v1': 'https://3kh0-lite.global.ssl.fastly.net/projects/1v1lol/',
        'x3k-retrobowl': 'https://3kh0-lite.global.ssl.fastly.net/projects/retro-bowl/',
        'x3k-drivemad': 'https://3kh0-lite.global.ssl.fastly.net/projects/drive-mad/',
        'x3k-smashkarts': 'https://3kh0-lite.global.ssl.fastly.net/projects/smash-karts/',
        'x3k-cookie': 'https://3kh0-lite.global.ssl.fastly.net/projects/cookie-clicker/',
        'x3k-geo': 'https://3kh0-lite.global.ssl.fastly.net/projects/geometry-dash/',
        'x3k-tunnel': 'https://3kh0-lite.global.ssl.fastly.net/projects/tunnel-rush/',
        'x3k-moto': 'https://3kh0-lite.global.ssl.fastly.net/projects/moto-x3m/',
        'mc-1.8.8': 'https://eaglercraft.com/mc/1.8.8/',
        'dos-doom': 'https://js-dos.com/games/doom.exe.html',
        'x3k-stick': 'https://3kh0-lite.global.ssl.fastly.net/projects/stickman-hook/',
        'x3k-bitlife': 'https://3kh0-lite.global.ssl.fastly.net/projects/bitlife/',
        'x3k-run3': 'https://3kh0-lite.global.ssl.fastly.net/projects/run-3/',
        'x3k-crossy': 'https://3kh0-lite.global.ssl.fastly.net/projects/crossy-road/',
        'x3k-temple': 'https://3kh0-lite.global.ssl.fastly.net/projects/temple-run-2/',
    };
    
    var url = gameUrls[gameId];
    if (!url) return;
    
    // Open game in a window
    if (window.toggleApp) {
        // Create a custom game window
        var layer = document.getElementById('windows-layer');
        var winId = 'quick-game-' + gameId;
        var existingWin = document.getElementById('win-' + winId);
        
        if (existingWin) {
            existingWin.classList.remove('minimized');
            existingWin.classList.add('active');
            existingWin.style.zIndex = ++highestZ;
            return;
        }
        
        var win = document.createElement('div');
        win.id = 'win-' + winId;
        win.className = 'window active header-visible';
        win.style.zIndex = ++highestZ;
        win.innerHTML = '<div class="win-header"><div class="win-title">' + gameName + '</div><div class="win-controls"><div class="win-btn btn-min" onclick="minimizeWindow(\'' + winId + '\')"></div><div class="win-btn btn-close" onclick="closeWindow(\'' + winId + '\')"></div></div></div><div class="win-body"><iframe id="frame-' + winId + '" allow="autoplay;fullscreen;gamepad" allowfullscreen></iframe></div>';
        layer.appendChild(win);
        
        var iframe = document.getElementById('frame-' + winId);
        if (iframe) {
            iframe.src = '/service/' + btoa(url);
        }
        
        activeWindowId = winId;
        startImmersiveMode(win);
    }
}

// Keyboard shortcut for quick launcher (Ctrl+G)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        var ql = document.getElementById('quick-launcher');
        if (ql.classList.contains('open')) {
            closeQuickLauncher();
        } else {
            openQuickLauncher();
        }
    }
    // Ctrl+T for terminal
    if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        var lc = document.getElementById('linux-console');
        if (lc.classList.contains('open')) {
            closeLinuxConsole();
        } else {
            openLinuxConsole();
        }
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-UPDATE FROM GITHUB
// ═══════════════════════════════════════════════════════════════════════════
function checkForUpdates() {
    // Check GitHub for latest version
    fetch('https://api.github.com/repos/midicl/IntellectualOS/commits/main')
        .then(function(response) {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(function(data) {
            var latestSha = data.sha;
            var lastCheck = localStorage.getItem('ios_last_update_check');
            var currentSha = localStorage.getItem('ios_current_sha');
            
            if (currentSha && currentSha !== latestSha) {
                showNotification('Update Available', 'A new version of Intellectual OS is available. Reload to update.');
            }
            
            localStorage.setItem('ios_last_update_check', Date.now().toString());
            localStorage.setItem('ios_current_sha', latestSha);
        })
        .catch(function() {
            // Silently fail if GitHub is unreachable
        });
}

// Check for updates on load (with rate limiting)
document.addEventListener('DOMContentLoaded', function() {
    var lastCheck = parseInt(localStorage.getItem('ios_last_update_check') || '0');
    var now = Date.now();
    // Only check every 5 minutes
    if (now - lastCheck > 300000) {
        checkForUpdates();
    }
});

// Auto-reload if update flag is set
if (localStorage.getItem('ios_pending_update') === 'true') {
    localStorage.removeItem('ios_pending_update');
    window.location.reload();
}
