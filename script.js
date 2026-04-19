var _devBuildVer = "1.0.0";

var APPS = {
    'cine':     {title:'INTELLECTUAL // HUB', internal:true, icon:'https://cdn.worldvectorlogo.com/logos/netflix-logo-icon.svg', pinned:true},
    'term':     {title:'Music',               internal:true, icon:'https://cdn.pixabay.com/photo/2016/10/22/00/15/spotify-1759471_1280.jpg', pinned:true},
    'files':    {title:'Games',               internal:true, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-OeL_be7RFaoHi3PswkuAR5XcMgBNRDynsg&s', pinned:true},
    'web':      {title:'Browser',             internal:true, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeD89ZcX5W1FBtal7RerasT27q-OmZqnBixQ&s', pinned:true},
    'settings': {title:'CONFIG',              internal:true, icon:'https://cdn.iconscout.com/icon/free/png-256/free-apple-settings-icon-svg-download-png-493162.png', pinned:true},
    'discord':  {title:'Discord',             internal:true, icon:'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', pinned:false},
    'roblox':   {title:'Roblox',              internal:true, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KvNyFWMg_bjo_q_1IVLKFWbfCeonn2qDow&s', pinned:false},
    'youtube':  {title:'YouTube',             internal:true, icon:'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', pinned:false},
    'ciniai':   {title:'Intellectual AI',     internal:true, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkLXhvns5Rrdf-XBNlWcPIRh0hlJfWnEtBWg&s', pinned:false},
    'Geforce':  {title:'GeForce NOW',         internal:true, icon:'https://play-lh.googleusercontent.com/_-b_HQXrVyyhZSHj_BoE9u_-cxkcHDH_yLX5rDjJsFMIfsCNQs9F3QP4JvEFcWaSIz0=w240-h480-rw', pinned:false},
};

var savedPins = localStorage.getItem('intel_pins_v2');
if(savedPins){var p=JSON.parse(savedPins);for(var k in p){if(APPS[k])APPS[k].pinned=p[k];}}
function syncPins(){var obj={};for(var k in APPS)obj[k]=APPS[k].pinned;localStorage.setItem('intel_pins_v2',JSON.stringify(obj));}

var wallpaperRegistry = {
    "css-space":  {id:"css-space",  name:"Deep Space",  url:"__css__", css:"radial-gradient(ellipse at 20% 50%, #0d0d2b 0%, #000 70%)",  locked:false},
    "css-forest": {id:"css-forest", name:"Dark Forest",  url:"__css__", css:"radial-gradient(ellipse at bottom, #0a1a0a 0%, #000 70%)",   locked:false},
    "css-ocean":  {id:"css-ocean",  name:"Deep Ocean",   url:"__css__", css:"radial-gradient(ellipse at top, #001a2e 0%, #000 70%)",      locked:false},
    "css-fire":   {id:"css-fire",   name:"Ember",        url:"__css__", css:"radial-gradient(ellipse at bottom right, #1a0500 0%, #000 70%)", locked:false},
    "css-purple": {id:"css-purple", name:"Nebula",       url:"__css__", css:"radial-gradient(ellipse at center, #0d001a 0%, #000 70%)",   locked:false},
    "css-ice":    {id:"css-ice",    name:"Frost",        url:"__css__", css:"radial-gradient(ellipse at top left, #001020 0%, #000 70%)", locked:false},
};

var sysConfig = JSON.parse(localStorage.getItem('intel_sys_config'))||{};
if(sysConfig.optBg===undefined)sysConfig.optBg=false;
if(sysConfig.shortBoot===undefined)sysConfig.shortBoot=false;
if(sysConfig.wpLoop===undefined)sysConfig.wpLoop=false;
if(sysConfig.idleLock===undefined)sysConfig.idleLock=false;
if(sysConfig.redirectConfirm===undefined)sysConfig.redirectConfirm=false;
if(!sysConfig.panicKey)sysConfig.panicKey='`';
if(!sysConfig.homeWallpaper)sysConfig.homeWallpaper='css-space';
if(!sysConfig.lockWallpaper)sysConfig.lockWallpaper='css-ocean';
if(!sysConfig.cloak)sysConfig.cloak='none';

window.updateSysSetting=function(key,value){sysConfig[key]=value;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));if(key==='optBg')applySystemSettings();};
var cloaks={none:{title:"Intellectual OS",icon:""},google:{title:"Google",icon:"https://www.google.com/favicon.ico"},drive:{title:"My Drive - Google Drive",icon:"https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"},canvas:{title:"Dashboard",icon:"https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico"},classroom:{title:"Classes",icon:"https://ssl.gstatic.com/classroom/favicon.png"}};
window.updateCloak=function(key){sysConfig.cloak=key;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));applyCloak();};
function applyCloak(){var k=sysConfig.cloak||'none',sel=cloaks[k],icons=document.querySelectorAll("link[rel*='icon']");for(var i=0;i<icons.length;i++)icons[i].remove();if(sel&&k!=='none'){document.title=sel.title;var n=document.createElement('link');n.type='image/x-icon';n.rel='shortcut icon';n.href=sel.icon;document.getElementsByTagName('head')[0].appendChild(n);}else{document.title="Intellectual OS";}}
setInterval(applyCloak,2000);

var isDesktopActive=false,bootActive=true,enterCount=0,highestZ=500,activeWindowId=null,isMediaPlaying=false,activeCtxId=null;
var isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if(isMobile){var mw=document.getElementById('mobile-warning');if(mw&&mw.showModal)mw.showModal();else if(mw)mw.style.display='flex';var lastTap=0;document.addEventListener('touchstart',function(e){var t=new Date().getTime(),tl=t-lastTap;if(tl<500&&tl>0){if(mw&&mw.close)mw.close();else if(mw)mw.style.display='none';}lastTap=t;});}

document.addEventListener("DOMContentLoaded",function(){applyCloak();document.getElementById('boot-layer').style.display='block';renderUI();initWallpapers();setupAppContextMenu();loadDesktop();updateSidebarData();});

// ── BOOT ─────────────────────────────────────────────────────────────────────
function startBootSequence(){
    if(sysConfig.shortBoot){skipBootSequence();return;}
    var bc=document.getElementById('boot-content');bc.style.display='none';
    var bl=document.getElementById('boot-layer');
    var wrap=document.createElement('div');
    wrap.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;z-index:2;';
    wrap.innerHTML='<div style="font-family:\'Orbitron\',sans-serif;font-size:2rem;color:#fff;letter-spacing:10px;text-shadow:0 0 30px rgba(255,255,255,0.3);">INTELLECTUAL OS</div><div style="width:220px;"><div style="width:100%;height:2px;background:#1a1a1a;border-radius:2px;overflow:hidden;"><div id="bp" style="height:100%;width:0%;background:#fff;transition:width 0.08s linear;border-radius:2px;"></div></div><div id="bm" style="margin-top:12px;font-family:\'Rajdhani\',sans-serif;color:#444;font-size:11px;letter-spacing:4px;text-align:center;">INITIALIZING...</div></div>';
    bl.appendChild(wrap);
    var msgs=['LOADING CORE...','MOUNTING APPS...','STARTING SERVICES...','SYSTEM READY'];
    var pct=0,mi=0;
    var iv=setInterval(function(){pct+=1.5;var bp=document.getElementById('bp'),bm=document.getElementById('bm');if(bp)bp.style.width=Math.min(pct,100)+'%';if(bm&&pct%25<2&&mi<msgs.length)bm.innerText=msgs[mi++];if(pct>=100){clearInterval(iv);setTimeout(function(){if(bootActive)skipBootSequence();},400);}},25);
}
function skipBootSequence(){if(!bootActive)return;bootActive=false;var lay=document.getElementById('boot-layer');if(lay){lay.style.opacity='0';document.getElementById('lock-screen').classList.add('active');setTimeout(function(){lay.style.display='none';},600);updateClock();}}
document.addEventListener('keydown',function(e){if(bootActive&&e.key==='Enter'){enterCount++;if(enterCount>=2)skipBootSequence();setTimeout(function(){enterCount=0;},500);}if(e.key&&sysConfig.panicKey&&e.key.toLowerCase()===sysConfig.panicKey.toLowerCase())window.location.href="https://google.com";});

