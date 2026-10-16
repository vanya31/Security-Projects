(function(){
  var $ = function(id){ return document.getElementById(id); };
  var ipEl=$('ip'), pfxEl=$('pfx'), slEl=$('slider'), testEl=$('test');

  function toStr(n){ return [n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.'); }
  function fmt(n){ return n.toLocaleString('en-US'); }

  function parseIPv4(raw){
    var s=raw.trim();
    if(!s) return {empty:true};
    var parts=s.split('.');
    if(parts.length!==4) return {error:'Use four numbers separated by dots, like 192.168.10.37.'};
    for(var i=0;i<4;i++){
      var p=parts[i];
      if(p==='') return {error:'Octet '+(i+1)+' is empty. Fill it with a number from 0 to 255.'};
      if(!/^\d+$/.test(p)) return {error:'Octet '+(i+1)+' ("'+p.slice(0,12)+'") must contain digits only.'};
      if(p.length>1&&p[0]==='0') return {error:'Octet '+(i+1)+' has a leading zero ('+p+'). Write it as '+(+p)+'.'};
      if(+p>255) return {error:'Octet '+(i+1)+' is '+p+', but octets go from 0 to 255.'};
    }
    return {value:(((+parts[0])<<24)|((+parts[1])<<16)|((+parts[2])<<8)|(+parts[3]))>>>0};
  }

  function parsePrefix(raw){
    var s=raw.trim().replace(/^\//,'');
    if(!s) return {empty:true};
    if(!/^\d+$/.test(s)) return {error:'Prefix length must be a whole number from 0 to 32.'};
    var n=+s;
    if(n>32) return {error:'/'+s.slice(0,10)+' is out of range. IPv4 prefixes go from 0 to 32.'};
    return {value:n};
  }

  function calc(ip,p){
    var mask=p===0?0:(0xFFFFFFFF<<(32-p))>>>0;
    var wild=(~mask)>>>0, net=(ip&mask)>>>0, bc=(net|wild)>>>0, total=Math.pow(2,32-p);
    var first,last,usable,note='';
    if(p===32){first=last=net;usable=1;note='Single-host block: its one address is usable.';}
    else if(p===31){first=net;last=bc;usable=2;note='Point-to-point block (RFC 3021): both addresses are usable, and none is reserved for network or broadcast.';}
    else{first=net+1;last=bc-1;usable=total-2;}
    return {ip:ip,p:p,mask:mask,wild:wild,net:net,bc:bc,total:total,first:first,last:last,usable:usable,note:note};
  }

  function bitsHTML(v,p){
    var h='';
    for(var i=0;i<4;i++){
      var c='';
      for(var j=0;j<8;j++){
        var k=i*8+j, b=(v>>>(31-k))&1;
        c+='<i class="cell '+(k<p?'n':'h')+(b?'':' z')+(k===p&&p>0&&p<32?' edge':'')+'" style="--i:'+k+'">'+b+'</i>';
      }
      h+='<div class="oct"><div class="cells">'+c+'</div><span class="dec">'+((v>>>(24-8*i))&255)+'</span></div>';
    }
    return h;
  }

  function setErr(input,el,msg){
    el.textContent=msg||'';
    if(msg) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid');
  }

  function render(r){
    $('bits-ip').innerHTML=bitsHTML(r.ip,r.p);
    $('bits-mask').innerHTML=bitsHTML(r.mask,r.p);
    $('legend').innerHTML=
      '<span><i style="background:var(--net)"></i>Network bits: '+r.p+'</span>'+
      '<span><i style="background:var(--host)"></i>Host bits: '+(32-r.p)+'</span>';
    var rows=[
      ['Network address',toStr(r.net)],['Broadcast address',toStr(r.bc)],
      ['Subnet mask',toStr(r.mask)],['Wildcard mask',toStr(r.wild)],
      ['First usable host',toStr(r.first)],['Last usable host',toStr(r.last)],
      ['Total addresses',fmt(r.total)],['Usable hosts',fmt(r.usable)],
      ['CIDR block',toStr(r.net)+'/'+r.p,1],
      ['Address range',toStr(r.net)+' \u2013 '+toStr(r.bc),1]
    ];
    $('items').innerHTML=rows.map(function(x){
      return '<button type="button" class="item'+(x[2]?' wide':'')+'" data-v="'+x[1]+'" aria-label="Copy '+x[0].toLowerCase()+'">'+
        '<span class="k">'+x[0]+'</span><span class="v">'+x[1]+'</span></button>';
    }).join('');
    $('note').textContent=r.note;
  }

  function renderCheck(r){
    var badge=$('badge'), why=$('why'), tp=parseIPv4(testEl.value);
    setErr(testEl,$('test-err'),tp.error);
    if(tp.value===undefined){
      badge.className='badge idle';
      badge.textContent=tp.error?'Invalid address':'Waiting for an address';
      why.textContent=tp.error?'':'Enter an address to test against '+toStr(r.net)+'/'+r.p+'.';
      return;
    }
    var tnet=(tp.value&r.mask)>>>0, inside=tnet===r.net;
    badge.className='badge '+(inside?'in':'out');
    badge.textContent=inside?'Inside this subnet':'Outside this subnet';
    var t=toStr(tp.value)+' AND '+toStr(r.mask)+' = '+toStr(tnet)+(inside?' (matches ':' (expected ')+toStr(r.net)+').';
    if(inside&&r.p<31){
      if(tp.value===r.net) t+=' This is the network address, so it cannot be assigned to a host.';
      else if(tp.value===r.bc) t+=' This is the broadcast address, so it cannot be assigned to a host.';
    }
    why.textContent=t;
  }

  var last=null;
  function update(){
    var ip=parseIPv4(ipEl.value), pf=parsePrefix(pfxEl.value);
    setErr(ipEl,$('ip-err'),ip.error);
    setErr(pfxEl,$('pfx-err'),pf.error);
    if(pf.value!==undefined) slEl.value=pf.value;
    var ok=ip.value!==undefined&&pf.value!==undefined;
    $('out').hidden=!ok;
    var em=$('empty'); em.hidden=ok;
    if(!ok){
      em.textContent=(ip.error||pf.error)?'Fix the highlighted field to see the subnet.':'Enter an address and a prefix length to see the subnet.';
      return;
    }
    last=calc(ip.value,pf.value);
    render(last);
    renderCheck(last);
  }

  ipEl.addEventListener('input',function(){
    var v=ipEl.value, i=v.indexOf('/');
    if(i>-1){ ipEl.value=v.slice(0,i).trim(); pfxEl.value=v.slice(i+1).trim(); }
    update();
  });
  pfxEl.addEventListener('input',update);
  slEl.addEventListener('input',function(){ pfxEl.value=slEl.value; update(); });
  testEl.addEventListener('input',function(){ if(last) renderCheck(last); else update(); });

  function copy(text){
    function fallback(){
      try{
        var t=document.createElement('textarea'); t.value=text; t.style.cssText='position:fixed;opacity:0';
        document.body.appendChild(t); t.select(); var ok=document.execCommand('copy'); t.remove(); return ok;
      }catch(e){ return false; }
    }
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function(){return true;},function(){return fallback();});
    }catch(e){}
    return Promise.resolve(fallback());
  }
  $('items').addEventListener('click',function(e){
    var b=e.target.closest('button[data-v]'); if(!b) return;
    copy(b.dataset.v).then(function(ok){
      b.dataset.msg=ok?'Copied':'Copy blocked';
      b.classList.add('done');
      setTimeout(function(){ b.classList.remove('done'); },1200);
    });
  });

  (function(){
    var el=$('typed'), text='CIDR calculator', i=0;
    if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){ el.textContent=text; return; }
    function tick(){
      el.textContent=text.slice(0,++i);
      if(i<text.length) setTimeout(tick,70+Math.random()*70);
    }
    setTimeout(tick,350);
  })();

  update();
  setTimeout(function(){
    $('bits-ip').classList.remove('intro');
    $('bits-mask').classList.remove('intro');
  },1500);
})();
