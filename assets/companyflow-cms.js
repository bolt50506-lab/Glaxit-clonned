(function(){
const SUPA_URL="https://ozlovfaxljojheykroax.supabase.co";
const SUPA_KEY="sb_publishable_9mQ3omzC2ws9obM5i-ZroQ_qMzohZQ7";
function slugify(s){return String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function esc(s){const d=document.createElement("div");d.textContent=s??"";return d.innerHTML}

async function syncSite(sb){
 const [{data:h},{data:a},{data:o}]=await Promise.all([
  sb.from("companyflow_site_content").select("value").eq("key","homepage").maybeSingle(),
  sb.from("companyflow_animation_settings").select("value").eq("key","global").maybeSingle(),
  sb.from("companyflow_site_content").select("value").eq("key","visual_editor").maybeSingle()
 ]);
 const home=h?.value;
 if(home){
  const replaceExact=(from,to)=>{if(!from||to==null)return;document.querySelectorAll("*").forEach(el=>{if(el.children.length===0&&el.textContent.trim()===from)el.textContent=to})};
  replaceExact("Digital products built around your business.",home.heroTitle);
  replaceExact("Websites, ecommerce, custom software and AI automation built around the way your business works.",home.heroText);
  replaceExact("10+",home.years);replaceExact("500+",home.projects);replaceExact("100%",home.clients);
 }
 if(a?.value?.duration){document.documentElement.style.setProperty("--companyflow-animation-duration",a.value.duration+"ms")}
 const overrides=o?.value;
 if(Array.isArray(overrides)){overrides.forEach(v=>{
   try{
     const el=document.querySelector(v.selector); if(!el)return;
     if(v.text!=null && !el.children.length)el.textContent=v.text;
     if(el.tagName==="IMG" && v.src)el.setAttribute("src",v.src);
     if(v.href!=null){const link=el.tagName==="A"?el:el.closest("a");if(link)link.setAttribute("href",v.href)}
     if(v.style!=null)el.setAttribute("style",v.style);
     el.hidden=!!v.hidden;
   }catch(e){}
 })}
}
async function run(){
 if(!window.supabase)return;
 const sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
 await syncSite(sb);
 const {data:projects,error}=await sb.from("companyflow_projects").select("*, companyflow_categories(name,slug)").eq("published",true).order("sort_order");
 if(error||!projects?.length)return;
 const path=location.pathname.replace(/\\/g,"/");
 const catMap={
  "real-estate":"Real Estate","business-software":"Business Software","healthcare":"Healthcare",
  "ecommerce-retail":"E-commerce & Retail","ai-automation":"AI & Automation","travel-transportation":"Travel & Transportation"
 };
 const catKey=Object.keys(catMap).find(k=>path.includes("/blog/case-study/"+k+"/"));
 if(catKey){
  const items=projects.filter(p=>(p.companyflow_categories?.name||"")===catMap[catKey]);
  const grid=document.querySelector(".gx-case-grid");
  if(grid&&items.length){
   grid.innerHTML=items.map(p=>`<article class="gx-case-card"><div class="gx-case-image">${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy">`:""}</div><div class="gx-case-body"><span class="gx-case-category">CompanyFlow Project</span><h2>${esc(p.name)}</h2><p>${esc(p.description||"Digital product built around the business.")}</p><a class="gx-case-explore" href="../${encodeURIComponent(p.slug)}/">Explore Project <span>↗</span></a></div></article>`).join("");
   grid.querySelectorAll(".gx-case-card").forEach((c,i)=>{c.style.transitionDelay=(i*.09)+"s";requestAnimationFrame(()=>c.classList.add("is-visible"))});
  }
 }
 const detail=path.match(/\/blog\/case-study\/([^/]+)\/$/);
 if(detail){
  const slug=detail[1];
  const p=projects.find(x=>x.slug===slug);
  if(p){
   const h=document.querySelector(".gx-project-hero h1");if(h)h.textContent=p.name;
   const lead=document.querySelector(".gx-project-lead");if(lead&&p.description)lead.textContent=p.description;
   const shot=document.querySelector(".gx-project-shot img");if(shot&&p.image_url){shot.src=p.image_url;shot.removeAttribute("data-src");shot.alt=p.name}
   document.title=p.name+" — CompanyFlow";
  }
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();