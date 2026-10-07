/* CompanyFlow frontend behavior migrated from the existing clone. */

(function(){
  /*
   * Keep the original Glaxit Swiper/Elementor carousel intact.
   * Only replace the six project contents with CompanyFlow projects.
   * data-swiper-slide-index identifies the real slide even when Swiper creates clones.
   */
  var projects=[
    {
      title:'LabStacks',
      image:'./wp-content/uploads/2025/01/LabStacks.webp',
      desc:'A multi-tenant diagnostic laboratory platform built for modern healthcare operations.',
      url:'./blog/case-study/healthcare/'
    },
    {
      title:'Destino Travels',
      image:'./wp-content/uploads/2025/01/Destino.webp',
      desc:'A complete travel operations portal for flights, hotels, bookings, agents and customer workflows.',
      url:'./blog/case-study/travel-transportation/'
    },
    {
      title:'Aurum Accessories',
      image:'./wp-content/uploads/2025/01/Aurum.webp',
      desc:'A performance-focused ecommerce experience engineered for a premium accessories brand.',
      url:'./blog/case-study/ecommerce-retail/'
    },
    {
      title:'CompanyFlow',
      image:'./wp-content/uploads/2025/01/CompanyFlow.webp',
      desc:'A digital product studio platform bringing software, websites, ecommerce and automation together.',
      url:'./blog/case-study/business-software/'
    },
    {
      title:'AgentHub',
      image:'./wp-content/uploads/2025/01/AgentHub.webp',
      desc:'An AI-powered sales and WhatsApp automation platform built around real business conversations.',
      url:'./blog/case-study/ai-automation/'
    },
    {
      title:'AI Sales Agent',
      image:'./wp-content/uploads/2025/01/AISalesAgent.webp',
      desc:'An AI sales agent that discovers prospects, enriches leads and supports automated outreach.',
      url:'./blog/case-study/ai-automation/'
    }
  ];

  function applyProjects(){
    var carousel=document.querySelector('.elementor-element-0c05614 .elementor-loop-container');
    if(!carousel) return;

    var slides=Array.from(carousel.querySelectorAll('.swiper-slide'));
    if(!slides.length) return;

    slides.forEach(function(slide){
      var index=parseInt(slide.getAttribute('data-swiper-slide-index'),10);
      if(isNaN(index) || !projects[index]) return;

      var item=projects[index];

      var titleEl=slide.querySelector('.elementor-element-44e3b4d .elementor-heading-title,.elementor-heading-title');
      if(titleEl) titleEl.textContent=item.title;

      var img=slide.querySelector('.elementor-element-faa9c6a img,img');
      if(img){
        img.src=item.image;
        img.setAttribute('data-src',item.image);
        img.removeAttribute('data-srcset');
        img.removeAttribute('data-lazy-src');
        img.removeAttribute('data-lazyloaded');
      }

      var desc=slide.querySelector('.elementor-widget-text-editor');
      if(desc) desc.innerHTML='<p>'+item.desc+'</p>';

      var link=slide.querySelector('.elementor-element-f11d2fd a,.elementor-widget-button a');
      if(link){
        link.href=item.url;
        link.removeAttribute('data-elementor-open-lightbox');
      }

      slide.dataset.companyflowProject=item.title;
    });

    if(carousel.swiper){
      carousel.swiper.params.slidesPerView=4;
      carousel.swiper.params.slidesPerGroup=1;
      carousel.swiper.params.spaceBetween=20;
      carousel.swiper.params.autoplay={
        delay:300,
        disableOnInteraction:false,
        pauseOnMouseEnter:true
      };
      carousel.swiper.params.speed=1400;
      carousel.swiper.update();
    }
  }

  function start(){
    applyProjects();
    setTimeout(applyProjects,250);
    setTimeout(applyProjects,1000);
    setTimeout(applyProjects,2000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start);
  }else{
    start();
  }
})();

