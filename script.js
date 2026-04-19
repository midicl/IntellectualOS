var _devBuildVer = "1.0.0";

var APPS = {
    'cine':     {title:'Hub', internal:true, icon:'https://cdn.worldvectorlogo.com/logos/netflix-logo-icon.svg', pinned:true},
    'term':     {title:'Music',               internal:true, icon:'https://cdn.pixabay.com/photo/2016/10/22/00/15/spotify-1759471_1280.jpg', pinned:true},
    'files':    {title:'Games',               internal:true, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-OeL_be7RFaoHi3PswkuAR5XcMgBNRDynsg&s', pinned:true},
    'web':      {title:'Browser',             internal:true, icon:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeD89ZcX5W1FBtal7RerasT27q-OmZqnBixQ&s', pinned:true},
    'settings': {title:'Settings',              internal:true, icon:'https://cdn.iconscout.com/icon/free/png-256/free-apple-settings-icon-svg-download-png-493162.png', pinned:true},
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

document.addEventListener("DOMContentLoaded",function(){applyCloak();document.getElementById('boot-layer').style.display='block';renderUI();initWallpapers();setupAppContextMenu();loadDesktop();updateSidebarData();if(sysConfig.accentColor)applyAccentColor(sysConfig.accentColor);});

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
    return id;
};

function applyWallpaperCSS(wp,target){
    if(!wp)return;
    var da=document.getElementById('desktop-area'),ls=document.getElementById('lock-screen');
    var bv=document.getElementById('bg-video'),bi=document.getElementById('bg-img');
    var lv=document.getElementById('lock-video'),li=document.getElementById('lock-img');
    if(wp.url==='__css__'||wp.css){
        var cssVal=wp.css||'#000';
        if(target==='home'){bv.style.display='none';bi.style.display='none';da.style.background=cssVal;}
        else{lv.style.display='none';li.style.display='none';ls.style.background=cssVal;}
    } else {
        var isImg=wp.url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i);
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
    document.getElementById('desktop-area').style.background='radial-gradient(ellipse at 20% 50%, #0d0d2b 0%, #000 70%)';
    document.getElementById('lock-screen').style.background='radial-gradient(ellipse at top, #001a2e 0%, #000 70%)';
    applyWallpaperCSS(wallpaperRegistry[sysConfig.homeWallpaper]||wallpaperRegistry['css-space'],'home');
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
}

function setWallpaper(k){
    var d=wallpaperRegistry[k];if(!d)return;
    if(window.wpMode==='home'||window.wpMode==='both'){applyWallpaperCSS(d,'home');sysConfig.homeWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}
    if(window.wpMode==='lock'||window.wpMode==='both'){applyWallpaperCSS(d,'lock');sysConfig.lockWallpaper=k;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));}
}
window.wpMode='both';

function openWallpaperMenu(){
    var m=document.getElementById('wallpaper-menu'),gu=document.getElementById('wp-grid-unlocked');
    if(!m||!gu)return;
    if(m.showModal)m.showModal();else m.style.display='flex';
    m.classList.add('open');
    gu.innerHTML='';
    for(var k in wallpaperRegistry){
        var d=wallpaperRegistry[k],c=document.createElement('div');
        c.className='wp-card';c.setAttribute('data-key',k);
        if(d.url==='__css__'||d.css){
            c.innerHTML='<div style="width:100%;height:100%;background:'+(d.css||'#111')+';"></div><div class="wp-info">'+(d.custom?' ':'')+d.name+'</div>';
        }else if(d.url.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i)){
            c.innerHTML='<img src="'+d.url+'" alt="wp" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background=\'#111\'"><div class="wp-info">'+(d.custom?' ':'')+d.name+'</div>';
        }else{
            c.innerHTML='<video src="'+d.url+'" preload="none" playsinline muted loop onmouseover="this.play()" onmouseout="this.pause()" style="width:100%;height:100%;object-fit:cover;"></video><div class="wp-info">'+(d.custom?' ':'')+d.name+'</div>';
        }
        if(d.custom){
            var del=document.createElement('div');
            del.style.cssText='position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.7);color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;z-index:2;';
            del.textContent='';
            del.onclick=function(e){e.stopPropagation();var k2=this.parentElement.getAttribute('data-key');delete wallpaperRegistry[k2];delete customWallpapers[k2];localStorage.setItem('intel_custom_wp',JSON.stringify(customWallpapers));openWallpaperMenu();};
            c.style.position='relative';
            c.appendChild(del);
        }
        c.onclick=function(){
            setWallpaper(this.getAttribute('data-key'));
            document.querySelectorAll('.wp-card').forEach(function(x){x.classList.remove('active-wp');});
            this.classList.add('active-wp');
        };
        gu.appendChild(c);
    }
    // Add custom wallpaper card
    var addCard=document.createElement('div');
    addCard.className='wp-card wp-add-card';
    addCard.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;border:1px dashed #333;background:#0a0a0a;';
    addCard.innerHTML='<div style="font-size:1.5rem;color:#444;">+</div><div style="font-size:11px;color:#444;font-weight:700;letter-spacing:1px;text-align:center;">ADD CUSTOM</div>';
    addCard.onclick=function(){
        var name=prompt('Wallpaper name:');if(!name)return;
        var url=prompt('Image or video URL (direct link to .jpg/.png/.mp4 etc):');if(!url)return;
        addCustomWallpaper(name.trim(),url.trim());
        openWallpaperMenu();
    };
    gu.appendChild(addCard);

    var chk=document.getElementById('wp-loop-chk');
    if(chk){chk.checked=sysConfig.wpLoop;chk.onchange=function(e){window.updateSysSetting('wpLoop',e.target.checked);};}
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

