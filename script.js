const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav-links');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));
document.getElementById('year').textContent=new Date().getFullYear();

const PUBLIC_API='https://portfolio-public-api.jeevan01work.workers.dev/api/public';
const safeText=(value,fallback='')=>typeof value==='string'&&value.trim()?value.trim():fallback;
function setText(selector,value){const el=document.querySelector(selector);if(el&&value)el.textContent=value;}
function renderProjects(projects){
  const gallery=document.querySelector('.gallery');
  if(!gallery||!Array.isArray(projects)||!projects.length)return;
  gallery.replaceChildren();
  projects.forEach(project=>{
    const article=document.createElement('article');article.className='project';
    const media=document.createElement('div');media.className='media-placeholder';
    const url=safeText(project.media_url);
    if(url&&/^https?:\/\//i.test(url)){
      const isVideo=/\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
      if(isVideo){const video=document.createElement('video');video.src=url;video.controls=true;video.playsInline=true;video.style.cssText='width:100%;height:100%;object-fit:cover';media.replaceChildren(video);}
      else{const img=document.createElement('img');img.src=url;img.alt=safeText(project.title,'Project image');img.loading='lazy';img.style.cssText='width:100%;height:100%;object-fit:cover';media.replaceChildren(img);}
    }else{media.textContent=safeText(project.category,'PROJECT');}
    const title=document.createElement('h3');title.textContent=safeText(project.title,'Untitled project');
    const description=document.createElement('p');description.textContent=safeText(project.description);
    article.append(media,title,description);gallery.append(article);
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