(function(){
  function smoothTo(hash){
    if(!hash || hash==='#') return false;
    var target=document.querySelector(hash);
    if(!target) return false;
    var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    if(history.replaceState) history.replaceState(null,'',hash);
    return true;
  }

  function openOffCanvas(){
    var panel=document.getElementById('off-canvas-20b5d70');
    if(!panel) return;
    panel.setAttribute('aria-hidden','false');
    panel.removeAttribute('inert');
    document.body.classList.add('e-off-canvas-open');
    var opener=document.querySelector('[aria-controls="off-canvas-20b5d70"]');
    if(opener) opener.setAttribute('aria-expanded','true');
  }

  function closeOffCanvas(){
    var panel=document.getElementById('off-canvas-20b5d70');
    if(!panel) return;
    panel.setAttribute('aria-hidden','true');
    panel.setAttribute('inert','');
    document.body.classList.remove('e-off-canvas-open');
    var opener=document.querySelector('[aria-controls="off-canvas-20b5d70"]');
    if(opener) opener.setAttribute('aria-expanded','false');
  }

  function ensureContactModal(){
    var modal=document.getElementById('cf-contact-modal');
    if(modal) return modal;
    modal=document.createElement('div');
    modal.id='cf-contact-modal'; modal.className='cf-contact-modal'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML='<div class="cf-contact-card" role="dialog" aria-modal="true" aria-labelledby="cf-contact-title"><button type="button" class="cf-contact-close" aria-label="Close">×</button><div class="cf-contact-info"><p class="cf-contact-kicker">Contact Us</p><h2 id="cf-contact-title" class="cf-contact-title">Your Solution Starts Here<br><span>Contact Us Now</span></h2><p class="cf-contact-copy">Have questions or need assistance? Our team is here to help. Reach out today and let’s create something great together!</p><div class="cf-contact-details"><span>✦ Websites &amp; landing pages</span><span>✦ Ecommerce &amp; custom software</span><span>✦ AI &amp; business automation</span><span>✦ WhatsApp: +92 340 746 5567</span></div></div><div class="cf-contact-form-wrap"><form class="cf-contact-form" id="cf-contact-form"><div class="cf-contact-field"><label for="cf-first-name">First Name</label><input id="cf-first-name" name="firstName" required placeholder="First Name"></div><div class="cf-contact-field"><label for="cf-last-name">Last Name</label><input id="cf-last-name" name="lastName" required placeholder="Last Name"></div><div class="cf-contact-field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required placeholder="Email"></div><div class="cf-contact-field"><label for="cf-company">Company Name</label><input id="cf-company" name="company" placeholder="Company Name"></div><div class="cf-contact-field full"><label for="cf-message">Message</label><textarea id="cf-message" name="message" required placeholder="Tell us about your project"></textarea></div><div class="cf-contact-field full"><label for="cf-hear">How did you hear about us?</label><select id="cf-hear" name="hear"><option value="">Select an option</option><option>Google</option><option>LinkedIn</option><option>Facebook / Instagram</option><option>Referral</option><option>Fiverr</option><option>Other</option></select></div><label class="cf-consent"><input type="checkbox" name="consent" required><span>I consent to the processing of my personal data as outlined in the <a href="#privacy">Privacy Terms</a>.</span></label><div class="cf-recaptcha" aria-label="reCAPTCHA"><span class="cf-recaptcha-box">✓</span><span>reCAPTCHA</span><small>Privacy - Terms</small></div><button class="cf-contact-submit" type="submit">Send Request <span>→</span></button></form></div></div>'
    document.body.appendChild(modal);
    modal.querySelector('.cf-contact-close').addEventListener('click',closeContactModal);
    modal.addEventListener('click',function(e){if(e.target===modal) closeContactModal();});
    modal.querySelector('#cf-contact-form').addEventListener('submit',function(e){
      e.preventDefault();
      var f=new FormData(e.target);
      var body='Name: '+f.get('firstName')+' '+f.get('lastName')+'\nEmail: '+f.get('email')+'\nCompany: '+f.get('company')+'\nHow they heard about us: '+f.get('hear')+'\n\nProject message:\n'+f.get('message');
      window.location.href='mailto:alihotspot1@gmail.com?subject='+encodeURIComponent('New CompanyFlow project enquiry')+'&body='+encodeURIComponent(body);
      setTimeout(closeContactModal,300);
    });
    return modal;
  }
  function openContactModal(){var modal=ensureContactModal();modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('cf-modal-open');setTimeout(function(){var n=document.getElementById('cf-first-name');if(n)n.focus();},350);}
  function closeContactModal(){var modal=document.getElementById('cf-contact-modal');if(!modal)return;modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('cf-modal-open');}

  function ensureModal(){
    var modal=document.getElementById('cf-action-modal');
    if(modal) return modal;
    modal=document.createElement('div');
    modal.id='cf-action-modal';
    modal.className='cf-action-modal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML='<div class="cf-action-modal__panel" role="dialog" aria-modal="true" aria-labelledby="cf-action-title">'+
      '<button type="button" class="cf-action-modal__close" aria-label="Close">×</button>'+
      '<p class="cf-action-modal__eyebrow">CompanyFlow</p>'+
      '<h2 id="cf-action-title" class="cf-action-modal__title"></h2>'+
      '<div class="cf-action-modal__text"></div>'+
      '<a class="cf-action-modal__cta" href="#contact">Discuss this with us</a>'+
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal) closeModal();});
    modal.querySelector('.cf-action-modal__close').addEventListener('click',closeModal);
    modal.querySelector('.cf-action-modal__cta').addEventListener('click',function(){closeModal();setTimeout(function(){smoothTo('#contact')},50);});
    return modal;
  }

  function openModal(title,text){
    var modal=ensureModal();
    modal.querySelector('.cf-action-modal__title').textContent=title||'CompanyFlow';
    modal.querySelector('.cf-action-modal__text').textContent=text||'Tell us what you need and we will build the right digital solution around your business.';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('cf-modal-open');
  }
  function closeModal(){
    var modal=document.getElementById('cf-action-modal');
    if(!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('cf-modal-open');
  }

  function bind(){
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();closeContactModal();closeOffCanvas();}});
    document.addEventListener('click',function(e){
      var a=e.target.closest && e.target.closest('a');
      if(!a) return;
      var href=a.getAttribute('href')||'';
      var text=(a.textContent||'').replace(/\s+/g,' ').trim();

      if(href.indexOf('off_canvas%3Aaction%3D')>=0 || href.indexOf('action%3Doff_canvas%3Aopen')>=0){
        e.preventDefault(); e.stopImmediatePropagation(); openOffCanvas(); return;
      }
      if(href.indexOf('action%3Doff_canvas%3Aclose')>=0){
        e.preventDefault(); e.stopImmediatePropagation(); closeOffCanvas(); return;
      }
      if(a.closest && a.closest('[data-id="25m5fv"]') || href.indexOf('I3NTQ3')>=0){ e.preventDefault(); e.stopImmediatePropagation(); window.location.href='https://wa.me/923407465567?text='+encodeURIComponent('Hi CompanyFlow, I would like to discuss a project.'); return; }
      if(href.indexOf('action%3Dpopup%3Aopen')>=0){
        e.preventDefault(); e.stopImmediatePropagation();
        var card=a.closest('.elementor-loop-item,.swiper-slide,.elementor-element');
        var title=card && card.querySelector('.elementor-heading-title') ? card.querySelector('.elementor-heading-title').textContent.trim() : 'Our Services';
        var desc=card && card.querySelector('.elementor-widget-text-editor') ? card.querySelector('.elementor-widget-text-editor').textContent.replace(/\s+/g,' ').trim() : 'CompanyFlow builds digital products around the way your business works.';
        openModal(title,desc);
        return;
      }
      if((href==='#contact' || text==='Connect Now' || text==='Contact Us' || text==='Contact Us Now' || text==='Talk Now' || text==="Let's Talk" || text==='Start a Conversation' || text==='Talk to Us' || text==='Get in Touch') && !href.includes('elementor-action')){ e.preventDefault(); e.stopImmediatePropagation(); closeOffCanvas(); window.location.href='https://wa.me/923407465567?text='+encodeURIComponent('Hi CompanyFlow, I would like to discuss a project.'); return; }
      if(href.charAt(0)==='#' && href.length>1){
        if(smoothTo(href)){e.preventDefault();closeOffCanvas();}
        return;
      }
      if(href==='./'){
        e.preventDefault();closeOffCanvas();window.scrollTo({top:0,behavior:'smooth'});if(history.replaceState)history.replaceState(null,'','#top');return;
      }
    },true);

    var overlay=document.querySelector('#off-canvas-20b5d70 .e-off-canvas__overlay');
    if(overlay) overlay.addEventListener('click',closeOffCanvas);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();

