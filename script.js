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

function getAppSrcdoc(id){
var B='<!DOCTYPE html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{background:#000;color:#fff;font-family:'Inter',sans-serif;height:100vh;overflow:hidden}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}input,select,button,textarea{font-family:Inter}button{cursor:pointer}</style></head><body>';
var E='</body></html>';

// ═══════════════════════════════════════════════════════════════════════════════
// PS STORE STYLE GAMES
// ═══════════════════════════════════════════════════════════════════════════════
if(id==='files'){
var CATALOG=[
  {id:'mc',      name:'Minecraft',        sub:'Eaglercraft Edition',   url:'https://eaglercraft.com/mc/1.8.8-wasm/', color:'#4a7c2f', img:'https://www.minecraft.net/content/dam/games/minecraft/key-art/MC_Java_Edition_Keyart_1920x1080.jpg'},
  {id:'bloxd',   name:'Bloxd.io',         sub:'3D Multiplayer',        url:'https://bloxd.io/',                     color:'#1a6bb5', img:'https://bloxd.io/favicon.png'},
  {id:'smash',   name:'Smash Karts',      sub:'Racing',                url:'https://smashkarts.io/',                color:'#c44b1a', img:'https://smashkarts.io/images/logo.png'},
  {id:'venge',   name:'Venge.io',         sub:'FPS Shooter',           url:'https://venge.io/',                     color:'#1a1a3a', img:'https://venge.io/favicon.ico'},
  {id:'shell',   name:'Shell Shockers',   sub:'Egg FPS',               url:'https://shellshock.io/',               color:'#8b3a1a', img:'https://shellshock.io/img/shell-shockers-logo.png'},
  {id:'zombs',   name:'Zombs Royale',     sub:'Battle Royale',         url:'https://zombsroyale.io/',              color:'#1a4a1a', img:'https://zombsroyale.io/images/ZombsRoyale_Logo.png'},
  {id:'krunker', name:'Krunker.io',       sub:'FPS Browser Game',      url:'https://krunker.io/',                  color:'#1a2a1a', img:'https://krunker.io/img/krunker_icon_128.png'},
  {id:'1v1',     name:'1v1.LOL',          sub:'Building & Combat',     url:'https://1v1.lol/',                     color:'#3a1a5a', img:'https://1v1.lol/assets/images/logo.png'},
  {id:'slope',   name:'Slope',            sub:'Speed Runner',          url:'https://slope-game.com/',              color:'#0a2a4a', img:'https://slope-game.com/favicon.ico'},
  {id:'paper',   name:'Paper.io 2',       sub:'Territory Control',     url:'https://paper-io.com/',                color:'#1a3a5a', img:'https://paper-io.com/favicon.ico'},
  {id:'retro',   name:'Retro Games',      sub:'Classic Arcade',        url:'https://www.retrogames.cc/',           color:'#3a1a1a', img:'https://www.retrogames.cc/favicon.ico'},
  {id:'moto',    name:'Moto X3M',         sub:'Stunt Racing',          url:'https://www.motox3m.com/',             color:'#4a2a0a', img:'https://www.motox3m.com/favicon.ico'},
  {id:'among',   name:'Among Us Online',  sub:'Deduction Game',        url:'https://www.miniplay.com/game/among-us-online', color:'#1a0a3a', img:'https://img.miniplay.com/game/among-us-online_250x250.jpg'},
  {id:'fnf',     name:'FNF',              sub:'Rhythm Game',           url:'https://www.fridaynightfunkin.com/',   color:'#2a0a2a', img:'https://www.fridaynightfunkin.com/favicon.ico'},
  {id:'ovo',     name:'OvO',              sub:'Platformer',            url:'https://www.crazygames.com/game/ovo',  color:'#1a1a1a', img:'https://imgs.crazygames.com/games/ovo/cover-1656436359244.png'},
  {id:'cookie',  name:'Cookie Clicker',   sub:'Idle Game',             url:'https://orteil.dashnet.org/cookieclicker/', color:'#3a2a0a', img:'https://orteil.dashnet.org/cookieclicker/img/favicon.ico'},
];

return B+`
<style>
*{box-sizing:border-box}
#ps{height:100%;display:flex;flex-direction:column;background:#000;overflow:hidden}
/* NAV */
#ps-nav{display:flex;align-items:center;padding:0 28px;height:48px;background:#000;border-bottom:1px solid #111;flex-shrink:0;gap:0}
.ps-nav-link{font-size:14px;font-weight:700;color:#aaa;padding:0 18px;height:100%;display:flex;align-items:center;border-bottom:2px solid transparent;cursor:pointer;transition:.2s;letter-spacing:.3px;white-space:nowrap}
.ps-nav-link:hover{color:#fff}
.ps-nav-link.active{color:#fff;border-bottom-color:#fff}
.ps-nav-search{display:flex;align-items:center;gap:8px;margin-left:auto;background:#111;border:1px solid #1a1a1a;padding:6px 14px;border-radius:20px;cursor:pointer;transition:.2s}
.ps-nav-search:hover{background:#1a1a1a;border-color:#333}
.ps-nav-search span{font-size:13px;color:#888;font-weight:600}
.ps-nav-right{display:flex;align-items:center;gap:16px;margin-left:16px}
.ps-clock{font-size:13px;font-weight:700;color:#888}
/* BODY */
#ps-body{flex:1;overflow-y:auto;overflow-x:hidden;padding-bottom:30px}
/* HERO */
#ps-hero{padding:36px 28px 28px;position:relative}
#ps-hero h1{font-size:2rem;font-weight:900;color:#fff;margin-bottom:6px;letter-spacing:-.5px}
#ps-hero p{font-size:14px;color:#888;margin-bottom:20px}
.ps-hero-btn{display:inline-flex;align-items:center;gap:10px;background:#1a1a1a;border:1px solid #2a2a2a;color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;font-weight:700;cursor:pointer;transition:.2s}
.ps-hero-btn:hover{background:#2a2a2a;border-color:#444}
/* SECTION LABELS */
.ps-section{padding:0 0 0 28px;margin-top:28px}
.ps-section-header{display:flex;align-items:center;justify-content:space-between;padding-right:28px;margin-bottom:16px}
.ps-section-title{font-size:1.05rem;font-weight:800;color:#fff;letter-spacing:.2px}
/* YOUR GAMES GRID */
#your-games-row{display:flex;gap:14px;padding-right:28px;flex-wrap:wrap}
.your-game-card{width:128px;height:128px;border-radius:12px;background:#111;border:1px solid #1e1e1e;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:.2s;position:relative;overflow:hidden}
.your-game-card:hover{border-color:#444;transform:scale(1.04)}
.your-game-card .yg-thumb{width:100%;height:100%;object-fit:cover;border-radius:12px}
.your-game-card .yg-label{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.85));padding:8px 8px 8px;font-size:11px;font-weight:700;color:#fff;letter-spacing:.3px}
.add-card{background:#0a0a0a;border:1px dashed #222 !important;color:#444}
.add-card:hover{border-color:#444 !important;color:#888}
.add-card .plus{font-size:1.8rem;line-height:1;margin-bottom:6px}
.add-card .add-lbl{font-size:11px;font-weight:700;letter-spacing:1px}
/* SCROLL ROWS */
.ps-row-wrap{position:relative}
.ps-row{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 28px 12px;scroll-behavior:smooth}
.ps-row::-webkit-scrollbar{height:0}
.ps-card{flex-shrink:0;width:170px;border-radius:10px;overflow:hidden;cursor:pointer;position:relative;transition:.25s;scroll-snap-align:start;background:#111;border:1px solid #1a1a1a}
.ps-card:hover{transform:translateY(-4px) scale(1.02);border-color:#3a3a3a;box-shadow:0 12px 30px rgba(0,0,0,.8)}
.ps-card:active{transform:scale(.97)}
.ps-card-art{width:100%;height:110px;object-fit:cover;display:block;background:#111}
.ps-card-art-fallback{width:100%;height:110px;display:flex;align-items:center;justify-content:center;font-size:2.5rem}
.ps-card-info{padding:10px 10px 12px}
.ps-card-name{font-size:13px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.ps-card-sub{font-size:11px;color:#666;font-weight:600}
/* SCROLL ARROWS */
.row-arrow{position:absolute;top:50%;transform:translateY(-60%);width:32px;height:32px;background:rgba(0,0,0,.85);border:1px solid #333;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;color:#fff;font-size:14px;transition:.2s;opacity:0}
.ps-row-wrap:hover .row-arrow{opacity:1}
.row-arrow:hover{background:#1a1a1a;border-color:#555}
.arrow-l{left:4px}
.arrow-r{right:4px}
/* GAME LAUNCHER */
#launcher{display:none;position:fixed;inset:0;z-index:1000;flex-direction:column;background:#000}
#launcher-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;height:100%;background:#000}
#launcher-bar-wrap{width:280px}
.launcher-title{font-size:1.1rem;font-weight:800;color:#fff;letter-spacing:2px;margin-bottom:4px;text-align:center}
.launcher-sub{font-size:12px;color:#444;text-align:center;margin-bottom:24px;letter-spacing:1px}
#launcher-bar{width:100%;height:2px;background:#1a1a1a;border-radius:2px;overflow:hidden}
#launcher-fill{height:100%;width:0%;background:#fff;border-radius:2px;transition:width .05s linear}
#launcher-pct{text-align:center;margin-top:10px;font-size:11px;color:#444;font-weight:700;letter-spacing:0.5px}
#launcher-frame{flex:1;border:none;display:none}
#launcher-close{position:absolute;top:14px;right:14px;background:rgba(0,0,0,.8);border:1px solid #333;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;z-index:10;transition:.2s}
#launcher-close:hover{background:#222;border-color:#666}
/* SEARCH PANEL */
#search-panel{display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.95);backdrop-filter:blur(20px);flex-direction:column;padding:40px}
#search-panel.open{display:flex}
#search-wrap{display:flex;gap:10px;align-items:center;max-width:500px;width:100%;margin-bottom:30px}
#search-in{flex:1;background:#111;border:1px solid #222;color:#fff;padding:12px 18px;border-radius:10px;outline:none;font-size:16px;font-weight:600}
.search-x{background:#222;border:1px solid #333;color:#fff;padding:10px 18px;border-radius:10px;font-weight:700}
#search-results{display:flex;flex-wrap:wrap;gap:12px;overflow-y:auto}
/* ADD GAME MODAL */
#add-modal{display:none;position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.9);backdrop-filter:blur(10px);align-items:center;justify-content:center}
#add-modal.open{display:flex}
.add-box{background:#0d0d0d;border:1px solid #222;border-radius:14px;padding:28px;width:420px;max-width:90vw}
.add-box h3{font-size:.9rem;font-weight:800;letter-spacing:0.5px;margin-bottom:20px;color:#fff}
.add-box input{width:100%;background:#111;border:1px solid #1e1e1e;color:#fff;padding:10px 14px;border-radius:8px;outline:none;font-size:14px;margin-bottom:12px;transition:.2s}
.add-box input:focus{border-color:#444}
.add-actions{display:flex;gap:10px;margin-top:6px}
.btn-w{background:#fff;color:#000;border:none;padding:10px 22px;border-radius:8px;font-weight:800;font-size:13px;transition:.2s}
.btn-w:hover{background:#ddd}
.btn-d{background:#1a1a1a;color:#888;border:1px solid #222;padding:10px 22px;border-radius:8px;font-weight:800;font-size:13px}
.btn-d:hover{color:#fff;border-color:#444}
</style>
<div id="ps">
  <div id="ps-nav">
    <div class="ps-nav-link active" onclick="showTab('home',this)">Home</div>
    <div class="ps-nav-link" onclick="showTab('library',this)">Game Library</div>
    <div class="ps-nav-link" onclick="showTab('store',this)">Play Store</div>
    <div class="ps-nav-search" onclick="openSearch()"><span></span><span>Search</span></div>
    <div class="ps-nav-right">
      <div class="ps-clock" id="ps-clk">--:--</div>
    </div>
  </div>
  <div id="ps-body">
    <!-- HOME TAB -->
    <div id="tab-home">
      <div id="ps-hero">
        <h1>Upload Title</h1>
        <p>Add any game via URL — it saves to your library</p>
        <button class="ps-hero-btn" onclick="openAddModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Install Game
        </button>
      </div>
      <div class="ps-section">
        <div class="ps-section-header">
          <div class="ps-section-title">Your Games</div>
        </div>
        <div id="your-games-row">
          <div class="your-game-card add-card" onclick="openAddModal()">
            <div class="plus">+</div>
            <div class="add-lbl">ADD GAME</div>
          </div>
        </div>
      </div>
      <div class="ps-section">
        <div class="ps-section-header">
          <div class="ps-section-title">Try Something New!</div>
        </div>
        <div class="ps-row-wrap">
          <div class="row-arrow arrow-l" onclick="scrollRow('new',-1)">‹</div>
          <div class="ps-row" id="row-new"></div>
          <div class="row-arrow arrow-r" onclick="scrollRow('new',1)">›</div>
        </div>
      </div>
      <div class="ps-section">
        <div class="ps-section-header">
          <div class="ps-section-title">What We Recommend</div>
        </div>
        <div class="ps-row-wrap">
          <div class="row-arrow arrow-l" onclick="scrollRow('rec',-1)">‹</div>
          <div class="ps-row" id="row-rec"></div>
          <div class="row-arrow arrow-r" onclick="scrollRow('rec',1)">›</div>
        </div>
      </div>
    </div>
    <!-- LIBRARY TAB -->
    <div id="tab-library" style="display:none;padding:28px">
      <div style="font-size:1.1rem;font-weight:800;margin-bottom:20px">All Games</div>
      <div id="lib-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px"></div>
    </div>
    <!-- STORE TAB -->
    <div id="tab-store" style="display:none">
      <div class="ps-section">
        <div class="ps-section-header" style="padding-top:28px">
          <div class="ps-section-title">Browse All Games</div>
        </div>
        <div id="store-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;padding:0 28px 28px"></div>
      </div>
    </div>
  </div>
</div>
<!-- LAUNCHER -->
<div id="launcher">
  <div id="launcher-loading">
    <div class="launcher-title" id="lnch-name">LOADING</div>
    <div class="launcher-sub">Intellectual OS</div>
    <div id="launcher-bar-wrap">
      <div id="launcher-bar"><div id="launcher-fill"></div></div>
      <div id="launcher-pct">0%</div>
    </div>
  </div>
  <iframe id="launcher-frame" allow="autoplay;fullscreen;gamepad;clipboard-write" allowfullscreen></iframe>
  <div id="launcher-close" onclick="closeLauncher()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
</div>
<!-- SEARCH -->
<div id="search-panel">
  <div id="search-wrap">
    <input id="search-in" type="text" placeholder="Search games..." oninput="doSearch(this.value)" autofocus>
    <button class="search-x" onclick="closeSearch()"> Close</button>
  </div>
  <div id="search-results"></div>
</div>
<!-- ADD MODAL -->
<div id="add-modal">
  <div class="add-box">
    <h3>ADD GAME TO LIBRARY</h3>
    <input id="add-name" type="text" placeholder="Title">
    <input id="add-url" type="text" placeholder="URL">
    <input id="add-img" type="text" placeholder="Cover image URL (optional)">
    <div class="add-actions">
      <button class="btn-w" onclick="addGame()">ADD TO LIBRARY</button>
      <button class="btn-d" onclick="closeAddModal()">CANCEL</button>
    </div>
  </div>
</div>
<script>
var CATALOG=${JSON.stringify(CATALOG)};
var userGames=JSON.parse(localStorage.getItem('intel_user_games')||'[]');
var EMOJIS=['G','A','R','F','S','C','P','X','M','B'];

function rnd(arr,n){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a.slice(0,n||a.length);}

function cardHTML(g,sz){
  sz=sz||170;
  var img=g.img||g.thumb||'';
  var art=img?('<img class="ps-card-art" src="'+img+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" loading="lazy"><div class="ps-card-art-fallback" style="display:none">'+EMOJIS[Math.floor(Math.random()*EMOJIS.length)]+'</div>'):('<div class="ps-card-art-fallback">'+EMOJIS[Math.floor(Math.random()*EMOJIS.length)]+'</div>');
  return '<div class="ps-card" style="width:'+sz+'px" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+encodeURIComponent(g.name||'Game')+'\')">'+art+'<div class="ps-card-info"><div class="ps-card-name">'+(g.name||'Game')+'</div><div class="ps-card-sub">'+(g.sub||g.genre||'Game')+'</div></div></div>';
}

function buildRows(){
  var shuffled=rnd(CATALOG);
  document.getElementById('row-new').innerHTML=shuffled.slice(0,10).map(function(g){return cardHTML(g);}).join('');
  var rec=rnd(CATALOG.filter(function(g){return['mc','venge','shell','krunker','1v1'].indexOf(g.id)!==-1;})).concat(rnd(CATALOG.slice()).slice(0,6));
  document.getElementById('row-rec').innerHTML=rec.slice(0,10).map(function(g){return cardHTML(g);}).join('');
}

function buildYourGames(){
  var row=document.getElementById('your-games-row');
  var addCard='<div class="your-game-card add-card" onclick="openAddModal()"><div class="plus">+</div><div class="add-lbl">ADD GAME</div></div>';
  var cards=userGames.map(function(g,i){
    var img=g.img?'<img class="yg-thumb" src="'+g.img+'" onerror="this.style.display=\'none\'">':\
                  '<div style="font-size:2.5rem;margin-bottom:6px">'+EMOJIS[i%EMOJIS.length]+'</div>';
    return '<div class="your-game-card" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+encodeURIComponent(g.name||'Game')+'\')">'+img+'<div class="yg-label">'+(g.name||'Game')+'</div></div>';
  }).join('');
  row.innerHTML=addCard+cards;
}

function buildLib(){
  var all=CATALOG.concat(userGames);
  document.getElementById('lib-grid').innerHTML=all.map(function(g){return cardHTML(g,150);}).join('');
}

function buildStore(){
  document.getElementById('store-grid').innerHTML=CATALOG.map(function(g){return cardHTML(g,150);}).join('');
}

function showTab(name,el){
  ['home','library','store'].forEach(function(t){document.getElementById('tab-'+t).style.display='none';});
  document.querySelectorAll('.ps-nav-link').forEach(function(l){l.classList.remove('active');});
  document.getElementById('tab-'+name).style.display='block';
  el.classList.add('active');
  if(name==='library')buildLib();
  if(name==='store')buildStore();
}

function scrollRow(id,dir){
  var r=document.getElementById('row-'+id);
  r.scrollBy({left:dir*360,behavior:'smooth'});
}

function launch(urlEnc,nameEnc){
  var url=decodeURIComponent(urlEnc),name=decodeURIComponent(nameEnc);
  var l=document.getElementById('launcher');
  var ll=document.getElementById('launcher-loading');
  var lf=document.getElementById('launcher-frame');
  l.style.display='flex';
  ll.style.display='flex';
  lf.style.display='none';
  document.getElementById('lnch-name').textContent=name.toUpperCase();
  document.getElementById('launcher-fill').style.width='0%';
  document.getElementById('launcher-pct').textContent='0%';
  var p=0;
  var iv=setInterval(function(){
    p+=Math.random()*8+2;
    if(p>92)p=92;
    document.getElementById('launcher-fill').style.width=p+'%';
    document.getElementById('launcher-pct').textContent=Math.floor(p)+'%';
  },120);
  lf.onload=function(){
    clearInterval(iv);
    document.getElementById('launcher-fill').style.width='100%';
    document.getElementById('launcher-pct').textContent='100%';
    setTimeout(function(){ll.style.display='none';lf.style.display='block';},500);
  };
  lf.src=url;
}

function closeLauncher(){
  var l=document.getElementById('launcher');
  l.style.display='none';
  document.getElementById('launcher-frame').src='';
}

function openSearch(){document.getElementById('search-panel').classList.add('open');document.getElementById('search-in').value='';document.getElementById('search-results').innerHTML='';setTimeout(function(){document.getElementById('search-in').focus();},100);}
function closeSearch(){document.getElementById('search-panel').classList.remove('open');}
function doSearch(q){
  q=q.toLowerCase().trim();
  var all=CATALOG.concat(userGames);
  var res=q?all.filter(function(g){return(g.name||'').toLowerCase().includes(q)||(g.sub||'').toLowerCase().includes(q);}):all;
  document.getElementById('search-results').innerHTML=res.map(function(g){return cardHTML(g,160);}).join('');
}

function openAddModal(){document.getElementById('add-modal').classList.add('open');document.getElementById('add-name').focus();}
function closeAddModal(){document.getElementById('add-modal').classList.remove('open');['add-name','add-url','add-img'].forEach(function(i){document.getElementById(i).value='';});}
function addGame(){
  var n=document.getElementById('add-name').value.trim();
  var u=document.getElementById('add-url').value.trim();
  var img=document.getElementById('add-img').value.trim();
  if(!n||!u){alert('Game name and URL are required');return;}
  if(!u.startsWith('http'))u='https://'+u;
  userGames.push({name:n,url:u,img:img||'',sub:'My Library',custom:true});
  localStorage.setItem('intel_user_games',JSON.stringify(userGames));
  buildYourGames();
  closeAddModal();
}

// CLOCK
function tick(){var n=new Date(),h=n.getHours().toString().padStart(2,'0'),m=n.getMinutes().toString().padStart(2,'0');document.getElementById('ps-clk').textContent=h+':'+m;}
tick();setInterval(tick,30000);

// ESC key
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeLauncher();closeSearch();closeAddModal();}});
document.getElementById('add-modal').onclick=function(e){if(e.target===this)closeAddModal();};
document.getElementById('search-panel').onclick=function(e){if(e.target===this)closeSearch();};

buildRows();buildYourGames();
<\/script>`+E;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPOTIFY-STYLE MUSIC (IntellectSpy)
// ═══════════════════════════════════════════════════════════════════════════════
if(id==='term')return B+`
<style>
*{box-sizing:border-box}
#spt{height:100%;display:flex;flex-direction:column;background:#000}
/* LAYOUT */
#spt-main{flex:1;display:flex;overflow:hidden;min-height:0}
/* LEFT NAV */
#spt-nav{width:200px;background:#0a0a0a;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
#spt-nav::-webkit-scrollbar{width:2px}
#spt-nav::-webkit-scrollbar-thumb{background:#1a1a1a}
.spt-logo{padding:20px 16px 14px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #111;flex-shrink:0}
.spt-logo-icon{width:32px;height:32px;background:#1db954;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px}
.spt-logo-text{font-size:13px;font-weight:800;letter-spacing:1px;color:#fff}
.spt-logo-sub{font-size:9px;color:#444;letter-spacing:2px;margin-top:1px}
.spt-nav-section{padding:14px 12px 6px}
.spt-nav-label{font-size:10px;font-weight:700;letter-spacing:2px;color:#333;margin-bottom:8px}
.spt-nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;color:#888;transition:.15s;margin-bottom:2px}
.spt-nav-item:hover,.spt-nav-item.active{background:#111;color:#fff}
.spt-nav-item .ni{font-size:15px;width:20px;text-align:center}
.spt-playlist{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;color:#555;transition:.15s}
.spt-playlist:hover{color:#888}
.spt-playlist .pl-art{width:30px;height:30px;border-radius:4px;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
/* MAIN */
#spt-content{flex:1;overflow-y:auto;overflow-x:hidden;background:linear-gradient(to bottom,#111 0%,#0a0a0a 200px,#060606 100%)}
#spt-content::-webkit-scrollbar{width:3px}
#spt-content::-webkit-scrollbar-thumb{background:#1a1a1a}
#spt-top-bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;padding:14px 22px;gap:10px;background:rgba(10,10,10,.85);backdrop-filter:blur(10px)}
.spt-nav-btn{background:#000;border:1px solid #1a1a1a;color:#888;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;transition:.2s}
.spt-nav-btn:hover{color:#fff;border-color:#333}
#greeting-wrap{padding:22px 22px 6px}
#greeting{font-size:1.5rem;font-weight:900;color:#fff;margin-bottom:4px}
/* SECTION */
.spt-section{padding:18px 22px 8px}
.spt-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.spt-section-title{font-size:.95rem;font-weight:800;color:#fff}
.spt-section-all{font-size:11px;font-weight:700;color:#555;cursor:pointer;letter-spacing:.5px}
.spt-section-all:hover{color:#fff}
/* ALBUM GRID */
.spt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
.spt-card{background:#111;border-radius:8px;padding:12px;cursor:pointer;transition:.2s;border:1px solid transparent}
.spt-card:hover{background:#1a1a1a;border-color:#222}
.spt-card:hover .spt-play-btn{opacity:1;transform:translateY(0)}
.spt-card-art{width:100%;aspect-ratio:1;border-radius:6px;margin-bottom:10px;object-fit:cover;display:block;background:#1a1a1a;position:relative}
.spt-card-art-wrap{position:relative;overflow:visible}
.spt-play-btn{position:absolute;bottom:-6px;right:-2px;width:34px;height:34px;background:#1db954;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;opacity:0;transform:translateY(6px);transition:.2s;box-shadow:0 6px 20px rgba(0,0,0,.6)}
.spt-play-btn:hover{transform:scale(1.06)!important;opacity:1!important}
.spt-card-name{font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px}
.spt-card-sub{font-size:11px;color:#666}
/* QUICK ROW */
.spt-quick-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 22px 6px}
.spt-quick-card{display:flex;align-items:center;gap:10px;background:#111;border-radius:6px;overflow:hidden;cursor:pointer;transition:.2s;height:48px}
.spt-quick-card:hover{background:#1a1a1a}
.spt-quick-art{width:48px;height:48px;object-fit:cover;flex-shrink:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.spt-quick-name{font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:10px}
/* PLAYER BAR */
#spt-bar{height:80px;background:#0a0a0a;border-top:1px solid #111;display:flex;align-items:center;padding:0 18px;gap:14px;flex-shrink:0}
#bar-left{display:flex;align-items:center;gap:12px;width:230px;overflow:hidden;flex-shrink:0}
#bar-art{width:48px;height:48px;border-radius:6px;background:#1a1a1a;object-fit:cover;display:block;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
#bar-art img{width:100%;height:100%;object-fit:cover;border-radius:6px}
#bar-track{overflow:hidden}
#bar-track-name{font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#bar-track-artist{font-size:11px;color:#666;margin-top:2px}
#bar-heart{color:#555;font-size:16px;cursor:pointer;transition:.2s;flex-shrink:0}
#bar-heart:hover{color:#fff}
#bar-center{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px}
#bar-btns{display:flex;align-items:center;gap:20px}
.b-btn{background:none;border:none;color:#888;font-size:16px;transition:.2s;padding:4px}
.b-btn:hover{color:#fff}
#b-play{background:#fff;color:#000;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:none}
#b-play:hover{background:#ddd;transform:scale(1.05)}
#bar-prog{display:flex;align-items:center;gap:8px;width:100%;max-width:450px}
.b-time{font-size:10px;color:#555;font-weight:700;min-width:30px}
#prog-bg{flex:1;height:4px;background:#1e1e1e;border-radius:2px;cursor:pointer;position:relative}
#prog-fg{position:absolute;top:0;left:0;height:100%;background:#fff;border-radius:2px;width:0%;transition:width .5s linear}
#prog-bg:hover #prog-fg{background:#1db954}
#bar-right{width:160px;display:flex;justify-content:flex-end;align-items:center;gap:8px}
.v-btn{color:#666;font-size:13px}
#vol-bg{width:80px;height:4px;background:#1e1e1e;border-radius:2px;cursor:pointer;position:relative}
#vol-fg{height:100%;background:#fff;border-radius:2px;width:70%}
/* IFRAME OVERLAY */
#sc-overlay{display:none;position:fixed;bottom:80px;right:16px;width:320px;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;z-index:100;box-shadow:0 20px 50px rgba(0,0,0,.9)}
#sc-overlay.open{display:block}
#sc-overlay iframe{width:100%;height:180px;border:none}
#sc-ov-close{position:absolute;top:6px;right:8px;background:rgba(0,0,0,.8);color:#fff;border:none;width:22px;height:22px;border-radius:50%;font-size:12px;z-index:5}
#sc-ov-close:hover{background:#333}
#yt-embed{display:none;position:fixed;bottom:90px;left:50%;transform:translateX(-50%);width:min(500px,90vw);background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;z-index:100;box-shadow:0 20px 50px rgba(0,0,0,.9)}
#yt-embed.open{display:block}
#yt-embed iframe{width:100%;height:280px;border:none}
#yt-close{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.8);color:#fff;border:none;width:24px;height:24px;border-radius:50%;font-size:14px;z-index:5}
#yt-url-bar{padding:10px 12px;display:flex;gap:6px;border-top:1px solid #1a1a1a;background:#0d0d0d}
#yt-in{flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:6px 10px;border-radius:6px;outline:none;font-size:12px}
.yt-go{background:#ff0000;border:none;color:#fff;padding:6px 12px;border-radius:6px;font-weight:700;font-size:12px}
</style>
<div id="spt">
  <div id="spt-main">
    <div id="spt-nav">
      <div class="spt-logo">
        <div class="spt-logo-icon" style="background:#1a1a1a;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
        <div>
          <div class="spt-logo-text">IntellectSpy</div>
          <div class="spt-logo-sub">Music</div>
        </div>
      </div>
      <div class="spt-nav-section">
        <div class="spt-nav-label">MENU</div>
        <div class="spt-nav-item active" onclick="setActive(this);showView('home')"><span class="ni"></span>Home</div>
        <div class="spt-nav-item" onclick="setActive(this);showView('search')"><span class="ni"></span>Search</div>
      </div>
      <div class="spt-nav-section">
        <div class="spt-nav-label">YOUR LIBRARY</div>
        <div class="spt-nav-item" onclick="openYT()"><span class="ni"></span>YouTube Music</div>
        <div class="spt-nav-item" onclick="loadSC('https://soundcloud.com/charts/top')"><span class="ni"></span>SoundCloud</div>
      </div>
      <div class="spt-nav-section">
        <div class="spt-nav-label">QUICK PLAY</div>
        ${[['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap',''],['Lo-Fi','https://soundcloud.com/lofimusic',''],['Phonk','https://soundcloud.com/charts/top?genre=danceedm',''],['Pop Hits','https://soundcloud.com/charts/top?genre=pop',''],['R&B','https://soundcloud.com/charts/top?genre=rnb',''],['Indie','https://soundcloud.com/charts/top?genre=alternative',''],['Trap','https://soundcloud.com/charts/top?genre=trap',''],['Jazz','https://soundcloud.com/charts/top?genre=jazz','']].map(function(x){return'<div class="spt-playlist" onclick="loadSC(\''+x[1]+'\')"><div class="pl-art">'+x[2]+'</div><div style="overflow:hidden"><div style="font-size:12px;font-weight:700;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+x[0]+'</div></div></div>';}).join('')}
      </div>
    </div>
    <div id="spt-content">
      <!-- HOME VIEW -->
      <div id="view-home">
        <div id="spt-top-bar">
          <div class="spt-nav-btn">‹</div>
          <div class="spt-nav-btn">›</div>
        </div>
        <div id="greeting-wrap">
          <div id="greeting">Good Morning</div>
          <div style="font-size:12px;color:#555;margin-top:4px;font-weight:600">What do you want to listen to?</div>
        </div>
        <!-- QUICK ACCESS -->
        <div style="padding:14px 22px 0">
          <div class="spt-quick-row">
            ${[['Liked Songs','','https://soundcloud.com/charts/top'],['Hip-Hop Charts','','https://soundcloud.com/charts/top?genre=hiphoprap'],['Lo-Fi Beats','','https://soundcloud.com/lofimusic'],['Trending','','https://soundcloud.com/charts/top?genre=pop']].map(function(x){return'<div class="spt-quick-card" onclick="loadSC(\''+x[2]+'\')"><div class="spt-quick-art">'+x[1]+'</div><div class="spt-quick-name">'+x[0]+'</div></div>';}).join('')}
          </div>
        </div>
        <!-- TODAY'S HITS -->
        <div class="spt-section">
          <div class="spt-section-head"><div class="spt-section-title">Today\'s Hits</div><div class="spt-section-all" onclick="loadSC(\'https://soundcloud.com/charts/top\')">See all</div></div>
          <div class="spt-grid" id="grid-hits"></div>
        </div>
        <!-- INDIE CHILL -->
        <div class="spt-section">
          <div class="spt-section-head"><div class="spt-section-title">Chill Mix</div></div>
          <div class="spt-grid" id="grid-chill"></div>
        </div>
        <!-- YT MUSIC -->
        <div class="spt-section">
          <div class="spt-section-head"><div class="spt-section-title">YouTube Music Videos</div><div class="spt-section-all" onclick="openYT()">Open player</div></div>
          <div class="spt-grid" id="grid-yt"></div>
        </div>
      </div>
      <!-- SEARCH VIEW -->
      <div id="view-search" style="display:none;padding:22px">
        <div style="font-size:1rem;font-weight:800;margin-bottom:14px">Search SoundCloud</div>
        <div style="display:flex;gap:8px;margin-bottom:20px">
          <input id="spt-search-in" type="text" placeholder="Artists, songs, playlists..." style="flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:10px 14px;border-radius:8px;outline:none;font-size:14px">
          <button onclick="doSCSearch()" style="background:#fff;color:#000;border:none;padding:10px 18px;border-radius:8px;font-weight:800">GO</button>
        </div>
        <iframe id="sc-search-frame" src="" style="width:100%;height:360px;border:none;border-radius:8px;background:#111;display:none"></iframe>
        <div style="margin-top:16px">
          <div style="font-size:.85rem;font-weight:800;margin-bottom:12px">Browse Categories</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            ${[['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap','#ff5500'],['Pop','https://soundcloud.com/charts/top?genre=pop','#e91e8c'],['Lo-Fi','https://soundcloud.com/lofimusic','#5865f2'],['Phonk','https://soundcloud.com/charts/top?genre=danceedm','#111'],['R&B','https://soundcloud.com/charts/top?genre=rnb','#8b5cf6'],['Indie','https://soundcloud.com/charts/top?genre=alternative','#059669'],['Trap','https://soundcloud.com/charts/top?genre=trap','#dc2626'],['Jazz','https://soundcloud.com/charts/top?genre=jazz','#d97706']].map(function(x){return'<div onclick="loadSC(\''+x[1]+'\')" style="background:'+x[2]+';padding:12px 20px;border-radius:8px;font-size:13px;font-weight:800;cursor:pointer;transition:.2s;min-width:100px;text-align:center" onmouseover="this.style.opacity=\'.8\'" onmouseout="this.style.opacity=\'1\'">'+x[0]+'</div>';}).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- PLAYER BAR -->
  <div id="spt-bar">
    <div id="bar-left">
      <div id="bar-art" style="background:#111;border:1px solid #1a1a1a;border-radius:6px;width:48px;height:48px;flex-shrink:0;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="#333"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
      <div id="bar-track">
        <div id="bar-track-name">Not Playing</div>
        <div id="bar-track-artist">Select a track</div>
      </div>
      <div id="bar-heart"></div>
    </div>
    <div id="bar-center">
      <div id="bar-btns">
        <button class="b-btn" title="Shuffle">⇄</button>
        <button class="b-btn" title="Prev"></button>
        <button id="b-play" onclick="togglePlay()"></button>
        <button class="b-btn" title="Next"></button>
        <button class="b-btn" title="Loop">↻</button>
      </div>
      <div id="bar-prog">
        <span class="b-time" id="b-cur">0:00</span>
        <div id="prog-bg" onclick="seekProg(event)"><div id="prog-fg"></div></div>
        <span class="b-time" id="b-end">∞</span>
      </div>
    </div>
    <div id="bar-right">
      <span class="v-btn"></span>
      <div id="vol-bg" onclick="setVol(event)"><div id="vol-fg"></div></div>
    </div>
  </div>
</div>
<!-- SC OVERLAY -->
<div id="sc-overlay">
  <button id="sc-ov-close" onclick="document.getElementById('sc-overlay').classList.remove('open')"></button>
  <iframe id="sc-frame" src="" allow="autoplay" style="width:100%;height:180px;border:none"></iframe>
  <div id="sc-url-bar" style="padding:10px 12px;display:flex;gap:6px;border-top:1px solid #1a1a1a;background:#0d0d0d">
    <input id="sc-custom-in" type="text" placeholder="Custom SoundCloud URL..." style="flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:6px 10px;border-radius:6px;outline:none;font-size:12px">
    <button onclick="loadSC(document.getElementById('sc-custom-in').value)" style="background:#ff5500;border:none;color:#fff;padding:6px 12px;border-radius:6px;font-weight:700;font-size:12px">GO</button>
  </div>
</div>
<!-- YT EMBED -->
<div id="yt-embed">
  <button id="yt-close" onclick="document.getElementById('yt-embed').classList.remove('open')"></button>
  <iframe id="yt-frame" src="" allow="autoplay;fullscreen" allowfullscreen style="width:100%;height:280px;border:none"></iframe>
  <div id="yt-url-bar">
    <input id="yt-in" type="text" placeholder="YouTube URL or video ID...">
    <button class="yt-go" onclick="playYT()"></button>
  </div>
</div>
<script>
var isPlaying=false,progVal=0;

// GREETING
function setGreeting(){var h=new Date().getHours();var g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';document.getElementById('greeting').textContent=g;}
setGreeting();

function setActive(el){document.querySelectorAll('.spt-nav-item').forEach(function(i){i.classList.remove('active');});el.classList.add('active');}
function showView(v){document.querySelectorAll('[id^="view-"]').forEach(function(el){el.style.display='none';});document.getElementById('view-'+v).style.display='block';}

// ALBUM CARDS DATA
var HITS=[
  {name:'Today\'s Top Hits',artist:'Various Artists',art:'',url:'https://soundcloud.com/charts/top?genre=pop'},
  {name:'Hip-Hop 2024',artist:'Charts',art:'',url:'https://soundcloud.com/charts/top?genre=hiphoprap'},
  {name:'Phonk Drive',artist:'Phonk Charts',art:'',url:'https://soundcloud.com/charts/top?genre=danceedm'},
  {name:'R&B Vibes',artist:'R&B Charts',art:'',url:'https://soundcloud.com/charts/top?genre=rnb'},
  {name:'Country Hits',artist:'Country Charts',art:'',url:'https://soundcloud.com/charts/top?genre=country'},
  {name:'Electronic',artist:'EDM Charts',art:'',url:'https://soundcloud.com/charts/top?genre=electronic'},
  {name:'Rock Classics',artist:'Rock Charts',art:'',url:'https://soundcloud.com/charts/top?genre=rock'},
  {name:'Jazz & Soul',artist:'Jazz Charts',art:'',url:'https://soundcloud.com/charts/top?genre=jazz'},
];
var CHILL=[
  {name:'Lo-Fi Study',artist:'Lo-Fi Beats',art:'',url:'https://soundcloud.com/lofimusic'},
  {name:'Indie Chill',artist:'Indie Mix',art:'',url:'https://soundcloud.com/charts/top?genre=alternative'},
  {name:'Rainy Day',artist:'Ambient',art:'',url:'https://soundcloud.com/charts/top?genre=ambient'},
  {name:'Sleep Sounds',artist:'Relaxing',art:'',url:'https://soundcloud.com/charts/top?genre=ambient'},
  {name:'Coffee Shop',artist:'Background Music',art:'',url:'https://soundcloud.com/lofimusic'},
  {name:'Piano Vibes',artist:'Instrumental',art:'',url:'https://soundcloud.com/charts/top?genre=classical'},
];
var YT_VIDS=[
  {name:'Lo-Fi Radio',artist:'Chillhop Music',art:'',vid:'5qap5aO4i9A'},
  {name:'Phonk Mix 2024',artist:'Phonk',art:'',vid:'Lmc3Q5pOFW0'},
  {name:'Late Night Vibes',artist:'R&B Mix',art:'',vid:'lTRiuFIWV54'},
  {name:'Hip-Hop Classics',artist:'Various',art:'',vid:'f02mOEt11OQ'},
  {name:'Trap Nation Mix',artist:'Trap Nation',art:'',vid:'BEljvkEHhvA'},
  {name:'Chill Beats 2024',artist:'Chill',art:'',vid:'5mSFGN0VLuU'},
];

function makeCard(d){
  var isYT=!!d.vid;
  var fn=isYT?'playYTVid(\''+d.vid+'\',\''+d.name+'\',\''+d.artist+'\')':'loadSC(\''+d.url+'\',\''+d.name+'\',\''+d.artist+'\')';
  return '<div class="spt-card" onclick="'+fn+'">'+
    '<div class="spt-card-art-wrap"><div style="width:100%;aspect-ratio:1;background:#1a1a1a;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin-bottom:10px">'+d.art+'</div><div class="spt-play-btn" onclick="event.stopPropagation();'+fn+'"></div></div>'+
    '<div class="spt-card-name">'+d.name+'</div><div class="spt-card-sub">'+d.artist+'</div></div>';
}

document.getElementById('grid-hits').innerHTML=HITS.map(makeCard).join('');
document.getElementById('grid-chill').innerHTML=CHILL.map(makeCard).join('');
document.getElementById('grid-yt').innerHTML=YT_VIDS.map(makeCard).join('');

function loadSC(url,name,artist){
  document.getElementById('sc-frame').src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%23ff5500&auto_play=true&show_comments=false&hide_related=true';
  document.getElementById('sc-overlay').classList.add('open');
  updateBar(name||'SoundCloud',artist||'Browse');
  isPlaying=true;updatePlayBtn();
}

function playYTVid(vid,name,artist){
  document.getElementById('yt-frame').src='https://www.youtube.com/embed/'+vid+'?autoplay=1&rel=0';
  document.getElementById('yt-embed').classList.add('open');
  updateBar(name||'YouTube Music',artist||'YouTube');
  isPlaying=true;updatePlayBtn();
}

function openYT(){
  document.getElementById('yt-embed').classList.add('open');
  document.getElementById('yt-in').focus();
}

function playYT(){
  var s=document.getElementById('yt-in').value.trim();
  var m=s.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  var vid=m?m[1]:(s.length===11?s:null);
  if(!vid)return;
  document.getElementById('yt-frame').src='https://www.youtube.com/embed/'+vid+'?autoplay=1&rel=0';
  updateBar('YouTube Music','Playing');isPlaying=true;updatePlayBtn();
}

function doSCSearch(){
  var q=document.getElementById('spt-search-in').value.trim();
  if(!q)return;
  var url='https://soundcloud.com/search?q='+encodeURIComponent(q);
  var f=document.getElementById('sc-search-frame');
  f.src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%23ff5500&auto_play=false&show_comments=false';
  f.style.display='block';
}

function updateBar(name,artist){
  document.getElementById('bar-track-name').textContent=name||'Playing';
  document.getElementById('bar-track-artist').textContent=artist||'IntellectSpy';
}

function togglePlay(){isPlaying=!isPlaying;updatePlayBtn();}
function updatePlayBtn(){document.getElementById('b-play').textContent=isPlaying?'':'';}
function seekProg(e){var r=document.getElementById('prog-bg').getBoundingClientRect();progVal=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));document.getElementById('prog-fg').style.width=progVal+'%';}
function setVol(e){var r=document.getElementById('vol-bg').getBoundingClientRect();document.getElementById('vol-fg').style.width=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+'%';}

setInterval(function(){if(isPlaying&&progVal<100)progVal+=0.05;document.getElementById('prog-fg').style.width=progVal+'%';},1000);
document.getElementById('bar-heart').onclick=function(){this.textContent=this.textContent===''?'':'';this.style.color=this.textContent===''?'#1db954':'#555';};
<\/script>`+E;

// ═══════════════════════════════════════════════════════════════════════════════
// NETFLIX-STYLE HUB
// ═══════════════════════════════════════════════════════════════════════════════
if(id==='cine')return B+`
<style>
#hub{height:100%;display:flex;flex-direction:column;background:#000;overflow:hidden}
#hub-nav{position:absolute;top:0;left:0;right:0;z-index:20;padding:14px 28px;display:flex;align-items:center;gap:24px;background:linear-gradient(to bottom,rgba(0,0,0,.85),transparent)}
#hub-nav .brand{font-family:'Space Grotesk',sans-serif;font-size:.9rem;letter-spacing:0.5px;color:#fff;flex-shrink:0}
.nav-link{font-size:13px;font-weight:700;color:rgba(255,255,255,.7);cursor:pointer;transition:.2s;letter-spacing:.3px;white-space:nowrap}
.nav-link:hover,.nav-link.active{color:#fff}
#hub-search-in{margin-left:auto;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);color:#fff;padding:6px 14px;border-radius:6px;outline:none;font-size:13px;width:180px;transition:.3s}
#hub-search-in:focus{border-color:#fff;background:rgba(0,0,0,.9);width:240px}
#hero{position:relative;height:52vh;flex-shrink:0;overflow:hidden}
#hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,#0d1a3a 0%,#000 70%)}
#hero-frame{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}
#hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,.85) 0%,rgba(0,0,0,.2) 60%,transparent 100%)}
#hero-content{position:absolute;bottom:40px;left:36px;max-width:44%}
#hero-title{font-size:clamp(1.2rem,2.5vw,2rem);font-weight:900;letter-spacing:.5px;margin-bottom:8px;text-shadow:0 2px 20px rgba(0,0,0,.8)}
#hero-desc{font-size:13px;color:rgba(255,255,255,.7);line-height:1.6;margin-bottom:18px}
.hbtn{padding:10px 24px;border:none;border-radius:6px;font-weight:800;font-size:13px;letter-spacing:.5px;cursor:pointer;transition:.2s}
.hbtn-p{background:#fff;color:#000}
.hbtn-p:hover{background:#ccc}
.hbtn-i{background:rgba(80,80,80,.7);color:#fff;border:1px solid rgba(255,255,255,.2)}
.hbtn-i:hover{background:rgba(100,100,100,.9)}
#rows-wrap{flex:1;overflow-y:auto;padding:0 0 30px}
#rows-wrap::-webkit-scrollbar{width:3px}
#rows-wrap::-webkit-scrollbar-thumb{background:#1a1a1a}
.row-s{margin-top:26px}
.row-label{font-size:.85rem;font-weight:800;color:#fff;padding:0 28px;margin-bottom:12px;display:flex;align-items:center;gap:12px}
.row-label span{font-size:.7rem;color:#4af;cursor:pointer;font-weight:600}
.row-label span:hover{text-decoration:underline}
.card-row{display:flex;gap:8px;padding:4px 28px 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth}
.card-row::-webkit-scrollbar{display:none}
.nf-card{flex-shrink:0;width:175px;border-radius:6px;overflow:hidden;cursor:pointer;position:relative;transition:.25s cubic-bezier(.2,.8,.2,1);scroll-snap-align:start;background:#111}
.nf-card:hover{transform:scale(1.06);z-index:5;box-shadow:0 8px 30px rgba(0,0,0,.8)}
.nf-card:hover .nf-label{opacity:1}
.nf-art{width:100%;height:108px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;background:#111}
.nf-label{position:absolute;bottom:0;left:0;right:0;padding:8px 10px;background:linear-gradient(transparent,rgba(0,0,0,.95));font-size:11px;font-weight:700;opacity:0;transition:.2s;letter-spacing:.3px}
#url-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);backdrop-filter:blur(10px);z-index:100;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:30px;text-align:center}
#url-modal.open{display:flex}
#url-modal h3{font-size:.9rem;letter-spacing:0.5px;font-weight:800}
#url-modal p{color:#555;font-size:13px;max-width:340px;line-height:1.6}
#url-in{background:#111;border:1px solid #333;color:#fff;padding:10px 16px;border-radius:8px;outline:none;font-size:14px;width:100%;max-width:400px;margin:4px 0}
</style>
<div id="hub">
  <div id="hero">
    <div id="hero-bg"></div>
    <iframe id="hero-frame" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe>
    <div id="hero-overlay"></div>
    <div id="hub-nav">
      <div class="brand">Intellectual OS</div>
      ${['Home','Anime','Action','Music','Gaming'].map(function(x,i){return'<span class="nav-link'+(i===0?' active':'')+'" onclick="showCat(\''+x.toLowerCase()+'\',this)">'+x+'</span>';}).join('')}
      <input id="hub-search-in" type="text" placeholder=" Search..." onkeydown="if(event.key===\'Enter\')doHubSearch(this.value)">
    </div>
    <div id="hero-content">
      <div id="hero-title">WELCOME TO THE HUB</div>
      <div id="hero-desc">Paste any YouTube URL to watch inline. Browse categories below.</div>
      <div style="display:flex;gap:10px;margin-top:2px">
        <button class="hbtn hbtn-p" onclick="openUrlModal()"> Paste URL</button>
        <button class="hbtn hbtn-i" onclick="document.getElementById(\'rows-wrap\').scrollTop+=300">↓ Browse</button>
      </div>
    </div>
  </div>
  <div id="rows-wrap"><div id="all-rows"></div></div>
</div>
<div id="url-modal">
  <h3>PLAY VIDEO</h3>
  <p>Paste a YouTube URL or 11-char video ID</p>
  <input id="url-in" type="text" placeholder="https://youtube.com/watch?v=...">
  <div style="display:flex;gap:10px">
    <button style="background:#fff;color:#000;border:none;padding:10px 22px;border-radius:6px;font-weight:800" onclick="playFromUrl()"> Play</button>
    <button style="background:#222;color:#888;border:1px solid #333;padding:10px 22px;border-radius:6px;font-weight:800" onclick="closeModal()">Cancel</button>
  </div>
</div>
<script>
var CATS={
  home:{label:'Trending',items:[{t:'Lo-Fi Beats',e:'',id:'5qap5aO4i9A'},{t:'Phonk Mix',e:'',id:'Lmc3Q5pOFW0'},{t:'Anime AMV',e:'',id:'8MJ7HMFbSCg'},{t:'Gaming Clips',e:'',id:'g6gGPnv4Wgo'},{t:'Minecraft LP',e:'',id:'gKNJKce1p8M'},{t:'Chill Radio',e:'',id:'lTRiuFIWV54'},{t:'4K Nature',e:'',id:'BHACKCNDMW8'},{t:'City Nights',e:'',id:'f02mOEt11OQ'}]},
  anime:{label:'Anime',items:[{t:'AMV Epic',e:'',id:'8MJ7HMFbSCg'},{t:'AMV Phonk',e:'',id:'Lmc3Q5pOFW0'},{t:'JJK Mix',e:'',id:'BEljvkEHhvA'},{t:'One Piece',e:'',id:'aaIJb8bRy78'},{t:'Naruto AMV',e:'',id:'gKNJKce1p8M'},{t:'Demon Slayer',e:'',id:'5mSFGN0VLuU'},{t:'Bleach AMV',e:'',id:'f02mOEt11OQ'},{t:'Attack on Titan',e:'',id:'BHACKCNDMW8'}]},
  action:{label:'Action & Gaming',items:[{t:'FPS Highlights',e:'',id:'g6gGPnv4Wgo'},{t:'Minecraft',e:'',id:'gKNJKce1p8M'},{t:'Warzone',e:'',id:'f02mOEt11OQ'},{t:'Among Us',e:'',id:'lTRiuFIWV54'},{t:'Speedrun',e:'',id:'5qap5aO4i9A'},{t:'Battle Royale',e:'',id:'BEljvkEHhvA'},{t:'Retro',e:'',id:'BHACKCNDMW8'},{t:'Pro Clips',e:'',id:'Lmc3Q5pOFW0'}]},
  music:{label:'Music',items:[{t:'Lo-Fi Radio',e:'',id:'5qap5aO4i9A'},{t:'Phonk Drive',e:'',id:'Lmc3Q5pOFW0'},{t:'Chill Beats',e:'',id:'lTRiuFIWV54'},{t:'Hip-Hop',e:'',id:'f02mOEt11OQ'},{t:'Trap Mix',e:'',id:'BEljvkEHhvA'},{t:'R&B Vibes',e:'',id:'5mSFGN0VLuU'},{t:'Pop Hits',e:'',id:'BHACKCNDMW8'},{t:'EDM Mix',e:'',id:'gKNJKce1p8M'}]},
  gaming:{label:'Gaming',items:[{t:'Minecraft',e:'',id:'gKNJKce1p8M'},{t:'FPS Clips',e:'',id:'g6gGPnv4Wgo'},{t:'Retro',e:'',id:'BHACKCNDMW8'},{t:'Speedrun',e:'',id:'5qap5aO4i9A'},{t:'Warzone',e:'',id:'f02mOEt11OQ'},{t:'Roblox',e:'',id:'lTRiuFIWV54'},{t:'Pro Gamer',e:'',id:'BEljvkEHhvA'},{t:'Funny Fails',e:'',id:'Lmc3Q5pOFW0'}]}
};

function buildRows(filter){
  var html='';
  var keys=filter?[filter]:Object.keys(CATS);
  keys.forEach(function(k){
    var c=CATS[k];
    html+='<div class="row-s"><div class="row-label">'+c.label+'</div><div class="card-row">'+
      c.items.map(function(x){return'<div class="nf-card" onclick="playVid(\''+x.id+'\',\''+x.t+'\')"><div class="nf-art">'+x.e+'</div><div class="nf-label">'+x.t+'</div></div>';}).join('')+'</div></div>';
  });
  document.getElementById('all-rows').innerHTML=html;
}

function showCat(k,el){
  document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active');});
  el.classList.add('active');
  buildRows(k==='home'?null:k);
}

function playVid(id,title){
  document.getElementById('hero-bg').style.display='none';
  var f=document.getElementById('hero-frame');f.style.display='block';
  f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1';
  document.getElementById('hero-title').textContent=title;
  document.getElementById('hero-desc').textContent='Playing now in hub.';
  closeModal();
}

function getVid(s){s=(s||'').trim();var m=s.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);return m?m[1]:(s.length===11?s:null);}
function playFromUrl(){var v=getVid(document.getElementById('url-in').value);if(!v){alert('Paste a valid YouTube URL');return;}playVid(v,'Custom Video');}
function openUrlModal(){document.getElementById('url-modal').classList.add('open');document.getElementById('url-in').focus();}
function closeModal(){document.getElementById('url-modal').classList.remove('open');}
function doHubSearch(q){if(!q)return;buildRows();document.getElementById('all-rows').insertAdjacentHTML('afterbegin','<div style="padding:28px 28px 0;color:#555;font-size:13px">YouTube search requires opening YouTube. Tip: Copy a URL from YouTube and paste it with the Play button.</div>');}
document.getElementById('url-modal').onclick=function(e){if(e.target===this)closeModal();};
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});
buildRows();
<\/script>`+E;

// ═══════════════════════════════════════════════════════════════════════════════
// DISCORD - INVITE EMBED
// ═══════════════════════════════════════════════════════════════════════════════
if(id==='discord')return B+`
<style>
body{background:#1e1f22;display:flex;flex-direction:column;height:100vh;overflow:hidden}
#dc-bar{padding:10px 16px;background:#111827;border-bottom:1px solid #111;display:flex;align-items:center;gap:10px;flex-shrink:0}
.dc-logo{width:24px;height:24px}
.dc-title{font-size:.8rem;font-weight:700;letter-spacing:2px;color:#fff;font-family:'Space Grotesk',sans-serif}
#dc-frame{flex:1;border:none;width:100%;background:#1e1f22}
#dc-fallback{display:none;flex:1;align-items:center;justify-content:center;flex-direction:column;gap:20px;background:#1e1f22;text-align:center;padding:30px}
.dc-invite-card{background:#2b2d31;border-radius:8px;padding:20px 24px;max-width:340px;width:100%;text-align:left}
.dc-server-row{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.dc-icon{width:50px;height:50px;border-radius:12px;background:#5865f2;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.dc-server-name{font-size:1rem;font-weight:800;color:#fff}
.dc-stats{font-size:12px;color:#b5bac1;margin-top:3px}
.dc-stats span{margin-right:14px}
.dc-stats .dot-g{color:#23a55a}
.dc-stats .dot-g::before{content:' '}
.dc-stats .dot-gray::before{content:' ';color:#80848e}
.accept-btn{width:100%;background:#5865f2;border:none;color:#fff;padding:10px;border-radius:4px;font-size:14px;font-weight:700;cursor:pointer;transition:.2s;letter-spacing:.5px}
.accept-btn:hover{background:#4752c4}
.scan-box{background:#2b2d31;border-radius:8px;padding:16px;max-width:340px;width:100%;display:flex;flex-direction:column;align-items:center;gap:10px}
.qr-placeholder{width:120px;height:120px;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#000;font-weight:700;text-align:center;padding:8px}
.scan-label{font-size:11px;color:#b5bac1;letter-spacing:2px;text-transform:uppercase;font-weight:700}
</style>
<div style="display:flex;flex-direction:column;height:100vh">
  <div id="dc-bar">
    <img class="dc-logo" src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png">
    <div class="dc-title">Discord</div>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
      <input id="dc-proxy-in" type="text" placeholder="Proxy URL to load Discord app..." style="background:#111;border:1px solid #222;color:#aaa;padding:5px 12px;border-radius:6px;outline:none;font-size:12px;width:220px">
      <button onclick="loadDcApp()" style="background:#5865f2;border:none;color:#fff;padding:5px 14px;border-radius:6px;font-weight:700;font-size:12px;cursor:pointer">LOAD APP</button>
    </div>
  </div>
  <iframe id="dc-frame" src="about:blank" allow="autoplay;fullscreen;clipboard-write;camera;microphone" style="flex:1;border:none"></iframe>
  <div id="dc-fallback">
    <p style="color:#b5bac1;font-size:13px;margin-bottom:6px">YOU HAVE BEEN INVITED TO JOIN</p>
    <div class="dc-invite-card">
      <div class="dc-server-row">
        <div class="dc-icon"></div>
        <div>
          <div class="dc-server-name">Intellectual OS</div>
          <div class="dc-stats">
            <span class="dot-g">Online</span>
            <span class="dot-gray">Members</span>
          </div>
        </div>
      </div>
      <button class="accept-btn" onclick="openInvite()">Accept Invitation</button>
    </div>
    <div class="scan-box" style="margin-top:10px">
      <div class="qr-placeholder">SCAN TO JOIN<br>discord.gg/<br>Sduv8uDjxF</div>
      <div class="scan-label">Scan to join Intellectual OS</div>
    </div>
  </div>
</div>
<script>
var INVITE='https://discord.gg/Sduv8uDjxF';
document.getElementById('dc-proxy-in').value=localStorage.getItem('intel_proxy_url')||'';

function loadDcApp(){
  var proxy=document.getElementById('dc-proxy-in').value.trim();
  var f=document.getElementById('dc-frame');
  document.getElementById('dc-fallback').style.display='none';
  f.style.flex='1';
  if(proxy){
    f.src=proxy.replace(/\/$/,'')+'/service/'+btoa('https://discord.com/app');
  } else {
    f.src='https://discord.com/app';
    f.onerror=function(){showFallback();};
    setTimeout(function(){
      try{if(!f.contentDocument||f.contentDocument.body.innerHTML==='')showFallback();}catch(e){showFallback();}
    },4000);
  }
}

function showFallback(){
  document.getElementById('dc-frame').style.display='none';
  document.getElementById('dc-fallback').style.display='flex';
}

function openInvite(){
  // Load invite in iframe
  var proxy=document.getElementById('dc-proxy-in').value.trim();
  var f=document.getElementById('dc-frame');
  document.getElementById('dc-fallback').style.display='none';
  f.style.display='block';f.style.flex='1';
  f.src=proxy?proxy.replace(/\/$/,'')+'/service/'+btoa(INVITE):INVITE;
}

// Try loading with proxy if available
if(localStorage.getItem('intel_proxy_url')){
  loadDcApp();
} else {
  // Show invite card by default
  document.getElementById('dc-frame').style.display='none';
  document.getElementById('dc-fallback').style.display='flex';
}
<\/script>`+E;

// ═══════════════════════════════════════════════════════════════════════════════
// PROXY BROWSER
// ═══════════════════════════════════════════════════════════════════════════════
if(id==='web')return B+`
<style>
body{background:#000;overflow:hidden}
#br{height:100%;display:flex;flex-direction:column}
#br-top{padding:10px 12px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;gap:7px;align-items:center;flex-shrink:0}
.nav-btn{background:#111;border:1px solid #1a1a1a;color:#888;width:28px;height:28px;border-radius:50%;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:.2s}
.nav-btn:hover{color:#fff;border-color:#333}
#br-url{flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:7px 14px;border-radius:20px;outline:none;font-size:13px;font-weight:600;transition:.3s}
#br-url:focus{border-color:#333;background:#141414}
#br-go{background:#fff;color:#000;border:none;padding:7px 18px;border-radius:20px;font-weight:800;font-size:13px;cursor:pointer;transition:.2s;flex-shrink:0}
#br-go:hover{background:#ddd}
#proxy-bar{padding:7px 14px;background:#060606;border-bottom:1px solid #0d0d0d;display:flex;align-items:center;gap:8px;flex-shrink:0}
#p-dot{width:7px;height:7px;border-radius:50%;background:#333;flex-shrink:0;transition:.3s}
#p-dot.on{background:#4a4;box-shadow:0 0 6px #4a4}
#p-label{font-size:10px;color:#333;letter-spacing:2px;flex-shrink:0;font-weight:700}
#p-sel{background:transparent;border:none;color:#555;font-size:11px;outline:none;font-family:Inter;font-weight:600;flex-shrink:0;cursor:pointer;padding:0 6px}
#p-custom{flex:1;background:transparent;border:none;color:#444;font-size:11px;outline:none;min-width:0}
.setup-link{font-size:10px;color:#333;cursor:pointer;flex-shrink:0;letter-spacing:1px;transition:.2s;font-weight:700}
.setup-link:hover{color:#888}
#setup-guide{display:none;padding:14px 18px;background:#080808;border-bottom:1px solid #0d0d0d;flex-shrink:0}
#br-body{flex:1;position:relative;overflow:hidden}
#no-p{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px;text-align:center}
#main-f{position:absolute;inset:0;border:none;width:100%;height:100%;display:none}
</style>
<div id="br">
  <div id="br-top">
    <div class="nav-btn" onclick="bk()">←</div>
    <div class="nav-btn" onclick="fw()">→</div>
    <div class="nav-btn" onclick="rl()">↺</div>
    <input id="br-url" type="text" placeholder="URL or search Google..." onkeydown="if(event.key==='Enter')go()">
    <button id="br-go" onclick="go()">GO</button>
  </div>
  <div id="proxy-bar">
    <div id="p-dot"></div>
    <span id="p-label">PROXY</span>
    <select id="p-sel" onchange="pickProxy()">
      <option value="">Custom...</option>
      <option value="__uv__">Ultraviolet (self-hosted)</option>
    </select>
    <input id="p-custom" type="text" placeholder="Paste proxy or Ultraviolet URL here..." oninput="saveProxy(this.value)">
    <span class="setup-link" onclick="toggleSetup()">SETUP </span>
  </div>
  <div id="setup-guide">
    <div style="font-size:.65rem;font-family:'Space Grotesk',sans-serif;letter-spacing:0.5px;color:#fff;margin-bottom:10px">PROXY SETUP (FREE · 5 MIN)</div>
    ${[['1','Fork: github.com/titaniumnetwork-dev/Ultraviolet-App'],['2','Click "Deploy to Render" in the README'],['3','Sign up for Render free tier'],['4','Wait ~2 min, copy your .onrender.com URL'],['5','Paste that URL into the proxy box above']].map(function(x){return'<div style="display:flex;gap:8px;margin-bottom:6px;align-items:flex-start"><div style="background:#1a1a1a;color:#fff;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">'+x[0]+'</div><div style="font-size:12px;color:#555;line-height:1.5">'+x[1]+'</div></div>';}).join('')}
    <button onclick="toggleSetup()" style="margin-top:8px;background:#111;border:1px solid #222;color:#666;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer">CLOSE</button>
  </div>
  <div id="br-body">
    <div id="no-p">
      <div style="font-size:2.5rem"></div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:.75rem;letter-spacing:0.5px;color:#1a1a1a">NO PROXY</div>
      <div style="color:#2a2a2a;font-size:13px;max-width:280px;line-height:1.8">Configure a proxy above to bypass school filters. Click <strong style="color:#555">SETUP</strong> for step-by-step instructions.</div>
    </div>
    <iframe id="main-f" allow="autoplay;fullscreen;clipboard-write;camera;microphone" allowfullscreen></iframe>
  </div>
</div>
<script>
var proxy=localStorage.getItem('intel_proxy_url')||'';
document.getElementById('p-custom').value=proxy;
document.getElementById('p-dot').classList.toggle('on',!!proxy);

function saveProxy(v){proxy=v;localStorage.setItem('intel_proxy_url',v);document.getElementById('p-dot').classList.toggle('on',!!v);}
function pickProxy(){var v=document.getElementById('p-sel').value;if(v&&v!=='__uv__')saveProxy(v);else document.getElementById('p-custom').focus();}
function go(){
  var raw=document.getElementById('br-url').value.trim();if(!raw)return;
  var url=raw.startsWith('http')?raw:(raw.includes('.')&&!raw.includes(' ')?'https://'+raw:'https://www.google.com/search?q='+encodeURIComponent(raw));
  var f=document.getElementById('main-f'),ph=document.getElementById('no-p');
  ph.style.display='none';f.style.display='block';
  f.src=proxy?proxy.replace(/\/$/,'')+'/service/'+btoa(url):url;
}
function bk(){try{document.getElementById('main-f').contentWindow.history.back();}catch(e){}}
function fw(){try{document.getElementById('main-f').contentWindow.history.forward();}catch(e){}}
function rl(){var f=document.getElementById('main-f');if(f.src&&f.src!=='about:blank')f.src=f.src;}
function toggleSetup(){var g=document.getElementById('setup-guide');g.style.display=g.style.display==='none'||!g.style.display?'block':'none';}
<\/script>`+E;

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
if(id==='settings')return B+`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
body{overflow-y:auto;height:auto;min-height:100vh;background:#000}
.cfg{padding:24px;max-width:560px;margin:0 auto}
.cfg-h{font-family:'Space Grotesk',sans-serif;letter-spacing:0.5px;font-size:.75rem;color:#fff;border-bottom:1px solid #111;padding-bottom:10px;margin-bottom:14px;margin-top:28px;display:flex;align-items:center;gap:8px}
.cfg-h:first-child{margin-top:0}
.card{background:#0d0d0d;border:1px solid #111;padding:12px 14px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:10px;transition:.2s}
.ci{display:flex;gap:10px;align-items:center}
.ci-icon{color:#2a2a2a;width:16px;text-align:center;font-size:.9rem}
.ct strong{display:block;font-weight:700;font-size:13px;color:#fff}
.ct small{display:block;color:#333;font-size:11px;margin-top:1px}
.tog{position:relative;display:inline-block;width:38px;height:20px;flex-shrink:0}
.tog input{opacity:0;width:0;height:0}
.ts{position:absolute;cursor:pointer;inset:0;background:#1a1a1a;border-radius:34px;transition:.3s;border:1px solid #222}
.ts:before{position:absolute;content:"";height:13px;width:13px;left:3px;bottom:3px;background:#444;transition:.3s;border-radius:50%}
input:checked+.ts{background:#fff;border-color:#fff}
input:checked+.ts:before{transform:translateX(18px);background:#000}
select.csel{background:#111;color:#fff;border:1px solid #1a1a1a;padding:6px 8px;border-radius:6px;outline:none;font-size:12px;font-family:Inter}
input.csm{width:36px;height:26px;background:#111;border:1px solid #1a1a1a;color:#fff;text-align:center;font-size:.95rem;font-weight:bold;outline:none;border-radius:4px}
.color-grid{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.csw{width:26px;height:26px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:.2s}
.csw:hover,.csw.act{border-color:#fff;transform:scale(1.15)}
#cc{width:36px;height:26px;border:1px solid #1a1a1a;border-radius:4px;padding:1px;background:#111;cursor:pointer}
</style>
<div class="cfg">
  <div class="cfg-h"><i class="fas fa-microchip"></i> PERFORMANCE</div>
  ${[['optBg','film','Optimized Background','Disables animated backgrounds'],['shortBoot','bolt','Fast Boot','Skip boot animation'],['idleLock','lock','Idle Lock','Lock after 3 min'],['redirectConfirm','shield-alt','Redirect Confirm','Block GoGuardian']].map(function(x){return'<div class="card"><div class="ci"><i class="fas fa-'+x[1]+' ci-icon"></i><div class="ct"><strong>'+x[2]+'</strong><small>'+x[3]+'</small></div></div><label class="tog"><input type="checkbox" id="c-'+x[0]+'" onchange="window.parent.updateSysSetting(\''+x[0]+'\',this.checked);syncTog(this)"><span class="ts"></span></label></div>';}).join('')}
  <div class="cfg-h"><i class="fas fa-mask"></i> STEALTH</div>
  <div class="card"><div class="ci"><i class="fas fa-mask ci-icon"></i><div class="ct"><strong>Tab Cloak</strong><small>Disguise this tab</small></div></div><select class="csel" id="clk" onchange="window.parent.updateCloak(this.value)"><option value="none">None (Intellectual OS)</option><option value="google">Google</option><option value="drive">Google Drive</option><option value="canvas">Canvas</option><option value="classroom">Google Classroom</option></select></div>
  <div class="card"><div class="ci"><i class="fas fa-exclamation-triangle ci-icon"></i><div class="ct"><strong>Panic Key</strong><small>Instant redirect to Google</small></div></div><input class="csm" type="text" id="pk" maxlength="1" onkeyup="window.parent.updateSysSetting('panicKey',this.value)"></div>
  <div class="cfg-h"><i class="fas fa-palette"></i> CUSTOMIZATION</div>
  <div class="card" style="flex-direction:column;align-items:flex-start;gap:10px">
    <div class="ci"><i class="fas fa-fill-drip ci-icon"></i><div class="ct"><strong>Accent Color</strong><small>OS glow & highlight color</small></div></div>
    <div class="color-grid">
      ${['#fff','#4f8ef7','#f74f4f','#4ff78e','#f7c14f','#c14ff7','#f74fc1','#4ff7f7','#ff6b35','#1db954'].map(function(c){return'<div class="csw" style="background:'+c+'" onclick="pickCol(\''+c+'\')"></div>';}).join('')}
      <input type="color" id="cc" value="#ffffff" onchange="pickCol(this.value)">
    </div>
  </div>
  <div class="card" style="flex-direction:column;align-items:flex-start;gap:10px">
    <div class="ci"><i class="fas fa-image ci-icon"></i><div class="ct"><strong>Custom Wallpaper</strong><small>Add any image/video URL</small></div></div>
    <div style="display:flex;gap:6px;width:100%;flex-wrap:wrap">
      <input id="wn" type="text" placeholder="Name..." style="width:110px;background:#111;border:1px solid #1a1a1a;color:#fff;padding:6px 10px;border-radius:6px;outline:none;font-size:12px">
      <input id="wu" type="text" placeholder="Image/video URL..." style="flex:1;background:#111;border:1px solid #1a1a1a;color:#fff;padding:6px 10px;border-radius:6px;outline:none;font-size:12px;min-width:140px">
      <button onclick="addWP()" style="background:#fff;color:#000;border:none;padding:6px 14px;border-radius:6px;font-weight:800;font-size:12px;cursor:pointer">ADD</button>
    </div>
  </div>
</div>
<script>
(function(){
  var p=window.parent.sysConfig;
  ['optBg','shortBoot','idleLock','redirectConfirm'].forEach(function(k){var cb=document.getElementById('c-'+k);if(cb){cb.checked=!!p[k];syncTog(cb);}});
  var cl=document.getElementById('clk');if(cl)cl.value=p.cloak||'none';
  var pk=document.getElementById('pk');if(pk)pk.value=p.panicKey||'';
  var ac=p.accentColor||'#fff';
  document.querySelectorAll('.csw').forEach(function(s){if(s.style.background===ac||s.style.backgroundColor===ac)s.classList.add('act');});
})();
function syncTog(cb){var t=cb.nextElementSibling;t.style.background=cb.checked?'#fff':'#1a1a1a';t.style.borderColor=cb.checked?'#fff':'#222';t.querySelector(':before');}
function pickCol(c){document.querySelectorAll('.csw').forEach(function(s){s.classList.remove('act');});var m=document.querySelector('.csw[style*="'+c+'"]');if(m)m.classList.add('act');window.parent.applyAccentColor(c);}
function addWP(){var n=document.getElementById('wn').value.trim(),u=document.getElementById('wu').value.trim();if(!n||!u){alert('Enter name and URL');return;}window.parent.addCustomWallpaper(n,u);document.getElementById('wn').value='';document.getElementById('wu').value='';}
<\/script>`+E;

// AI
if(id==='ciniai')return B+`
<div style="height:100%;display:flex;flex-direction:column">
  <div style="padding:10px 16px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:10px;flex-shrink:0;flex-wrap:wrap">
    <div style="font-family:'Space Grotesk',sans-serif;font-size:.75rem;letter-spacing:0.5px">AI Assistant</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${[['ChatGPT','gpt','https://chat.openai.com','#10a37f'],['Claude','cld','https://claude.ai','#d97706'],['Gemini','gem','https://gemini.google.com','#4285f4'],['Perplexity','perp','https://perplexity.ai','#1fb8cd'],['Grok','grk','https://grok.x.ai','#fff']].map(function(x){return'<button id="ai-'+x[1]+'" onclick="loadAi(\''+x[2]+'\',\''+x[1]+'\',\''+x[3]+'\')" style="background:#111;border:1px solid '+x[3]+'33;color:#888;padding:5px 14px;border-radius:16px;font-size:12px;font-weight:700;transition:.2s;cursor:pointer" onmouseover="this.style.color=\'#fff\'" onmouseout="if(cur!==\''+x[1]+'\')this.style.color=\'#888\'">'+x[0]+'</button>';}).join('')}
    </div>
    <div style="margin-left:auto;display:flex;gap:6px">
      <input id="aip" type="text" placeholder="Proxy URL..." style="background:#111;border:1px solid #1a1a1a;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px;width:190px">
      <button onclick="reloadAi()" style="background:#1a1a1a;border:1px solid #222;color:#666;padding:5px 10px;border-radius:6px;font-size:12px;cursor:pointer">↺</button>
    </div>
  </div>
  <iframe id="aif" src="" style="flex:1;border:none;background:#111" allow="autoplay;fullscreen;clipboard-write"></iframe>
</div>
<script>
var cur='',curUrl='';
document.getElementById('aip').value=localStorage.getItem('intel_proxy_url')||'';
function loadAi(url,key,color){
  cur=key;curUrl=url;
  document.querySelectorAll('[id^="ai-"]').forEach(function(b){if(b.tagName==='BUTTON'){b.style.background='#111';b.style.color='#888';}});
  var btn=document.getElementById('ai-'+key);if(btn){btn.style.background=(color||'#fff')+'22';btn.style.color='#fff';}
  var p=document.getElementById('aip').value.trim();
  document.getElementById('aif').src=p?p.replace(/\/$/,'')+'/service/'+btoa(url):url;
}
function reloadAi(){if(curUrl)loadAi(curUrl,cur);}
loadAi('https://chat.openai.com','gpt','#10a37f');
<\/script>`+E;

if(id==='roblox')return B+'<div style="height:100%;display:flex;flex-direction:column"><div style="padding:10px 16px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:10px;flex-shrink:0"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9KvNyFWMg_bjo_q_1IVLKFWbfCeonn2qDow&s" style="width:22px;border-radius:5px"><div style="font-family:'Space Grotesk',sans-serif;font-size:.75rem;letter-spacing:0.5px">Roblox</div><input id="rbp" type="text" placeholder="Proxy URL..." style="margin-left:auto;background:#111;border:1px solid #1a1a1a;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px;width:200px"><button onclick="loadRb()" style="background:#e2231a;border:none;color:#fff;padding:5px 14px;border-radius:6px;font-weight:700;font-size:12px;margin-left:6px;cursor:pointer">LAUNCH</button></div><iframe id="rbf" src="" style="flex:1;border:none" allow="autoplay;fullscreen;clipboard-write"></iframe></div><script>document.getElementById("rbp").value=localStorage.getItem("intel_proxy_url")||"";function loadRb(){var p=document.getElementById("rbp").value.trim(),f=document.getElementById("rbf");f.src=p?p.replace(/\/$/,"")+"/service/"+btoa("https://www.roblox.com"):"https://www.roblox.com";}if(localStorage.getItem("intel_proxy_url"))loadRb();<\/script>'+E;

if(id==='Geforce')return B+'<div style="height:100%;display:flex;flex-direction:column"><div style="padding:10px 16px;background:#0a0a0a;border-bottom:1px solid #111;display:flex;align-items:center;gap:10px;flex-shrink:0"><div style="font-family:'Space Grotesk',sans-serif;font-size:.75rem;letter-spacing:0.5px">GeForce Now</div><input id="gfp" type="text" placeholder="Proxy URL..." style="margin-left:auto;background:#111;border:1px solid #1a1a1a;color:#aaa;padding:5px 10px;border-radius:6px;outline:none;font-size:12px;width:200px"><button onclick="loadGf()" style="background:#76b900;border:none;color:#000;padding:5px 14px;border-radius:6px;font-weight:700;font-size:12px;margin-left:6px;cursor:pointer">LAUNCH</button></div><iframe id="gff" src="" style="flex:1;border:none" allow="autoplay;fullscreen;gamepad"></iframe></div><script>document.getElementById("gfp").value=localStorage.getItem("intel_proxy_url")||"";function loadGf(){var p=document.getElementById("gfp").value.trim(),f=document.getElementById("gff");f.src=p?p.replace(/\/$/,"")+"/service/"+btoa("https://play.geforcenow.com"):"https://play.geforcenow.com";}if(localStorage.getItem("intel_proxy_url"))loadGf();<\/script>'+E;

return B+'<div style="height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px"><div style="font-size:2.5rem"></div><p style="font-family:'Space Grotesk',sans-serif;letter-spacing:0.5px;color:#1a1a1a;font-size:.8rem">APP NOT CONFIGURED</p></div>'+E;
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
