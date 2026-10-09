(function(){
  function activateTab(button, buttons, panels, activeClass){
    var index=Array.prototype.indexOf.call(buttons,button);
    buttons.forEach(function(b,i){b.classList.toggle('is-active',i===index);});
    panels.forEach(function(p,i){p.classList.toggle('is-active',i===index);});
  }
  document.querySelectorAll('.cfs-mega').forEach(function(menu){
    var tabs=menu.querySelectorAll('.cfs-tab'), panels=menu.querySelectorAll('.cfs-panel');
    tabs.forEach(function(tab){tab.addEventListener('click',function(){activateTab(tab,tabs,panels);});});
  });
  document.querySelectorAll('.sv-tabs').forEach(function(group){
    var section=group.closest('.sv-tech')||group.parentElement;
    var tabs=group.querySelectorAll('.sv-tabbtn'), panels=section.querySelectorAll('.sv-techpanel');
    tabs.forEach(function(tab){tab.addEventListener('click',function(){activateTab(tab,tabs,panels);});});
  });
  document.querySelectorAll('.cfs-toggle').forEach(function(toggle){
    toggle.addEventListener('click',function(){
      var menu=toggle.closest('.cfs-header').querySelector('.cfs-mobile');
      var open=menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded',open?'true':'false');
      toggle.setAttribute('aria-label',open?'Close menu':'Open menu');
    });
  });
  document.querySelectorAll('.cfs-navbtn').forEach(function(button){
    button.addEventListener('click',function(event){
      var dd=button.closest('.cfs-dd');
      if(!dd)return;
      if(window.matchMedia('(hover: none)').matches){event.preventDefault();dd.classList.toggle('is-open');}
    });
  });
  document.querySelectorAll('#cfs-form').forEach(function(form){
    form.addEventListener('submit',function(event){
      event.preventDefault();
      var fields=new FormData(form), email=String(fields.get('email')||'').trim();
      var note=form.querySelector('#cfs-note');
      if(!String(fields.get('first')||'').trim()||!email||!String(fields.get('message')||'').trim()){
        note.hidden=false;note.textContent='Please complete your first name, email and message.';return;
      }
      var subject=form.getAttribute('data-subject')||'CompanyFlow enquiry';
      var lines=[];fields.forEach(function(value,key){lines.push(key+': '+value);});
      note.hidden=false;note.textContent='Your email app will open with your enquiry details. Please send the prepared message to complete your request.';
      window.location.href='mailto:alihotspot1@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));
    });
  });
  if('IntersectionObserver' in window){
    var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.style.animationPlayState='running';observer.unobserve(entry.target);}});},{threshold:.08});
    document.querySelectorAll('.sv-rv').forEach(function(el){el.style.animationPlayState='paused';observer.observe(el);});
  }

  // Use contextual photography on the newly added solution pages instead of generic SVG mockups.
  var solutionVisuals = {
    'ai-automation':'photo-1677442136019-21780ecad995',
    'ai-sales-agents':'photo-1551434678-e076c223a692',
    'ai-solutions':'photo-1677442136019-21780ecad995',
    'analytics-tracking':'photo-1460925895917-afdab827c52f',
    'application-hardening':'photo-1550751827-4bd374c3f58b',
    'authentication-access':'photo-1555949963-ff9fe0c870eb',
    'business-intelligence':'photo-1460925895917-afdab827c52f',
    'business-management-systems':'photo-1556761175-b413da4baf72',
    'cloud-infrastructure':'photo-1451187580459-43490279c0fa',
    'content-systems':'photo-1497366754035-f200968a6e72',
    'conversion-focused-landing-pages':'photo-1460925895917-afdab827c52f',
    'creative-digital-experiences':'photo-1558655146-9f40138edfeb',
    'custom-business-software':'photo-1551288049-bebda4e38f71',
    'digital-growth':'photo-1552664730-d307ca884978',
    'documentation-training':'photo-1516321318423-f06f85e504b3',
    'domain-hosting':'photo-1451187580459-43490279c0fa',
    'ecommerce-development':'photo-1556742049-0cfed4f6a45d',
    'lead-generation':'photo-1552581234-26160f608093',
    'mobile-web-apps':'photo-1512941937669-90a1b58e7e9c',
    'performance-marketing':'photo-1460925895917-afdab827c52f',
    'product-ui-ux':'photo-1586717791821-3f44a563fa4c',
    'reliable-backups':'photo-1518770660439-4636190af475',
    'secure-business-systems':'photo-1550751827-4bd374c3f58b',
    'security-reviews':'photo-1563013544-824ae1b704d3',
    'seo':'photo-1432888622747-4eb9a8efeb07',
    'technical-documentation':'photo-1516321318423-f06f85e504b3',
    'ui-ux-product-design':'photo-1586717791821-3f44a563fa4c',
    'website-content':'photo-1455390582262-044cdead277a',
    'websites-landing-pages':'photo-1460925895917-afdab827c52f',
    'workflow-automation':'photo-1556761175-b413da4baf72',
    'staff-augmentation':'photo-1521737711867-e3b97375f902',
    'project-base':'photo-1460925895917-afdab827c52f'
  };
  var slug = location.pathname.replace(/\/+$/, '').split('/').pop();
  var photo = solutionVisuals[slug];
  if (photo) {
    var stockImage = 'https://images.unsplash.com/' + photo + '?auto=format&fit=crop&w=1400&q=85';
    // Apply the page-specific image to the hero illustration and the About Services collage.
    document.querySelectorAll('.sv-art').forEach(function(art){
      art.style.backgroundImage = 'linear-gradient(180deg,rgba(10,20,16,.08),rgba(10,20,16,.22)),url("' + stockImage + '")';
      art.style.backgroundSize = 'cover';
      art.style.backgroundPosition = 'center';
      art.querySelectorAll('svg').forEach(function(svg){svg.style.display='none';});
    });
    // Use wording that matches Glaxit's original company messaging.
    document.querySelectorAll('.sv-chip').forEach(function(chip,index){
      var icon=chip.querySelector('i');
      chip.textContent='';
      if(icon)chip.appendChild(icon);
      chip.appendChild(document.createTextNode(index===0?'Our Vision':'Our Mission'));
    });
    var collage = document.querySelector('.sv-collage');
    if (collage) {
      collage.style.backgroundImage = 'linear-gradient(180deg,rgba(10,20,16,.04),rgba(10,20,16,.28)),url("' + stockImage + '")';
      collage.style.backgroundSize = 'cover';
      collage.style.backgroundPosition = 'center';
      collage.querySelectorAll('.big,.small').forEach(function(el){
        el.style.background = 'rgba(255,255,255,.12)';
        el.style.backdropFilter = 'blur(2px)';
      });
    }
  }
})();

