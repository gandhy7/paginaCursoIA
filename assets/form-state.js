(function(global){
 'use strict';
 global.DraftGuard={attach:function(ids){
  const forms=ids.map(id=>{const form=document.getElementById(id);if(!form)throw Error('No existe el formulario '+id);const note=document.createElement('p');note.className='draft-note';note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.textContent='Tienes cambios sin guardar. Guárdalos para incluirlos en tus archivos exportados.';note.hidden=true;form.append(note);const record={id,form,note,dirty:false};const mark=()=>{record.dirty=true;note.hidden=false;};form.addEventListener('input',mark);form.addEventListener('change',mark);return record;});
  const any=()=>forms.some(r=>r.dirty);
  if(global.addEventListener)global.addEventListener('beforeunload',event=>{if(any()){event.preventDefault();event.returnValue='';}});
  return {any,clean:function(id){const r=forms.find(r=>r.id===id);if(r){r.dirty=false;r.note.hidden=true;}},discard:function(id){const r=forms.find(r=>r.id===id);return !r?.dirty||global.confirm('Tienes cambios sin guardar en este formulario. ¿Descartarlos y continuar?');},allowSavedExport:function(){return !any()||global.confirm('Tienes cambios sin guardar. El archivo incluirá solo los registros guardados. ¿Continuar con esa exportación?');}};
 }};
})(window);