// ── WALLPAPERS (CSS-based, zero file dependencies) ────────────────────────────
function applyWallpaperCSS(wp,target){
    if(!wp)return;
    var da=document.getElementById('desktop-area'),ls=document.getElementById('lock-screen');
    var bv=document.getElementById('bg-video'),bi=document.getElementById('bg-img');
    var lv=document.getElementById('lock-video'),li=document.getElementById('lock-img');
    if(wp.url==='__css__'){
        if(target==='home'){bv.style.display='none';bi.style.display='none';da.style.background=wp.css;}
        else{lv.style.display='none';li.style.display='none';ls.style.background=wp.css;}
    } else {
        var isImg=wp.url.match(/\.(png|jpg|jpeg|gif)$/i);
        var vEl=target==='home'?bv:lv, iEl=target==='home'?bi:li;
        if(isImg){vEl.style.display='none';iEl.style.display='block';iEl.src=wp.url;iEl.onerror=function(){iEl.style.display='none';};}
        else{iEl.style.display='none';vEl.style.display='block';vEl.src=wp.url;vEl.load();vEl.onerror=function(){vEl.style.display='none';};if(target==='home'&&isDesktopActive&&!sysConfig.optBg)vEl.play().catch(function(){});}
    }
}
function initWallpapers(){
    document.getElementById('desktop-area').style.background='radial-gradient(ellipse at 20% 50%, #0d0d2b 0%, #000 70%)';
    document.getElementById('lock-screen').style.background='radial-gradient(ellipse at top, #001a2e 0%, #000 70%)';
    applyWallpaperCSS(wallpaperRegistry[sysConfig.homeWallpaper]||wallpaperRegistry['css-space'],'home');
    applyWallpaperCSS(wallpaperRegistry[sysConfig.lockWallpaper]||wallpaperRegistry['css-ocean'],'lock');
    var chk=document.getElementById('wp-loop-chk');if(chk)chk.checked=sysConfig.wpLoop;
}
function setWallpaper(k){var d=wallpaperRegistry[k];if(!d)return;if(window.wpMode==='home'||window.wpMode==='both'){applyWallpaperCSS(d,'home');sysConfig.homeWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}if(window.wpMode==='lock'||window.wpMode==='both'){applyWallpaperCSS(d,'lock');sysConfig.lockWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}}
window.wpMode='both';
function openWallpaperMenu(){var m=document.getElementById('wallpaper-menu'),gu=document.getElementById('wp-grid-unlocked');if(!m||!gu)return;if(m.showModal)m.showModal();else m.style.display='flex';m.classList.add('open');gu.innerHTML='';for(var k in wallpaperRegistry){var d=wallpaperRegistry[k],c=document.createElement('div');c.className='wp-card';c.setAttribute('data-key',k);if(d.url==='__css__'){c.innerHTML='<div style="width:100%;height:100%;background:'+d.css+';"></div><div class="wp-info">'+d.name+'</div>';}else{var mh=d.url.match(/\.(png|jpg|jpeg|gif)$/i)?'<img src="'+d.url+'" alt="wp">':'<video src="'+d.url+'" preload="none" playsinline muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>';c.innerHTML=mh+'<div class="wp-info">'+d.name+'</div>';}c.onclick=function(){setWallpaper(this.getAttribute('data-key'));document.querySelectorAll('.wp-card').forEach(function(x){x.classList.remove('active-wp');});this.classList.add('active-wp');};gu.appendChild(c);}var chk=document.getElementById('wp-loop-chk');if(chk){chk.checked=sysConfig.wpLoop;chk.onchange=function(e){window.updateSysSetting('wpLoop',e.target.checked);};}};

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function updateClock(){var n=new Date(),dArr=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'],mArr=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'],hrs=n.getHours().toString().padStart(2,'0'),min=n.getMinutes().toString().padStart(2,'0'),dName=dArr[n.getDay()],dNum=n.getDate().toString().padStart(2,'0'),yr=n.getFullYear();var lDay=document.getElementById('lock-day-large'),lDat=document.getElementById('lock-date'),lTim=document.getElementById('lock-time'),hDay=document.getElementById('lbl-day');if(lDay)lDay.innerText=dName;if(hDay)hDay.innerText=dName;if(lDat)lDat.innerText=dNum+' '+mArr[n.getMonth()]+', '+yr+'.';if(lTim)lTim.innerText='- '+hrs+':'+min+' -';}
setInterval(updateClock,1000);

// ── LOCK / UNLOCK ─────────────────────────────────────────────────────────────
var welcomeShown=false;
window.unlockSystem=function(){var scr=document.getElementById('lock-screen');scr.classList.add('slide-up');setTimeout(function(){scr.classList.remove('active');isDesktopActive=true;if(!welcomeShown){showNotification("Welcome to Intellectual OS","Right-click desktop to change wallpaper!");welcomeShown=true;}},600);resetIdle();};
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

