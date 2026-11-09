const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
document.getElementById('year').textContent=new Date().getFullYear();

const PUBLIC_API='https://portfolio-public-api.jeevan01work.workers.dev/api/public';
const safeText=(value,fallback='')=>typeof value==='string'&&value.trim()?value.trim():fallback;
function setText(selector,value){const el=document.querySelector(selector);if(el&&value)el.textContent=value;}

function getVideoSource(rawUrl){
  try{
    const url=new URL(rawUrl);
    if(!['http:','https:'].includes(url.protocol))return null;
    const host=url.hostname.replace(/^www\./,'').toLowerCase();
    if(host==='youtu.be'){
      const id=url.pathname.split('/').filter(Boolean)[0];
      return id?{type:'embed',src:'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0'}:null;
    }
    if(host==='youtube.com'||host==='m.youtube.com'||host==='youtube-nocookie.com'){
      const parts=url.pathname.split('/').filter(Boolean);
      const id=url.searchParams.get('v')||(parts[0]==='shorts'||parts[0]==='embed'||parts[0]==='live'?parts[1]:null);
      return id?{type:'embed',src:'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0'}:null;
    }
    if(host==='vimeo.com'||host==='player.vimeo.com'){
      const id=url.pathname.split('/').filter(Boolean).pop();
      return id&&/^\d+$/.test(id)?{type:'embed',src:'https://player.vimeo.com/video/'+id+'?autoplay=1'}:null;
    }
    if(/\.(mp4|webm|ogg|m4v)(\?.*)?$/i.test(url.href))return{type:'file',src:url.href};
    return null;
  }catch{return null;}
}

function createVideoViewer(){
  const overlay=document.createElement('div');
  overlay.className='video-viewer';
  overlay.hidden=true;
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Video player');
  overlay.innerHTML='<div class="video-viewer__panel"><button class="video-viewer__close" type="button" aria-label="Close video">×</button><div class="video-viewer__stage"></div></div>';
  document.body.append(overlay);
  const stage=overlay.querySelector('.video-viewer__stage');
  const closeButton=overlay.querySelector('.video-viewer__close');
  let previousFocus=null;
  function close(){
    if(overlay.hidden)return;
    overlay.hidden=true;
    stage.replaceChildren();
    document.body.classList.remove('video-viewer-open');
    if(previousFocus)previousFocus.focus();
  }
  function open(video,title){
    previousFocus=document.activeElement;
    stage.replaceChildren();
    if(video.type==='file'){
      const player=document.createElement('video');
      player.src=video.src;
      player.controls=true;
      player.autoplay=true;
      player.playsInline=true;
      player.preload='metadata';
      player.setAttribute('aria-label',title);
      stage.append(player);
    }else{
      const frame=document.createElement('iframe');
      frame.src=video.src;
      frame.title=title;
      frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen=true;
      frame.referrerPolicy='strict-origin-when-cross-origin';
      stage.append(frame);
    }
    overlay.hidden=false;
    document.body.classList.add('video-viewer-open');
    closeButton.focus();
  }
  closeButton.addEventListener('click',close);
  overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  return open;
}
const openVideo=createVideoViewer();

function renderProjects(projects){
  const gallery=document.querySelector('.gallery');
  if(!gallery||!Array.isArray(projects)||!projects.length)return;
  gallery.replaceChildren();
  projects.forEach(project=>{
    const article=document.createElement('article');article.className='project';
    const media=document.createElement('div');media.className='media-placeholder';
    const url=safeText(project.media_url);
    const title=safeText(project.title,'Untitled project');
    const video=url&&/^https?:\/\//i.test(url)?getVideoSource(url):null;
    if(video){
      const play=document.createElement('button');
      play.type='button';
      play.className='media-play';
      play.setAttribute('aria-label','Play '+title);
      play.innerHTML='<span class="media-play__icon" aria-hidden="true">▶</span><span class="media-play__label">WATCH VIDEO</span>';
      play.addEventListener('click',()=>openVideo(video,title));
      media.classList.add('media-placeholder--video');
      media.append(play);
    }else if(url&&/^https?:\/\//i.test(url)){
      const img=document.createElement('img');
      img.src=url;img.alt=title;img.loading='lazy';img.style.cssText='width:100%;height:100%;object-fit:cover';
      media.replaceChildren(img);
    }else{
      media.textContent=safeText(project.category,'PROJECT');
    }
    const heading=document.createElement('h3');heading.textContent=title;
    const description=document.createElement('p');description.textContent=safeText(project.description);
    article.append(media,heading,description);gallery.append(article);
  });
}
async function loadPortfolio(){
  try{
    const response=await fetch(PUBLIC_API,{method:'GET',cache:'no-store'});
    if(!response.ok)throw new Error('Portfolio data unavailable');
    const data=await response.json();
    const profile=data.profile||{};
    const name=safeText(profile.name);
    const role=safeText(profile.role);
    const bio=safeText(profile.bio);
    const email=safeText(profile.email);
    if(name){
      const brand=document.querySelector('.brand');
      if(brand&&brand.firstChild)brand.firstChild.textContent=name.toUpperCase();
      document.title=name+' | '+(role||'Portfolio');
      const footer=document.querySelector('footer');
      if(footer)footer.innerHTML='© '+new Date().getFullYear()+' '+name.toUpperCase()+' · '+(role||'CREATIVE PORTFOLIO');
    }
    if(role)setText('.hero-copy .eyebrow',role.toUpperCase());
    if(bio){setText('.intro',bio);setText('.about > p:last-child',bio);}
    if(email){const contactLink=document.querySelector('.contact .button');if(contactLink)contactLink.href='mailto:'+email;}
    renderProjects(data.projects);
  }catch(error){console.warn('Could not load live portfolio data:',error);}
}
loadPortfolio();