(function(){
var r=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(function(){r.classList.remove('off')},reduce?0:900);
var rail=document.querySelector('.nrail'),lamps=[].slice.call(document.querySelectorAll('.nl')),w=innerWidth,h=innerHeight,tx=w*.6,ty=h*.45,cx=tx,cy=ty,raf=null;
addEventListener('resize',function(){w=innerWidth;h=innerHeight});
function frame(){
cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
r.style.setProperty('--x',cx+'px');r.style.setProperty('--y',cy+'px');
if(!reduce&&rail){var rr=rail.getBoundingClientRect();lamps.forEach(function(l){var lx=rr.left+rr.width*parseFloat(l.getAttribute('data-k'))/100,a=Math.atan2(cx-lx,Math.max(cy-rr.top,80))*57.3;l.style.setProperty('--a',Math.max(-28,Math.min(28,-a*.5))+'deg')})}
raf=(Math.abs(tx-cx)<.5&&Math.abs(ty-cy)<.5)?null:requestAnimationFrame(frame)}
function start(){if(!raf)raf=requestAnimationFrame(frame)}
addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;start()},{passive:true});
start();
})();