function getAppSrcdoc(id){
var B='<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@900&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:Rajdhani,sans-serif;height:100vh;overflow:hidden}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}input,select,button{font-family:Rajdhani}</style></head><body>';
var E='</body></html>';

// ── HUB: YouTube Embed Player ────────────────────────────────────────────────
if(id==='cine')return B+`
<div style="height:100%;display:flex;flex-direction:column;background:#0a0a0a">
  <div style="padding:12px 16px;background:#111;border-bottom:1px solid #222;display:flex;gap:8px;align-items:center;flex-shrink:0">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px;color:#fff;flex-shrink:0">INTELLECTUAL HUB</div>
    <input id="vi" type="text" placeholder="Paste YouTube URL or video ID..."
      style="flex:1;background:#1a1a1a;border:1px solid #333;color:#fff;padding:8px 12px;border-radius:8px;outline:none;font-size:14px;font-weight:600"
      onkeydown="if(event.key==='Enter')load()">
    <button onclick="load()" style="background:#fff;color:#000;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700;flex-shrink:0">PLAY</button>
  </div>
  <div id="cats" style="padding:10px 16px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0">
    ${[['Anime','anime episodes full'],['Movies','full movie 2024'],['TV Shows','full episode'],['Cartoons','cartoon full episode'],['Documentaries','documentary full 2024'],['Music Videos','official music video']].map(function(x){return'<button onclick="srch(\''+x[1]+'\')" style="background:#1a1a1a;border:1px solid #333;color:#888;padding:5px 12px;border-radius:16px;cursor:pointer;font-size:12px;font-weight:700;transition:.2s" onmouseover="this.style.color=\'#fff\';this.style.borderColor=\'#fff\'" onmouseout="this.style.color=\'#888\';this.style.borderColor=\'#333\'">'+x[0]+'</button>';}).join('')}
  </div>
  <div id="ph" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
    <div style="font-size:3rem">📺</div>
    <p style="font-family:Orbitron;letter-spacing:4px;color:#222;font-size:.75rem">PASTE A YOUTUBE URL ABOVE</p>
    <p style="color:#333;font-size:12px;max-width:300px;text-align:center">Tip: Go to YouTube, right-click any video → Copy link, then paste it here</p>
  </div>
  <iframe id="yt" src="" style="flex:1;border:none;display:none" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
</div>
<script>
function getid(s){
  s=s.trim();
  var m=s.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  return m?m[1]:(s.length===11?s:null);
}
function load(){
  var v=document.getElementById('vi').value;
  var vid=getid(v);
  if(!vid){document.getElementById('ph').innerHTML='<div style="color:#e55;font-size:14px;font-weight:700">⚠ Paste a full YouTube URL or 11-character video ID</div>';document.getElementById('ph').style.display='flex';return;}
  document.getElementById('ph').style.display='none';
  document.getElementById('yt').style.display='block';
  document.getElementById('yt').src='https://www.youtube.com/embed/'+vid+'?autoplay=1&rel=0';
}
function srch(q){document.getElementById('vi').value=q;document.getElementById('ph').innerHTML='<div style="font-size:2rem">🔍</div><p style="font-family:Orbitron;letter-spacing:3px;color:#333;font-size:.75rem">GO TO YOUTUBE, SEARCH: '+q.toUpperCase()+'</p><p style="color:#333;font-size:12px;max-width:280px;text-align:center;margin-top:8px">Copy the URL from YouTube and paste it above to play here</p>';document.getElementById('ph').style.display='flex';}
<\/script>`+E;

// ── MUSIC: SoundCloud + YouTube embeds ───────────────────────────────────────
if(id==='term')return B+`
<div style="height:100%;display:flex;flex-direction:column;background:#0a0a0a">
  <div style="padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;gap:8px;align-items:center;flex-shrink:0">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px;flex-shrink:0">MUSIC</div>
    <div id="tabs" style="display:flex;gap:6px;margin-left:auto">
      <button onclick="sw('sc')" id="t-sc" style="background:#ff5500;color:#fff;border:none;padding:5px 14px;border-radius:16px;cursor:pointer;font-weight:700;font-size:12px">SoundCloud</button>
      <button onclick="sw('yt')" id="t-yt" style="background:#1a1a1a;color:#888;border:1px solid #333;padding:5px 14px;border-radius:16px;cursor:pointer;font-weight:700;font-size:12px">YouTube</button>
    </div>
  </div>
  <div id="sc-wrap" style="flex:1;display:flex;flex-direction:column">
    <div style="padding:10px 16px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0">
      ${[['Hip-Hop Charts','https://soundcloud.com/charts/top?genre=hiphoprap'],['Pop Charts','https://soundcloud.com/charts/top?genre=pop'],['Lo-Fi Beats','https://soundcloud.com/lo-fi-beats'],['Phonk','https://soundcloud.com/charts/top?genre=danceedm'],['R&B','https://soundcloud.com/charts/top?genre=rnb']].map(function(x){return'<button onclick="loadsc(\''+x[1]+'\')" style="background:#1a1a1a;border:1px solid #333;color:#888;padding:4px 10px;border-radius:14px;cursor:pointer;font-size:12px;font-weight:700;transition:.2s" onmouseover="this.style.color=\'#fff\';this.style.borderColor=\'#ff5500\'" onmouseout="this.style.color=\'#888\';this.style.borderColor=\'#333\'">'+x[0]+'</button>';}).join('')}
      <input id="sc-in" type="text" placeholder="SoundCloud URL..." style="flex:1;background:#1a1a1a;border:1px solid #333;color:#fff;padding:5px 10px;border-radius:8px;outline:none;font-size:13px;min-width:140px">
      <button onclick="loadsc(document.getElementById('sc-in').value)" style="background:#ff5500;border:none;color:#fff;padding:5px 12px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">GO</button>
    </div>
    <iframe id="sc-frame" src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/charts/top&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false" style="flex:1;border:none" allow="autoplay"></iframe>
  </div>
  <div id="yt-wrap" style="flex:1;display:none;flex-direction:column">
    <div style="padding:10px 16px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;flex-shrink:0">
      <input id="yt-in" type="text" placeholder="Paste YouTube music video URL..." style="flex:1;background:#1a1a1a;border:1px solid #333;color:#fff;padding:7px 12px;border-radius:8px;outline:none;font-size:13px">
      <button onclick="loadyt()" style="background:#ff0000;border:none;color:#fff;padding:7px 14px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px">PLAY</button>
    </div>
    <iframe id="yt-frame" src="" style="flex:1;border:none" allow="autoplay;fullscreen" allowfullscreen></iframe>
  </div>
</div>
<script>
function sw(t){
  document.getElementById('sc-wrap').style.display=t==='sc'?'flex':'none';
  document.getElementById('yt-wrap').style.display=t==='yt'?'flex':'none';
  document.getElementById('t-sc').style.background=t==='sc'?'#ff5500':'#1a1a1a';
  document.getElementById('t-sc').style.color=t==='sc'?'#fff':'#888';
  document.getElementById('t-sc').style.border=t==='sc'?'none':'1px solid #333';
  document.getElementById('t-yt').style.background=t==='yt'?'#ff0000':'#1a1a1a';
  document.getElementById('t-yt').style.color=t==='yt'?'#fff':'#888';
  document.getElementById('t-yt').style.border=t==='yt'?'none':'1px solid #333';
}
function loadsc(url){
  if(!url)return;
  document.getElementById('sc-frame').src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%23ff5500&auto_play=true';
}
function loadyt(){
  var s=document.getElementById('yt-in').value.trim();
  var m=s.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  var vid=m?m[1]:(s.length===11?s:null);
  if(!vid)return;
  document.getElementById('yt-frame').src='https://www.youtube.com/embed/'+vid+'?autoplay=1';
}
<\/script>`+E;

// ── GAMES ─────────────────────────────────────────────────────────────────────
if(id==='files')return B+`
<div style="height:100%;display:flex;flex-direction:column;background:#0a0a0a">
  <div style="padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px;flex-shrink:0">GAME VAULT</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${[['Minecraft','mc'],['Bloxd.io','bloxd'],['Smash Karts','smash'],['Venge.io','venge'],['Zombs Royale','zombs'],['Retro Emu','retro']].map(function(x){return'<button id="gb-'+x[1]+'" onclick="lg(\''+x[1]+'\')" style="background:#1a1a1a;border:1px solid #333;color:#888;padding:5px 13px;border-radius:16px;cursor:pointer;font-weight:700;font-size:12px;transition:.2s" onmouseover="this.style.borderColor=\'#fff\';this.style.color=\'#fff\'" onmouseout="if(cur!==\''+x[1]+'\'){this.style.borderColor=\'#333\';this.style.color=\'#888\';}">'+x[0]+'</button>';}).join('')}
    </div>
  </div>
  <div id="retro-bar" style="display:none;padding:10px 16px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;flex-shrink:0">
    <div style="font-size:12px;color:#666;margin-bottom:8px;font-weight:600">RETRO EMULATOR — Select system & paste a ROM URL from <a href="https://vimm.net" style="color:#aaa">vimm.net</a> or archive.org</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <select id="sys" style="background:#111;color:#fff;border:1px solid #333;padding:6px 10px;border-radius:6px;outline:none">
        <option value="gba">GBA</option>
        <option value="nes">NES</option>
        <option value="snes">SNES</option>
        <option value="n64">N64</option>
        <option value="nds">Nintendo DS</option>
        <option value="psx">PlayStation 1</option>
      </select>
      <input id="rom-url" type="text" placeholder="Direct ROM file URL (.gba, .nes, .sfc, .z64, .nds, .bin)..."
        style="flex:1;background:#111;border:1px solid #333;color:#fff;padding:6px 10px;border-radius:6px;outline:none;font-size:13px;min-width:200px">
      <button onclick="launchEmu()" style="background:#fff;color:#000;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-weight:700;font-size:13px">LAUNCH</button>
    </div>
  </div>
  <div id="gph" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
    <div style="font-size:3rem">🎮</div>
    <p style="font-family:Orbitron;letter-spacing:3px;color:#222;font-size:.75rem">SELECT A GAME ABOVE</p>
  </div>
  <iframe id="gf" src="" style="width:100%;border:none;display:none;flex:1" allow="autoplay;fullscreen;gamepad;clipboard-write" allowfullscreen></iframe>
  <div id="emu-wrap" style="flex:1;display:none;flex-direction:column">
    <div id="emu-container" style="flex:1;position:relative"></div>
  </div>
</div>
<script src="https://cdn.emulatorjs.org/stable/data/loader.js" id="emu-script" data-autoload="false"><\/script>
<script>
var cur='';
var GAMES={
  mc:{url:'https://eaglercraft.com/mc/1.8.8-wasm/',label:'Minecraft'},
  bloxd:{url:'https://bloxd.io/',label:'Bloxd.io'},
  smash:{url:'https://smashkarts.io/',label:'Smash Karts'},
  venge:{url:'https://venge.io/',label:'Venge.io'},
  zombs:{url:'https://zombsroyale.io/',label:'Zombs Royale'},
};
function lg(k){
  cur=k;
  document.querySelectorAll('[id^="gb-"]').forEach(function(b){b.style.background='#1a1a1a';b.style.color='#888';b.style.borderColor='#333';});
  document.getElementById('gb-'+k).style.background='#fff';
  document.getElementById('gb-'+k).style.color='#000';
  document.getElementById('gb-'+k).style.border='none';
  document.getElementById('gph').style.display='none';
  document.getElementById('emu-wrap').style.display='none';
  document.getElementById('retro-bar').style.display='none';
  if(k==='retro'){
    document.getElementById('gf').style.display='none';
    document.getElementById('retro-bar').style.display='block';
    document.getElementById('emu-wrap').style.display='flex';
    return;
  }
  document.getElementById('gf').style.display='block';
  document.getElementById('gf').src=GAMES[k]?GAMES[k].url:'';
}
function launchEmu(){
  var sys=document.getElementById('sys').value;
  var rom=document.getElementById('rom-url').value.trim();
  if(!rom){alert('Paste a ROM URL first!');return;}
  var c=document.getElementById('emu-container');
  c.innerHTML='';
  window.EJS_player='#emu-container';
  window.EJS_gameUrl=rom;
  window.EJS_core=sys;
  window.EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';
  window.EJS_startOnLoaded=true;
  var s=document.createElement('script');
  s.src='https://cdn.emulatorjs.org/stable/data/loader.js';
  document.body.appendChild(s);
}
<\/script>`+E;

// ── BROWSER: Proxy browser ────────────────────────────────────────────────────
if(id==='web')return B+`
<div style="height:100%;display:flex;flex-direction:column;background:#0a0a0a">
  <div style="padding:10px 14px;background:#111;border-bottom:1px solid #222;display:flex;gap:8px;align-items:center;flex-shrink:0">
    <button onclick="goBack()" style="background:#1a1a1a;border:1px solid #333;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;transition:.2s" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#1a1a1a'">←</button>
    <button onclick="goFwd()" style="background:#1a1a1a;border:1px solid #333;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;transition:.2s" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#1a1a1a'">→</button>
    <input id="ub" type="text" placeholder="Enter URL or search..."
      style="flex:1;background:#1a1a1a;border:1px solid #333;color:#fff;padding:8px 12px;border-radius:8px;outline:none;font-size:14px;font-weight:600"
      onkeydown="if(event.key==='Enter')nav()">
    <button onclick="nav()" style="background:#fff;color:#000;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700;flex-shrink:0">GO</button>
  </div>
  <div id="proxy-bar" style="background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:8px 14px;display:flex;align-items:center;gap:8px;flex-shrink:0">
    <span style="font-size:11px;color:#555;flex-shrink:0">⚡ PROXY:</span>
    <input id="purl" type="text" placeholder="Paste your Ultraviolet URL here to unlock all sites..."
      style="flex:1;background:#111;border:1px solid #222;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px"
      oninput="localStorage.setItem('intel_proxy_url',this.value);updateStatus()">
    <div id="pstatus" style="font-size:11px;font-weight:700;flex-shrink:0"></div>
    <button onclick="showSetup()" style="background:#1a1a1a;border:1px solid #333;color:#888;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;flex-shrink:0" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#888'">HOW TO SET UP</button>
  </div>
  <div id="setup-guide" style="display:none;background:#0a0a0a;border-bottom:1px solid #1a1a1a;padding:16px;flex-shrink:0;max-height:200px;overflow-y:auto">
    <div style="font-family:Orbitron;font-size:.75rem;letter-spacing:3px;margin-bottom:12px;color:#fff">PROXY SETUP (FREE, 5 MIN)</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${[
        ['1','Go to','github.com/titaniumnetwork-dev/Ultraviolet-App','https://github.com/titaniumnetwork-dev/Ultraviolet-App'],
        ['2','Click the purple','Deploy to Render','https://render.com/deploy?repo=https://github.com/titaniumnetwork-dev/Ultraviolet-App'],
        ['3','Sign up for Render (free) and deploy','',''],
        ['4','Wait ~2 min, then copy the URL Render gives you','',''],
        ['5','Paste that URL in the proxy box above — done!','',''],
      ].map(function(x){return'<div style="display:flex;gap:10px;align-items:flex-start"><div style="background:#222;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">'+x[0]+'</div><div style="font-size:13px;color:#aaa">'+(x[1]?x[1]+' ':'')+(x[3]?'<a href="'+x[3]+'" target="_blank" style="color:#fff;font-weight:700">'+x[2]+'</a>':x[2])+'</div></div>';}).join('')}
    </div>
    <button onclick="document.getElementById(\'setup-guide\').style.display=\'none\'" style="margin-top:12px;background:#333;border:none;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px">CLOSE</button>
  </div>
  <div id="no-proxy-ph" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:30px;text-align:center">
    <div style="font-size:2.5rem">🔒</div>
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px;color:#333">NO PROXY CONFIGURED</div>
    <div style="color:#444;font-size:13px;max-width:320px;line-height:1.7">Without a proxy, school filters will block most sites. Click <strong style="color:#888">HOW TO SET UP</strong> above to deploy your free proxy in 5 minutes.</div>
    <div style="background:#1a1a1a;border:1px solid #222;border-radius:12px;padding:16px 20px;max-width:320px">
      <div style="color:#888;font-size:12px;font-weight:700;margin-bottom:6px">OR — enter a URL to try without proxy:</div>
      <div style="color:#555;font-size:12px">Some sites (YouTube, Wikipedia, etc.) may still load directly</div>
    </div>
  </div>
  <iframe id="bf" src="" style="flex:1;border:none;display:none;background:#000" allow="autoplay;fullscreen;clipboard-write;camera;microphone" allowfullscreen></iframe>
</div>
<script>
document.getElementById('purl').value=localStorage.getItem('intel_proxy_url')||'';
function updateStatus(){
  var p=localStorage.getItem('intel_proxy_url')||'';
  var s=document.getElementById('pstatus');
  if(p){s.textContent='✓ PROXY SET';s.style.color='#4a4';}
  else{s.textContent='✗ NO PROXY';s.style.color='#a44';}
}
updateStatus();
function nav(){
  var raw=document.getElementById('ub').value.trim();
  var proxy=document.getElementById('purl').value.trim();
  if(!raw)return;
  var url=raw.startsWith('http')?raw:(raw.includes('.')&&!raw.includes(' ')?'https://'+raw:'https://www.google.com/search?q='+encodeURIComponent(raw));
  var f=document.getElementById('bf'),ph=document.getElementById('no-proxy-ph');
  f.style.display='block';ph.style.display='none';
  if(proxy){
    var enc=btoa(url);
    f.src=proxy.replace(/\/$/,'')+'/service/'+enc;
  }else{
    f.src=url;
    f.onerror=function(){ph.style.display='flex';f.style.display='none';ph.querySelector('div:first-child').textContent='🚫';};
  }
}
function goBack(){try{document.getElementById('bf').contentWindow.history.back();}catch(e){}}
function goFwd(){try{document.getElementById('bf').contentWindow.history.forward();}catch(e){}}
function showSetup(){var g=document.getElementById('setup-guide');g.style.display=g.style.display==='none'?'block':'none';}
<\/script>`+E;

// ── SETTINGS ──────────────────────────────────────────────────────────────────
if(id==='settings')return B+`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<div style="padding:22px;height:100%;overflow-y:auto;background:#000">
  <h2 style="font-family:Orbitron;letter-spacing:2px;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:18px;font-size:1rem">SYSTEM CONFIG</h2>
  ${[['optBg','film','Optimized Background','Disables animated backgrounds'],['shortBoot','bolt','Fast Boot','Skip the boot animation'],['idleLock','lock','Idle Lock Screen','Lock after 3 min inactive'],['redirectConfirm','shield-alt','Redirect Confirmation','Block GoGuardian']].map(function(x){return'<div style="background:#111;border:1px solid #1a1a1a;padding:14px 15px;border-radius:10px;margin-bottom:9px;display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:12px;align-items:center"><i class="fas fa-'+x[1]+'" style="color:#555;width:18px;font-size:1.1rem"></i><div><div style="font-weight:700;font-size:14px">'+x[2]+'</div><div style="color:#555;font-size:12px">'+x[3]+'</div></div></div><label style="position:relative;display:inline-block;width:40px;height:20px"><input type="checkbox" id="c-'+x[0]+'" style="opacity:0;width:0;height:0"><span style="position:absolute;cursor:pointer;inset:0;background:#333;border-radius:34px;transition:.3s" onclick="var cb=this.previousElementSibling;cb.checked=!cb.checked;applyToggle(\''+x[0]+'\',cb.checked)"></span></label></div>';}).join('')}
  <div style="background:#111;border:1px solid #1a1a1a;padding:14px 15px;border-radius:10px;margin-bottom:9px;display:flex;justify-content:space-between;align-items:center">
    <div style="display:flex;gap:12px;align-items:center"><i class="fas fa-mask" style="color:#555;width:18px;font-size:1.1rem"></i><div><div style="font-weight:700;font-size:14px">Tab Cloak</div><div style="color:#555;font-size:12px">Disguise this tab</div></div></div>
    <select id="cloak-sel" onchange="window.parent.updateCloak(this.value)" style="background:#222;color:#fff;border:1px solid #333;padding:6px;border-radius:6px;outline:none">
      <option value="none">None (Intellectual OS)</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option>
    </select>
  </div>
  <div style="background:#111;border:1px solid #1a1a1a;padding:14px 15px;border-radius:10px;margin-bottom:9px;display:flex;justify-content:space-between;align-items:center">
    <div style="display:flex;gap:12px;align-items:center"><i class="fas fa-exclamation-triangle" style="color:#555;width:18px;font-size:1.1rem"></i><div><div style="font-weight:700;font-size:14px">Panic Key</div><div style="color:#555;font-size:12px">Instant redirect to Google</div></div></div>
    <input type="text" id="pk" maxlength="1" style="width:36px;height:28px;background:#222;border:1px solid #333;color:#fff;text-align:center;font-size:1.1rem;font-weight:bold;outline:none;border-radius:4px" onkeyup="window.parent.updateSysSetting('panicKey',this.value)">
  </div>
</div>
<script>
function applyToggle(k,v){
  var sl=document.querySelectorAll('#c-'+k+' + span');
  if(sl.length){sl[0].style.background=v?'#fff':'#333';}
  // move knob
  var cb=document.getElementById('c-'+k);
  if(cb){var knob=cb.nextElementSibling;if(knob){knob.style.background=v?'#fff':'#333';}}
  window.parent.updateSysSetting(k,v);
}
(function(){
  var p=window.parent.sysConfig;
  ['optBg','shortBoot','idleLock','redirectConfirm'].forEach(function(k){
    var cb=document.getElementById('c-'+k);
    if(cb){
      cb.checked=p[k];
      var span=cb.nextElementSibling;
      if(span){span.style.background=p[k]?'#fff':'#333';}
    }
  });
  var cs=document.getElementById('cloak-sel');if(cs)cs.value=p.cloak||'none';
  var pk=document.getElementById('pk');if(pk)pk.value=p.panicKey||'';
})();
<\/script>`+E;

// ── DISCORD ───────────────────────────────────────────────────────────────────
if(id==='discord')return B+`
<div style="height:100%;display:flex;flex-direction:column;background:#111">
  <div style="padding:10px 16px;background:#111;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;gap:10px;flex-shrink:0">
    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" style="width:24px">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px">DISCORD</div>
    <div id="dc-status" style="margin-left:auto;font-size:11px;color:#555">Needs proxy to fully work</div>
  </div>
  <div style="padding:10px 14px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;flex-shrink:0">
    <input id="dc-proxy" type="text" placeholder="Paste your proxy URL to load Discord..."
      style="flex:1;background:#111;border:1px solid #222;color:#aaa;padding:6px 10px;border-radius:6px;outline:none;font-size:12px"
      value="">
    <button onclick="loadDc()" style="background:#5865f2;border:none;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px">LOAD</button>
  </div>
  <iframe id="dc-frame" src="" style="flex:1;border:none;background:#2b2d31" allow="autoplay;fullscreen;clipboard-write;camera;microphone"></iframe>
</div>
<script>
document.getElementById('dc-proxy').value=localStorage.getItem('intel_proxy_url')||'';
function loadDc(){
  var proxy=document.getElementById('dc-proxy').value.trim();
  var f=document.getElementById('dc-frame');
  if(proxy){
    f.src=proxy.replace(/\/$/,'')+'/service/'+btoa('https://discord.com/app');
  }else{
    f.src='https://discord.com/app';
  }
  document.getElementById('dc-status').textContent='Loading...';
  document.getElementById('dc-status').style.color='#888';
}
if(localStorage.getItem('intel_proxy_url'))loadDc();
<\/script>`+E;

// ── AI ────────────────────────────────────────────────────────────────────────
if(id==='ciniai')return B+`
<div style="height:100%;display:flex;flex-direction:column">
  <div style="padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;flex-shrink:0">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px">INTELLECTUAL AI</div>
    <div style="margin-left:auto;display:flex;gap:6px">
      ${[['ChatGPT','gpt','https://chat.openai.com'],['Claude','claude','https://claude.ai'],['Gemini','gemini','https://gemini.google.com'],['Perplexity','perp','https://perplexity.ai']].map(function(x){return'<button id="ai-'+x[1]+'" onclick="loadAi(\''+x[2]+'\',\''+x[1]+'\')" style="background:#1a1a1a;border:1px solid #333;color:#888;padding:5px 12px;border-radius:14px;cursor:pointer;font-size:12px;font-weight:700;transition:.2s" onmouseover="this.style.color=\'#fff\'" onmouseout="if(curAi!==\''+x[1]+'\')this.style.color=\'#888\'">'+x[0]+'</button>';}).join('')}
    </div>
  </div>
  <div style="padding:8px 14px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;flex-shrink:0">
    <input id="ai-proxy" type="text" placeholder="Proxy URL (needed to bypass school AI blocks)..."
      style="flex:1;background:#111;border:1px solid #222;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px">
    <button onclick="reloadAi()" style="background:#333;border:none;color:#fff;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700">RELOAD</button>
  </div>
  <iframe id="ai-frame" src="" style="flex:1;border:none;background:#111" allow="autoplay;fullscreen;clipboard-write"></iframe>
</div>
<script>
var curAi='',curAiUrl='';
document.getElementById('ai-proxy').value=localStorage.getItem('intel_proxy_url')||'';
function loadAi(url,key){
  curAi=key;curAiUrl=url;
  document.querySelectorAll('[id^="ai-"]').forEach(function(b){if(b.tagName==='BUTTON'){b.style.background='#1a1a1a';b.style.color='#888';b.style.border='1px solid #333';}});
  var btn=document.getElementById('ai-'+key);if(btn){btn.style.background='#fff';btn.style.color='#000';btn.style.border='none';}
  var proxy=document.getElementById('ai-proxy').value.trim();
  var f=document.getElementById('ai-frame');
  f.src=proxy?proxy.replace(/\/$/,'')+'/service/'+btoa(url):url;
}
function reloadAi(){if(curAiUrl)loadAi(curAiUrl,curAi);}
loadAi('https://chat.openai.com','gpt');
<\/script>`+E;

// ── ROBLOX ────────────────────────────────────────────────────────────────────
if(id==='roblox')return B+`
<div style="height:100%;display:flex;flex-direction:column">
  <div style="padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;flex-shrink:0">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KvNyFWMg_bjo_q_1IVLKFWbfCeonn2qDow&s" style="width:24px;border-radius:6px">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px">ROBLOX</div>
  </div>
  <div style="padding:8px 14px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;flex-shrink:0">
    <input id="rb-proxy" type="text" placeholder="Proxy URL (required to load Roblox through school filters)..."
      style="flex:1;background:#111;border:1px solid #222;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px">
    <button onclick="loadRb()" style="background:#e2231a;border:none;color:#fff;padding:5px 14px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px">LAUNCH</button>
  </div>
  <iframe id="rb-frame" src="" style="flex:1;border:none;background:#111" allow="autoplay;fullscreen;clipboard-write"></iframe>
</div>
<script>
document.getElementById('rb-proxy').value=localStorage.getItem('intel_proxy_url')||'';
function loadRb(){
  var proxy=document.getElementById('rb-proxy').value.trim();
  var f=document.getElementById('rb-frame');
  f.src=proxy?proxy.replace(/\/$/,'')+'/service/'+btoa('https://www.roblox.com'):'https://www.roblox.com';
}
if(localStorage.getItem('intel_proxy_url'))loadRb();
<\/script>`+E;

// ── GEFORCE NOW ───────────────────────────────────────────────────────────────
if(id==='Geforce')return B+`
<div style="height:100%;display:flex;flex-direction:column">
  <div style="padding:10px 16px;background:#111;border-bottom:1px solid #222;display:flex;align-items:center;gap:10px;flex-shrink:0">
    <div style="font-family:Orbitron;font-size:.8rem;letter-spacing:3px">GEFORCE NOW</div>
  </div>
  <div style="padding:8px 14px;background:#0d0d0d;border-bottom:1px solid #1a1a1a;display:flex;gap:8px;flex-shrink:0">
    <input id="gfn-proxy" type="text" placeholder="Proxy URL..."
      style="flex:1;background:#111;border:1px solid #222;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px">
    <button onclick="loadGfn()" style="background:#76b900;border:none;color:#000;padding:5px 14px;border-radius:6px;cursor:pointer;font-weight:700;font-size:12px">LAUNCH</button>
  </div>
  <iframe id="gfn-frame" src="" style="flex:1;border:none;background:#111" allow="autoplay;fullscreen;clipboard-write;gamepad"></iframe>
</div>
<script>
document.getElementById('gfn-proxy').value=localStorage.getItem('intel_proxy_url')||'';
function loadGfn(){
  var proxy=document.getElementById('gfn-proxy').value.trim();
  var f=document.getElementById('gfn-frame');
  f.src=proxy?proxy.replace(/\/$/,'')+'/service/'+btoa('https://play.geforcenow.com'):'https://play.geforcenow.com';
}
if(localStorage.getItem('intel_proxy_url'))loadGfn();
<\/script>`+E;

return B+'<div style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px"><div style="font-size:2.5rem">🚧</div><p style="font-family:Orbitron;letter-spacing:3px;color:#2a2a2a;font-size:.8rem">APP NOT CONFIGURED</p></div>'+E;
}


