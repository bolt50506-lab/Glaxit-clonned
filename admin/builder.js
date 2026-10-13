import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
const supabase=createClient('https://sawqalrbdbayroypbopp.supabase.co','sb_publishable_RQOgdAIQAkm3kMfea9cQQQ_foK6CTdm',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=id=>document.getElementById(id);
const state={user:null,pages:[],page:null,sections:[],selected:-1,device:'desktop',preview:'canvas',dirty:false};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaults={hero:{type:'hero',eyebrow:'COMPANYFLOW',title:'Build a business that works smarter',text:'Custom software, websites and automation designed around the way your business works.',buttonText:'Connect with us',buttonUrl:'https://companyflow.co.uk/contact-us/',background:'#111a22',align:'left'},text:{type:'text',eyebrow:'ABOUT US',title:'Content section heading',text:'Write your section copy here. Explain the value you deliver and what makes your business different.',buttonText:'',buttonUrl:'',background:'#ffffff',align:'left'},image:{type:'image',eyebrow:'OUR APPROACH',title:'Text with an image',text:'Describe the image and the story it supports. Add a publicly accessible image URL below.',imageUrl:'',imageAlt:'',buttonText:'Learn more',buttonUrl:'',background:'#ffffff',align:'left'},features:{type:'features',eyebrow:'WHAT WE DO',title:'Solutions built around you',text:'Choose the key benefits your visitors should understand.',features:[{title:'Custom development',text:'Software tailored to your workflow.'},{title:'Modern websites',text:'Fast, responsive experiences.'},{title:'Automation',text:'Reduce repetitive work.'}],background:'#f5f8f7',align:'left'},cta:{type:'cta',eyebrow:'LET’S WORK TOGETHER',title:'Ready to move your business forward?',text:'Tell us what you want to improve. We’ll help you plan the next step.',buttonText:'Connect now',buttonUrl:'https://companyflow.co.uk/contact-us/',background:'#10251f',align:'center'}};
const labels={hero:'Hero banner',text:'Text section',image:'Image + text',features:'Feature cards',cta:'Call to action'};
function toast(msg,error=false){const el=$('toast');el.textContent=msg;el.classList.toggle('error',error);el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),4500)}
function setDirty(){state.dirty=true;$('saveState').textContent='Unsaved changes';}
function slug(p){return '/'+p.slug.replace(/^\/+|\/+$/g,'')+'/'}
async function init(){
 const {data,error}=await supabase.auth.getSession();
 if(error||!data.session||!(data.session.user.app_metadata?.companyflow_admin===true||data.session.user.app_metadata?.companyflow_admin==='true')){document.body.innerHTML='<main style="font:14px system-ui;max-width:480px;margin:15vh auto;padding:25px;text-align:center"><h1>Admin sign-in required</h1><p>Sign in to the authorised CompanyFlow admin account first.</p><a href="./index.html" style="color:#11866e">Return to admin login</a></main>';return;}
 state.user=data.session.user;await loadPages();
}
async function loadPages(){
 $('pageList').innerHTML='<div class="loading">Loading pages…</div>';
 const {data,error}=await supabase.from('cms_pages').select('*').order('title');
 if(error){$('pageList').innerHTML='<div class="empty">Could not load pages.</div>';toast(error.message,true);return}
 state.pages=data||[];renderPageList();
 if(state.page){const refreshed=state.pages.find(p=>p.id===state.page.id);if(refreshed)selectPage(refreshed,false);else state.page=null}
}
function renderPageList(){
 const q=$('pageSearch').value.trim().toLowerCase();
 const pages=state.pages.filter(p=>(p.title+' '+p.slug).toLowerCase().includes(q));
 $('pageList').innerHTML=pages.length?pages.map(p=>'<button class="pageitem '+(state.page?.id===p.id?'active':'')+'" data-page="'+esc(p.id)+'"><span class="pageicon">▤</span><span><b>'+esc(p.title)+'</b><small>/'+esc(p.slug)+'/ · '+esc(p.status)+'</small></span></button>').join(''):'<div class="empty">No CMS pages yet.<br>Create a page first, then open it here to edit visually.<p style="margin-top:12px"><a class="createpage-link" href="./index.html">＋ Create a page in Admin</a></p></div>';
}
function selectPage(page,mark=true){
 state.page=page;
 const c=page.content;
 state.sections=Array.isArray(c?.sections)?JSON.parse(JSON.stringify(c.sections)):[];
 state.selected=state.sections.length?0:-1;
 state.dirty=false;
 $('pageHeading').textContent=page.title;$('pageCrumb').textContent=page.title.toUpperCase();$('pageMeta').textContent='/'+page.slug+'/ · '+page.status+' · Visual section editor';
 $('saveState').textContent='All changes saved';renderPageList();renderSections();renderFields();renderCanvas();
}
function renderSections(){
 $('sectionCount').textContent=state.sections.length+' section'+(state.sections.length===1?'':'s');
 $('sectionList').innerHTML=state.sections.length?state.sections.map((s,i)=>'<button class="sectionitem '+(i===state.selected?'active':'')+'" data-section="'+i+'"><span class="handle">⠿</span><span><b>'+esc(labels[s.type]||s.type||'Section')+'</b><small>'+esc(s.title||'Untitled section')+'</small></span><span class="typeicon">☷</span></button>').join(''):'<div class="empty">No sections yet.<br>Use “Add section” to start building this page.</div>';
}
function inputField(label,key,value,opts={}){
 const id='field-'+key;
 if(opts.select)return '<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'" data-field="'+key+'">'+opts.select.map(o=>'<option value="'+esc(o.value)+'" '+(String(value)===String(o.value)?'selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select></div>';
 if(opts.textarea)return '<div class="field"><label for="'+id+'">'+label+'</label><textarea id="'+id+'" data-field="'+key+'">'+esc(value||'')+'</textarea></div>';
 return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" data-field="'+key+'" type="'+(opts.url?'url':'text')+'" value="'+esc(value||'')+'" placeholder="'+esc(opts.placeholder||'')+'"></div>';
}
function renderFields(){
 const s=state.sections[state.selected];
 if(!s){$('fieldsPanel').innerHTML='<div class="empty">Select a section or add one to begin editing.</div>';return}
 const base=inputField('Section label','eyebrow',s.eyebrow)+inputField('Heading','title',s.title)+inputField('Text','text',s.text,{textarea:true});
 let extra='';
 if(s.type==='image')extra=inputField('Image URL','imageUrl',s.imageUrl,{url:true,placeholder:'https://…'})+inputField('Image alt text','imageAlt',s.imageAlt);
 if(s.type==='features'){
  const f=s.features||[];
  extra='<div class="fieldnote">Edit each card below. These cards appear in the live editor preview.</div>'+f.map((x,i)=>'<div class="featureedit"><b>Card '+(i+1)+'</b>'+inputField('Title','features.'+i+'.title',x.title)+inputField('Description','features.'+i+'.text',x.text,{textarea:true})+'</div>').join('')+'<button class="movebtn" id="addFeature">＋ Add feature card</button>';
 }
 const buttonFields=s.type==='text'||s.type==='hero'||s.type==='image'||s.type==='cta';
 if(buttonFields)extra+=inputField('Button label','buttonText',s.buttonText)+inputField('Button link','buttonUrl',s.buttonUrl,{url:true,placeholder:'https://…'});
 extra+=inputField('Text alignment','align',s.align||'left',{select:[{value:'left',label:'Left'},{value:'center',label:'Center'}]});
 extra+=inputField('Section background colour','background',s.background||'#ffffff',{placeholder:'#ffffff'});
 $('fieldsPanel').innerHTML='<div class="fieldsTitle"><h3>Edit '+esc(labels[s.type]||'section')+'</h3><span class="fieldnote">Changes preview instantly</span></div>'+base+extra+'<div class="fieldactions"><button class="movebtn" id="moveUp" '+(state.selected<=0?'disabled':'')+'>↑ Move up</button><button class="movebtn" id="moveDown" '+(state.selected>=state.sections.length-1?'disabled':'')+'>↓ Move down</button><button class="danger" id="deleteSection">Delete section</button></div><p class="fieldnote">This saves section data to the CompanyFlow CMS. The live website will not change until the publishing connection is built and deployed.</p>';
 $('fieldsPanel').querySelectorAll('[data-field]').forEach(el=>el.addEventListener('input',()=>{
  const path=el.dataset.field.split('.');if(path[0]==='features'){const idx=Number(path[1]);s.features=s.features||[];s.features[idx][path[2]]=el.value}else s[path[0]]=el.value;
  setDirty();renderCanvas();renderSections();
 }));
 $('addFeature')?.addEventListener('click',()=>{s.features=s.features||[];s.features.push({title:'New feature',text:'Describe this benefit.'});setDirty();renderFields();renderCanvas()});
 $('deleteSection')?.addEventListener('click',()=>{if(!confirm('Delete this section from the draft?'))return;state.sections.splice(state.selected,1);state.selected=Math.min(state.selected,state.sections.length-1);setDirty();renderSections();renderFields();renderCanvas()});
 $('moveUp')?.addEventListener('click',()=>moveSection(-1));$('moveDown')?.addEventListener('click',()=>moveSection(1));
}
function moveSection(delta){const next=state.selected+delta;if(next<0||next>=state.sections.length)return;[state.sections[state.selected],state.sections[next]]=[state.sections[next],state.sections[state.selected]];state.selected=next;setDirty();renderSections();renderFields();renderCanvas()}
function renderCanvas(){
 const canvas=$('siteCanvas');canvas.className='sitecanvas '+(state.device==='desktop'?'':state.device);
 if(state.preview==='live')return;
 if(!state.page){canvas.innerHTML='<div class="emptycanvas"><span>CF</span><h2>Your page preview</h2><p>Select a page from the left to preview and edit its sections.</p></div>';return}
 if(!state.sections.length){canvas.innerHTML='<div class="emptycanvas"><span>CF</span><h2>This page has no sections yet</h2><p>Click Add section to build the page visually.</p></div>';return}
 canvas.innerHTML=state.sections.map((s,i)=>{
 const align=s.align==='center'?'center':'left';const bg=s.background||((s.type==='hero'||s.type==='cta')?'#111a22':'#ffffff');
 let content='<p class="pv-eyebrow">'+esc(s.eyebrow||'')+'</p>';
 if(s.title)content+=(s.type==='hero'?'<h1>':'<h2>')+esc(s.title)+(s.type==='hero'?'</h1>':'</h2>');
 if(s.text)content+='<p>'+esc(s.text)+'</p>';
 if(s.type==='image')content+='<div class="imagepreview">'+(s.imageUrl?'<img src="'+esc(s.imageUrl)+'" alt="'+esc(s.imageAlt||'')+'">':'<div class="placeholder">Add an image URL in section settings</div>')+'</div>';
 if(s.type==='features')content+='<div class="featuregrid">'+(s.features||[]).map(f=>'<div class="featurecard"><b>'+esc(f.title)+'</b><p>'+esc(f.text)+'</p></div>').join('')+'</div>';
 if(s.buttonText)content+='<a class="pv-button" href="'+esc(s.buttonUrl||'#')+'" target="_blank" rel="noopener">'+esc(s.buttonText)+'</a>';
 return '<section class="pv-section pv-'+esc(s.type)+' '+(i===state.selected?'selected':'')+'" data-canvas-section="'+i+'" style="background:'+esc(bg)+';text-align:'+align+'">'+(s.type==='image'?'<div class="image-layout">'+content+'</div>':content)+'</section>';
 }).join('');
 canvas.querySelectorAll('[data-canvas-section]').forEach(el=>el.addEventListener('click',()=>{state.selected=Number(el.dataset.canvasSection);renderSections();renderFields();renderCanvas()}));
}
function setPreview(mode){
 state.preview=mode;
 document.querySelectorAll('[data-preview]').forEach(b=>b.classList.toggle('active',b.dataset.preview===mode));
 $('canvasWrap').classList.toggle('hidden',mode==='live');$('liveFrame').classList.toggle('hidden',mode!=='live');
 if(mode==='live')$('liveFrame').src='https://companyflow.co.uk'+(state.page?slug(state.page):'/');
}
async function save(){
 if(!state.page){toast('Select a page first.',true);return}
 const button=$('saveBtn');button.disabled=true;button.textContent='Saving…';
 try{
  const {data:old,error:readErr}=await supabase.from('cms_pages').select('*').eq('id',state.page.id).single();if(readErr)throw readErr;
  const {error:revErr}=await supabase.from('cms_revisions').insert({page_id:old.id,snapshot:{slug:old.slug,title:old.title,page_type:old.page_type,status:old.status,content:old.content,seo_title:old.seo_title,seo_description:old.seo_description,canonical_url:old.canonical_url,robots_index:old.robots_index,og_image_path:old.og_image_path,published_at:old.published_at},note:'Before visual editor update',created_by:state.user.id});if(revErr)throw revErr;
  const content={...(old.content&&typeof old.content==='object'?old.content:{}),sections:state.sections};
  const {data,error}=await supabase.from('cms_pages').update({content,updated_by:state.user.id,updated_at:new Date().toISOString(),status:old.status==='published'?'draft':old.status}).eq('id',old.id).select().single();if(error)throw error;
  state.page=data;state.dirty=false;$('saveState').textContent='Draft saved';$('pageMeta').textContent='/'+data.slug+'/ · draft saved · public website unchanged until publishing is connected';renderPageList();toast('Draft saved to CMS. The live website has not changed.');
 }catch(e){toast('Save failed: '+e.message,true)}
 finally{button.disabled=false;button.textContent='Save draft'}
}
$('pageSearch').addEventListener('input',renderPageList);$('refreshBtn').addEventListener('click',loadPages);$('saveBtn').addEventListener('click',save);
const sectionPicker=$('sectionPicker');
function closeSectionPicker(){sectionPicker?.classList.add('hidden');}
function addSectionType(key){
 if(!state.page){toast('Choose a page first.',true);return}
 if(!defaults[key])return;
 state.sections.push(JSON.parse(JSON.stringify(defaults[key])));
 state.selected=state.sections.length-1;setDirty();renderSections();renderFields();renderCanvas();closeSectionPicker();
}
$('addSectionBtn').addEventListener('click',()=>{if(!state.page){toast('Choose a page first.',true);return}sectionPicker.classList.remove('hidden');});
$('closeSectionPicker')?.addEventListener('click',closeSectionPicker);
sectionPicker?.addEventListener('click',e=>{if(e.target===sectionPicker)closeSectionPicker();const item=e.target.closest('[data-add-type]');if(item)addSectionType(item.dataset.addType);});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSectionPicker();});
$('viewLiveBtn').addEventListener('click',()=>window.open('https://companyflow.co.uk'+(state.page?slug(state.page):'/'),'_blank','noopener,noreferrer'));
document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>{state.device=b.dataset.device;document.querySelectorAll('[data-device]').forEach(x=>x.classList.toggle('active',x===b));renderCanvas()}));
document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>setPreview(b.dataset.preview)));
$('pageList').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;if(state.dirty&&!confirm('Discard unsaved changes and switch pages?'))return;const page=state.pages.find(p=>p.id===b.dataset.page);if(page)selectPage(page)});
window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue='';}});
init();