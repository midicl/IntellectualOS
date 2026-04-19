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

document.addEventListener("DOMContentLoaded",function(){
    var _bi=document.getElementById('bg-img');if(_bi)_bi.style.display='none';
    var _li=document.getElementById('lock-img');if(_li)_li.style.display='none';applyCloak();document.getElementById('boot-layer').style.display='block';renderUI();initWallpapers();setupAppContextMenu();loadDesktop();updateSidebarData();if(sysConfig.accentColor)applyAccentColor(sysConfig.accentColor);});

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
#nav{height:46px;background:#000;border-bottom:1px solid #111;display:flex;align-items:center;padding:0 20px;gap:2px;flex-shrink:0}
.nt{padding:0 16px;height:100%;display:flex;align-items:center;font-size:13px;font-weight:600;color:#666;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;user-select:none;transition:color .15s}
.nt:hover{color:#ccc}
.nt.on{color:#fff;border-bottom-color:#fff}
#nav-r{margin-left:auto;display:flex;align-items:center;gap:16px}
#clk{font-size:12px;font-weight:600;color:#333}
#nav-search-btn{display:flex;align-items:center;gap:6px;color:#555;cursor:pointer;font-size:13px;transition:.15s}
#nav-search-btn:hover{color:#aaa}

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
#ll-load{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
#ll-name{font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;color:#fff}
#ll-sub{font-size:11px;color:#333;letter-spacing:1px}
#ll-track{width:220px;height:1px;background:#1a1a1a;border-radius:1px;overflow:hidden;margin-top:4px}
#ll-fill{height:100%;width:0%;background:#fff;border-radius:1px;transition:width .06s}
#ll-pct{font-size:11px;color:#2a2a2a;font-weight:600}
#ll-frame{flex:1;border:none;display:none;width:100%;height:100%}
#ll-x{position:absolute;top:14px;right:14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:#888;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;z-index:10;transition:.15s}
#ll-x:hover{background:rgba(255,255,255,.14);color:#fff}

/* SEARCH OVERLAY */
#srch{display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.96);backdrop-filter:blur(16px);flex-direction:column;padding:36px 24px}
#srch.open{display:flex}
#srch-row{display:flex;gap:8px;max-width:480px;margin-bottom:24px}
#srch-in{flex:1;background:#111;border:1px solid #1e1e1e;color:#fff;padding:10px 14px;border-radius:8px;outline:none;font-size:14px;font-weight:500}
#srch-in:focus{border-color:#2a2a2a}
#srch-in::placeholder{color:#2a2a2a}
#srch-x{background:#1a1a1a;border:1px solid #1e1e1e;color:#888;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600}
#srch-x:hover{color:#fff}
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
  <div id="ll-x" onclick="closeLaunch()">&#215;</div>
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

// Load GN-Math zones
fetch(ZONES_URL + '?t=' + Date.now())
  .then(function(r){ return r.json(); })
  .then(function(data){
    zones = data.filter(function(z){ return z.url && !z.url.startsWith('http'); });
    document.getElementById('loading').style.display = 'none';
    buildHome();
  })
  .catch(function(){
    document.getElementById('loading').textContent = 'Could not load games. Check your connection.';
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
  document.getElementById('rn').innerHTML = sh.slice(0,16).map(function(z){ return card(z); }).join('');
  document.getElementById('rr').innerHTML = sh.slice(5,21).map(function(z){ return card(z); }).join('');
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
    document.getElementById('lib-grid').innerHTML = saved.map(function(g){
      return '<div class="gc" style="width:145px" onclick="launch(\''+encodeURIComponent(g.url)+'\',\''+g.name.replace(/'/g,'&#39;')+'\')">' +
        '<img class="gc-art" src="'+g.img+'" onerror="this.style.display=\'none\'"><div class="gc-info"><div class="gc-name">'+g.name+'</div></div></div>';
    }).join('') + zones.slice(0,50).map(function(z){ return card(z,145); }).join('');
  }
  if (name === 'store') {
    document.getElementById('store-grid').innerHTML = zones.map(function(z){ return card(z,145); }).join('');
  }
}

function scr(id,d){ document.getElementById(id).scrollBy({left:d*340,behavior:'smooth'}); }

function launch(urlEnc, name) {
  var url = decodeURIComponent(urlEnc);
  if (!url || url === '#') return;
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
     MUSIC — SPOTIFY STYLE
  ===================================================================== */
  if (id === 'term') { return H + `
<style>
body{background:#121212;overflow:hidden}
#sp{height:100vh;display:flex;flex-direction:column}
#body{flex:1;display:flex;overflow:hidden;min-height:0}
#sb{width:232px;background:#000;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
#sb::-webkit-scrollbar{width:0}
.sb-logo{padding:18px 14px 10px;font-family:'Space Grotesk',sans-serif;font-size:.9rem;font-weight:700}
.sbi{display:flex;align-items:center;gap:14px;padding:9px 14px;border-radius:4px;cursor:pointer;font-size:14px;font-weight:600;color:#b3b3b3;transition:.1s;margin:0 8px 2px}
.sbi:hover{color:#fff}.sbi.on{color:#fff;background:rgba(255,255,255,.07)}
.sbi svg{flex-shrink:0}
#sb-lib{flex:1;background:#121212;border-radius:8px;margin:8px;padding:8px}
#sb-lib-hd{display:flex;align-items:center;justify-content:space-between;padding:4px 4px 12px;cursor:pointer}
#sb-lib-hd span{font-size:14px;font-weight:700;color:#b3b3b3;display:flex;align-items:center;gap:12px}
#sb-lib-hd span:hover{color:#fff}
.sb-plus{color:#b3b3b3;font-size:20px;cursor:pointer;transition:.1s}.sb-plus:hover{color:#fff}
.pli{display:flex;align-items:center;gap:10px;padding:7px 4px;border-radius:4px;cursor:pointer;transition:.1s}
.pli:hover{background:rgba(255,255,255,.07)}
.pla{width:40px;height:40px;border-radius:4px;flex-shrink:0;object-fit:cover}
.pl-n{font-size:14px;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-m{font-size:12px;color:#b3b3b3;margin-top:2px}
#main{flex:1;display:flex;flex-direction:column;overflow:hidden;background:linear-gradient(to bottom,#1a1a2e 0%,#121212 340px)}
#topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;flex-shrink:0}
#tb-nav{display:flex;gap:8px}
.tb-btn{background:rgba(0,0,0,.5);border:none;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px}
#user-btn{background:rgba(0,0,0,.5);border-radius:14px;padding:4px 10px 4px 4px;display:flex;align-items:center;gap:8px;cursor:pointer;border:none;color:#fff;font-size:13px;font-weight:700}
.uav{width:24px;height:24px;background:#535353;border-radius:50%;display:flex;align-items:center;justify-content:center}
#content{flex:1;overflow-y:auto;padding:0 22px 24px}
#content::-webkit-scrollbar{width:4px}
#content::-webkit-scrollbar-thumb{background:#2a2a2a}
#greeting{font-size:1.8rem;font-weight:900;color:#fff;margin-bottom:20px}
.al-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:16px;margin-bottom:8px}
.al-card{background:#181818;border-radius:6px;padding:14px;cursor:pointer;transition:.2s;position:relative}
.al-card:hover{background:#282828}
.al-card:hover .al-play{opacity:1;transform:translateY(0)}
.al-art{width:100%;aspect-ratio:1;background:#282828;border-radius:4px;margin-bottom:12px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.al-art img{width:100%;height:100%;object-fit:cover}
.al-art-fb{font-size:10px;font-weight:600;color:#2a2a2a;padding:8px;text-align:center}
.al-play{position:absolute;bottom:6px;right:6px;width:38px;height:38px;background:#1db954;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(8px);transition:.2s;box-shadow:0 8px 24px rgba(0,0,0,.6)}
.al-play:hover{transform:scale(1.06) translateY(0)!important;background:#1ed760}
.al-play svg{margin-left:2px}
.al-title{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.al-artist{font-size:12px;color:#b3b3b3}
.sec-hd{display:flex;align-items:baseline;justify-content:space-between;margin:26px 0 14px}
.sec-t{font-size:1.4rem;font-weight:900;color:#fff}
.sec-m{font-size:12px;font-weight:700;color:#b3b3b3;cursor:pointer;letter-spacing:.5px}
.sec-m:hover{color:#fff;text-decoration:underline}
#player{height:88px;background:#181818;border-top:1px solid #282828;display:flex;align-items:center;padding:0 16px;gap:14px;flex-shrink:0}
#pl-l{display:flex;align-items:center;gap:12px;width:220px;overflow:hidden;flex-shrink:0}
#pl-art{width:52px;height:52px;background:#282828;border-radius:4px;flex-shrink:0;object-fit:cover;border:1px solid #1e1e1e;display:flex;align-items:center;justify-content:center}
#pl-tr{overflow:hidden}
#pl-ti{font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#pl-ar{font-size:11px;color:#b3b3b3;margin-top:2px}
#pl-hrt{color:#b3b3b3;font-size:16px;cursor:pointer;flex-shrink:0;padding:4px;transition:.1s}
#pl-hrt:hover{color:#fff}
#pl-c{flex:1;display:flex;flex-direction:column;align-items:center;gap:7px}
#pl-btns{display:flex;align-items:center;gap:18px}
.pb{background:none;border:none;color:#b3b3b3;transition:.1s;padding:4px;font-size:16px}.pb:hover{color:#fff}
#pb-play{width:32px;height:32px;background:#fff;border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:.1s}
#pb-play:hover{transform:scale(1.06);background:#f0f0f0}
#pb-play svg{margin-left:2px}
#pl-prog{display:flex;align-items:center;gap:8px;width:100%;max-width:480px}
.pt{font-size:11px;font-weight:600;color:#b3b3b3;min-width:35px}
#pb-bar{flex:1;height:4px;background:#535353;border-radius:2px;cursor:pointer;position:relative}
#pb-fill{position:absolute;top:0;left:0;height:100%;background:#b3b3b3;border-radius:2px;width:0%}
#pb-bar:hover #pb-fill{background:#1db954}
#pl-r{display:flex;align-items:center;gap:8px;width:180px;justify-content:flex-end}
#vb{width:90px;height:4px;background:#535353;border-radius:2px;cursor:pointer;position:relative}
#vf{height:100%;background:#b3b3b3;border-radius:2px;width:65%}
#sc-ov{display:none;position:fixed;bottom:98px;right:16px;width:315px;background:#181818;border:1px solid #282828;border-radius:8px;overflow:hidden;z-index:100;box-shadow:0 16px 40px rgba(0,0,0,.8)}
#sc-ov.open{display:block}
#sc-ov-x{position:absolute;top:7px;right:8px;background:rgba(0,0,0,.7);border:1px solid #333;color:#888;width:22px;height:22px;border-radius:50%;font-size:12px;z-index:5;display:flex;align-items:center;justify-content:center;cursor:pointer}
#sc-ov-x:hover{color:#fff}
#sc-if{width:100%;height:168px;border:none}
#sc-bar{padding:8px 10px;display:flex;gap:6px;background:#121212;border-top:1px solid #282828}
#sc-in{flex:1;background:#282828;border:none;color:#fff;padding:6px 10px;border-radius:4px;outline:none;font-size:12px}
#sc-in::placeholder{color:#535353}
.sc-go{background:#ff4500;border:none;color:#fff;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:700}
</style>
<div id="sp">
  <div id="body">
    <div id="sb">
      <div class="sb-logo">IntellectSpy</div>
      <div style="padding:0 8px 4px">
        <div class="sbi on" onclick="setNav(this,'home')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>Home
        </div>
        <div class="sbi" onclick="setNav(this,'search')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>Search
        </div>
      </div>
      <div id="sb-lib">
        <div id="sb-lib-hd">
          <span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5 11.12 10 12.5 10c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/></svg>
            Your Library
          </span>
          <span class="sb-plus" onclick="document.getElementById('sc-ov').classList.add('open')">+</span>
        </div>
        <div class="pli" onclick="loadSC('https://soundcloud.com/charts/top','Liked Songs')">
          <div class="pla" style="background:linear-gradient(135deg,#450af5,#8e8ee5);display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div><div class="pl-n">Liked Songs</div><div class="pl-m">Playlist</div></div>
        </div>
        ${[['Hip-Hop','https://soundcloud.com/charts/top?genre=hiphoprap','#2d46b9'],['Lo-Fi','https://soundcloud.com/lofimusic','#1db954'],['Phonk','https://soundcloud.com/charts/top?genre=danceedm','#e91429'],['Pop','https://soundcloud.com/charts/top?genre=pop','#8d67ab'],['R&B','https://soundcloud.com/charts/top?genre=rnb','#e8115b'],['Indie','https://soundcloud.com/charts/top?genre=alternative','#148a08'],['Trap','https://soundcloud.com/charts/top?genre=trap','#56282d'],['Jazz','https://soundcloud.com/charts/top?genre=jazz','#0d3b2e']].map(function(x,i){return'<div class="pli" onclick="loadSC(\''+x[1]+'\',\''+x[0]+'\')"><div class="pla" style="background:'+x[2]+';flex-shrink:0"></div><div><div class="pl-n">'+x[0]+'</div><div class="pl-m">Playlist</div></div></div>';}).join('')}
      </div>
    </div>
    <div id="main">
      <div id="topbar">
        <div id="tb-nav"><button class="tb-btn">&#8249;</button><button class="tb-btn">&#8250;</button></div>
        <button id="user-btn"><div class="uav"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>User</button>
      </div>
      <div id="content">
        <div id="v-home">
          <div id="greeting"></div>
          <div class="sec-hd"><div class="sec-t">Today's Hits</div><div class="sec-m" onclick="loadSC('https://soundcloud.com/charts/top','Charts')">See all</div></div>
          <div class="al-grid" id="g-hits"></div>
          <div class="sec-hd"><div class="sec-t">Chill</div></div>
          <div class="al-grid" id="g-chill"></div>
          <div class="sec-hd"><div class="sec-t">YouTube Music</div><div class="sec-m" onclick="openYT()">Open</div></div>
          <div class="al-grid" id="g-yt"></div>
        </div>
        <div id="v-search" style="display:none;padding-top:4px">
          <div style="font-size:1.4rem;font-weight:900;margin-bottom:16px">Search</div>
          <div style="display:flex;gap:8px;margin-bottom:18px">
            <input id="sc-q" type="text" placeholder="What do you want to listen to?" style="flex:1;background:#282828;border:none;color:#fff;padding:11px 14px;border-radius:5px;outline:none;font-size:14px">
            <button onclick="doSCSearch()" style="background:#1db954;border:none;color:#000;padding:11px 18px;border-radius:5px;font-weight:700;font-size:13px;cursor:pointer">Go</button>
          </div>
          <div style="font-size:14px;font-weight:700;margin-bottom:12px">Genres</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            ${[['Hip-Hop','#ba5d07','https://soundcloud.com/charts/top?genre=hiphoprap'],['Pop','#7d2247','https://soundcloud.com/charts/top?genre=pop'],['Lo-Fi','#1e3264','https://soundcloud.com/lofimusic'],['Phonk','#503750','https://soundcloud.com/charts/top?genre=danceedm'],['R&B','#1e3264','https://soundcloud.com/charts/top?genre=rnb'],['Indie','#1f4f23','https://soundcloud.com/charts/top?genre=alternative'],['Trap','#56282d','https://soundcloud.com/charts/top?genre=trap'],['Jazz','#0d3b2e','https://soundcloud.com/charts/top?genre=jazz']].map(function(x){return'<div onclick="loadSC(\''+x[2]+'\',\''+x[0]+'\')" style="background:'+x[1]+';padding:16px 20px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;min-width:120px;text-align:center;transition:.15s" onmouseover="this.style.opacity=\'.8\'" onmouseout="this.style.opacity=\'1\'">'+x[0]+'</div>';}).join('')}
          </div>
          <iframe id="sc-sf" src="" style="width:100%;height:280px;border:none;border-radius:6px;background:#282828;display:none;margin-top:18px"></iframe>
        </div>
      </div>
    </div>
  </div>
  <div id="player">
    <div id="pl-l">
      <div id="pl-art"><svg width="16" height="16" viewBox="0 0 24 24" fill="#535353"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>
      <div id="pl-tr"><div id="pl-ti">Not playing</div><div id="pl-ar">Select a track</div></div>
      <div id="pl-hrt">&#9825;</div>
    </div>
    <div id="pl-c">
      <div id="pl-btns">
        <button class="pb"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="4" y1="4" x2="9" y2="9"/></svg></button>
        <button class="pb"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg></button>
        <button id="pb-play" onclick="togglePlay()"><svg id="ic-p" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><svg id="ic-pa" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
        <button class="pb"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
        <button class="pb"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button>
      </div>
      <div id="pl-prog">
        <span class="pt">0:00</span>
        <div id="pb-bar" onclick="seek(event)"><div id="pb-fill"></div></div>
        <span class="pt">0:00</span>
      </div>
    </div>
    <div id="pl-r">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#b3b3b3"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
      <div id="vb" onclick="setVol(event)"><div id="vf"></div></div>
    </div>
  </div>
</div>
<div id="sc-ov">
  <div id="sc-ov-x" onclick="document.getElementById('sc-ov').classList.remove('open')">&#215;</div>
  <iframe id="sc-if" src="" allow="autoplay"></iframe>
  <div id="sc-bar"><input id="sc-in" type="text" placeholder="SoundCloud URL..."><button class="sc-go" onclick="loadSC(document.getElementById('sc-in').value,'Custom')">Go</button></div>
</div>
<script>
var playing=false,prog=0;
(function(){var h=new Date().getHours();document.getElementById('greeting').textContent=h<12?'Good Morning':h<17?'Good Afternoon':'Good Evening';})();
var HITS=[{t:"Today's Hits",a:"Pop Charts",url:'https://soundcloud.com/charts/top?genre=pop'},{t:"Hip-Hop",a:"Charts",url:'https://soundcloud.com/charts/top?genre=hiphoprap'},{t:"Phonk",a:"Charts",url:'https://soundcloud.com/charts/top?genre=danceedm'},{t:"R&B",a:"Charts",url:'https://soundcloud.com/charts/top?genre=rnb'},{t:"Electronic",a:"Charts",url:'https://soundcloud.com/charts/top?genre=electronic'},{t:"Rock",a:"Charts",url:'https://soundcloud.com/charts/top?genre=rock'}];
var CHILL=[{t:"Lo-Fi Beats",a:"Lo-Fi Music",url:'https://soundcloud.com/lofimusic'},{t:"Indie Chill",a:"Alternative",url:'https://soundcloud.com/charts/top?genre=alternative'},{t:"Jazz",a:"Charts",url:'https://soundcloud.com/charts/top?genre=jazz'},{t:"Classical",a:"Charts",url:'https://soundcloud.com/charts/top?genre=classical'},{t:"Ambient",a:"Charts",url:'https://soundcloud.com/charts/top?genre=ambient'},{t:"Country",a:"Charts",url:'https://soundcloud.com/charts/top?genre=country'}];
var YT=[{t:"Lo-Fi Radio",a:"Chillhop",vid:'5qap5aO4i9A'},{t:"Phonk Mix",a:"Phonk",vid:'Lmc3Q5pOFW0'},{t:"Hip-Hop Mix",a:"Various",vid:'f02mOEt11OQ'},{t:"Chill Mix",a:"Various",vid:'lTRiuFIWV54'},{t:"R&B Vibes",a:"Various",vid:'BEljvkEHhvA'},{t:"Study Beats",a:"Lo-Fi",vid:'5mSFGN0VLuU'}];
function mkCard(d,isSC){
  var fn=isSC?("loadSC('"+d.url+"','"+d.t+"','"+d.a+"')"):"playYT('"+d.vid+"','"+d.t+"','"+d.a+"')";
  return'<div class="al-card" onclick="'+fn+'"><div class="al-art"><div class="al-art-fb">'+d.t+'</div><div class="al-play" onclick="event.stopPropagation();'+fn+'"><svg width="13" height="13" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z"/></svg></div></div><div class="al-title">'+d.t+'</div><div class="al-artist">'+d.a+'</div></div>';
}
function buildGrids(){
  document.getElementById('g-hits').innerHTML=HITS.map(function(d){return mkCard(d,true);}).join('');
  document.getElementById('g-chill').innerHTML=CHILL.map(function(d){return mkCard(d,true);}).join('');
  document.getElementById('g-yt').innerHTML=YT.map(function(d){return mkCard(d,false);}).join('');
  // Try to load real album art from iTunes
  HITS.concat(CHILL).forEach(function(d,i){loadArt(d,i);});
}
function loadArt(d,i){
  var grid=i<HITS.length?'g-hits':'g-chill';
  var cards=document.getElementById(grid).querySelectorAll('.al-art');
  var el=cards[i<HITS.length?i:i-HITS.length];
  if(!el)return;
  var q=d.a+' '+d.t;
  fetch('https://itunes.apple.com/search?term='+encodeURIComponent(q)+'&media=music&limit=1')
    .then(function(r){return r.json();})
    .then(function(j){
      if(j.results&&j.results.length>0){
        var img=document.createElement('img');
        img.src=j.results[0].artworkUrl100.replace('100x100bb','300x300bb');
        img.style.cssText='width:100%;height:100%;object-fit:cover;position:absolute;inset:0';
        el.insertBefore(img,el.firstChild);
      }
    }).catch(function(){});
}
function loadSC(url,title,artist){
  if(!url)return;
  document.getElementById('sc-if').src='https://w.soundcloud.com/player/?url='+encodeURIComponent(url)+'&color=%231db954&auto_play=true&show_comments=false&hide_related=true';
  document.getElementById('sc-ov').classList.add('open');
  document.getElementById('pl-ti').textContent=title||'SoundCloud';
  document.getElementById('pl-ar').textContent=artist||'SoundCloud';
  playing=true;updPlay();
}
var ytEl=null;
function openYT(){
  if(!ytEl){ytEl=document.createElement('div');ytEl.style.cssText='position:fixed;bottom:98px;left:50%;transform:translateX(-50%);width:min(480px,90vw);background:#181818;border:1px solid #282828;border-radius:8px;overflow:hidden;z-index:100;box-shadow:0 16px 40px rgba(0,0,0,.8)';ytEl.innerHTML='<div style="position:relative"><iframe id="yt-f2" src="" allow="autoplay;fullscreen" allowfullscreen style="width:100%;height:270px;border:none"></iframe><div onclick="this.parentElement.parentElement.remove();ytEl=null" style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);border:1px solid #333;color:#aaa;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px">&#215;</div></div><div style="padding:9px 11px;display:flex;gap:6px;background:#121212;border-top:1px solid #282828"><input id="yt-i2" type="text" placeholder="YouTube URL..." style="flex:1;background:#282828;border:none;color:#fff;padding:6px 10px;border-radius:4px;outline:none;font-size:12px"><button onclick="playYTInput()" style="background:#cc0000;border:none;color:#fff;padding:6px 12px;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer">Play</button></div>';document.body.appendChild(ytEl);}
  ytEl.style.display='block';
}
function playYT(vid,t,a){openYT();document.getElementById('yt-f2').src='https://www.youtube.com/embed/'+vid+'?autoplay=1&rel=0';document.getElementById('pl-ti').textContent=t;document.getElementById('pl-ar').textContent=a;playing=true;updPlay();}
function playYTInput(){var s=document.getElementById('yt-i2').value.trim();var m=s.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?\/ ]{11})/);var v=m?m[1]:(s.length===11?s:null);if(!v)return;document.getElementById('yt-f2').src='https://www.youtube.com/embed/'+v+'?autoplay=1&rel=0';}
function doSCSearch(){var q=document.getElementById('sc-q').value.trim();if(!q)return;var f=document.getElementById('sc-sf');f.src='https://w.soundcloud.com/player/?url='+encodeURIComponent('https://soundcloud.com/search?q='+q)+'&color=%231db954&auto_play=false&show_comments=false';f.style.display='block';}
function setNav(el,v){document.querySelectorAll('.sbi').forEach(function(i){i.classList.remove('on');});el.classList.add('on');document.getElementById('v-home').style.display=v==='home'?'block':'none';document.getElementById('v-search').style.display=v==='search'?'block':'none';}
function togglePlay(){playing=!playing;updPlay();}
function updPlay(){document.getElementById('ic-p').style.display=playing?'none':'block';document.getElementById('ic-pa').style.display=playing?'block':'none';}
function seek(e){var r=document.getElementById('pb-bar').getBoundingClientRect();prog=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));document.getElementById('pb-fill').style.width=prog+'%';}
function setVol(e){var r=document.getElementById('vb').getBoundingClientRect();document.getElementById('vf').style.width=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+'%';}
document.getElementById('pl-hrt').onclick=function(){this.textContent=this.textContent==='\u2665'?'\u2661':'\u2665';this.style.color=this.textContent==='\u2665'?'#1db954':'#b3b3b3';};
setInterval(function(){if(playing&&prog<100)prog+=0.04;document.getElementById('pb-fill').style.width=prog+'%';},1000);
buildGrids();
</script>` + T; }

  /* =====================================================================
     DISCORD — invite card with purple glow + real QR
  ===================================================================== */
  if (id === 'discord') { return H + `
<style>
body{background:radial-gradient(ellipse at 50% 55%,#1a0a3a 0%,#08080f 45%,#000 70%);height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
#top{position:fixed;top:0;left:0;right:0;padding:9px 16px;background:rgba(0,0,0,.6);display:flex;align-items:center;gap:9px}
#pr-in{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#aaa;padding:5px 10px;border-radius:5px;outline:none;font-size:12px}
#pr-in::placeholder{color:#333}
.pr-btn{background:#5865f2;border:none;color:#fff;padding:5px 14px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer}
#card{display:flex;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#2b2d31;max-width:500px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,.6),0 0 80px rgba(100,60,200,.08)}
#card-l{flex:1;padding:20px 24px 24px}
#card-r{width:168px;border-left:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;flex-shrink:0}
#eyebrow{font-size:10px;font-weight:700;color:#b5bac1;text-transform:uppercase;letter-spacing:.5px;margin-bottom:14px}
#srv-row{display:flex;align-items:center;gap:13px;margin-bottom:18px}
#srv-ico{width:50px;height:50px;border-radius:14px;background:#36393f;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(255,255,255,.06)}
#srv-name{font-size:1.05rem;font-weight:800;color:#fff}
#srv-stats{display:flex;gap:18px;margin-top:5px;font-size:12px;color:#b5bac1}
.st{display:flex;align-items:center;gap:5px}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.dg{background:#23a55a}.dgy{background:#80848e}
#accept-btn{width:100%;background:linear-gradient(135deg,#5865f2,#7289da);border:none;color:#fff;padding:11px;border-radius:4px;font-size:14px;font-weight:600;cursor:pointer;transition:.15s;letter-spacing:.3px}
#accept-btn:hover{background:linear-gradient(135deg,#4752c4,#5c73c7);box-shadow:0 4px 16px rgba(88,101,242,.4)}
#qr{width:108px;height:108px;border-radius:6px;background:#fff;padding:4px;display:block}
#scan-lbl{font-size:9px;color:#72767d;text-transform:uppercase;letter-spacing:.5px;font-weight:700;text-align:center;line-height:1.5}
#dc-frame{position:fixed;inset:0;border:none;width:100%;height:100%;display:none;z-index:50}
</style>
<div id="top">
  <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" style="width:20px;height:20px">
  <span style="font-family:'Space Grotesk',sans-serif;font-size:.75rem;font-weight:600">Discord</span>
  <input id="pr-in" type="text" placeholder="Proxy URL to load Discord app...">
  <button class="pr-btn" onclick="loadApp()">Load</button>
</div>
<div id="card">
  <div id="card-l">
    <div id="eyebrow">You have been invited to join</div>
    <div id="srv-row">
      <div id="srv-ico">
        <svg width="28" height="28" viewBox="0 0 127.14 96.36" fill="#fff"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
      </div>
      <div>
        <div id="srv-name">Intellectual OS</div>
        <div id="srv-stats">
          <div class="st"><span class="dot dg"></span>Online</div>
          <div class="st"><span class="dot dgy"></span>Members</div>
        </div>
      </div>
    </div>
    <button id="accept-btn" onclick="joinServer()">Accept Invitation</button>
  </div>
  <div id="card-r">
    <img id="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://discord.gg/Sduv8uDjxF&bgcolor=ffffff&color=000000&margin=2" alt="QR Code">
    <div id="scan-lbl">Scan to join<br>Intellectual OS</div>
  </div>
</div>
<iframe id="dc-frame" allow="autoplay;fullscreen;clipboard-write;camera;microphone"></iframe>
<script>
document.getElementById('pr-in').value=localStorage.getItem('intel_proxy_url')||'';
function loadApp(){
  var p=document.getElementById('pr-in').value.trim();
  var f=document.getElementById('dc-frame');
  f.src=p?p.replace(/\/$/,'')+'/service/'+btoa('https://discord.com/app'):'/service/'+btoa('https://discord.com/app');
  document.getElementById('card').style.display='none';
  document.getElementById('top').style.display='none';
  f.style.display='block';
}
function joinServer(){
  var p=document.getElementById('pr-in').value.trim();
  var url='https://discord.gg/Sduv8uDjxF';
  var f=document.getElementById('dc-frame');
  f.src=p?p.replace(/\/$/,'')+'/service/'+btoa(url):'/service/'+btoa(url);
  document.getElementById('card').style.display='none';
  document.getElementById('top').style.display='none';
  f.style.display='block';
}
</script>` + T; }

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