function getAppSrcdoc(id) {
  var HEAD = '<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%;overflow:hidden;background:#000;color:#fff;font-family:Inter,-apple-system,sans-serif;font-size:14px;-webkit-font-smoothing:antialiased}button,input,select{font-family:inherit}button{cursor:pointer}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:4px}</style></head><body>';
  var TAIL = '</body></html>';

  /* ═══════════════════════════════════════════════════════════
     GAMES — PS STORE STYLE
  ═══════════════════════════════════════════════════════════ */
  if (id === 'files') {
    var games = [
      { id:'mc',     name:'Minecraft',       genre:'Sandbox',         url:'https://eaglercraft.com/mc/1.8.8-wasm/',  bg:'#2d5a1b' },
      { id:'bloxd',  name:'Bloxd.io',        genre:'Multiplayer',     url:'https://bloxd.io/',                       bg:'#1a3a6b' },
      { id:'smash',  name:'Smash Karts',     genre:'Racing',          url:'https://smashkarts.io/',                  bg:'#6b2a1a' },
      { id:'venge',  name:'Venge.io',        genre:'FPS',             url:'https://venge.io/',                       bg:'#1a1a3a' },
      { id:'shell',  name:'Shell Shockers',  genre:'FPS',             url:'https://shellshock.io/',                  bg:'#3a1a1a' },
      { id:'zombs',  name:'Zombs Royale',    genre:'Battle Royale',   url:'https://zombsroyale.io/',                 bg:'#1a3a1a' },
      { id:'krunker',name:'Krunker',         genre:'FPS',             url:'https://krunker.io/',                     bg:'#1a2a1a' },
      { id:'1v1',    name:'1v1.LOL',         genre:'Build & Shoot',   url:'https://1v1.lol/',                        bg:'#2a1a4a' },
      { id:'slope',  name:'Slope',           genre:'Arcade',          url:'https://slope-game.com/',                 bg:'#0a2a4a' },
      { id:'paper',  name:'Paper.io 2',      genre:'Casual',          url:'https://paper-io.com/',                   bg:'#1a3a4a' },
      { id:'cookie', name:'Cookie Clicker',  genre:'Idle',            url:'https://orteil.dashnet.org/cookieclicker/', bg:'#3a2a0a' },
      { id:'moto',   name:'Moto X3M',        genre:'Racing',          url:'https://www.motox3m.com/',                bg:'#4a2a0a' },
    ];
    var gJSON = JSON.stringify(games);
    return HEAD + `
<style>
  #root { height:100vh; display:flex; flex-direction:column; background:#000; }

  /* ── TOP NAV ── */
  nav {
    display:flex; align-items:center; gap:6px;
    padding:0 20px; height:46px;
    background:#000; border-bottom:1px solid #111;
    flex-shrink:0;
  }
  .nav-tab {
    padding:0 14px; height:100%; display:flex; align-items:center;
    font-size:13px; font-weight:500; color:#666;
    border-bottom:2px solid transparent; cursor:pointer; white-space:nowrap;
    transition:color .15s;
  }
  .nav-tab:hover { color:#aaa; }
  .nav-tab.active { color:#fff; border-bottom-color:#fff; }
  .nav-right { margin-left:auto; display:flex; align-items:center; gap:12px; }
  .nav-search {
    display:flex; align-items:center; gap:8px;
    background:#111; border:1px solid #1e1e1e; border-radius:20px;
    padding:6px 14px; cursor:pointer; transition:.15s;
  }
  .nav-search:hover { border-color:#333; }
  .nav-search span { font-size:13px; color:#555; }
  #nav-clock { font-size:12px; font-weight:600; color:#444; }

  /* ── MAIN ── */
  #main { flex:1; overflow-y:auto; overflow-x:hidden; }

  /* ── HERO INSTALL AREA ── */
  #hero {
    padding:32px 24px 24px;
  }
  #hero h1 { font-family:'Space Grotesk',sans-serif; font-size:1.9rem; font-weight:700; margin-bottom:6px; }
  #hero p { font-size:13px; color:#555; margin-bottom:20px; }
  .install-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:#1a1a1a; border:1px solid #2a2a2a; color:#ccc;
    padding:9px 18px; border-radius:8px; font-size:13px; font-weight:600;
    transition:.15s; cursor:pointer;
  }
  .install-btn:hover { background:#222; border-color:#444; color:#fff; }
  .install-btn svg { flex-shrink:0; }

  /* ── SECTION ── */
  .section { padding:0 0 4px 24px; margin-top:28px; }
  .section-head {
    display:flex; align-items:center; justify-content:space-between;
    padding-right:24px; margin-bottom:14px;
  }
  .section-title { font-family:'Space Grotesk',sans-serif; font-size:.95rem; font-weight:600; }

  /* ── YOUR GAMES ── */
  #your-games {
    display:flex; gap:12px; padding-right:24px; flex-wrap:wrap;
  }
  .yg-card {
    width:120px; height:120px; border-radius:10px;
    background:#0d0d0d; border:1px solid #1a1a1a;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    cursor:pointer; transition:.2s; position:relative; overflow:hidden;
    flex-shrink:0;
  }
  .yg-card:hover { border-color:#333; transform:scale(1.03); }
  .yg-card img { width:100%; height:100%; object-fit:cover; border-radius:10px; }
  .yg-card-label {
    position:absolute; bottom:0; left:0; right:0;
    padding:20px 8px 8px;
    background:linear-gradient(transparent,rgba(0,0,0,.85));
    font-size:11px; font-weight:600; color:#fff;
  }
  .yg-add {
    background:#0a0a0a; border:1px dashed #1e1e1e !important; color:#333;
  }
  .yg-add:hover { border-color:#333 !important; color:#666; }
  .yg-add-icon { font-size:24px; font-weight:300; line-height:1; margin-bottom:4px; }
  .yg-add-lbl { font-size:11px; font-weight:500; }

  /* ── SCROLL ROW ── */
  .row-wrap { position:relative; }
  .row {
    display:flex; gap:8px; overflow-x:auto; scroll-snap-type:x mandatory;
    padding:4px 24px 10px; scroll-behavior:smooth;
  }
  .row::-webkit-scrollbar { height:0; }
  .arrow {
    position:absolute; top:50%; transform:translateY(-58%);
    width:30px; height:30px; background:rgba(0,0,0,.9); border:1px solid #2a2a2a;
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    cursor:pointer; z-index:5; font-size:16px; color:#666; transition:.15s;
    opacity:0; pointer-events:none;
  }
  .row-wrap:hover .arrow { opacity:1; pointer-events:all; }
  .arrow:hover { color:#fff; border-color:#555; }
  .al { left:6px; } .ar { right:6px; }

  /* ── GAME CARD ── */
  .gc {
    flex-shrink:0; width:160px; border-radius:8px; overflow:hidden;
    cursor:pointer; transition:.2s; scroll-snap-align:start;
    background:#111; border:1px solid #1a1a1a; position:relative;
  }
  .gc:hover { transform:translateY(-3px); border-color:#2e2e2e; box-shadow:0 8px 24px rgba(0,0,0,.6); }
  .gc-art {
    width:100%; height:96px; display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:600; color:rgba(255,255,255,.2); letter-spacing:.5px;
    text-align:center; padding:10px;
  }
  .gc-info { padding:8px 10px 10px; }
  .gc-name { font-size:13px; font-weight:700; color:#fff; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .gc-genre { font-size:11px; color:#555; font-weight:500; }

  /* ── LAUNCHER ── */
  #launcher {
    display:none; position:fixed; inset:0; z-index:1000;
    background:#000; flex-direction:column;
  }
  #lnch-loading {
    flex:1; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:20px;
  }
  #lnch-name { font-family:'Space Grotesk',sans-serif; font-size:1rem; font-weight:600; color:#fff; }
  #lnch-sub { font-size:12px; color:#333; margin-top:-10px; }
  #lnch-bar-wrap { width:240px; }
  #lnch-track { width:100%; height:2px; background:#1a1a1a; border-radius:2px; overflow:hidden; }
  #lnch-fill { height:100%; width:0%; background:#fff; border-radius:2px; transition:width .05s; }
  #lnch-pct { text-align:center; margin-top:10px; font-size:11px; font-weight:600; color:#333; }
  #lnch-frame { flex:1; border:none; display:none; }
  #lnch-close {
    position:absolute; top:14px; right:14px;
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    color:#888; width:30px; height:30px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10;
    font-size:14px; transition:.15s;
  }
  #lnch-close:hover { background:rgba(255,255,255,.12); color:#fff; }

  /* ── SEARCH ── */
  #search-panel {
    display:none; position:fixed; inset:0; z-index:500;
    background:rgba(0,0,0,.96); backdrop-filter:blur(16px);
    padding:40px 24px; flex-direction:column;
  }
  #search-panel.open { display:flex; }
  #search-input-wrap { display:flex; gap:8px; max-width:480px; width:100%; margin-bottom:28px; }
  #search-in {
    flex:1; background:#111; border:1px solid #222; color:#fff;
    padding:10px 16px; border-radius:8px; outline:none; font-size:15px; font-weight:500;
  }
  #search-in:focus { border-color:#333; }
  #search-close-btn {
    background:#1a1a1a; border:1px solid #222; color:#888;
    padding:10px 16px; border-radius:8px; font-size:13px; font-weight:600;
  }
  #search-results { display:flex; flex-wrap:wrap; gap:10px; overflow-y:auto; }

  /* ── ADD MODAL ── */
  #add-modal {
    display:none; position:fixed; inset:0; z-index:600;
    background:rgba(0,0,0,.88); backdrop-filter:blur(10px);
    align-items:center; justify-content:center;
  }
  #add-modal.open { display:flex; }
  .add-box {
    background:#0d0d0d; border:1px solid #1e1e1e; border-radius:12px;
    padding:24px; width:400px; max-width:90vw;
  }
  .add-box h3 {
    font-family:'Space Grotesk',sans-serif; font-size:.9rem; font-weight:600;
    margin-bottom:18px; color:#fff;
  }
  .add-box input {
    width:100%; background:#111; border:1px solid #1e1e1e; color:#fff;
    padding:9px 13px; border-radius:6px; outline:none; font-size:13px;
    margin-bottom:10px; transition:.15s;
  }
  .add-box input:focus { border-color:#333; }
  .add-box input::placeholder { color:#333; }
  .modal-actions { display:flex; gap:8px; margin-top:4px; }
  .btn-primary {
    background:#fff; color:#000; border:none;
    padding:9px 20px; border-radius:6px; font-size:13px; font-weight:700;
    transition:.15s;
  }
  .btn-primary:hover { background:#e0e0e0; }
  .btn-secondary {
    background:#1a1a1a; color:#666; border:1px solid #222;
    padding:9px 20px; border-radius:6px; font-size:13px; font-weight:600;
  }
  .btn-secondary:hover { color:#aaa; border-color:#333; }

  /* ── STORE/LIB GRIDS ── */
  .full-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill, minmax(148px,1fr));
    gap:10px; padding:0 24px 24px;
  }
</style>

<div id="root">
  <nav>
    <div class="nav-tab active" onclick="showTab('home',this)">Home</div>
    <div class="nav-tab" onclick="showTab('library',this)">Library</div>
    <div class="nav-tab" onclick="showTab('discover',this)">Discover</div>
    <div class="nav-right">
      <div class="nav-search" onclick="openSearch()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Search</span>
      </div>
      <div id="nav-clock"></div>
    </div>
  </nav>

  <div id="main">
    <!-- HOME TAB -->
    <div id="tab-home">
      <div id="hero">
        <h1>Your Library</h1>
        <p>Add any game by URL — it saves automatically.</p>
        <button class="install-btn" onclick="openAdd()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14m-7-7 7 7 7-7"/></svg>
          Add Game
        </button>
      </div>

      <div class="section">
        <div class="section-head">
          <div class="section-title">Your Games</div>
        </div>
        <div id="your-games">
          <div class="yg-card yg-add" onclick="openAdd()">
            <div class="yg-add-icon">+</div>
            <div class="yg-add-lbl">Add game</div>
          </div>
        </div>
      </div>

      <div class="section" style="margin-top:32px">
        <div class="section-head">
          <div class="section-title">Try something new</div>
        </div>
        <div class="row-wrap">
          <div class="arrow al" onclick="scrollR('r-new',-1)">&#8249;</div>
          <div class="row" id="r-new"></div>
          <div class="arrow ar" onclick="scrollR('r-new',1)">&#8250;</div>
        </div>
      </div>

      <div class="section" style="margin-top:8px">
        <div class="section-head">
          <div class="section-title">Staff picks</div>
        </div>
        <div class="row-wrap">
          <div class="arrow al" onclick="scrollR('r-rec',-1)">&#8249;</div>
          <div class="row" id="r-rec"></div>
          <div class="arrow ar" onclick="scrollR('r-rec',1)">&#8250;</div>
        </div>
      </div>
    </div>

    <!-- LIBRARY TAB -->
    <div id="tab-library" style="display:none; padding-top:24px">
      <div style="padding:0 24px 16px; font-family:'Space Grotesk',sans-serif; font-size:.95rem; font-weight:600">All games</div>
      <div class="full-grid" id="lib-grid"></div>
    </div>

    <!-- DISCOVER TAB -->
    <div id="tab-discover" style="display:none; padding-top:24px">
      <div style="padding:0 24px 16px; font-family:'Space Grotesk',sans-serif; font-size:.95rem; font-weight:600">Browse</div>
      <div class="full-grid" id="disc-grid"></div>
    </div>
  </div>
</div>

<!-- LAUNCHER -->
<div id="launcher">
  <div id="lnch-loading">
    <div id="lnch-name">Loading</div>
    <div id="lnch-sub">Intellectual OS</div>
    <div id="lnch-bar-wrap">
      <div id="lnch-track"><div id="lnch-fill"></div></div>
      <div id="lnch-pct">0%</div>
    </div>
  </div>
  <iframe id="lnch-frame" allow="autoplay;fullscreen;gamepad;clipboard-write" allowfullscreen></iframe>
  <div id="lnch-close" onclick="closeLauncher()">&#215;</div>
</div>

<!-- SEARCH -->
<div id="search-panel">
  <div id="search-input-wrap">
    <input id="search-in" type="text" placeholder="Search games..." oninput="doSearch(this.value)">
    <button id="search-close-btn" onclick="closeSearch()">Done</button>
  </div>
  <div id="search-results"></div>
</div>

<!-- ADD MODAL -->
<div id="add-modal">
  <div class="add-box">
    <h3>Add a game</h3>
    <input id="add-name" placeholder="Title">
    <input id="add-url" placeholder="URL (e.g. https://bloxd.io)">
    <input id="add-img" placeholder="Cover image URL (optional)">
    <div class="modal-actions">
      <button class="btn-primary" onclick="saveGame()">Save</button>
      <button class="btn-secondary" onclick="closeAdd()">Cancel</button>
    </div>
  </div>
</div>

<script>
var GAMES = ${gJSON};
var saved = JSON.parse(localStorage.getItem('ios_games') || '[]');

function gc(g, w) {
  w = w || 160;
  var art = g.img
    ? '<img src="' + g.img + '" style="width:100%;height:96px;object-fit:cover" onerror="this.parentElement.style.background=\'' + (g.bg||'#111') + '\'">'
    : '<div class="gc-art" style="background:' + (g.bg||'#111') + '">' + g.name + '</div>';
  return '<div class="gc" style="width:' + w + 'px" onclick="launch(\'' + encodeURIComponent(g.url) + '\',\'' + encodeURIComponent(g.name) + '\')">' + art + '<div class="gc-info"><div class="gc-name">' + g.name + '</div><div class="gc-genre">' + (g.genre || '') + '</div></div></div>';
}

function buildHome() {
  var s = GAMES.slice().sort(function() { return Math.random() - .5; });
  document.getElementById('r-new').innerHTML = s.slice(0, 10).map(function(g) { return gc(g); }).join('');
  document.getElementById('r-rec').innerHTML = s.slice(2, 12).map(function(g) { return gc(g); }).join('');
}

function buildYour() {
  var add = '<div class="yg-card yg-add" onclick="openAdd()"><div class="yg-add-icon">+</div><div class="yg-add-lbl">Add game</div></div>';
  var cards = saved.map(function(g, i) {
    var art = g.img ? '<img src="' + g.img + '" style="width:100%;height:120px;object-fit:cover;border-radius:10px" onerror="this.style.display=\'none\'">' : '<div style="width:100%;height:120px;background:#111;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#333;padding:8px;text-align:center">' + g.name + '</div>';
    return '<div class="yg-card" onclick="launch(\'' + encodeURIComponent(g.url) + '\',\'' + encodeURIComponent(g.name) + '\')">' + art + '<div class="yg-card-label">' + g.name + '</div></div>';
  }).join('');
  document.getElementById('your-games').innerHTML = add + cards;
}

function showTab(name, el) {
  ['home','library','discover'].forEach(function(t) { document.getElementById('tab-'+t).style.display = 'none'; });
  document.querySelectorAll('.nav-tab').forEach(function(t) { t.classList.remove('active'); });
  document.getElementById('tab-'+name).style.display = 'block';
  el.classList.add('active');
  if (name === 'library') {
    document.getElementById('lib-grid').innerHTML = saved.concat(GAMES).map(function(g) { return gc(g, 148); }).join('');
  }
  if (name === 'discover') {
    document.getElementById('disc-grid').innerHTML = GAMES.map(function(g) { return gc(g, 148); }).join('');
  }
}

function scrollR(id, dir) {
  document.getElementById(id).scrollBy({ left: dir * 340, behavior: 'smooth' });
}

function launch(urlEnc, nameEnc) {
  var url = decodeURIComponent(urlEnc), name = decodeURIComponent(nameEnc);
  var l = document.getElementById('launcher');
  var ll = document.getElementById('lnch-loading');
  var lf = document.getElementById('lnch-frame');
  l.style.display = 'flex'; ll.style.display = 'flex'; lf.style.display = 'none';
  document.getElementById('lnch-name').textContent = name;
  document.getElementById('lnch-fill').style.width = '0%';
  document.getElementById('lnch-pct').textContent = '0%';
  var p = 0;
  var iv = setInterval(function() {
    p += Math.random() * 6 + 2;
    if (p > 90) p = 90;
    document.getElementById('lnch-fill').style.width = p + '%';
    document.getElementById('lnch-pct').textContent = Math.floor(p) + '%';
  }, 100);
  lf.onload = function() {
    clearInterval(iv);
    document.getElementById('lnch-fill').style.width = '100%';
    document.getElementById('lnch-pct').textContent = '100%';
    setTimeout(function() { ll.style.display = 'none'; lf.style.display = 'block'; }, 400);
  };
  lf.src = url;
}

function closeLauncher() {
  document.getElementById('launcher').style.display = 'none';
  document.getElementById('lnch-frame').src = '';
}

function openSearch() {
  document.getElementById('search-panel').classList.add('open');
  setTimeout(function() { document.getElementById('search-in').focus(); }, 50);
}
function closeSearch() { document.getElementById('search-panel').classList.remove('open'); }
function doSearch(q) {
  q = q.toLowerCase();
  var all = GAMES.concat(saved);
  var res = q ? all.filter(function(g) { return g.name.toLowerCase().includes(q); }) : all;
  document.getElementById('search-results').innerHTML = res.map(function(g) { return gc(g, 155); }).join('');
}

function openAdd() { document.getElementById('add-modal').classList.add('open'); document.getElementById('add-name').focus(); }
function closeAdd() {
  document.getElementById('add-modal').classList.remove('open');
  ['add-name','add-url','add-img'].forEach(function(id) { document.getElementById(id).value = ''; });
}
function saveGame() {
  var n = document.getElementById('add-name').value.trim();
  var u = document.getElementById('add-url').value.trim();
  var img = document.getElementById('add-img').value.trim();
  if (!n || !u) return;
  if (!u.startsWith('http')) u = 'https://' + u;
  saved.push({ name: n, url: u, img: img, genre: 'My Library' });
  localStorage.setItem('ios_games', JSON.stringify(saved));
  buildYour();
  closeAdd();
}

function tick() {
  var d = new Date(), h = d.getHours().toString().padStart(2,'0'), m = d.getMinutes().toString().padStart(2,'0');
  document.getElementById('nav-clock').textContent = h + ':' + m;
}
tick(); setInterval(tick, 30000);

document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeLauncher(); closeSearch(); closeAdd(); } });
document.getElementById('add-modal').onclick = function(e) { if (e.target === this) closeAdd(); };
document.getElementById('search-panel').onclick = function(e) { if (e.target === this) closeSearch(); };

buildHome(); buildYour();
</script>
` + TAIL;
  }

  /* ═══════════════════════════════════════════════════════════
     MUSIC — SPOTIFY STYLE
  ═══════════════════════════════════════════════════════════ */
  if (id === 'term') { return HEAD + `
<style>
  #sp { height:100vh; display:flex; flex-direction:column; background:#000; }
  #sp-body { flex:1; display:flex; overflow:hidden; min-height:0; }

  /* sidebar */
  #sidebar {
    width:210px; background:#0a0a0a; display:flex; flex-direction:column;
    border-right:1px solid #111; flex-shrink:0; overflow-y:auto;
  }
  #sidebar::-webkit-scrollbar { width:0; }
  .sb-logo {
    padding:18px 16px 14px; display:flex; align-items:center; gap:10px;
    border-bottom:1px solid #111;
  }
  .sb-logo-mark {
    width:30px; height:30px; background:#1a1a1a; border-radius:6px;
    display:flex; align-items:center; justify-content:center;
  }
  .sb-logo-mark svg { display:block; }
  .sb-logo-text { font-family:'Space Grotesk',sans-serif; font-size:.85rem; font-weight:700; }
  .sb-logo-sub { font-size:10px; color:#444; margin-top:1px; font-weight:500; }
  .sb-section { padding:14px 12px 6px; }
  .sb-label { font-size:10px; font-weight:600; color:#333; letter-spacing:.5px; text-transform:uppercase; margin-bottom:8px; }
  .sb-item {
    display:flex; align-items:center; gap:10px; padding:7px 10px;
    border-radius:6px; cursor:pointer; font-size:13px; font-weight:500; color:#666;
    transition:.12s; margin-bottom:1px;
  }
  .sb-item:hover { background:#111; color:#aaa; }
  .sb-item.active { background:#111; color:#fff; }
  .sb-item svg { flex-shrink:0; opacity:.6; }
  .sb-item.active svg { opacity:1; }
  .sb-playlist {
    display:flex; align-items:center; gap:10px; padding:6px 10px;
    border-radius:6px; cursor:pointer; transition:.12s; margin-bottom:1px;
  }
  .sb-playlist:hover { background:#0d0d0d; }
  .sb-pl-art {
    width:28px; height:28px; border-radius:4px; background:#1a1a1a;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .sb-pl-name { font-size:12px; font-weight:500; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* main */
  #sp-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  #sp-topbar {
    padding:12px 20px; background:rgba(0,0,0,.85); backdrop-filter:blur(10px);
    border-bottom:1px solid #0d0d0d; display:flex; align-items:center; gap:10px;
    flex-shrink:0;
  }
  .sp-topbar-btn {
    background:#0d0d0d; border:1px solid #1a1a1a; color:#666;
    width:26px; height:26px; border-radius:50%; display:flex; align-items:center;
    justify-content:center; cursor:pointer; font-size:14px; transition:.12s;
  }
  .sp-topbar-btn:hover { border-color:#333; color:#aaa; }
  #sp-content { flex:1; overflow-y:auto; }
  #sp-content::-webkit-scrollbar { width:3px; }
  #sp-content::-webkit-scrollbar-thumb { background:#1a1a1a; }

  /* greeting */
  #greeting { padding:22px 22px 6px; font-family:'Space Grotesk',sans-serif; font-size:1.4rem; font-weight:700; }
  #greeting-sub { padding:0 22px 6px; font-size:13px; color:#555; }

  /* quick access */
  .quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; padding:14px 22px 0; }
  .quick-card {
    display:flex; align-items:center; gap:0; background:#111; border-radius:6px;
    overflow:hidden; cursor:pointer; transition:.12s; height:46px;
  }
  .quick-card:hover { background:#1a1a1a; }
  .quick-art {
    width:46px; height:46px; flex-shrink:0; background:#1a1a1a;
    display:flex; align-items:center; justify-content:center;
  }
  .quick-art svg { display:block; }
  .quick-name { padding:0 12px; font-size:13px; font-weight:600; color:#ccc; }

  /* sections */
  .sp-section { padding:18px 22px 8px; }
  .sp-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .sp-section-title { font-family:'Space Grotesk',sans-serif; font-size:.9rem; font-weight:600; }
  .sp-section-more { font-size:11px; font-weight:600; color:#444; cursor:pointer; transition:.12s; }
  .sp-section-more:hover { color:#aaa; }

  /* album grid */
  .al-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); gap:12px; }
  .al-card {
    background:#111; border-radius:8px; padding:12px; cursor:pointer; transition:.15s;
    border:1px solid transparent; position:relative;
  }
  .al-card:hover { background:#161616; border-color:#1e1e1e; }
  .al-card:hover .al-play { opacity:1; transform:translateY(0); }
  .al-art {
    width:100%; aspect-ratio:1; background:#1a1a1a; border-radius:6px;
    margin-bottom:10px; display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden;
  }
  .al-art-inner {
    width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:600; color:#2a2a2a; text-align:center; padding:10px;
  }
  .al-play {
    position:absolute; bottom:6px; right:6px;
    width:32px; height:32px; background:#fff; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    opacity:0; transform:translateY(6px); transition:.2s;
    box-shadow:0 4px 12px rgba(0,0,0,.6);
  }
  .al-play svg { margin-left:2px; }
  .al-name { font-size:13px; font-weight:700; color:#fff; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .al-artist { font-size:11px; color:#555; }

  /* player bar */
  #player {
    height:76px; background:#080808; border-top:1px solid #111;
    display:flex; align-items:center; padding:0 18px; gap:14px; flex-shrink:0;
  }
  #pl-left { display:flex; align-items:center; gap:12px; width:220px; overflow:hidden; flex-shrink:0; }
  #pl-art {
    width:44px; height:44px; background:#1a1a1a; border-radius:5px; flex-shrink:0;
    border:1px solid #1e1e1e; display:flex; align-items:center; justify-content:center;
    overflow:hidden;
  }
  #pl-art svg { display:block; }
  #pl-track { overflow:hidden; }
  #pl-name { font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #pl-artist { font-size:11px; color:#555; margin-top:1px; }
  #pl-heart { color:#333; cursor:pointer; font-size:15px; transition:.12s; flex-shrink:0; margin-left:4px; }
  #pl-heart:hover { color:#aaa; }
  #pl-center { flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; }
  #pl-buttons { display:flex; align-items:center; gap:18px; }
  .pl-btn { background:none; border:none; color:#555; font-size:16px; transition:.12s; padding:4px; }
  .pl-btn:hover { color:#ccc; }
  #pl-play {
    width:32px; height:32px; background:#fff; border:none; color:#000; border-radius:50%;
    display:flex; align-items:center; justify-content:center; transition:.12s;
  }
  #pl-play:hover { background:#ddd; transform:scale(1.04); }
  #pl-play svg { margin-left:2px; }
  #pl-prog { display:flex; align-items:center; gap:8px; width:100%; max-width:420px; }
  .pl-time { font-size:10px; font-weight:600; color:#444; min-width:28px; }
  #pl-bar { flex:1; height:4px; background:#1e1e1e; border-radius:2px; cursor:pointer; position:relative; }
  #pl-fill { position:absolute; top:0; left:0; height:100%; background:#fff; border-radius:2px; width:0%; transition:width .6s linear; }
  #pl-right { width:150px; display:flex; align-items:center; justify-content:flex-end; gap:8px; }
  .pl-vol-icon { color:#444; font-size:13px; }
  #pl-vol-track { width:72px; height:4px; background:#1e1e1e; border-radius:2px; cursor:pointer; position:relative; }
  #pl-vol-fill { height:100%; background:#fff; border-radius:2px; width:65%; }

  /* sc widget */
  #sc-widget {
    display:none; position:fixed; bottom:86px; right:16px; width:310px;
    background:#111; border:1px solid #1e1e1e; border-radius:10px; overflow:hidden;
    z-index:100; box-shadow:0 16px 40px rgba(0,0,0,.8);
  }
  #sc-widget.open { display:block; }
  #sc-widget-close {
    position:absolute; top:7px; right:8px;
    background:rgba(0,0,0,.7); border:1px solid #2a2a2a; color:#666;
    width:22px; height:22px; border-radius:50%; font-size:12px; z-index:5; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
  }
  #sc-widget-close:hover { color:#fff; }
  #sc-frame { width:100%; height:175px; border:none; display:block; }
  #sc-input { padding:9px 11px; display:flex; gap:6px; background:#0d0d0d; border-top:1px solid #1a1a1a; }
  #sc-url { flex:1; background:#111; border:1px solid #1a1a1a; color:#fff; padding:6px 10px; border-radius:5px; outline:none; font-size:12px; }
  #sc-url::placeholder { color:#333; }
  .sc-go { background:#ff4500; border:none; color:#fff; padding:6px 12px; border-radius:5px; font-size:12px; font-weight:600; }

  /* yt player */
  #yt-player {
    display:none; position:fixed; bottom:86px; left:50%; transform:translateX(-50%);
    width:min(480px,90vw); background:#111; border:1px solid #1e1e1e; border-radius:10px;
    overflow:hidden; z-index:100; box-shadow:0 16px 40px rgba(0,0,0,.8);
  }
  #yt-player.open { display:block; }
  #yt-player-close {
    position:absolute; top:8px; right:8px; background:rgba(0,0,0,.7); border:1px solid #2a2a2a;
    color:#666; width:24px; height:24px; border-radius:50%; font-size:13px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; z-index:5;
  }
  #yt-player-close:hover { color:#fff; }
  #yt-frame { width:100%; height:270px; border:none; display:block; }
  #yt-input { padding:9px 11px; display:flex; gap:6px; background:#0d0d0d; border-top:1px solid #1a1a1a; }
  #yt-url { flex:1; background:#111; border:1px solid #1a1a1a; color:#fff; padding:6px 10px; border-radius:5px; outline:none; font-size:12px; }
  #yt-url::placeholder { color:#333; }
  .yt-go { background:#cc0000; border:none; color:#fff; padding:6px 12px; border-radius:5px; font-size:12px; font-weight:600; }
</style>

<div id="sp">
  <div id="sp-body">
    <!-- SIDEBAR -->
    <div id="sidebar">
      <div class="sb-logo">
        <div class="sb-logo-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#888"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        </div>
        <div>
          <div class="sb-logo-text">IntellectSpy</div>
          <div class="sb-logo-sub">Music</div>
        </div>
      </div>
      <div class="sb-section">
        <div class="sb-label">Menu</div>
        <div class="sb-item active" onclick="setNav(this,'home')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          Home
        </div>
        <div class="sb-item" onclick="setNav(this,'search')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Search
        </div>
        <div class="sb-item" onclick="openYT()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          YouTube
        </div>
      </div>
      <div class="sb-section">
        <div class="sb-label">Your library</div>
        ${[
          ['Liked Songs', 'https://soundcloud.com/charts/top'],
          ['Hip-Hop', 'https://soundcloud.com/charts/top?genre=hiphoprap'],
          ['Lo-Fi', 'https://soundcloud.com/lofimusic'],
          ['Phonk', 'https://soundcloud.com/charts/top?genre=danceedm'],
          ['Pop', 'https://soundcloud.com/charts/top?genre=pop'],
          ['R&B', 'https://soundcloud.com/charts/top?genre=rnb'],
          ['Indie', 'https://soundcloud.com/charts/top?genre=alternative'],
          ['Trap', 'https://soundcloud.com/charts/top?genre=trap'],
          ['Jazz', 'https://soundcloud.com/charts/top?genre=jazz'],
        ].map(function(x){return'<div class="sb-playlist" onclick="loadSC(\''+x[1]+'\',\''+x[0]+'\')"><div class="sb-pl-art"><svg width="12" height="12" viewBox="0 0 24 24" fill="#444"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div><div class="sb-pl-name">'+x[0]+'</div></div>';}).join('')}
      </div>
    </div>

    <!-- MAIN -->
    <div id="sp-main">
      <div id="sp-topbar">
        <button class="sp-topbar-btn">&#8249;</button>
        <button class="sp-topbar-btn">&#8250;</button>
      </div>
      <div id="sp-content">
        <!-- HOME VIEW -->
        <div id="view-home">
          <div id="greeting"></div>
          <div id="greeting-sub">What are you in the mood for?</div>
          <div class="quick-grid">
            ${[
              ['Liked Songs','https://soundcloud.com/charts/top','#4a0a7a'],
              ['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap','#1a1a3a'],
              ['Lo-Fi','https://soundcloud.com/lofimusic','#0a2a3a'],
              ['Phonk','https://soundcloud.com/charts/top?genre=danceedm','#2a0a0a'],
            ].map(function(x){return'<div class="quick-card" onclick="loadSC(\''+x[1]+'\',\''+x[0]+'\')"><div class="quick-art" style="background:'+x[2]+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,.3)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div><div class="quick-name">'+x[0]+'</div></div>';}).join('')}
          </div>
          <div class="sp-section">
            <div class="sp-section-head">
              <div class="sp-section-title">Trending</div>
              <div class="sp-section-more" onclick="loadSC('https://soundcloud.com/charts/top','Charts')">See all</div>
            </div>
            <div class="al-grid" id="grid-trending"></div>
          </div>
          <div class="sp-section">
            <div class="sp-section-head"><div class="sp-section-title">Chill</div></div>
            <div class="al-grid" id="grid-chill"></div>
          </div>
          <div class="sp-section" style="padding-bottom:20px">
            <div class="sp-section-head">
              <div class="sp-section-title">YouTube Music</div>
              <div class="sp-section-more" onclick="openYT()">Open player</div>
            </div>
            <div class="al-grid" id="grid-yt"></div>
          </div>
        </div>
        <!-- SEARCH VIEW -->
        <div id="view-search" style="display:none; padding:20px">
          <div style="font-family:'Space Grotesk',sans-serif; font-size:.9rem; font-weight:600; margin-bottom:12px">Search</div>
          <div style="display:flex; gap:8px; margin-bottom:18px">
            <input id="sc-search-q" type="text" placeholder="Artists, tracks, playlists..." style="flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:9px 13px;border-radius:7px;outline:none;font-size:13px">
            <button onclick="runSearch()" style="background:#ff4500;border:none;color:#fff;padding:9px 16px;border-radius:7px;font-weight:600;font-size:13px">Go</button>
          </div>
          <div style="font-size:13px;font-weight:600;color:#333;margin-bottom:12px">Genres</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${[['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap','#1c1c2e'],['Pop','https://soundcloud.com/charts/top?genre=pop','#1e1428'],['Lo-Fi','https://soundcloud.com/lofimusic','#0e1e28'],['Phonk','https://soundcloud.com/charts/top?genre=danceedm','#1e0e0e'],['R&B','https://soundcloud.com/charts/top?genre=rnb','#150e1e'],['Indie','https://soundcloud.com/charts/top?genre=alternative','#0e1e14'],['Trap','https://soundcloud.com/charts/top?genre=trap','#1e1010'],['Jazz','https://soundcloud.com/charts/top?genre=jazz','#14100a']].map(function(x){return'<div onclick="loadSC(\''+x[1]+'\',\''+x[0]+'\')" style="background:'+x[2]+';border:1px solid #222;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s;min-width:90px;text-align:center" onmouseover="this.style.borderColor=\'#333\'" onmouseout="this.style.borderColor=\'#222\'">'+x[0]+'</div>';}).join('')}
          </div>
          <iframe id="sc-search-frame" src="" style="width:100%;height:320px;border:none;border-radius:8px;background:#111;display:none;margin-top:16px"></iframe>
        </div>
      </div>
    </div>
  </div>

  <!-- PLAYER BAR -->
  <div id="player">
    <div id="pl-left">
      <div id="pl-art">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>
      <div id="pl-track">
        <div id="pl-name">Not playing</div>
        <div id="pl-artist">Select a track</div>
      </div>
      <div id="pl-heart">&#9825;</div>
    </div>
    <div id="pl-center">
      <div id="pl-buttons">
        <button class="pl-btn" title="Shuffle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
        </button>
        <button class="pl-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
        </button>
        <button id="pl-play" onclick="togglePlay()">
          <svg id="pl-icon-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg id="pl-icon-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="pl-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14 4.77 2.14L8 14.14V9.86z"/><path d="M16 6h2v12h-2z"/></svg>
        </button>
        <button class="pl-btn" title="Repeat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </button>
      </div>
      <div id="pl-prog">
        <span class="pl-time" id="pl-cur">0:00</span>
        <div id="pl-bar" onclick="seekBar(event)"><div id="pl-fill"></div></div>
        <span class="pl-time" id="pl-end">--:--</span>
      </div>
    </div>
    <div id="pl-right">
      <svg class="pl-vol-icon" width="14" height="14" viewBox="0 0 24 24" fill="#444"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
      <div id="pl-vol-track" onclick="setVol(event)"><div id="pl-vol-fill"></div></div>
    </div>
  </div>
</div>

<!-- SC WIDGET -->
<div id="sc-widget">
  <div id="sc-widget-close" onclick="document.getElementById('sc-widget').classList.remove('open')">&#215;</div>
  <iframe id="sc-frame" src="" allow="autoplay" style="width:100%;height:175px;border:none"></iframe>
  <div id="sc-input">
    <input id="sc-url" type="text" placeholder="SoundCloud URL...">
    <button class="sc-go" onclick="loadSC(document.getElementById('sc-url').value,'Custom')">Go</button>
  </div>
</div>

<!-- YT PLAYER -->
<div id="yt-player">
  <div id="yt-player-close" onclick="document.getElementById('yt-player').classList.remove('open')">&#215;</div>
  <iframe id="yt-frame" src="" allow="autoplay;fullscreen" allowfullscreen style="width:100%;height:270px;border:none"></iframe>
  <div id="yt-input">
    <input id="yt-url" type="text" placeholder="YouTube URL or video ID...">
    <button class="yt-go" onclick="playYT()">Play</button>
  </div>
</div>

<script>
var playing = false, prog = 0;

function setGreeting() {
  var h = new Date().getHours();
  document.getElementById('greeting').textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

var TRENDING = [
  { name:"Today's Hits", artist:"Charts", url:'https://soundcloud.com/charts/top?genre=pop' },
  { name:'Hip-Hop', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=hiphoprap' },
  { name:'Phonk', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=danceedm' },
  { name:'R&B', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=rnb' },
  { name:'Electronic', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=electronic' },
  { name:'Rock', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=rock' },
];
var CHILL = [
  { name:'Lo-Fi Beats', artist:'Lo-Fi Music', url:'https://soundcloud.com/lofimusic' },
  { name:'Indie Chill', artist:'Alternative', url:'https://soundcloud.com/charts/top?genre=alternative' },
  { name:'Jazz', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=jazz' },
  { name:'Ambient', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=ambient' },
  { name:'Classical', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=classical' },
  { name:'Country', artist:'Charts', url:'https://soundcloud.com/charts/top?genre=country' },
];
var YT = [
  { name:'Lo-Fi Radio', artist:'Chillhop', vid:'5qap5aO4i9A' },
  { name:'Phonk Mix', artist:'Phonk', vid:'Lmc3Q5pOFW0' },
  { name:'Hip-Hop Mix', artist:'Various', vid:'f02mOEt11OQ' },
  { name:'Chill Mix', artist:'Various', vid:'lTRiuFIWV54' },
  { name:'Late Night', artist:'R&B', vid:'BEljvkEHhvA' },
  { name:'Study Mix', artist:'Lo-Fi', vid:'5mSFGN0VLuU' },
];

function alCard(d) {
  var isSC = !!d.url;
  var fn = isSC ? "loadSC('" + d.url + "','" + d.name + "')" : "playYTVid('" + d.vid + "','" + d.name + "','" + d.artist + "')";
  return '<div class="al-card" onclick="' + fn + '">' +
    '<div class="al-art"><div class="al-art-inner">' + d.name + '</div>' +
    '<div class="al-play" onclick="event.stopPropagation();' + fn + '">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg></div></div>' +
    '<div class="al-name">' + d.name + '</div><div class="al-artist">' + d.artist + '</div></div>';
}

document.getElementById('grid-trending').innerHTML = TRENDING.map(alCard).join('');
document.getElementById('grid-chill').innerHTML = CHILL.map(alCard).join('');
document.getElementById('grid-yt').innerHTML = YT.map(alCard).join('');

function loadSC(url, name) {
  if (!url) return;
  document.getElementById('sc-frame').src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&color=%23ff4500&auto_play=true&show_comments=false&hide_related=true';
  document.getElementById('sc-widget').classList.add('open');
  document.getElementById('pl-name').textContent = name || 'SoundCloud';
  document.getElementById('pl-artist').textContent = 'SoundCloud';
  playing = true; updPlay();
}

function playYTVid(vid, name, artist) {
  document.getElementById('yt-frame').src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0';
  document.getElementById('yt-player').classList.add('open');
  document.getElementById('pl-name').textContent = name || 'YouTube';
  document.getElementById('pl-artist').textContent = artist || 'YouTube';
  playing = true; updPlay();
}

function openYT() { document.getElementById('yt-player').classList.add('open'); document.getElementById('yt-url').focus(); }

function playYT() {
  var s = document.getElementById('yt-url').value.trim();
  var m = s.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/ ]{11})/);
  var vid = m ? m[1] : (s.length === 11 ? s : null);
  if (!vid) return;
  playYTVid(vid, 'YouTube', 'YouTube Music');
}

function runSearch() {
  var q = document.getElementById('sc-search-q').value.trim();
  if (!q) return;
  var url = 'https://soundcloud.com/search?q=' + encodeURIComponent(q);
  var f = document.getElementById('sc-search-frame');
  f.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&color=%23ff4500&auto_play=false&show_comments=false';
  f.style.display = 'block';
}

function setNav(el, view) {
  document.querySelectorAll('.sb-item').forEach(function(i) { i.classList.remove('active'); });
  el.classList.add('active');
  ['home','search'].forEach(function(v) { document.getElementById('view-' + v).style.display = v === view ? 'block' : 'none'; });
}

function togglePlay() { playing = !playing; updPlay(); }
function updPlay() {
  document.getElementById('pl-icon-play').style.display = playing ? 'none' : 'block';
  document.getElementById('pl-icon-pause').style.display = playing ? 'block' : 'none';
}
function seekBar(e) {
  var r = document.getElementById('pl-bar').getBoundingClientRect();
  prog = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
  document.getElementById('pl-fill').style.width = prog + '%';
}
function setVol(e) {
  var r = document.getElementById('pl-vol-track').getBoundingClientRect();
  document.getElementById('pl-vol-fill').style.width = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)) + '%';
}
document.getElementById('pl-heart').onclick = function() {
  this.textContent = this.textContent === '\u2665' ? '\u2661' : '\u2665';
  this.style.color = this.textContent === '\u2665' ? '#fff' : '#333';
};
setInterval(function() { if (playing && prog < 100) prog += 0.04; document.getElementById('pl-fill').style.width = prog + '%'; }, 1000);

setGreeting();
</script>
` + TAIL;
  }

  /* ═══════════════════════════════════════════════════════════
     DISCORD
  ═══════════════════════════════════════════════════════════ */
  if (id === 'discord') { return HEAD + `
<style>
  body { background:#1e1f22; display:flex; flex-direction:column; }
  #dc-header {
    padding:10px 16px; background:#1e1f22; border-bottom:1px solid rgba(255,255,255,.04);
    display:flex; align-items:center; gap:10px; flex-shrink:0;
  }
  #dc-header img { width:22px; height:22px; }
  .dc-title { font-family:'Space Grotesk',sans-serif; font-size:.8rem; font-weight:600; color:#fff; }
  #dc-proxy-row { margin-left:auto; display:flex; gap:6px; align-items:center; }
  #dc-proxy-in {
    background:#111; border:1px solid #222; color:#aaa; padding:5px 10px;
    border-radius:6px; outline:none; font-size:12px; width:200px;
  }
  #dc-proxy-in::placeholder { color:#2a2a2a; }
  .dc-load-btn {
    background:#5865f2; border:none; color:#fff;
    padding:5px 13px; border-radius:6px; font-size:12px; font-weight:600;
  }
  #dc-frame { flex:1; border:none; background:#1e1f22; }

  /* INVITE CARD (shown when no proxy) */
  #invite-view {
    flex:1; display:none; flex-direction:column;
    align-items:center; justify-content:center; gap:16px;
    background:radial-gradient(ellipse at 50% 60%, #1a0a2e 0%, #0a0a0e 60%);
    padding:30px;
  }
  .inv-card {
    background:#2b2d31; border:1px solid rgba(255,255,255,.06);
    border-radius:8px; padding:0; width:440px; max-width:100%; overflow:hidden;
    display:flex;
  }
  .inv-left { flex:1; padding:20px 24px; }
  .inv-right {
    width:160px; border-left:1px solid rgba(255,255,255,.06);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:10px; padding:20px;
  }
  .inv-eyebrow { font-size:11px; font-weight:700; color:#b5bac1; letter-spacing:.5px; text-transform:uppercase; margin-bottom:14px; }
  .inv-server { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
  .inv-icon {
    width:48px; height:48px; background:#5865f2; border-radius:12px;
    display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:20px;
  }
  .inv-name { font-size:1rem; font-weight:700; color:#fff; }
  .inv-stats { display:flex; gap:16px; margin-top:4px; font-size:12px; color:#b5bac1; }
  .inv-stat { display:flex; align-items:center; gap:5px; }
  .dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
  .dot-green { background:#23a55a; }
  .dot-gray { background:#80848e; }
  .accept-btn {
    width:100%; background:#5865f2; border:none; color:#fff;
    padding:10px; border-radius:4px; font-size:14px; font-weight:600;
    cursor:pointer; transition:.15s;
  }
  .accept-btn:hover { background:#4752c4; }
  .qr-box {
    width:100px; height:100px; background:#fff; border-radius:6px;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; color:#000; font-weight:700; text-align:center; padding:8px;
    line-height:1.4;
  }
  .inv-scan-label { font-size:10px; color:#555; text-align:center; font-weight:600; letter-spacing:.3px; text-transform:uppercase; }
</style>

<div style="height:100vh;display:flex;flex-direction:column">
  <div id="dc-header">
    <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png">
    <div class="dc-title">Discord</div>
    <div id="dc-proxy-row">
      <input id="dc-proxy-in" type="text" placeholder="Proxy URL to load Discord...">
      <button class="dc-load-btn" onclick="loadApp()">Load</button>
    </div>
  </div>
  <iframe id="dc-frame" style="display:none;flex:1;border:none" allow="autoplay;fullscreen;clipboard-write;camera;microphone"></iframe>
  <div id="invite-view">
    <div class="inv-card">
      <div class="inv-left">
        <div class="inv-eyebrow">You have been invited to join</div>
        <div class="inv-server">
          <div class="inv-icon">&#128172;</div>
          <div>
            <div class="inv-name">Intellectual OS</div>
            <div class="inv-stats">
              <div class="inv-stat"><span class="dot dot-green"></span> Online</div>
              <div class="inv-stat"><span class="dot dot-gray"></span> Members</div>
            </div>
          </div>
        </div>
        <button class="accept-btn" onclick="openInvite()">Accept Invitation</button>
      </div>
      <div class="inv-right">
        <div class="qr-box">discord.gg/<br>Sduv8uDjxF</div>
        <div class="inv-scan-label">Scan to join</div>
      </div>
    </div>
  </div>
</div>

<script>
var INVITE = 'https://discord.gg/Sduv8uDjxF';
document.getElementById('dc-proxy-in').value = localStorage.getItem('intel_proxy_url') || '';

function loadApp() {
  var p = document.getElementById('dc-proxy-in').value.trim();
  var f = document.getElementById('dc-frame');
  document.getElementById('invite-view').style.display = 'none';
  f.style.display = 'block';
  f.src = p ? p.replace(/\/$/, '') + '/service/' + btoa('https://discord.com/app') : 'https://discord.com/app';
}

function openInvite() {
  var p = document.getElementById('dc-proxy-in').value.trim();
  var f = document.getElementById('dc-frame');
  document.getElementById('invite-view').style.display = 'none';
  f.style.display = 'block';
  f.src = p ? p.replace(/\/$/, '') + '/service/' + btoa(INVITE) : INVITE;
}

if (localStorage.getItem('intel_proxy_url')) {
  loadApp();
} else {
  document.getElementById('invite-view').style.display = 'flex';
}
</script>
` + TAIL;
  }

  /* BROWSER, SETTINGS, AI, ROBLOX, GEFORCE — kept clean */
  if (id === 'web') { return HEAD + `<style>body{overflow:hidden}#br{height:100vh;display:flex;flex-direction:column}#top{padding:9px 11px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;gap:6px;align-items:center;flex-shrink:0}.nb{background:#111;border:1px solid #1a1a1a;color:#666;width:27px;height:27px;border-radius:50%;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.12s}.nb:hover{color:#aaa;border-color:#2a2a2a}#url{flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 14px;border-radius:18px;outline:none;font-size:13px;font-weight:500;transition:.2s}#url:focus{border-color:#2a2a2a}#go{background:#fff;color:#000;border:none;padding:7px 16px;border-radius:18px;font-weight:700;font-size:13px;cursor:pointer;flex-shrink:0;transition:.12s}#go:hover{background:#ddd}#pbar{padding:6px 13px;background:#060606;border-bottom:1px solid #0d0d0d;display:flex;align-items:center;gap:7px;flex-shrink:0}#pdot{width:6px;height:6px;border-radius:50%;background:#2a2a2a;flex-shrink:0;transition:.3s}#pdot.on{background:#4a7}#plabel{font-size:10px;font-weight:600;color:#2a2a2a;flex-shrink:0;text-transform:uppercase;letter-spacing:.5px}#pin{flex:1;background:transparent;border:none;color:#444;font-size:11px;outline:none}#pin::placeholder{color:#222}#pguide{display:none;padding:13px 16px;background:#060606;border-bottom:1px solid #0d0d0d;flex-shrink:0}#body{flex:1;position:relative}#ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:30px;text-align:center}#mf{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}.setup-toggle{font-size:11px;font-weight:600;color:#2a2a2a;cursor:pointer;flex-shrink:0;letter-spacing:.5px;text-transform:uppercase;transition:.12s}.setup-toggle:hover{color:#666}</style><div id="br"><div id="top"><div class="nb" onclick="bk()">&#8249;</div><div class="nb" onclick="fw()">&#8250;</div><div class="nb" onclick="rl()">&#8635;</div><input id="url" type="text" placeholder="Search or enter a URL..." onkeydown="if(event.key==='Enter')go()"><button id="go" onclick="go()">Go</button></div><div id="pbar"><div id="pdot"></div><span id="plabel">Proxy</span><input id="pin" type="text" placeholder="Paste your Ultraviolet proxy URL here..." oninput="sv(this.value)"><div class="setup-toggle" onclick="tg()">Setup guide</div></div><div id="pguide"><div style="font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:600;margin-bottom:10px">How to set up a proxy (free, 5 min)</div>${[['Fork github.com/titaniumnetwork-dev/Ultraviolet-App'],['Click Deploy to Render in the README'],['Create a free Render account and deploy'],['Copy the .onrender.com URL Render gives you'],['Paste that URL in the proxy field above']].map(function(x,i){return'<div style="display:flex;gap:8px;margin-bottom:6px"><div style="background:#1a1a1a;color:#666;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">'+(i+1)+'</div><div style="font-size:12px;color:#444;line-height:1.5">'+x[0]+'</div></div>';}).join('')}<button onclick="tg()" style="margin-top:8px;background:#111;border:1px solid #1a1a1a;color:#555;padding:4px 12px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer">Close</button></div><div id="body"><div id="ph"><div style="font-size:1.8rem;color:#1a1a1a">&#128274;</div><div style="font-family:'Space Grotesk',sans-serif;font-size:.85rem;font-weight:600;color:#1e1e1e">No proxy configured</div><div style="font-size:12px;color:#1a1a1a;max-width:260px;line-height:1.7;margin-top:4px">School filters block most sites. Paste a proxy URL above or click Setup guide for instructions.</div></div><iframe id="mf" allow="autoplay;fullscreen;clipboard-write;camera;microphone" allowfullscreen></iframe></div></div><script>(function(){var p=localStorage.getItem('intel_proxy_url')||'';document.getElementById('pin').value=p;document.getElementById('pdot').classList.toggle('on',!!p);})();function sv(v){localStorage.setItem('intel_proxy_url',v);document.getElementById('pdot').classList.toggle('on',!!v);}function go(){var raw=document.getElementById('url').value.trim(),p=document.getElementById('pin').value.trim();if(!raw)return;var url=raw.startsWith('http')?raw:(raw.includes('.')&&!raw.includes(' ')?'https://'+raw:'https://www.google.com/search?q='+encodeURIComponent(raw));var f=document.getElementById('mf');document.getElementById('ph').style.display='none';f.style.display='block';f.src=p?p.replace(/\/$/,'')+'/service/'+btoa(url):url;}function bk(){try{document.getElementById('mf').contentWindow.history.back();}catch(e){}}function fw(){try{document.getElementById('mf').contentWindow.history.forward();}catch(e){}}function rl(){var f=document.getElementById('mf');if(f.src&&f.src!=='about:blank')f.src=f.src;}function tg(){var g=document.getElementById('pguide');g.style.display=g.style.display==='block'?'none':'block';}<\/script>` + TAIL; }

  if (id === 'settings') { return HEAD + `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><style>body{overflow-y:auto;height:auto;min-height:100vh}.w{padding:22px;max-width:520px;margin:0 auto}.h1{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:600;color:#fff;border-bottom:1px solid #111;padding-bottom:10px;margin-bottom:12px;margin-top:26px;display:flex;align-items:center;gap:8px;color:#888}.h1:first-child{margin-top:0}.c{background:#0d0d0d;border:1px solid #111;padding:12px 14px;border-radius:8px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;gap:12px;transition:.12s}.ci{display:flex;gap:11px;align-items:center}.ci i{color:#2a2a2a;width:15px;text-align:center;font-size:.85rem}.ct strong{display:block;font-weight:600;font-size:13px;color:#fff}.ct small{display:block;color:#333;font-size:11px;margin-top:1px}.tog{position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0}.tog input{opacity:0;width:0;height:0}.ts{position:absolute;cursor:pointer;inset:0;background:#1a1a1a;border-radius:20px;transition:.25s;border:1px solid #1e1e1e}.ts:before{position:absolute;content:"";height:13px;width:13px;left:3px;bottom:3px;background:#333;transition:.25s;border-radius:50%}input:checked+.ts{background:#fff;border-color:#fff}input:checked+.ts:before{transform:translateX(16px);background:#000}select.sel{background:#111;color:#fff;border:1px solid #1a1a1a;padding:5px 8px;border-radius:5px;outline:none;font-size:12px;font-family:inherit}input.sm{width:34px;height:26px;background:#111;border:1px solid #1a1a1a;color:#fff;text-align:center;font-size:.9rem;font-weight:600;outline:none;border-radius:4px}.colors{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.sw{width:24px;height:24px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:.15s}.sw:hover,.sw.on{border-color:#fff;transform:scale(1.12)}#cc{width:34px;height:24px;border:1px solid #1a1a1a;border-radius:4px;padding:1px;background:#111;cursor:pointer}</style><div class="w"><div class="h1"><i class="fas fa-sliders-h"></i>Performance</div>${[['optBg','film','Optimized background','Disables animated background'],['shortBoot','bolt','Fast boot','Skip the startup animation'],['idleLock','lock','Auto-lock','Lock after 3 minutes of inactivity'],['redirectConfirm','shield-alt','Redirect warning','Helps block GoGuardian']].map(function(x){return'<div class="c"><div class="ci"><i class="fas fa-'+x[1]+'"></i><div class="ct"><strong>'+x[2]+'</strong><small>'+x[3]+'</small></div></div><label class="tog"><input type="checkbox" id="c-'+x[0]+'" onchange="window.parent.updateSysSetting(\''+x[0]+'\',this.checked);st(this)"><span class="ts"></span></label></div>';}).join('')}<div class="h1"><i class="fas fa-lock"></i>Privacy</div><div class="c"><div class="ci"><i class="fas fa-mask"></i><div class="ct"><strong>Tab disguise</strong><small>Make this tab look like another site</small></div></div><select class="sel" id="clk" onchange="window.parent.updateCloak(this.value)"><option value="none">None</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option></select></div><div class="c"><div class="ci"><i class="fas fa-exclamation-triangle"></i><div class="ct"><strong>Panic key</strong><small>Press to instantly close the tab</small></div></div><input class="sm" type="text" id="pk" maxlength="1" onkeyup="window.parent.updateSysSetting('panicKey',this.value)"></div><div class="h1"><i class="fas fa-palette"></i>Appearance</div><div class="c" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="ci"><i class="fas fa-circle" style="font-size:.5rem;padding:4px"></i><div class="ct"><strong>Accent color</strong><small>Changes highlights and glows across the OS</small></div></div><div class="colors">${['#fff','#4f8ef7','#f74f4f','#4ff78e','#f7c14f','#c14ff7','#f74fc1','#4ff7f7','#ff6b35','#1db954'].map(function(c){return'<div class="sw" style="background:'+c+'" onclick="pc(\''+c+'\')"></div>';}).join('')}<input type="color" id="cc" value="#ffffff" onchange="pc(this.value)"></div></div><div class="c" style="flex-direction:column;align-items:flex-start;gap:8px"><div class="ci"><i class="fas fa-image"></i><div class="ct"><strong>Custom wallpaper</strong><small>Add any image or video URL as a wallpaper</small></div></div><div style="display:flex;gap:6px;width:100%;flex-wrap:wrap"><input id="wn" type="text" placeholder="Name" style="width:100px;background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 10px;border-radius:5px;outline:none;font-size:12px"><input id="wu" type="text" placeholder="Image or video URL" style="flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 10px;border-radius:5px;outline:none;font-size:12px;min-width:120px"><button onclick="aw()" style="background:#fff;color:#000;border:none;padding:7px 14px;border-radius:5px;font-weight:700;font-size:12px;cursor:pointer">Add</button></div></div></div><script>(function(){var p=window.parent.sysConfig;['optBg','shortBoot','idleLock','redirectConfirm'].forEach(function(k){var cb=document.getElementById('c-'+k);if(cb){cb.checked=!!p[k];st(cb);}});var cl=document.getElementById('clk');if(cl)cl.value=p.cloak||'none';var pk=document.getElementById('pk');if(pk)pk.value=p.panicKey||'';})();function st(cb){var t=cb.nextElementSibling;t.style.background=cb.checked?'#fff':'#1a1a1a';t.style.borderColor=cb.checked?'#fff':'#1e1e1e';t.querySelector(':before');}function pc(c){document.querySelectorAll('.sw').forEach(function(s){s.classList.remove('on');});var m=document.querySelector('.sw[style*="'+c+'"]');if(m)m.classList.add('on');window.parent.applyAccentColor(c);}function aw(){var n=document.getElementById('wn').value.trim(),u=document.getElementById('wu').value.trim();if(!n||!u){alert('Enter a name and URL');return;}window.parent.addCustomWallpaper(n,u);document.getElementById('wn').value='';document.getElementById('wu').value='';}<\/script>` + TAIL; }

  if (id === 'ciniai') { return HEAD + `<style>body{overflow:hidden}#ai-root{height:100vh;display:flex;flex-direction:column}#ai-header{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap}.ai-title{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:600}.ai-tabs{display:flex;gap:5px;flex-wrap:wrap}.ai-tab{background:#111;border:1px solid #1a1a1a;color:#555;padding:4px 13px;border-radius:14px;font-size:12px;font-weight:600;transition:.12s;cursor:pointer}.ai-tab:hover{color:#aaa}.ai-tab.on{background:#fff;color:#000;border-color:#fff}#ai-proxy-row{margin-left:auto;display:flex;gap:5px;align-items:center}#ai-proxy{background:#111;border:1px solid #1a1a1a;color:#aaa;padding:5px 9px;border-radius:5px;outline:none;font-size:11px;width:170px}#ai-proxy::placeholder{color:#222}.ai-reload{background:#111;border:1px solid #1a1a1a;color:#555;padding:5px 9px;border-radius:5px;font-size:12px;cursor:pointer;transition:.12s}.ai-reload:hover{color:#aaa}#ai-frame{flex:1;border:none;background:#111}</style><div id="ai-root"><div id="ai-header"><div class="ai-title">AI</div><div class="ai-tabs">${[['ChatGPT','gpt','https://chat.openai.com'],['Claude','cld','https://claude.ai'],['Gemini','gem','https://gemini.google.com'],['Perplexity','perp','https://perplexity.ai']].map(function(x){return'<div id="t-'+x[1]+'" class="ai-tab" onclick="load(\''+x[2]+'\',\''+x[1]+'\')">'+x[0]+'</div>';}).join('')}</div><div id="ai-proxy-row"><input id="ai-proxy" type="text" placeholder="Proxy URL..."><button class="ai-reload" onclick="reload()">&#8635;</button></div></div><iframe id="ai-frame" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>var cur='',curU='';document.getElementById('ai-proxy').value=localStorage.getItem('intel_proxy_url')||'';function load(url,key){cur=key;curU=url;document.querySelectorAll('.ai-tab').forEach(function(t){t.classList.remove('on');});var t=document.getElementById('t-'+key);if(t)t.classList.add('on');var p=document.getElementById('ai-proxy').value.trim();document.getElementById('ai-frame').src=p?p.replace(/\/$/,'')+'/service/'+btoa(url):url;}function reload(){if(curU)load(curU,cur);}load('https://chat.openai.com','gpt');<\/script>` + TAIL; }

  if (id === 'cine') { return HEAD + `<style>body{overflow:hidden}#hub{height:100vh;display:flex;flex-direction:column;background:#000}#hub-nav{position:absolute;top:0;left:0;right:0;z-index:20;padding:13px 24px;display:flex;align-items:center;gap:20px;background:linear-gradient(rgba(0,0,0,.85),transparent)}#hub-nav .brand{font-family:'Space Grotesk',sans-serif;font-size:.85rem;font-weight:700;flex-shrink:0}.nl{font-size:13px;font-weight:500;color:rgba(255,255,255,.5);cursor:pointer;transition:.12s;white-space:nowrap}.nl:hover,.nl.on{color:#fff}#hub-search{margin-left:auto;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12);color:#fff;padding:6px 13px;border-radius:6px;outline:none;font-size:13px;width:160px;transition:.2s}#hub-search:focus{border-color:rgba(255,255,255,.25);width:220px}#hero{position:relative;height:50vh;flex-shrink:0}#hero-bg{position:absolute;inset:0;background:#060608}#hf{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}#hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.8) 0%,rgba(0,0,0,.15) 60%,transparent 100%)}#hero-content{position:absolute;bottom:36px;left:30px;max-width:42%}#hero-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(1.1rem,2.4vw,1.8rem);font-weight:700;margin-bottom:8px}#hero-desc{font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;margin-bottom:16px}.hbtn{padding:9px 22px;border:none;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer;transition:.15s}.hbtn-p{background:#fff;color:#000}.hbtn-p:hover{background:#ddd}.hbtn-i{background:rgba(60,60,60,.7);color:#fff;border:1px solid rgba(255,255,255,.15)}.hbtn-i:hover{background:rgba(80,80,80,.9)}#rows-wrap{flex:1;overflow-y:auto;padding-bottom:28px}#rows-wrap::-webkit-scrollbar{width:3px}#rows-wrap::-webkit-scrollbar-thumb{background:#1a1a1a}.row-s{margin-top:24px}.row-label{font-family:'Space Grotesk',sans-serif;font-size:.85rem;font-weight:600;padding:0 24px;margin-bottom:10px}.card-row{display:flex;gap:7px;padding:3px 24px 8px;overflow-x:auto;scroll-snap-type:x mandatory}.card-row::-webkit-scrollbar{display:none}.nfc{flex-shrink:0;width:168px;border-radius:6px;overflow:hidden;cursor:pointer;transition:.2s;scroll-snap-align:start;background:#111;border:1px solid #1a1a1a}.nfc:hover{transform:scale(1.04);border-color:#2e2e2e;box-shadow:0 6px 24px rgba(0,0,0,.7)}.nfc-art{width:100%;height:100px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:rgba(255,255,255,.2);text-align:center;padding:8px;line-height:1.4}.nfc-info{padding:8px 10px 10px}.nfc-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}.nfc-sub{font-size:11px;color:#444}#url-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);backdrop-filter:blur(12px);z-index:100;align-items:center;justify-content:center;flex-direction:column;gap:12px;padding:30px;text-align:center}#url-modal.open{display:flex}#url-modal h3{font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:600}#url-modal p{color:#444;font-size:13px;max-width:320px;line-height:1.6}#url-in{background:#111;border:1px solid #222;color:#fff;padding:9px 15px;border-radius:7px;outline:none;font-size:13px;width:100%;max-width:380px}</style><div id="hub"><div id="hero"><div id="hero-bg"></div><iframe id="hf" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe><div id="hero-overlay"></div><div id="hub-nav"><div class="brand">Intellectual Hub</div>${['Home','Anime','Action','Music','Gaming'].map(function(x,i){return'<span class="nl'+(i===0?' on':'')+'" onclick="showCat(\''+x.toLowerCase()+'\',this)">'+x+'</span>';}).join('')}<input id="hub-search" type="text" placeholder="Search..." onkeydown="if(event.key===\'Enter\')doSearch(this.value)"></div><div id="hero-content"><div id="hero-title">Intellectual Hub</div><div id="hero-desc">Paste any YouTube URL to watch it here, or browse the rows below.</div><div style="display:flex;gap:8px"><button class="hbtn hbtn-p" onclick="openModal()">Paste URL</button><button class="hbtn hbtn-i" onclick="document.getElementById(\'rows-wrap\').scrollTop+=250">Browse</button></div></div></div><div id="rows-wrap"><div id="all-rows"></div></div></div><div id="url-modal"><h3>Play a video</h3><p>Paste a YouTube link to watch it here without leaving the OS.</p><input id="url-in" type="text" placeholder="https://youtube.com/watch?v=..."><div style="display:flex;gap:8px"><button style="background:#fff;color:#000;border:none;padding:9px 20px;border-radius:6px;font-weight:700;font-size:13px;cursor:pointer" onclick="playUrl()">Play</button><button style="background:#1a1a1a;color:#666;border:1px solid #222;padding:9px 20px;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer" onclick="closeModal()">Cancel</button></div></div><script>var CATS={home:{label:'Trending',items:[{t:'Lo-Fi Beats',id:'5qap5aO4i9A'},{t:'Phonk Mix',id:'Lmc3Q5pOFW0'},{t:'Anime AMV',id:'8MJ7HMFbSCg'},{t:'Gaming Clips',id:'g6gGPnv4Wgo'},{t:'Minecraft',id:'gKNJKce1p8M'},{t:'Chill Radio',id:'lTRiuFIWV54'},{t:'Night City',id:'BHACKCNDMW8'},{t:'Mix',id:'f02mOEt11OQ'}]},anime:{label:'Anime',items:[{t:'AMV Epic',id:'8MJ7HMFbSCg'},{t:'AMV Phonk',id:'Lmc3Q5pOFW0'},{t:'JJK',id:'BEljvkEHhvA'},{t:'One Piece',id:'aaIJb8bRy78'},{t:'Naruto AMV',id:'gKNJKce1p8M'},{t:'Demon Slayer',id:'5mSFGN0VLuU'},{t:'Bleach',id:'f02mOEt11OQ'},{t:'AOT',id:'BHACKCNDMW8'}]},action:{label:'Action',items:[{t:'FPS Clips',id:'g6gGPnv4Wgo'},{t:'Minecraft',id:'gKNJKce1p8M'},{t:'Warzone',id:'f02mOEt11OQ'},{t:'Among Us',id:'lTRiuFIWV54'},{t:'Speedrun',id:'5qap5aO4i9A'},{t:'Battle Royale',id:'BEljvkEHhvA'},{t:'Retro',id:'BHACKCNDMW8'},{t:'Highlights',id:'Lmc3Q5pOFW0'}]},music:{label:'Music',items:[{t:'Lo-Fi Radio',id:'5qap5aO4i9A'},{t:'Phonk',id:'Lmc3Q5pOFW0'},{t:'Chill',id:'lTRiuFIWV54'},{t:'Hip-Hop',id:'f02mOEt11OQ'},{t:'Trap',id:'BEljvkEHhvA'},{t:'R&B',id:'5mSFGN0VLuU'},{t:'Pop',id:'BHACKCNDMW8'},{t:'EDM',id:'gKNJKce1p8M'}]},gaming:{label:'Gaming',items:[{t:'Minecraft',id:'gKNJKce1p8M'},{t:'FPS',id:'g6gGPnv4Wgo'},{t:'Retro',id:'BHACKCNDMW8'},{t:'Speedrun',id:'5qap5aO4i9A'},{t:'Warzone',id:'f02mOEt11OQ'},{t:'Roblox',id:'lTRiuFIWV54'},{t:'Highlights',id:'BEljvkEHhvA'},{t:'Funny',id:'Lmc3Q5pOFW0'}]}};var BG=['#0a0a14','#140a0a','#0a140a','#0a0e14','#14100a','#100a14','#0a1410','#14140a'];function buildRows(k){var html='';var keys=k?[k]:Object.keys(CATS);keys.forEach(function(ck){var c=CATS[ck];html+='<div class="row-s"><div class="row-label">'+c.label+'</div><div class="card-row">'+c.items.map(function(x,i){return'<div class="nfc" onclick="playVid(\''+x.id+'\',\''+x.t+'\')"><div class="nfc-art" style="background:'+BG[i%BG.length]+'">'+x.t+'</div><div class="nfc-info"><div class="nfc-name">'+x.t+'</div><div class="nfc-sub">YouTube</div></div></div>';}).join('')+'</div></div>';});document.getElementById('all-rows').innerHTML=html;}function showCat(k,el){document.querySelectorAll('.nl').forEach(function(l){l.classList.remove('on');});el.classList.add('on');buildRows(k==='home'?null:k);}function playVid(id,title){document.getElementById('hero-bg').style.display='none';var f=document.getElementById('hf');f.style.display='block';f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';document.getElementById('hero-title').textContent=title;document.getElementById('hero-desc').textContent='Now playing.';closeModal();}function getVid(s){s=(s||'').trim();var m=s.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/ ]{11})/);return m?m[1]:(s.length===11?s:null);}function playUrl(){var v=getVid(document.getElementById('url-in').value);if(!v){alert('Paste a valid YouTube URL');return;}playVid(v,'Video');}function openModal(){document.getElementById('url-modal').classList.add('open');document.getElementById('url-in').focus();}function closeModal(){document.getElementById('url-modal').classList.remove('open');}function doSearch(q){buildRows();if(q)document.getElementById('all-rows').insertAdjacentHTML('afterbegin','<div style="padding:24px;font-size:13px;color:#444">To search: go to YouTube, search for "'+q+'", copy the URL, and paste it using Paste URL.</div>');}document.getElementById('url-modal').onclick=function(e){if(e.target===this)closeModal();};document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});buildRows();<\/script>` + TAIL; }

  if (id === 'roblox') { return HEAD + `<style>body{overflow:hidden}#rb{height:100vh;display:flex;flex-direction:column}#rb-bar{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.rb-title{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:600}#rb-proxy{flex:1;background:#111;border:1px solid #1a1a1a;color:#aaa;padding:5px 10px;border-radius:5px;outline:none;font-size:12px}#rb-proxy::placeholder{color:#222}.rb-btn{background:#e2231a;border:none;color:#fff;padding:5px 13px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer}#rb-frame{flex:1;border:none}</style><div id="rb"><div id="rb-bar"><div class="rb-title">Roblox</div><input id="rb-proxy" type="text" placeholder="Proxy URL..."><button class="rb-btn" onclick="load()">Launch</button></div><iframe id="rb-frame" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>document.getElementById('rb-proxy').value=localStorage.getItem('intel_proxy_url')||'';function load(){var p=document.getElementById('rb-proxy').value.trim();document.getElementById('rb-frame').src=p?p.replace(/\/$/,'')+'/service/'+btoa('https://www.roblox.com'):'https://www.roblox.com';}<\/script>` + TAIL; }

  if (id === 'Geforce') { return HEAD + `<style>body{overflow:hidden}#gf{height:100vh;display:flex;flex-direction:column}#gf-bar{padding:9px 14px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:9px;flex-shrink:0}.gf-title{font-family:'Space Grotesk',sans-serif;font-size:.8rem;font-weight:600}#gf-proxy{flex:1;background:#111;border:1px solid #1a1a1a;color:#aaa;padding:5px 10px;border-radius:5px;outline:none;font-size:12px}#gf-proxy::placeholder{color:#222}.gf-btn{background:#76b900;border:none;color:#000;padding:5px 13px;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer}#gf-frame{flex:1;border:none}</style><div id="gf"><div id="gf-bar"><div class="gf-title">GeForce Now</div><input id="gf-proxy" type="text" placeholder="Proxy URL..."><button class="gf-btn" onclick="load()">Launch</button></div><iframe id="gf-frame" allow="autoplay;fullscreen;gamepad"></iframe></div><script>document.getElementById('gf-proxy').value=localStorage.getItem('intel_proxy_url')||'';function load(){var p=document.getElementById('gf-proxy').value.trim();document.getElementById('gf-frame').src=p?p.replace(/\/$/,'')+'/service/'+btoa('https://play.geforcenow.com'):'https://play.geforcenow.com';}<\/script>` + TAIL; }

  return HEAD + '<div style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px"><div style="font-size:.8rem;font-weight:600;color:#1e1e1e">App not configured</div></div>' + TAIL;
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
(function drawFV(){requestAnimationFrame(drawFV);var cv=document.getElementById('visualizer');if(!cv)return;var cx=cv.getContext('2d');cv.width=cv.parentElement.clientWidth;cv.height=14;cx.clearRect(0,0,cv.width,cv.height);var bL=32,bW=(cv.width/bL)*2,xP=0;for(var i=0;i<bL;i++){var bH=aMedia&&!aMedia.paused?(Math.random()*cv.height):2;cx.fillStyle="#fff";cx.beginPath();try{cx.roundRect(xP,cv.height-bH,bW-1.5,bH,2);}catch(e){cx.rect(xP,cv.height-bH,bW-1.5,bH);}cx.fill();xP+=bW;}})();

// ── FPS ───────────────────────────────────────────────────────────────────────
var fLT=performance.now(),fFr=0,fLC=0;
(function chkFps(){requestAnimationFrame(chkFps);var nw=performance.now();fFr++;if(nw-fLT>=1000){var cFps=fFr,fv=document.getElementById('fps-val');if(fv)fv.innerText=cFps;if(cFps<=20){fLC++;if(fLC>=5&&!sysConfig.optBg){sysConfig.optBg=true;localStorage.setItem('intel_sys_config',JSON.stringify(sysConfig));showNotification("Performance","Background video paused to improve performance.");}}else{fLC=0;}fFr=0;fLT=nw;}})();

window.onbeforeunload=function(e){if(sysConfig.redirectConfirm){var msg="Are you sure you want to leave this page?";e.returnValue=msg;return msg;}};
