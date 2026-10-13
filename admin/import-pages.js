import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
const supabase=createClient('https://sawqalrbdbayroypbopp.supabase.co','sb_publishable_RQOgdAIQAkm3kMfea9cQQQ_foK6CTdm',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=id=>document.getElementById(id);
let user=null,files=[],pages=[],selected=new Set();
const excluded=/^(admin|wp-content|wp-includes|wp-json|cdnjs\.cloudflare\.com|gmpg\.org|unpkg\.com|node_modules|\.git)(\/|$)/i;
const utility=/^(privacy-policy|terms-and-conditions|refund-policy|blog)(\/|$)/i;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(msg){$('folderStatus').textContent=msg}
async function auth(){
 const {data,error}=await supabase.auth.getSession();user=data?.session?.user;
 if(error||!user||!(user.app_metadata?.companyflow_admin===true||user.app_metadata?.companyflow_admin==='true')){
  document.body.innerHTML='<main style="font:14px system-ui;max-width:520px;margin:15vh auto;padding:25px;text-align:center"><h1>Admin sign-in required</h1><p>Sign in to the authorised CompanyFlow admin account first.</p><a href="./index.html">Return to admin login</a></main>';return false;
 }return true;
}
function cleanText(el){return (el?.textContent||'').replace(/\s+/g,' ').trim()}
function meta(doc,name,attr='name'){return doc.querySelector('meta['+attr+'="'+name+'"]')?.content?.trim()||''}
function pageType(path){if(/^solutions\//i.test(path))return 'solution';if(/case-stud|project/i.test(path))return 'case-study';if(/landing/i.test(path))return 'landing';return 'page'}
function slugFromPath(path){let p=path.replace(/\\/g,'/').replace(/^\.\//,'').replace(/(^|\/)index\.html?$/i,'').replace(/\.html?$/i,'').replace(/^\/+|\/+$/g,'');return p||'home'}
function absoluteUrl(value,baseUrl){try{return new URL(value,baseUrl||'https://companyflow.co.uk/').href}catch{return ''}}
function extractSections(doc,canonical,sourcePath){
 const pageBase=canonical||new URL(sourcePath||'/', 'https://companyflow.co.uk/').href;
 const root=doc.querySelector('main')||doc.querySelector('[role="main"]')||doc.body;
 let source=[...root.querySelectorAll('section')].filter(s=>!s.parentElement?.closest('section'));
 if(!source.length)source=[root];
 const out=[];
 for(const node of source){
  const heading=node.querySelector('h1,h2,h3,h4');
  const paras=[...node.querySelectorAll('p')].map(cleanText).filter(t=>t.length>20).slice(0,4);
  const img=node.querySelector('img[src]');
  const button=[...node.querySelectorAll('a[href],button')].find(a=>cleanText(a)&&cleanText(a).length<45);
  const title=cleanText(heading), text=paras.join('\n\n');
  if(!title&&!text&&!img)continue;
  const isHero=!!node.querySelector('h1')&&!out.some(s=>s.type==='hero');
  const imageUrl=img?absoluteUrl(img.getAttribute('src'),pageBase):'';
  const btnUrl=button?.tagName==='A'?absoluteUrl(button.getAttribute('href'),pageBase):'';
  const section={type:isHero?'hero':img?'image':'text',eyebrow:'',title:title.slice(0,180),text:text.slice(0,1800),buttonText:button?cleanText(button).slice(0,80):'',buttonUrl:btnUrl,background:isHero?'#111a22':'#ffffff',align:isHero?'center':'left'};
  if(img){section.imageUrl=imageUrl;section.imageAlt=img.getAttribute('alt')||''}
  if(!section.title&&!section.text&&!section.imageUrl)continue;
  out.push(section);
  if(out.length>=35)break;
 }
 if(!out.length){
  const h=cleanText(root.querySelector('h1'));
  const p=cleanText(root.querySelector('p'));
  if(h||p)out.push({type:'hero',eyebrow:'',title:h||'Imported page',text:p,buttonText:'',buttonUrl:'',background:'#111a22',align:'left'});
 }
 return out;
}
async function scan(){
 const input=$('folderInput').files;
 if(!input?.length){notice('Select the extracted repository folder first.');return}
 const includeUtility=$('includeUtility').checked;
 const htmlFiles=[...input].filter(f=>/\.html?$/i.test(f.name));
 const candidates=htmlFiles.filter(f=>{
  const path=(f.webkitRelativePath||f.name).replace(/^[^/]+\//,'');
  if(excluded.test(path)||path.split('/').some(part=>excluded.test(part)))return false;
  if(!includeUtility&&utility.test(path))return false;
  return true;
 });
 pages=[];selected.clear();
 for(const file of candidates){
  const path=(file.webkitRelativePath||file.name).replace(/^[^/]+\//,'');
  try{
   const source=await file.text(),doc=new DOMParser().parseFromString(source,'text/html');
   const title=doc.title?.trim()||cleanText(doc.querySelector('h1'))||slugFromPath(path);
   const canonical=doc.querySelector('link[rel="canonical"]')?.href||'';
   const description=meta(doc,'description');
   const slug=slugFromPath(path);
   const sections=extractSections(doc,canonical,path);
   const firstImg=doc.querySelector('main img[src], body img[src]');
   pages.push({slug,title,page_type:pageType(slug),status:'draft',content:{sections,importedFrom:{sourcePath:path,canonicalUrl:canonical,importedAt:new Date().toISOString(),note:'Content and metadata were extracted from the static HTML. Original CSS, animation and exact layout are not converted; review before any future publishing.'}},seo_title:doc.title?.trim()||title,seo_description:description||null,canonical_url:canonical||null,robots_index:!/(noindex)/i.test(meta(doc,'robots')),og_image_path:null,published_at:null,sourcePath:path,sectionCount:sections.length,firstImage:firstImg?absoluteUrl(firstImg.getAttribute('src'),canonical||new URL(path,'https://companyflow.co.uk/').href):''});
  }catch(e){console.warn('Could not parse',path,e)}
 }
 pages.sort((a,b)=>a.slug.localeCompare(b.slug));
 pages.forEach(p=>selected.add(p.slug));
 $('reviewPanel').classList.remove('hidden');$('progressPanel').classList.add('hidden');
 $('reviewSummary').textContent=pages.length+' HTML pages found; '+pages.reduce((n,p)=>n+p.sectionCount,0)+' editable starter sections extracted. All will import as drafts.';
 $('reviewRows').innerHTML=pages.map(p=>'<tr><td><input type="checkbox" data-slug="'+esc(p.slug)+'" checked aria-label="Select '+esc(p.title)+'"></td><td><b>'+esc(p.title)+'</b><small>/'+esc(p.slug)+'/</small></td><td>'+esc(p.page_type)+'</td><td>'+p.sectionCount+' sections'+(p.firstImage?' · image found':'')+'</td><td><small>'+esc(p.sourcePath)+'</small></td></tr>').join('')||'<tr><td colspan="5">No eligible HTML files found. Check that you selected the extracted repository root.</td></tr>';
 $('importBtn').disabled=!pages.length;
 $('selectAll').checked=true;
 $('fileSummary').classList.remove('hidden');$('fileSummary').textContent='Scanned '+htmlFiles.length+' HTML files. '+pages.length+' eligible pages after exclusions.';
 notice('Scan complete. Review the page list before importing.');
}
async function runImport(){
 const chosen=pages.filter(p=>selected.has(p.slug));
 if(!chosen.length){alert('Select at least one page.');return}
 const replace=$('replaceExisting').checked;
 if(!confirm('Import '+chosen.length+' page(s) as drafts?'+(replace?' Existing pages with matching slugs will be updated.':' Existing pages will be skipped.')+' This does not publish to the live website.'))return;
 $('progressPanel').classList.remove('hidden');$('importBtn').disabled=true;$('scanBtn').disabled=true;
 const resultLines=[];let done=0,ok=0,skip=0,failed=0;
 const {data:existingRows,error:existingError}=await supabase.from('cms_pages').select('id,slug,title,content,status');
 if(existingError){$('progressText').textContent='Could not load existing pages: '+existingError.message;$('importBtn').disabled=false;$('scanBtn').disabled=false;return}
 const existing=new Map((existingRows||[]).map(p=>[p.slug,p]));
 for(const page of chosen){
  const old=existing.get(page.slug);done++;
  try{
   let saved;
   const payload={title:page.title,slug:page.slug,page_type:page.page_type,status:'draft',content:page.content,seo_title:page.seo_title,seo_description:page.seo_description,canonical_url:page.canonical_url,robots_index:page.robots_index,og_image_path:null,published_at:null,updated_by:user.id,updated_at:new Date().toISOString()};
   if(old&&!replace){skip++;resultLines.push('↷ Skipped existing: '+page.slug);continue}
   if(old){
    const {error:revErr}=await supabase.from('cms_revisions').insert({page_id:old.id,snapshot:{slug:old.slug,title:old.title,status:old.status,content:old.content},note:'Automatic snapshot before static HTML import',created_by:user.id});
    if(revErr)throw revErr;
    const {data,error}=await supabase.from('cms_pages').update(payload).eq('id',old.id).select().single();if(error)throw error;saved=data;
   }else{
    const {data,error}=await supabase.from('cms_pages').insert({...payload,created_by:user.id}).select().single();if(error)throw error;saved=data;
   }
   const {error:revErr}=await supabase.from('cms_revisions').insert({page_id:saved.id,snapshot:{slug:saved.slug,title:saved.title,status:saved.status,content:saved.content,seo_title:saved.seo_title,seo_description:saved.seo_description,canonical_url:saved.canonical_url,robots_index:saved.robots_index},note:'Imported from static HTML as draft',created_by:user.id});
   if(revErr)throw revErr;
   existing.set(page.slug,saved);ok++;resultLines.push('✓ Imported draft: '+page.slug);
  }catch(e){failed++;resultLines.push('✕ '+page.slug+': '+(e.message||'Import failed'))}
  $('progressText').textContent='Processed '+done+' of '+chosen.length+' · '+ok+' imported · '+skip+' skipped · '+failed+' failed';
  $('progressBar').style.width=Math.round(done/chosen.length*100)+'%';
  $('resultList').textContent=resultLines.slice(-60).join('\n');
 }
 $('progressText').textContent='Finished · '+ok+' imported · '+skip+' skipped · '+failed+' failed. All successful records are drafts.';
 $('importBtn').disabled=false;$('scanBtn').disabled=false;$('openBuilder').classList.remove('hidden');
}
$('folderInput').addEventListener('change',()=>{const n=$('folderInput').files.length;notice(n?n+' files selected. Click Scan selected files.':'No folder selected.');$('scanBtn').disabled=!n});
$('scanBtn').addEventListener('click',scan);
$('selectAll').addEventListener('change',()=>{selected.clear();if($('selectAll').checked)pages.forEach(p=>selected.add(p.slug));$('reviewRows').querySelectorAll('[data-slug]').forEach(el=>el.checked=$('selectAll').checked);$('importBtn').disabled=selected.size===0});
$('reviewRows').addEventListener('change',e=>{const box=e.target.closest('[data-slug]');if(!box)return;if(box.checked)selected.add(box.dataset.slug);else selected.delete(box.dataset.slug);$('selectAll').checked=selected.size===pages.length;$('importBtn').disabled=selected.size===0});
$('importBtn').addEventListener('click',runImport);
if(await auth())notice('Authorised. Choose the extracted website repository folder to begin.');
