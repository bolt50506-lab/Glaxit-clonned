(function(){
const SUPA_URL="https://ozlovfaxljojheykroax.supabase.co";
const SUPA_KEY="sb_publishable_9mQ3omzC2ws9obM5i-ZroQ_qMzohZQ7";
function slugify(s){return String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function esc(s){const d=document.createElement("div");d.textContent=s??"";return d.innerHTML}
async function run(){
 if(!window.supabase)return;
 const sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
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