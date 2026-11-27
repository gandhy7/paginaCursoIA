(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 // Reveal effects never hide content before JavaScript or depend on a timer.
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(!reduced&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);entry.target.animate?.([{opacity:.3,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.2,.65,.3,1)',fill:'none'});}}, {threshold:.08});
  document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element));
 }
 // Side navigation and quick actions reuse the existing accessible tabs.
 const shortcuts=Array.from(document.querySelectorAll('[data-jump]'));
 function syncNavigation(){shortcuts.forEach(button=>{const active=$(button.getAttribute('data-jump'))?.getAttribute('aria-selected')==='true';button.classList.toggle('is-active',active);if(button.classList.contains('workspace-nav-item')){if(active)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');}});}
 shortcuts.forEach(button=>button.addEventListener('click',()=>{
  const tab=$(button.getAttribute('data-jump'));if(!tab)return;tab.click();syncNavigation();
  const field=$(button.getAttribute('data-focus'));
  if(field){const editor=field.closest('details');if(editor)editor.open=true;field.focus();}
  else{$(tab.getAttribute('aria-controls'))?.scrollIntoView({block:'start',behavior:reduced?'auto':'smooth'});}
 }));
 const tabs=document.querySelectorAll('[role="tab"]');
 tabs.forEach(tab=>{tab.addEventListener('click',syncNavigation);tab.addEventListener('keydown',syncNavigation);});
 if('MutationObserver' in window&&tabs.length){const observer=new MutationObserver(syncNavigation);tabs.forEach(tab=>observer.observe(tab,{attributes:true,attributeFilter:['aria-selected']}));}
 syncNavigation();
 // Useful drafting feedback, calculated from the real brief, without saving it.
 const required=['brief-name','brief-goal','brief-inputs','brief-outputs','brief-limits','brief-acceptance'];
 if($('brief-progress')){const update=()=>{const n=required.filter(id=>$(id)?.value.trim()).length;$('brief-progress').value=n;$('brief-completeness').textContent=n+' de 6 campos clave';};$('brief-form').addEventListener('input',update);$('brief-form').addEventListener('reset',()=>setTimeout(update,0));document.addEventListener('click',()=>setTimeout(update,0));update();}
 document.querySelectorAll('[data-copy-target]').forEach(button=>button.addEventListener('click',async()=>{
  const target=$(button.getAttribute('data-copy-target'));if(!target?.textContent)return;
  const status=$('copy-status');try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(target.textContent);if(status)status.textContent='Guion copiado. Puedes revisarlo en tu correo antes de enviarlo.';}
  catch{if(status)status.textContent='Selecciona el guion y cópialo con el menú de tu dispositivo.';if(window.getSelection&&document.createRange){const range=document.createRange();range.selectNodeContents(target);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}}
 }));
 // The commercial entry point remembers only the chosen topic; it stores no visitor data.
 if($('contact-topic')){const topic=new URLSearchParams(window.location.search).get('tema');const map={seguridad:'Evaluación de seguridad',seguimiento:'Seguimiento administrativo',procesos:'Automatización de procesos'};if(map[topic]&&Array.from($('contact-topic').options).some(option=>option.value===map[topic]))$('contact-topic').value=map[topic];}
 const hashForm=$('hash-playground');
 if(hashForm){
  let lastHash='',lastInput='',sequence=0;
  const input=$('hash-input'),output=$('hash-current'),status=$('hash-status');
  input.addEventListener('input',()=>{sequence++;output.textContent='El contenido cambió. Calcula su nueva huella.';status.textContent='El resultado anterior no corresponde todavía a este contenido.';});
  $('hash-change').addEventListener('click',()=>{if(input.value.length>=4000){status.textContent='El texto llegó a su límite de 4.000 caracteres.';return;}input.value+='.';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();});
  hashForm.addEventListener('submit',async event=>{
   event.preventDefault();const value=input.value;if(!value){status.textContent='Escribe un texto para calcular su huella.';input.focus();return;}
   if(!window.crypto?.subtle){status.textContent='El cálculo requiere un navegador compatible y una dirección HTTPS. Abre esta página publicada para usarlo.';return;}
   const job=++sequence;status.textContent='Calculando SHA-256…';
   try{const digest=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));if(job!==sequence)return;const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(lastHash){$('hash-previous').textContent=lastHash;$('hash-previous-panel').hidden=false;}
    output.textContent=hash;status.textContent=!lastHash?'Huella calculada. Cambia una letra o añade un punto para comparar.':value===lastInput?'El mismo contenido produce la misma huella.':hash!==lastHash?'El contenido cambió y su huella también. Compara ambos resultados.':'Los contenidos produjeron la misma huella.';
    lastHash=hash;lastInput=value;
   }catch{if(job===sequence)status.textContent='No se pudo calcular la huella. Puedes volver a intentarlo.';}
  });
 }
})();