/* CompanyFlow footer newsletter forms -> Google Forms response storage */
(function(){
  var endpoint='https://docs.google.com/forms/d/e/1FAIpQLSeLpYPYRNYqacT73pIK3WpSHHnsVUKbq_H24jbR_NLoL9HBJg/formResponse';
  function connectNewsletter(form){
    if(form.dataset.cfGoogleConnected==='true') return;
    form.dataset.cfGoogleConnected='true';
    form.addEventListener('submit',function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      var emailInput=form.querySelector('input[type="email"],input[name*="email" i]');
      if(!emailInput || !emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value.trim())){
        if(emailInput){emailInput.setCustomValidity('Please enter a valid email address.');emailInput.reportValidity();emailInput.addEventListener('input',function(){emailInput.setCustomValidity('');},{once:true});}
        return;
      }
      var button=form.querySelector('button[type="submit"],button:not([type])');
      var original=button ? button.innerHTML : '';
      if(button){button.disabled=true;button.innerHTML='Sending…';}
      var fields={
        'entry.1586367275':'Newsletter',
        'entry.302503920':'Subscriber',
        'entry.1886860072':emailInput.value.trim(),
        'entry.640535184':'',
        'entry.87836562':'Newsletter subscription request',
        'entry.1859604813':'Website footer newsletter'
      };
      var data=new URLSearchParams();
      Object.keys(fields).forEach(function(key){data.append(key,fields[key]);});
      fetch(endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data.toString(),keepalive:true}).then(function(){
        if(button){button.innerHTML='Subscribed ✓';}
        form.reset();
        var note=form.querySelector('.cf-newsletter-status');
        if(!note){note=document.createElement('p');note.className='cf-newsletter-status';note.setAttribute('role','status');note.style.cssText='font-size:12px;margin:8px 0 0;color:inherit';form.appendChild(note);}
        note.textContent='Thanks — your email has been submitted.';
        setTimeout(function(){if(button){button.disabled=false;button.innerHTML=original;}},2200);
      }).catch(function(){
        if(button){button.disabled=false;button.innerHTML=original;}
        var note=form.querySelector('.cf-newsletter-status');
        if(!note){note=document.createElement('p');note.className='cf-newsletter-status';note.setAttribute('role','status');note.style.cssText='font-size:12px;margin:8px 0 0;color:inherit';form.appendChild(note);}
        note.textContent='Could not submit right now. Please try again.';
      });
    },true);
  }
  document.querySelectorAll('form.gx-footer-form').forEach(connectNewsletter);
})();