(function(){
function tune(){
 var root=document.querySelector('.elementor-element-0c05614 .elementor-loop-container');
 if(!root || !root.swiper) return false;
 var s=root.swiper;
 if(s.params.loop && typeof s.loopDestroy==='function'){s.loopDestroy();}
 s.params.loop=false;
 var desired=[0,1,5,2,3,4], slides=Array.prototype.slice.call(root.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)')), by={};
 slides.forEach(function(el){by[el.getAttribute('data-swiper-slide-index')]=el;});
 desired.forEach(function(idx){if(by[idx]) root.querySelector('.swiper-wrapper').appendChild(by[idx]);});
 s.params.slidesPerGroup=1;
 s.params.slidesPerGroupAuto=false;
 s.params.slidesPerView=4;
 if(s.params.breakpoints){
   s.params.breakpoints=Object.assign({},s.params.breakpoints,{0:{slidesPerView:1,slidesPerGroup:1},768:{slidesPerView:2,slidesPerGroup:1},1025:{slidesPerView:4,slidesPerGroup:1}});
 }
 s.params.autoplay=false;
 if(s.autoplay) s.autoplay.stop();
 s.update();
 return true;
}
var n=0;var t=setInterval(function(){if(tune()||++n>30)clearInterval(t)},250);
})();

(function(){
 function format(n){return n.toLocaleString('en-US')}
 function run(el){
   if(el.dataset.cfAnimated)return;
   el.dataset.cfAnimated='1';
   var target=parseFloat(el.getAttribute('data-to-value')||el.textContent.replace(/,/g,''))||0;
   var duration=parseInt(el.getAttribute('data-duration')||'2000',10);
   var start=performance.now();
   var tick=function(now){
     var p=Math.min((now-start)/duration,1), eased=1-Math.pow(1-p,4);
     el.textContent=format(Math.round(target*eased));
     if(p<1)requestAnimationFrame(tick);else el.textContent=format(target);
   };
   requestAnimationFrame(tick);
   var box=el.closest('.elementor-counter');if(box)box.classList.add('cf-counter-visible');
 }
 function init(){
   var els=[].slice.call(document.querySelectorAll('.elementor-counter-number[data-to-value]'));
   if(!els.length)return;
   if(!('IntersectionObserver' in window)){els.forEach(run);return}
   var io=new IntersectionObserver(function(entries){
     entries.forEach(function(e){if(e.isIntersecting){run(e.target);io.unobserve(e.target)}})
   },{threshold:.35,rootMargin:'0px 0px -50px'});
   els.forEach(function(el){io.observe(el)});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
