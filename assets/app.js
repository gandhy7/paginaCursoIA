(function(){
 'use strict';
 const $=id=>document.getElementById(id),toggle=$('nav-toggle'),nav=$('site-nav');
 if (toggle && nav) {
  const setMenu = open => {
   toggle.setAttribute('aria-expanded', String(open));
   nav.classList.toggle('is-open', open);
  };
  const onEscape = event => {
   if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    toggle.focus();
   }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  toggle.addEventListener('keydown', onEscape);
  nav.addEventListener('keydown', onEscape);
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
 }
 document.querySelectorAll('[data-config]').forEach(a=>{const key=a.getAttribute('data-config'),value=window.SITE_LINKS?.[key];try{if(!value)return;const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password)return;a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.hidden=false;}catch{}});
 const form=$('contact-form');if(!form)return;let draft='';
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const name=$('contact-name').value.trim(),email=$('contact-email').value.trim(),topic=$('contact-topic').value.trim(),message=$('contact-message').value.trim();if(!name||!email||!message)return;draft='Nombre: '+name+'\nCorreo: '+email+'\nTema: '+topic+'\n\n'+message;const recipient=document.body.getAttribute('data-recipient');$('contact-preview').textContent=draft;$('contact-result').hidden=false;$('contact-mail').href='mailto:'+encodeURIComponent(recipient)+'?subject='+encodeURIComponent('Consulta · '+topic)+'&body='+encodeURIComponent(draft);$('contact-status').textContent='Borrador preparado. Revisa el texto y ábrelo en tu correo para enviarlo. También puedes copiarlo.';$('contact-result').scrollIntoView({behavior:'auto',block:'nearest'});});
 form.addEventListener('input',()=>{draft='';$('contact-result').hidden=true;$('contact-mail').removeAttribute('href');$('contact-status').textContent='';});
 $('contact-copy').addEventListener('click',async()=>{if(!draft)return;try{if(!navigator.clipboard?.writeText)throw Error('clipboard');await navigator.clipboard.writeText(draft);$('contact-status').textContent='Texto copiado. Puedes pegarlo en tu aplicación de correo.';}catch{$('contact-status').textContent='Este navegador no permite copiar automáticamente. Selecciona el borrador y cópialo manualmente.';const selection=window.getSelection?.();if(selection&&document.createRange){const range=document.createRange();range.selectNodeContents($('contact-preview'));selection.removeAllRanges();selection.addRange(range);}}});
})();
