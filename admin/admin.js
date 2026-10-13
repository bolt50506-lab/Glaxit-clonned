import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const SUPABASE_URL = 'https://sawqalrbdbayroypbopp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_RQOgdAIQAkm3kMfea9cQQQ_foK6CTdm';
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});

const $ = (id) => document.getElementById(id);
const state = { user: null, pages: [], assets: [], settings: [], revisions: [], activeView: 'overview' };
const escapeHtml = (value='') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (value) => value ? new Date(value).toLocaleString() : '—';
const short = (value='', max=60) => String(value || '').length > max ? String(value).slice(0,max-1)+'…' : String(value || '');
const statusPill = (status) => '<span class="status-pill status-'+escapeHtml(status)+'">'+escapeHtml(status)+'</span>';
const pageSnapshot = (page) => ({slug:page.slug,title:page.title,page_type:page.page_type,status:page.status,content:page.content,seo_title:page.seo_title,seo_description:page.seo_description,canonical_url:page.canonical_url,robots_index:page.robots_index,og_image_path:page.og_image_path,published_at:page.published_at});
function showNotice(message, isError=false) {
  const el=$('notice'); el.textContent=message; el.classList.remove('hidden','error');
  if(isError) el.classList.add('error');
  window.scrollTo({top:0,behavior:'smooth'});
  window.setTimeout(()=>el.classList.add('hidden'),6500);
}
function setAuthMessage(message,isError=false){$('authMessage').textContent=message;$('authMessage').style.color=isError?'#b42318':'#0e806b';}
function renderTable(target, headers, rows, empty='Nothing here yet.') {
  const el=$(target);
  if(!rows.length){el.innerHTML='<div class="empty-state">'+escapeHtml(empty)+'</div>';return;}
  el.innerHTML='<table><thead><tr>'+headers.map(h=>'<th>'+escapeHtml(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>';
}
function rowPage(page, includeType=true) {
  return '<tr><td><b>'+escapeHtml(page.title)+'</b><small>/'+escapeHtml(page.slug)+'/</small></td>'+(includeType?'<td>'+escapeHtml(page.page_type)+'</td>':'')+'<td>'+statusPill(page.status)+'</td><td>'+escapeHtml(fmtDate(page.updated_at))+'</td><td><div class="table-actions"><button data-edit-page="'+escapeHtml(page.id)+'">Edit</button><button data-preview-page="'+escapeHtml(page.id)+'">Preview JSON</button></div></td></tr>';
}
function navigate(view) {
  state.activeView=view;
  document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
  $('view-'+view)?.classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  const titles={overview:'Overview',pages:'Pages & content',media:'Media library',seo:'SEO controls',settings:'Site settings',revisions:'Revision history'};
  $('viewTitle').textContent=titles[view]||'Admin';
  if(view==='pages') renderPages();
  if(view==='media') renderAssets();
  if(view==='seo') renderSeo();
  if(view==='settings') renderSettings();
  if(view==='revisions') loadRevisions();
}
async function isAdminSession(session) {
  const user=session?.user;
  if(!user) return false;
  // Authorization comes from server-controlled app_metadata, never user_metadata.
  return user.app_metadata?.companyflow_admin === true || user.app_metadata?.companyflow_admin === 'true';
}
async function handleSession(session) {
  if(!session || !(await isAdminSession(session))) {
    if(session) await supabase.auth.signOut();
    $('authGate').classList.remove('hidden');$('adminApp').classList.add('hidden');
    if(session) setAuthMessage('This account is not authorised for CompanyFlow administration.',true);
    return;
  }
  state.user=session.user;
  $('authGate').classList.add('hidden');$('adminApp').classList.remove('hidden');
  $('userBadge').textContent=session.user.email||'Admin';
  await refreshAll();
}
async function refreshAll() {
  const [pagesResult,assetsResult,settingsResult] = await Promise.all([
    supabase.from('cms_pages').select('*').order('updated_at',{ascending:false}),
    supabase.from('cms_assets').select('*').order('created_at',{ascending:false}),
    supabase.from('cms_settings').select('*').order('setting_key')
  ]);
  for (const result of [pagesResult,assetsResult,settingsResult]) {
    if(result.error){showNotice('CMS connection error: '+result.error.message,true);return;}
  }
  state.pages=pagesResult.data||[];state.assets=assetsResult.data||[];state.settings=settingsResult.data||[];
  $('statPages').textContent=state.pages.length;
  $('statPublished').textContent=state.pages.filter(p=>p.status==='published').length;
  $('statDrafts').textContent=state.pages.filter(p=>p.status==='draft').length;
  $('statAssets').textContent=state.assets.length;
  renderRecentPages();renderPages();renderAssets();renderSeo();renderSettings();
}
function renderRecentPages() {
  const recent=state.pages.slice(0,5);
  renderTable('recentPages',['Page','Type','Status','Updated','Actions'],recent.map(p=>rowPage(p,true)),'No CMS pages yet. Create your first page to begin.');
}
function renderPages() {
  const query=($('pageSearch')?.value||'').trim().toLowerCase();
  const filter=$('pageStatusFilter')?.value||'';
  const pages=state.pages.filter(p=>(!filter||p.status===filter)&&(!query||(p.title+' '+p.slug+' '+p.page_type).toLowerCase().includes(query)));
  renderTable('pagesTable',['Page','Type','Status','Updated','Actions'],pages.map(p=>rowPage(p,true)),'No pages match your filters.');
}
function openEditor(page=null) {
  $('pageEditor').classList.remove('hidden');
  $('editorHeading').textContent=page?'Edit page':'Create page';
  $('pageId').value=page?.id||'';
  $('pageSlug').dataset.touched=page?'true':'false';
  $('pageTitle').value=page?.title||'';
  $('pageSlug').value=page?.slug||'';
  $('pageType').value=page?.page_type||'page';
  $('pageStatus').value=page?.status||'draft';
  $('seoTitle').value=page?.seo_title||'';
  $('seoDescription').value=page?.seo_description||'';
  $('canonicalUrl').value=page?.canonical_url||'';
  $('robotsIndex').checked=page?.robots_index!==false;
  $('ogImagePath').value=page?.og_image_path||'';
  $('pageContent').value=JSON.stringify(page?.content||{sections:[]},null,2);
  updateCounters();
  $('pageEditor').scrollIntoView({behavior:'smooth',block:'start'});
}
function updateCounters(){$('seoTitleCount').textContent=$('seoTitle').value.length;$('seoDescCount').textContent=$('seoDescription').value.length;}
async function saveRevision(page,note='Before update') {
  const {error}=await supabase.from('cms_revisions').insert({page_id:page.id,snapshot:pageSnapshot(page),note,created_by:state.user.id});
  if(error) throw error;
}
async function savePage(event) {
  event.preventDefault();
  let content;
  try {content=JSON.parse($('pageContent').value);} catch {showNotice('Content JSON is invalid. Fix the JSON before saving.',true);return;}
  if(!content||typeof content!=='object'||Array.isArray(content)){showNotice('Content must be a JSON object.',true);return;}
  const id=$('pageId').value;
  const existing=state.pages.find(p=>p.id===id);
  const status=$('pageStatus').value;
  const payload={
    title:$('pageTitle').value.trim(),slug:$('pageSlug').value.trim(),page_type:$('pageType').value,status,
    content,seo_title:$('seoTitle').value.trim()||null,seo_description:$('seoDescription').value.trim()||null,
    canonical_url:$('canonicalUrl').value.trim()||null,robots_index:$('robotsIndex').checked,
    og_image_path:$('ogImagePath').value.trim()||null,
    published_at:status==='published'?(existing?.published_at||new Date().toISOString()):null,
    updated_by:state.user.id,updated_at:new Date().toISOString()
  };
  const button=$('savePageBtn');button.disabled=true;button.textContent='Saving…';
  try {
    if(existing) await saveRevision(existing,'Automatic snapshot before editing');
    let result;
    if(existing) result=await supabase.from('cms_pages').update(payload).eq('id',id).select().single();
    else result=await supabase.from('cms_pages').insert({...payload,created_by:state.user.id}).select().single();
    if(result.error) throw result.error;
    if(!existing){
      const rev=await supabase.from('cms_revisions').insert({page_id:result.data.id,snapshot:pageSnapshot(result.data),note:'Initial saved version',created_by:state.user.id});
      if(rev.error) throw rev.error;
    }
    $('pageEditor').classList.add('hidden');await refreshAll();showNotice('Page saved to the CompanyFlow CMS. This does not publish changes to the live website yet.');
  } catch(error){showNotice('Could not save page: '+error.message,true);}
  finally{button.disabled=false;button.textContent='Save page';}
}
async function deletePage(id) {
  const page=state.pages.find(p=>p.id===id);if(!page)return;
  if(!confirm('Archive "'+page.title+'" instead of permanently deleting it?'))return;
  const {error}=await supabase.from('cms_pages').update({status:'archived',updated_at:new Date().toISOString(),updated_by:state.user.id}).eq('id',id);
  if(error){showNotice('Could not archive page: '+error.message,true);return;}
  await refreshAll();showNotice('Page archived. Its revision history is retained.');
}
function previewPage(id) {
  const page=state.pages.find(p=>p.id===id);if(!page)return;
  const win=window.open('about:blank','_blank');
  if(!win){showNotice('Please allow pop-ups to preview the structured content.',true);return;}
  win.opener=null;
  const safe=escapeHtml(JSON.stringify(page.content,null,2));
  win.document.write('<!doctype html><html><head><title>'+escapeHtml(page.title)+' — CMS content preview</title><meta name="robots" content="noindex,nofollow"><style>body{font:14px system-ui;max-width:900px;margin:40px auto;padding:0 20px;color:#17202b}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f4f7f9;padding:20px;border-radius:10px}</style></head><body><h1>'+escapeHtml(page.title)+'</h1><p>This is a structured content preview, not the rendered public page.</p><pre>'+safe+'</pre></body></html>');
  win.document.close();
}
function renderAssets() {
  const grid=$('mediaGrid');
  if(!state.assets.length){grid.innerHTML='<div class="panel empty-state">Your media library is empty. Upload your first asset.</div>';return;}
  grid.innerHTML=state.assets.map(asset=>{
    const {data}=supabase.storage.from('cms-media').getPublicUrl(asset.storage_path);
    const image=(asset.mime_type||'').startsWith('image/');
    return '<article class="media-card"><div class="media-preview">'+(image?'<img loading="lazy" src="'+escapeHtml(data.publicUrl)+'" alt="'+escapeHtml(asset.alt_text||asset.file_name)+'">':'<span>▧</span>')+'</div><div class="media-info"><b title="'+escapeHtml(asset.file_name)+'">'+escapeHtml(asset.file_name)+'</b><small>'+escapeHtml(asset.mime_type||'file')+' · '+Math.max(1,Math.round((asset.byte_size||0)/1024))+' KB</small><a href="'+escapeHtml(data.publicUrl)+'" target="_blank" rel="noopener">Open asset ↗</a><div class="table-actions"><button data-copy-url="'+escapeHtml(data.publicUrl)+'">Copy URL</button><button data-delete-asset="'+escapeHtml(asset.id)+'">Delete</button></div></div></article>';
  }).join('');
}
async function uploadFiles(files) {
  for(const file of files) {
    if(file.size>10*1024*1024){showNotice(file.name+' exceeds 10 MB and was skipped.',true);continue;}
    const safeName=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'asset';
    const path=new Date().toISOString().slice(0,10)+'/'+crypto.randomUUID()+'-'+safeName;
    const {error:uploadError}=await supabase.storage.from('cms-media').upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false});
    if(uploadError){showNotice('Upload failed for '+file.name+': '+uploadError.message,true);continue;}
    const {error:rowError}=await supabase.from('cms_assets').insert({storage_path:path,file_name:file.name,mime_type:file.type||null,byte_size:file.size,created_by:state.user.id});
    if(rowError){await supabase.storage.from('cms-media').remove([path]);showNotice('Asset record failed: '+rowError.message,true);}
  }
  $('mediaUpload').value='';await refreshAll();showNotice('Upload process finished.');
}
async function deleteAsset(id) {
  const asset=state.assets.find(a=>a.id===id);if(!asset||!confirm('Delete media asset "'+asset.file_name+'"? Any pages using it may lose the image.'))return;
  const {error:storageError}=await supabase.storage.from('cms-media').remove([asset.storage_path]);
  if(storageError){showNotice('Storage delete failed: '+storageError.message,true);return;}
  const {error}=await supabase.from('cms_assets').delete().eq('id',id);
  if(error){showNotice('Asset record delete failed: '+error.message,true);return;}
  await refreshAll();showNotice('Asset deleted.');
}
function renderSeo() {
  const pages=state.pages;
  $('seoMissingTitle').textContent=pages.filter(p=>!p.seo_title?.trim()).length;
  $('seoMissingDesc').textContent=pages.filter(p=>!p.seo_description?.trim()).length;
  $('seoMissingCanonical').textContent=pages.filter(p=>!p.canonical_url?.trim()).length;
  $('seoNoIndex').textContent=pages.filter(p=>p.robots_index===false).length;
  renderTable('seoTable',['Page','SEO title','Description','Canonical','Indexing','Action'],pages.map(p=>'<tr><td><b>'+escapeHtml(p.title)+'</b><small>/'+escapeHtml(p.slug)+'/</small></td><td>'+escapeHtml(short(p.seo_title||'Missing',36))+'</td><td>'+escapeHtml(short(p.seo_description||'Missing',46))+'</td><td>'+escapeHtml(p.canonical_url?'Set':'Missing')+'</td><td>'+escapeHtml(p.robots_index===false?'No-index':'Indexable')+'</td><td><div class="table-actions"><button data-edit-page="'+escapeHtml(p.id)+'">Edit SEO</button></div></td></tr>'),'No pages are stored in the CMS yet.');
}
function renderSettings() {
  renderTable('settingsTable',['Key','Value','Updated','Action'],state.settings.map(s=>'<tr><td><b>'+escapeHtml(s.setting_key)+'</b></td><td>'+escapeHtml(short(JSON.stringify(s.setting_value),85))+'</td><td>'+escapeHtml(fmtDate(s.updated_at))+'</td><td><div class="table-actions"><button data-edit-setting="'+escapeHtml(s.setting_key)+'">Edit</button><button data-delete-setting="'+escapeHtml(s.setting_key)+'">Delete</button></div></td></tr>'),'No global settings saved yet.');
}
async function saveSetting(event) {
  event.preventDefault();let value;
  try{value=JSON.parse($('settingValue').value);}catch{showNotice('Setting value must be valid JSON.',true);return;}
  const key=$('settingKey').value.trim();
  const {error}=await supabase.from('cms_settings').upsert({setting_key:key,setting_value:value,updated_by:state.user.id,updated_at:new Date().toISOString()});
  if(error){showNotice('Could not save setting: '+error.message,true);return;}
  await refreshAll();$('settingKey').readOnly=false;showNotice('Setting saved.');
}
async function loadRevisions() {
  const {data,error}=await supabase.from('cms_revisions').select('*, cms_pages(title,slug)').order('created_at',{ascending:false}).limit(100);
  if(error){showNotice('Could not load revision history: '+error.message,true);return;}
  state.revisions=data||[];
  renderTable('revisionsTable',['Page','Revision note','Created','Actions'],state.revisions.map(r=>{
    const p=r.cms_pages||{};
    return '<tr><td><b>'+escapeHtml(p.title||'Deleted page')+'</b><small>/'+escapeHtml(p.slug||'')+'/</small></td><td>'+escapeHtml(r.note||'Saved revision')+'</td><td>'+escapeHtml(fmtDate(r.created_at))+'</td><td><div class="table-actions"><button data-restore-revision="'+escapeHtml(r.id)+'">Restore snapshot</button><button data-view-revision="'+escapeHtml(r.id)+'">View JSON</button></div></td></tr>';
  }),'No revisions yet. Save a page to create its first snapshot.');
}
async function viewRevision(id) {
  const r=state.revisions.find(x=>x.id===id);if(!r)return;
  const win=window.open('','_blank','noopener,noreferrer');if(!win){showNotice('Please allow pop-ups to view revision JSON.',true);return;}
  win.opener=null;
  win.document.write('<!doctype html><html><head><title>CMS revision</title><meta name="robots" content="noindex,nofollow"><style>body{font:13px system-ui;max-width:900px;margin:35px auto;padding:0 20px}pre{white-space:pre-wrap;background:#f5f7fa;padding:18px}</style></head><body><h1>Revision snapshot</h1><pre>'+escapeHtml(JSON.stringify(r.snapshot,null,2))+'</pre></body></html>');win.document.close();
}
async function restoreRevision(id) {
  const rev=state.revisions.find(r=>r.id===id);if(!rev)return;
  const page=state.pages.find(p=>p.id===rev.page_id);
  if(!page){showNotice('The original page no longer exists. Create it again manually before restoring.',true);return;}
  if(!confirm('Restore the saved CMS fields for "'+page.title+'"? A new snapshot of the current version will be created first.'))return;
  try {
    await saveRevision(page,'Automatic snapshot before restore');
    const s=rev.snapshot;
    const {error}=await supabase.from('cms_pages').update({...s,updated_by:state.user.id,updated_at:new Date().toISOString()}).eq('id',page.id);
    if(error)throw error;
    await refreshAll();await loadRevisions();showNotice('Snapshot restored in CMS. The public site has not been changed.');
  }catch(e){showNotice('Restore failed: '+e.message,true);}
}
async function deleteSetting(key) {
  if(!confirm('Delete setting "'+key+'"?'))return;
  const {error}=await supabase.from('cms_settings').delete().eq('setting_key',key);
  if(error){showNotice('Delete failed: '+error.message,true);return;}
  await refreshAll();showNotice('Setting deleted.');
}

