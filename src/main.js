import './story.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import {setWorkerUrl} from 'maplibre-gl';
import worker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {maplibreGL} from '@maplibre/maplibre-gl-leaflet';
import style from './vendor/warm-map/style.json';
import {locations} from './data/locations.js';
import {scene} from './scene.js';
import {story} from './story-data.js';
setWorkerUrl(worker);
const $=s=>document.querySelector(s);
const stops=story.map(s=>({...locations.find(l=>l.id===s.id),...s}));
let index=0,expanded=false,wandering=false,moving=false,activeMarker;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const layer of style.layers||[])if(layer.type==='symbol'&&layer.paint){layer.paint['text-color']='#768478';layer.paint['text-halo-color']='#e4eaec';layer.paint['text-halo-width']=2;}
const map=L.map('map',{zoomControl:false,attributionControl:false,minZoom:5,maxZoom:14,zoomSnap:.1,zoomAnimation:!reduced.matches,fadeAnimation:!reduced.matches});
const base=maplibreGL({style,attributionControl:false}).addTo(map);
const otherPins=L.layerGroup().addTo(map);
const markArt=()=>{
 const loc=stops[index];
 if(activeMarker)map.removeLayer(activeMarker);
 activeMarker=L.marker([loc.lat,loc.lng],{interactive:false,keyboard:false,zIndexOffset:3000,icon:L.divIcon({className:'scene-marker',iconSize:[1,1],iconAnchor:[0,0],html:`<figure class="map-art"><img src="${scene(loc.type,loc.id)}" alt=""/><figcaption>${loc.title==='Jim Corbett NP'?'Corbett':loc.title}<span>${loc.cue}</span></figcaption></figure>`})}).addTo(map);
};
function sceneBox(){
 const card=$('#story-card').getBoundingClientRect();
 const portrait=innerWidth<760&&innerHeight>430;
 return portrait?{left:18,right:innerWidth-18,top:innerHeight<700?62:145,bottom:card.top-12}:{left:card.right+28,right:innerWidth-38,top:120,bottom:innerHeight-100};
}
function drawPins(){
 otherPins.clearLayers();
 if(!wandering)return;
 const occupied=[...document.querySelectorAll('.world-title,.map-tools,#return-story,footer')].map(e=>e.getBoundingClientRect());
 const width=innerWidth<760?112:145,height=44;
 const bounds={left:10,right:innerWidth-10,top:12,bottom:innerHeight-52};
 const boxes=[];
 const collides=r=>[...occupied,...boxes].some(b=>r.left<b.right+6&&r.right>b.left-6&&r.top<b.bottom+6&&r.bottom>b.top-6);
 for(const loc of stops){
  const p=map.latLngToContainerPoint([loc.lat,loc.lng]);
  const candidates=[];
  for(let y=bounds.top;y<=bounds.bottom-height;y+=8)for(let x=bounds.left;x<=bounds.right-width;x+=12){
   const r={left:x,right:x+width,top:y,bottom:y+height};if(!collides(r))candidates.push({...r,d:Math.hypot(x+width/2-p.x,y+height/2-p.y)});
  }
  candidates.sort((a,b)=>a.d-b.d);const r=candidates[0];if(!r)continue;boxes.push(r);
  const point=L.point(r.left+width/2,r.top+height/2);const ll=map.containerPointToLatLng(point);
  L.polyline([[loc.lat,loc.lng],ll],{color:'#5c7b68',weight:1,opacity:.8,interactive:false}).addTo(otherPins);
  L.circleMarker([loc.lat,loc.lng],{radius:3,color:'#f0f4ed',fillColor:'#426b56',fillOpacity:1,weight:1,interactive:false}).addTo(otherPins);
  const marker=L.marker(ll,{keyboard:false,icon:L.divIcon({className:'overview-marker',iconSize:[width,height],iconAnchor:[width/2,height/2],html:`<button aria-label="Visit ${loc.title}" style="width:${width}px">${loc.id==='corbett'?'Corbett':loc.title}</button>`})}).addTo(otherPins);
  L.DomEvent.disableClickPropagation(marker.getElement());
  marker.getElement().querySelector('button').onclick=()=>show(stops.indexOf(loc));
 }
}
function sizeArt(){const box=sceneBox();const avail=box.bottom-box.top;document.documentElement.style.setProperty('--art-width',Math.min(innerWidth<760?230:330,Math.max(115,(avail-80)*4/3))+'px');}
function focus(animate=true){
 clearTimeout(overview.timer);moving=true;wandering=false;document.body.classList.remove('wandering');$('#return-story').hidden=true;
 sizeArt();const loc=stops[index],box=sceneBox();
 const target=L.point((box.left+box.right)/2,(box.top+box.bottom)/2);
 const z=loc.id==='dehradun'||loc.id==='mussoorie'||loc.id==='rishikesh'?8.8:8.2;
 const coord=map.project([loc.lat,loc.lng],z);
 const center=map.unproject(coord.subtract(target.subtract(L.point(innerWidth/2,innerHeight/2))),z);
 map.stop();map.setView(center,z,{animate:animate&&!reduced.matches,duration:1.15});
 clearTimeout(focus.timer);focus.timer=setTimeout(()=>{moving=false;drawPins();},1300);
}
function render(){
 const loc=stops[index];
 $('#chapter-count').textContent=`${String(index+1).padStart(2,'0')} / ${stops.length}`;
 $('#chapter-title').textContent=loc.chapter;
 $('#place-title').textContent=loc.id==='corbett'?'Corbett National Park':loc.title;
 $('#story-copy').textContent=expanded?loc.deep:loc.line;
 $('#deeper').textContent=expanded?'Back to the scene −':'Linger here +';
 $('#deeper').setAttribute('aria-expanded',String(expanded));
 $('#source').hidden=!expanded;$('#source').href=loc.source;
 $('#back').hidden=index===0;$('#first-scene').hidden=index!==0;
 $('#next').textContent=index===stops.length-1?'Begin again ↻':'Next scene →';
 $('#progress').replaceChildren(...stops.map((_,i)=>{const s=document.createElement('span');s.className=i===index?'current':i<index?'past':'';return s;}));
 $('#announce').textContent=`Scene ${index+1} of ${stops.length}. ${loc.title}. ${loc.chapter}.`;
 markArt();
}
function show(i,animate=true){index=i;expanded=false;render();requestAnimationFrame(()=>focus(animate));}
$('#next').onclick=()=>show((index+1)%stops.length);
$('#back').onclick=()=>{if(index)show(index-1);};
$('#deeper').onclick=()=>{expanded=!expanded;render();requestAnimationFrame(()=>{if(!wandering)focus(false);else drawPins();});};
$('#return-story').onclick=()=>focus();
function overview(){
 clearTimeout(focus.timer);clearTimeout(overview.timer);moving=true;wandering=true;document.body.classList.add('wandering');$('#return-story').hidden=false;
 const portrait=innerWidth<760&&innerHeight>430;
 map.stop();map.fitBounds(L.latLngBounds(stops.map(l=>[l.lat,l.lng])),{paddingTopLeft:[portrait?75:innerWidth*.3,portrait?160:100],paddingBottomRight:[portrait?85:innerWidth*.22,portrait?100:95],animate:false});
 drawPins();overview.timer=setTimeout(()=>moving=false,100);
}
$('#overview').onclick=overview;
$('#zoom-in').onclick=()=>{map.zoomIn();wander();};$('#zoom-out').onclick=()=>{map.zoomOut();wander();};
function wander(){if(moving)return;wandering=true;document.body.classList.add('wandering');$('#return-story').hidden=false;}
map.on('dragstart',()=>{moving=false;wander();});map.on('zoomstart',()=>{if(!moving)wander();});map.on('moveend zoomend',drawPins);
$('#about-open').onclick=()=>$('#about').showModal();$('#about-close').onclick=()=>$('#about').close();
$('#about').addEventListener('click',e=>{if(e.target===$('#about'))$('#about').close();});
document.addEventListener('keydown',e=>{if($('#about').open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a'))return;if(e.key==='ArrowRight'){e.preventDefault();show((index+1)%stops.length);}if(e.key==='ArrowLeft'&&index){e.preventDefault();show(index-1);}});
let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{map.invalidateSize();if(wandering)overview();else focus(false);},150);});
show(0,false);
map.whenReady(()=>base.getMaplibreMap()?.on('error',()=>$('#tile-note').hidden=false));
