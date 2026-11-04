(function(){
var root=document.documentElement,h1=document.getElementById('titular'),capEl=document.getElementById('cap');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var CAP='<g transform="rotate(-6 200 150)"><path class="b" d="M100 150 L200 190 L300 150 L300 212 C300 252 100 252 100 212 Z"/><path class="s" d="M20 110 L200 180 L200 202 L20 132 Z"/><path class="s" d="M380 110 L200 180 L200 202 L380 132 Z"/><path class="t" d="M200 40 L380 110 L200 180 L20 110 Z"/><circle class="k" cx="200" cy="110" r="7"/><path class="c" d="M200 110 L338 124 L338 214"/><path class="s" d="M330 214 h16 l5 52 h-26 z"/><path class="c" style="stroke-width:1.5" d="M334 230 v32 M342 230 v32"/></g>';
[].forEach.call(document.querySelectorAll('.capart'),function(g){g.innerHTML=CAP});
var lamps=[].slice.call(document.querySelectorAll(".nl")),rail=document.querySelector(".nrail");
var w=innerWidth,h=innerHeight,tx=w*.55,ty=h*.6,cx=tx,cy=ty,last=-1e9,raf=null;
addEventListener('resize',function(){w=innerWidth;h=innerHeight});
if(root.classList.contains('off'))setTimeout(function(){root.classList.remove('off')},1200);
addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;last=performance.now();start()},{passive:true});
function frame(t){
if(!reduce&&t-last>3500){tx=w*.5+w*.30*Math.sin(t/4200);ty=h*(.62+.10*Math.sin(t/5600+1))}
cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
root.style.setProperty('--x',cx+'px');root.style.setProperty('--y',cy+'px');
var r=h1.getBoundingClientRect(),cr=capEl.getBoundingClientRect();
root.style.setProperty('--hx',(cx-r.left)+'px');root.style.setProperty('--hy',(cy-r.top)+'px');
root.style.setProperty('--cx',(cx-cr.left)+'px');root.style.setProperty('--cy',(cy-cr.top)+'px');
if(!reduce&&rail){var rr=rail.getBoundingClientRect();lamps.forEach(function(l){var lx=rr.left+rr.width*parseFloat(l.getAttribute("data-k"))/100,a=Math.atan2(cx-lx,Math.max(cy-rr.top-22,80))*57.3;l.style.setProperty("--a",Math.max(-28,Math.min(28,a*.5))+"deg")})}
var settled=Math.abs(tx-cx)<.5&&Math.abs(ty-cy)<.5;
raf=(reduce&&settled)?null:requestAnimationFrame(frame)}
function start(){if(!raf)raf=requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',function(){if(document.hidden&&raf){cancelAnimationFrame(raf);raf=null}else start()});
start();
})();