// ── WINDOWS ───────────────────────────────────────────────────────────────────
function toggleApp(id){var w=document.getElementById('win-'+id);if(w){if(w.classList.contains('minimized')){w.classList.remove('minimized');w.classList.add('active');w.style.zIndex=++highestZ;activeWindowId=id;startImmersiveMode(w);}else if(activeWindowId===id){minimizeWindow(id);}else{w.style.zIndex=++highestZ;activeWindowId=id;startImmersiveMode(w);}}else{openWindow(id);}}
function openWindow(id){var sm=document.getElementById('start-menu');if(sm){sm.classList.remove('open');setTimeout(function(){sm.style.display='none';},300);}var layer=document.getElementById('windows-layer'),win=document.getElementById('win-'+id);if(!win){var dat=APPS[id]||{title:'APP',internal:true};win=document.createElement('div');win.id='win-'+id;win.className='window active header-visible';win.style.zIndex=++highestZ;win.innerHTML='<div class="win-header" onmousedown="DragSystem.startWinDrag(event,\''+id+'\')"><div class="win-title">'+dat.title+'</div><div class="win-controls"><div class="win-btn btn-min" onclick="minimizeWindow(\''+id+'\')"></div><div class="win-btn btn-close" onclick="closeWindow(\''+id+'\')"></div></div></div><div class="win-body"><iframe id="frame-'+id+'"></iframe></div>';layer.appendChild(win);var f=document.getElementById('frame-'+id);if(f)f.srcdoc=getAppSrcdoc(id);}else{win.classList.remove('minimized');win.classList.add('active');win.style.zIndex=++highestZ;}activeWindowId=id;startImmersiveMode(win);}
function closeWindow(id){var w=document.getElementById('win-'+id);if(w)w.remove();if(activeWindowId===id)activeWindowId=null;endImmersiveMode();}
function minimizeWindow(id){var w=document.getElementById('win-'+id);if(w){w.classList.add('minimized');w.classList.remove('active');if(activeWindowId===id)activeWindowId=null;}endImmersiveMode();}
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
function saveDesktop(){localStorage.setItem('intel_desktop_v2',JSON.stringify(desktopLayout));loadDesktop();}
function loadDesktop(){var c=document.getElementById('desktop-area');document.querySelectorAll('.desktop-app').forEach(function(e){e.remove();});desktopLayout.forEach(function(item,idx){var d=document.createElement('div');d.className='desktop-app';d.style.left=item.x+'px';d.style.top=item.y+'px';d.setAttribute('data-idx',idx);if(item.type==='folder'){var gHTML='<div class="d-folder-grid">';item.apps.slice(0,4).forEach(function(a){if(APPS[a])gHTML+='<img src="'+APPS[a].icon+'">';});gHTML+='</div>';if(!item.hideName)gHTML+='<div class="d-label">'+(item.customName||'Folder')+'</div>';d.innerHTML=gHTML;d.onclick=function(ev){if(DragSystem.isDragMove)return;ev.stopPropagation();if(!this.classList.contains('expanded-folder')){closeAllFolders();expandFolder(this,item,idx);}};}else{var a=APPS[item.id];if(a){d.innerHTML='<img src="'+(item.customIcon||a.icon)+'" class="d-icon">'+(item.hideName?'':'<div class="d-label">'+(item.customName||a.title)+'</div>');d.ondblclick=function(ev){ev.stopPropagation();toggleApp(item.id);};}}d.onmousedown=function(ev){ev.stopPropagation();if(ev.button===0)DragSystem.start(ev,d,'desktop',idx);};d.oncontextmenu=function(ev){ev.preventDefault();ev.stopPropagation();hideAllCtx();var m=document.getElementById('app-context-menu');if(m){m.style.display='block';m.style.left=ev.pageX+'px';m.style.top=ev.pageY+'px';m.setAttribute('data-target-idx',idx);}};c.appendChild(d);});}
function expandFolder(el,dat,idx){el.classList.add('expanded-folder');var h='<div class="folder-header">'+(dat.customName||'Folder')+' <i class="fas fa-times" onclick="closeAllFolders(event)"></i></div><div class="folder-grid-expanded">';dat.apps.forEach(function(aId){var info=APPS[aId];if(info)h+='<div class="f-app" onclick="event.stopPropagation();toggleApp(\''+aId+'\')"><img src="'+info.icon+'"><span>'+info.title+'</span></div>';});h+='</div>';el.innerHTML=h;setTimeout(function(){var rect=el.getBoundingClientRect();document.querySelectorAll('.desktop-app:not(.expanded-folder)').forEach(function(s){var sr=s.getBoundingClientRect();if(!(rect.right<sr.left||rect.left>sr.right||rect.bottom<sr.top||rect.top>sr.bottom)){s.style.transform='translateY('+(rect.bottom-sr.top+20)+'px)';s.setAttribute('data-pushed','true');}});},50);}
function closeAllFolders(ev){if(ev)ev.stopPropagation();document.querySelectorAll('.expanded-folder').forEach(function(o){o.classList.remove('expanded-folder');});document.querySelectorAll('.desktop-app[data-pushed="true"]').forEach(function(j){j.style.transform='';j.removeAttribute('data-pushed');});setTimeout(loadDesktop,250);}
function setupAppContextMenu(){var m=document.getElementById('app-context-menu');if(!m)return;m.innerHTML='<li class="ctx-item" id="ctx-rename" role="menuitem" tabindex="0"><i class="fas fa-edit fa-fw"></i> Rename</li><li class="ctx-item" id="ctx-hidename" role="menuitem" tabindex="0"><i class="fas fa-eye-slash fa-fw"></i> Toggle Name</li><li class="ctx-item" id="ctx-changeicon" role="menuitem" tabindex="0"><i class="fas fa-image fa-fw"></i> Change Icon</li><li class="ctx-separator"></li><li class="ctx-item" id="ctx-delete" role="menuitem" tabindex="0"><i class="fas fa-trash fa-fw" style="color:#aaa"></i> Remove</li>';document.getElementById('ctx-rename').onclick=function(){var i=m.getAttribute('data-target-idx'),nm=prompt("New name:",desktopLayout[i].customName||"");if(nm!==null){desktopLayout[i].customName=nm.trim()||"App";saveDesktop();}m.style.display='none';};document.getElementById('ctx-hidename').onclick=function(){var i=m.getAttribute('data-target-idx');desktopLayout[i].hideName=!desktopLayout[i].hideName;saveDesktop();m.style.display='none';};document.getElementById('ctx-changeicon').onclick=function(){var i=m.getAttribute('data-target-idx'),url=prompt("Image URL for icon:");if(url){desktopLayout[i].customIcon=url;saveDesktop();}m.style.display='none';};document.getElementById('ctx-delete').onclick=function(){var i=m.getAttribute('data-target-idx');desktopLayout.splice(i,1);saveDesktop();m.style.display='none';};}
document.addEventListener('contextmenu',function(e){var ids=['desktop-area','windows-layer','bg-video','bg-img','snow-fx'];if(ids.includes(e.target.id)||e.target.tagName==='BODY'||e.target.closest('#right-sidebar')){e.preventDefault();hideAllCtx();var m=document.getElementById('desktop-context-menu');if(m){m.style.display='block';var x=e.pageX,y=e.pageY;if(x+200>window.innerWidth)x=window.innerWidth-200;if(y+100>window.innerHeight)y=window.innerHeight-100;m.style.left=x+'px';m.style.top=y+'px';}}});
window.toggleDesktopSize=function(l){document.getElementById('desktop-area').classList[l?'add':'remove']('desktop-large-mode');document.getElementById('desktop-context-menu').style.display='none';};

