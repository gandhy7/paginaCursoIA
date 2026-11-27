(function(global){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  function text(value,max=300,required=false){if(typeof value!=='string')throw Error('Revisa los campos de texto.');const v=value.trim();if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v)||v.length>max||required&&!v)throw Error('Hay un campo vacío, demasiado largo o con caracteres no permitidos.');return v;}
  function email(value){const v=text(value,254);if(v&&!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(v))throw Error('Escribe un correo electrónico válido.');return v;}
  function date(value,required=false){const v=text(value,10,required);if(!v)return '';if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||v<'1900-01-01'||v>'2200-12-31'||!Number.isFinite(Date.parse(v+'T12:00:00Z'))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)throw Error('Revisa la fecha: debe existir y usar AAAA-MM-DD.');return v;}
  function instant(value){const v=text(value,30,true);if(!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v)throw Error('Fecha de registro no válida.');return v;}
  function number(value,min=0,max=1e12){if(value===''||value===null||value===undefined||typeof value==='boolean')throw Error('Completa el valor numérico.');const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)throw Error('Hay un número fuera del rango permitido.');return n;}
  function choice(value,allowed){if(!allowed.includes(value))throw Error('Selecciona una opción válida.');return value;}
  function id(value){const v=text(value,90,true);if(!/^[A-Za-z0-9_-]+$/.test(v))throw Error('Identificador inválido.');return v;}
  function uid(prefix='r'){return prefix+'_'+(global.crypto?.randomUUID?global.crypto.randomUUID():Date.now().toString(36)+'_'+Math.random().toString(36).slice(2));}
  function own(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k)))throw Error('El archivo contiene una estructura o campos inesperados.');return value;}
  function makeStore(key,empty,validate){
    let data=clone(empty),persistent=true,blocked=false,message='Datos guardados solo en este navegador.';
    try{const raw=global.localStorage.getItem(key);if(raw){if(raw.length>5e6)throw Error('excess');data=validate(JSON.parse(raw));}}
    catch(_){persistent=false;blocked=true;message='No se pudo leer el almacenamiento. Trabajas en memoria; descarga un respaldo antes de salir. Los datos anteriores no se han sobrescrito.';}
    function commit(next,recover=false){const valid=validate(clone(next));if(new TextEncoder().encode(JSON.stringify(valid,null,2)).length>5000000)throw Error('El conjunto de datos supera el espacio admitido para un respaldo recuperable. Exporta una copia y reduce el contenido antes de añadir más.');data=valid;if(recover)blocked=false;if(!blocked){try{global.localStorage.setItem(key,JSON.stringify(data));persistent=true;message='Datos guardados solo en este navegador.';}catch(_){persistent=false;message='No se pudo guardar en el navegador. Tu trabajo sigue en memoria; descarga un respaldo antes de salir.';}}return clone(data);}
    return {get:()=>clone(data),change:fn=>{const next=clone(data);fn(next);return commit(next);},replace:next=>commit(next,true),status:()=>({persistent,message})};
  }
  function parseJSON(value,limit=5e6){if(typeof value==='string'){if(value.length>limit)throw Error('El archivo supera el tamaño permitido.');try{return JSON.parse(value);}catch(_){throw Error('El archivo no contiene JSON válido.');}}return clone(value);}
  function parseCSV(source){
    if(typeof source!=='string'||source.length>3e6)throw Error('El CSV supera el límite de 3 MB.');
    source=source.replace(/^\uFEFF/,'');const first=source.split(/\r?\n/,1)[0];const separator=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
    const rows=[];let row=[],cell='',quoted=false,closed=false;
    for(let i=0;i<=source.length;i++){let c=source[i];if(quoted){if(c===undefined)throw Error('El CSV contiene una comilla sin cerrar.');if(c==='"'){if(source[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
      if(c==='"'){if(cell||closed)throw Error('Comillas mal ubicadas en el CSV.');quoted=true;continue;}
      if(c===separator||c==='\n'||c==='\r'||c===undefined){row.push(cell);cell='';closed=false;if(c!==separator){if(row.some(v=>v.trim()))rows.push(row);row=[];if(c==='\r'&&source[i+1]==='\n')i++;}continue;}
      if(closed&&c.trim())throw Error('Hay texto después de una comilla de cierre.');if(!closed)cell+=c;
    }
    if(rows.length<2||rows.length>2001)throw Error('El CSV necesita una cabecera y entre 1 y 2.000 filas.');
    const headers=rows.shift().map(v=>v.trim().toLowerCase());if(new Set(headers).size!==headers.length||headers.some(x=>!x||['__proto__','constructor','prototype'].includes(x)))throw Error('Cabeceras duplicadas o no válidas.');
    return rows.map((values,i)=>{if(values.length!==headers.length)throw Error('La fila '+(i+2)+' tiene un número de columnas diferente.');return Object.fromEntries(headers.map((h,j)=>[h,values[j].trim()]));});
  }
  function csv(headers,rows){const cell=v=>{let s=String(v??'');if(typeof v!=='number'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return '\uFEFF'+[headers,...rows].map(row=>row.map(cell).join(',')).join('\r\n');}
  function download(name,contents,type='application/json;charset=utf-8'){const blob=contents instanceof Blob?contents:new Blob([contents],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  async function readFile(input,max=5e6){const file=input.files?.[0];if(!file)throw Error('Selecciona primero un archivo.');if(file.size>max)throw Error('El archivo supera el tamaño permitido.');return {name:file.name,text:await file.text()};}
  function safeURL(value){try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:'';}catch(_){return '';}}
  function zip(files){
    const encoder=new TextEncoder();const chunks=[],central=[];let offset=0;
    function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
    for(const [name,value]of Object.entries(files)){if(!/^[A-Za-z0-9_.-]+$/.test(name))throw Error('Nombre de archivo ZIP no válido.');const filename=encoder.encode(name),data=encoder.encode(value),sum=crc(data);const head=new Uint8Array(30+filename.length),h=new DataView(head.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint16(12,33,true);h.setUint32(14,sum,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,filename.length,true);head.set(filename,30);chunks.push(head,data);
      const entry=new Uint8Array(46+filename.length),v=new DataView(entry.buffer);v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint16(14,33,true);v.setUint32(16,sum,true);v.setUint32(20,data.length,true);v.setUint32(24,data.length,true);v.setUint16(28,filename.length,true);v.setUint32(42,offset,true);entry.set(filename,46);central.push(entry);offset+=head.length+data.length;
    }
    const size=central.reduce((n,v)=>n+v.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,central.length,true);e.setUint16(10,central.length,true);e.setUint32(12,size,true);e.setUint32(16,offset,true);return new Blob([...chunks,...central,end],{type:'application/zip'});
  }
  global.LocalKit={clone,text,email,date,instant,number,choice,id,uid,own,makeStore,parseJSON,parseCSV,csv,download,readFile,safeURL,zip};
})(window);
