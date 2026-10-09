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
})();