// ── DRAG SYSTEM ───────────────────────────────────────────────────────────────
var DragSystem={dragging:false,startPos:{x:0,y:0},sourceType:null,sourceEl:null,idx:null,appId:null,proxy:document.getElementById('drag-proxy'),pImg:document.getElementById('proxy-img'),badge:document.getElementById('folder-badge'),init:function(){window.addEventListener('mousemove',function(e){DragSystem.move(e);});window.addEventListener('mouseup',function(e){DragSystem.end(e);});},start:function(e,el,type,id){this.startPos={x:e.clientX,y:e.clientY};this.sourceType=type;this.sourceEl=el;this.isDragMove=false;if(type==='drawer'||type==='dock')this.appId=id;else if(type==='desktop'){this.idx=id;this.sourceEl.style.opacity='0.5';}},startWinDrag:function(e,id){this.startPos={x:e.clientX,y:e.clientY};this.sourceType='window';this.sourceEl=document.getElementById('win-'+id);this.isDragMove=false;},move:function(e){if(!this.sourceEl)return;var dx=Math.abs(e.clientX-this.startPos.x),dy=Math.abs(e.clientY-this.startPos.y);if(dx>3||dy>3){this.dragging=true;this.isDragMove=true;if(this.sourceType==='desktop'||this.sourceType==='drawer'||this.sourceType==='dock'){if(this.sourceType==='drawer')toggleAppDrawer();this.proxy.style.display='block';this.proxy.style.left=(e.clientX-25)+'px';this.proxy.style.top=(e.clientY-25)+'px';if(this.sourceType==='drawer'||this.sourceType==='dock'){if(APPS[this.appId])this.pImg.src=APPS[this.appId].icon;}else{var itm=desktopLayout[this.idx];if(itm.type==='app'&&APPS[itm.id])this.pImg.src=APPS[itm.id].icon;else{this.pImg.src='';this.badge.style.display='flex';this.badge.innerText=itm.apps.length;}}}}},end:function(e){if(!this.sourceEl)return;if(!this.isDragMove&&this.sourceType==='desktop'){this.reset();return;}if(!this.dragging){this.reset();return;}if(this.sourceType==='desktop'||this.sourceType==='drawer'||this.sourceType==='dock'){var nx=Math.round((e.clientX-40)/90)*90,ny=Math.round((e.clientY-40)/100)*100;if(e.clientY>window.innerHeight-80){if(this.sourceType==='desktop')desktopLayout.splice(this.idx,1);}else{var tIdx=-1;document.querySelectorAll('.desktop-app').forEach(function(a){if(a!==DragSystem.sourceEl){var r=a.getBoundingClientRect();if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom)tIdx=a.dataset.idx;}});if(tIdx>-1){var targ=desktopLayout[tIdx],drp=(DragSystem.sourceType==='drawer'||DragSystem.sourceType==='dock')?[DragSystem.appId]:(desktopLayout[DragSystem.idx].type==='app'?[desktopLayout[DragSystem.idx].id]:desktopLayout[DragSystem.idx].apps);if(targ.type==='app'){targ.type='folder';targ.apps=[targ.id].concat(drp);delete targ.id;}else{targ.apps.push.apply(targ.apps,drp);}if(DragSystem.sourceType==='desktop')desktopLayout.splice(DragSystem.idx,1);}else{if(DragSystem.sourceType==='drawer'||DragSystem.sourceType==='dock')desktopLayout.push({type:'app',id:DragSystem.appId,x:nx,y:ny});else{desktopLayout[DragSystem.idx].x=nx;desktopLayout[DragSystem.idx].y=ny;}}}saveDesktop();}this.reset();},reset:function(){this.dragging=false;if(this.sourceEl)this.sourceEl.style.opacity='1';this.sourceEl=null;this.proxy.style.display='none';this.badge.style.display='none';}};
DragSystem.init();