$('passwordLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const email=$('adminEmail').value.trim();
  const password=$('adminPassword').value;
  const button=$('passwordLoginBtn');
  button.disabled=true;button.textContent='Signing in…';
  setAuthMessage('Checking admin credentials…');
  try {
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    if(!(await isAdminSession(data.session))) {
      await supabase.auth.signOut();
      setAuthMessage('This account is not authorised for CompanyFlow administration.',true);
      return;
    }
    await handleSession(data.session);
  } catch(error) {
    setAuthMessage(error.message==='Invalid login credentials'?'Email or password is incorrect.':error.message,true);
  } finally {
    button.disabled=false;button.textContent='Sign in';
  }
});
supabase.auth.onAuthStateChange((_event,session)=>{window.setTimeout(()=>handleSession(session),0);});
$('signOutBtn').addEventListener('click',async()=>{await supabase.auth.signOut();location.reload();});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
$('newPageBtn').addEventListener('click',()=>openEditor());
$('closeEditorBtn').addEventListener('click',()=>$('pageEditor').classList.add('hidden'));
$('cancelEditorBtn').addEventListener('click',()=>$('pageEditor').classList.add('hidden'));
$('pageForm').addEventListener('submit',savePage);
$('pageTitle').addEventListener('input',()=>{if(!$('pageId').value||!$('pageSlug').dataset.touched)$('pageSlug').value=$('pageTitle').value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');});
$('pageSlug').addEventListener('input',()=>{$('pageSlug').dataset.touched='true';});
$('seoTitle').addEventListener('input',updateCounters);$('seoDescription').addEventListener('input',updateCounters);
$('pageSearch').addEventListener('input',renderPages);$('pageStatusFilter').addEventListener('change',renderPages);
$('mediaUpload').addEventListener('change',e=>uploadFiles([...e.target.files]));
$('refreshSeoBtn').addEventListener('click',renderSeo);
$('settingsForm').addEventListener('submit',saveSetting);
$('refreshSettingsBtn').addEventListener('click',async()=>{const r=await supabase.from('cms_settings').select('*').order('setting_key');if(r.error)showNotice(r.error.message,true);else{state.settings=r.data||[];renderSettings();}});
$('refreshRevisionsBtn').addEventListener('click',loadRevisions);
$('footerYear').textContent=new Date().getFullYear();

document.addEventListener('click',async e=>{
  const edit=e.target.closest('[data-edit-page]');if(edit){const page=state.pages.find(p=>p.id===edit.dataset.editPage);if(page){navigate('pages');openEditor(page);}return;}
  const preview=e.target.closest('[data-preview-page]');if(preview){previewPage(preview.dataset.previewPage);return;}
  const delAsset=e.target.closest('[data-delete-asset]');if(delAsset){await deleteAsset(delAsset.dataset.deleteAsset);return;}
  const copy=e.target.closest('[data-copy-url]');if(copy){try{await navigator.clipboard.writeText(copy.dataset.copyUrl);showNotice('Public asset URL copied.');}catch{showNotice('Could not access clipboard; open the asset and copy its URL.',true);}return;}
  const editSetting=e.target.closest('[data-edit-setting]');if(editSetting){const setting=state.settings.find(s=>s.setting_key===editSetting.dataset.editSetting);if(setting){$('settingKey').value=setting.setting_key;$('settingKey').readOnly=true;$('settingValue').value=JSON.stringify(setting.setting_value,null,2);navigate('settings');$('settingsForm').scrollIntoView({behavior:'smooth'});}return;}
  const delSetting=e.target.closest('[data-delete-setting]');if(delSetting){await deleteSetting(delSetting.dataset.deleteSetting);return;}
  const restore=e.target.closest('[data-restore-revision]');if(restore){await restoreRevision(restore.dataset.restoreRevision);return;}
  const view=e.target.closest('[data-view-revision]');if(view){viewRevision(view.dataset.viewRevision);}
});


try {
  const {data,error}=await supabase.auth.getSession();
  if(error) setAuthMessage('Auth check failed: '+error.message,true);
  else await handleSession(data.session);
} catch(e) { setAuthMessage('Could not connect to the CMS authentication service.',true); }
