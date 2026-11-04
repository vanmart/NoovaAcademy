(function(){
var root=document.documentElement,h1=document.getElementById('titular'),lamp=document.getElementById('lamp'),rail=document.getElementById('rail'),btn=document.querySelector('.lamp-btn');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var CABLE=20; /* largo del cable en px, medido desde la cara inferior del riel */
var SPOT='<g style="opacity:var(--lit)"><polygon points="-9,'+(CABLE+44)+' 9,'+(CABLE+44)+' -95,'+(CABLE+1086)+' 95,'+(CABLE+1086)+'" fill="url(#cone)"/><circle cx="0" cy="'+(CABLE+46)+'" r="44" fill="url(#halo)"/></g><line x1="0" y1="0" x2="0" y2="'+CABLE+'" stroke="#30303A" stroke-width="2"/><rect x="-12" y="'+(CABLE-2)+'" width="24" height="44" rx="5" fill="#14141B" stroke="#30303A"/><rect x="-12" y="'+(CABLE+40)+'" width="24" height="1.6" fill="url(#rim)"/><ellipse cx="0" cy="'+(CABLE+44)+'" rx="9" ry="3" fill="#F4F0EB" style="opacity:calc(.2 + .8 * var(--lit))"/>';
btn.style.top=(CABLE-6)+'px';
var capEl=document.getElementById('cap');
var CAP='<g transform="rotate(-6 200 150)"><path class="b" d="M100 150 L200 190 L300 150 L300 212 C300 252 100 252 100 212 Z"/><path class="s" d="M20 110 L200 180 L200 202 L20 132 Z"/><path class="s" d="M380 110 L200 180 L200 202 L380 132 Z"/><path class="t" d="M200 40 L380 110 L200 180 L20 110 Z"/><circle class="k" cx="200" cy="110" r="7"/><path class="c" d="M200 110 L338 124 L338 214"/><path class="s" d="M330 214 h16 l5 52 h-26 z"/><path class="c" style="stroke-width:1.5" d="M334 230 v32 M342 230 v32"/></g>';
[].forEach.call(document.querySelectorAll('.capart'),function(g){g.innerHTML=CAP});
[].forEach.call(document.querySelectorAll('.spot-art'),function(g){g.innerHTML=SPOT});
var fx=[].map.call(document.querySelectorAll('.swing'),function(el,i){return{el:el,off:+el.getAttribute('data-off'),ang:0,vel:0,k:.010+i*.0013}});
var center=0;fx.forEach(function(f,i){if(f.off===0)center=i});
var w=innerWidth,h=innerHeight,lx=w*.5,sp=104,tx=w*.55,ty=h*.6,cx=tx,cy=ty,last=-1e9,raf=null,touched=false;
function layout(){w=innerWidth;h=innerHeight;var m=w<768;lx=w*.5;lamp.style.left=lx+'px';root.style.setProperty('--s',m?'.8':'1');sp=m?58:104;
fx.forEach(function(f){f.el.style.left=(f.off*sp)+'px'});rail.style.left=-(2*sp+44)+'px';rail.style.width=(4*sp+88)+'px'}
function label(){btn.setAttribute('aria-label',root.classList.contains('off')?'Encender la luz':'Apagar la luz')}
btn.addEventListener('click',function(){touched=true;root.classList.toggle('off');label()});
label();
if(root.classList.contains('off'))setTimeout(function(){if(!touched){root.classList.remove('off');label()}},1700);
addEventListener('resize',layout);
addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;last=performance.now();start()},{passive:true});
function frame(t){
if(!reduce&&t-last>3500){tx=lx+w*.30*Math.sin(t/4200);ty=h*(.62+.10*Math.sin(t/5600+1))}
cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
var settled=Math.abs(tx-cx)<.5&&Math.abs(ty-cy)<.5;
fx.forEach(function(f){var fl=lx+f.off*sp;var want=Math.max(-.6,Math.min(.6,Math.atan2(cx-fl,Math.max(cy,h*.25))));
if(reduce){f.ang+=(want-f.ang)*.2;f.vel=0}else{f.vel=(f.vel+(want-f.ang)*f.k)*.93;f.ang+=f.vel}
f.el.style.transform='rotate('+(-f.ang)+'rad)';
if(Math.abs(want-f.ang)>.002||Math.abs(f.vel)>.0005)settled=false});
var c=fx[center],d=Math.max(h*.4,Math.min(h*.95,Math.hypot(cx-lx,cy)));
var px=lx+d*Math.sin(c.ang),py=d*Math.cos(c.ang);
root.style.setProperty('--x',px+'px');root.style.setProperty('--y',py+'px');
var r=h1.getBoundingClientRect();
root.style.setProperty('--hx',(px-r.left)+'px');root.style.setProperty('--hy',(py-r.top)+'px');
var cr=capEl.getBoundingClientRect();root.style.setProperty('--cx',(px-cr.left)+'px');root.style.setProperty('--cy',(py-cr.top)+'px');
raf=(reduce&&settled)?null:requestAnimationFrame(frame)}
function start(){if(!raf)raf=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',function(){if(document.hidden&&raf){cancelAnimationFrame(raf);raf=null}else start()});
layout();start();
})();