// ── SNOW ──────────────────────────────────────────────────────────────────────
var cvsSnow=document.getElementById('snow-fx');
if(cvsSnow){var ctxSnow=cvsSnow.getContext('2d');cvsSnow.width=window.innerWidth;cvsSnow.height=window.innerHeight;var flakes=[];for(var f=0;f<30;f++)flakes.push({x:Math.random()*cvsSnow.width,y:Math.random()*cvsSnow.height,r:Math.random()*2,s:Math.random()+0.5});(function ds(){if(isDesktopActive){ctxSnow.clearRect(0,0,cvsSnow.width,cvsSnow.height);ctxSnow.fillStyle="rgba(255,255,255,0.25)";for(var i=0;i<flakes.length;i++){var fl=flakes[i];ctxSnow.beginPath();ctxSnow.arc(fl.x,fl.y,fl.r,0,Math.PI*2);ctxSnow.fill();fl.y+=fl.s;if(fl.y>cvsSnow.height)fl.y=0;}}requestAnimationFrame(ds);})();}

// ── CIRI ──────────────────────────────────────────────────────────────────────
var isCiriActive=false,holdTimer=null,hasBootCiri=false;
window.closeCiri=function(){document.body.classList.remove('ciri-active');isCiriActive=false;};
function checkApiKey(){var st=document.getElementById('status-text'),si=document.getElementById('status-icon');if(!st)return;if(localStorage.getItem('ciri_key')){st.textContent="Secure";st.className="secure";si.innerHTML='<svg class="secure-svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>';}else{st.textContent="Unstable";st.className="unstable";si.innerHTML='<svg class="unstable-svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';}}
checkApiKey();
window.autoGrow=function(el){el.style.height="5px";el.style.height=(el.scrollHeight)+"px";};
window.addEventListener('keydown',function(e){if(e.altKey&&(e.code==='KeyS'||e.key.toLowerCase()==='s')){if(!holdTimer&&!isCiriActive){holdTimer=setTimeout(function(){document.body.classList.add('ciri-active');isCiriActive=true;var cInp=document.getElementById('chat-input');if(!hasBootCiri){var bs=document.getElementById('ciri-boot-screen');if(bs)bs.style.display='flex';setTimeout(function(){document.getElementById('boot-ciri-text').classList.add('typing');},300);setTimeout(function(){document.getElementById('boot-sub-text').classList.add('show');},1100);setTimeout(function(){document.getElementById('boot-loader').style.opacity='1';setTimeout(function(){document.getElementById('boot-status-text').textContent="Connection Established.";document.getElementById('boot-spinner').style.display='none';setTimeout(function(){bs.style.filter='blur(10px)';bs.style.opacity='0';setTimeout(function(){bs.style.display='none';hasBootCiri=true;if(cInp)cInp.focus();},800);},1800);},1000);},2200);}else{setTimeout(function(){if(cInp)cInp.focus();},100);}},2000);}}else if(e.code==='Escape'&&isCiriActive){closeCiri();}});
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
(function drawFV(){requestAnimationFrame(drawFV);var cv=document.getElementById('visualizer');if(!cv)return;var cx=cv.getContext('2d');cv.width=cv.parentElement.clientWidth;cv.height=14;cx.clearRect(0,0,cv.width,cv.height);var bL=32,bW=(cv.width/bL)*2,xP=0;for(var i=0;i<bL;i++){var bH=aMedia&&!aMedia.paused?(Math.random()*cv.height):2;cx.fillStyle="#fff";cx.beginPath();try{cx.roundRect(xP,cv.height-bH,bW-1.5,bH,2);}catch(e){cx.rect(xP,cv.height-bH,bW-1.5,bH);}cx.fill();xP+=bW;}})();

// ── FPS ───────────────────────────────────────────────────────────────────────
var fLT=performance.now(),fFr=0,fLC=0;
(function chkFps(){requestAnimationFrame(chkFps);var nw=performance.now();fFr++;if(nw-fLT>=1000){var cFps=fFr,fv=document.getElementById('fps-val');if(fv)fv.innerText=cFps;if(cFps<=20){fLC++;if(fLC>=5&&!sysConfig.optBg){sysConfig.optBg=true;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));showNotification("System Optimized","Low FPS — backgrounds paused.");}}else{fLC=0;}fFr=0;fLT=nw;}})();

window.onbeforeunload=function(e){if(sysConfig.redirectConfirm){var msg="Leave? This helps block GoGuardian.";e.returnValue=msg;return msg;}};
