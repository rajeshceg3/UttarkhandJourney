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
 otherPins.clearLayers();const used=[];const box=sceneBox();
 const art=document.querySelector('.map-art')?.getBoundingClientRect();
 stops.forEach((loc,i)=>{
 if(i===index&&!wandering)return;const p=map.latLngToContainerPoint([loc.lat,loc.lng]);
 if(p.x<box.left+40||p.x>box.right-40||p.y<box.top+24||p.y>box.bottom-24)return;
 if(!wandering&&art&&p.x>art.left-45&&p.x<art.right+45&&p.y>art.top-30&&p.y<art.bottom+30)return;
 if(used.some(q=>q.distanceTo(p)<90))return;used.push(p);
 const marker=L.marker([loc.lat,loc.lng],{keyboard:false,icon:L.divIcon({className:'quiet-marker',iconSize:[90,48],iconAnchor:[45,24],html:`<button aria-label="Visit ${loc.title}"><i></i><span>${loc.id==='corbett'?'Corbett':loc.title}</span></button>`})}).addTo(otherPins);
 marker.on('click',()=>show(i));
 });
}
function sizeArt(){const box=sceneBox();const avail=box.bottom-box.top;document.documentElement.style.setProperty('--art-width',Math.min(innerWidth<760?230:330,Math.max(115,(avail-80)*4/3))+'px');}
function focus(animate=true){
 moving=true;wandering=false;document.body.classList.remove('wandering');$('#return-story').hidden=true;
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
 $('#region-note').textContent=index<4?'RIVER & HILLS':index<8?'HIGH COUNTRY':'FOREST & LAKE';
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
$('#overview').onclick=()=>{moving=true;map.fitBounds(L.latLngBounds(stops.map(l=>[l.lat,l.lng])),{paddingTopLeft:[innerWidth<760?22:440,innerWidth<760?195:100],paddingBottomRight:[35,innerWidth<760?$('#story-card').getBoundingClientRect().height+60:100],animate:!reduced.matches});wandering=true;document.body.classList.add('wandering');drawPins();$('#return-story').hidden=false;setTimeout(()=>moving=false,500);};
$('#zoom-in').onclick=()=>{map.zoomIn();wander();};$('#zoom-out').onclick=()=>{map.zoomOut();wander();};
function wander(){if(moving)return;wandering=true;document.body.classList.add('wandering');$('#return-story').hidden=false;}
map.on('dragstart',()=>{moving=false;wander();});map.on('zoomstart',()=>{if(!moving)wander();});map.on('moveend zoomend',drawPins);
$('#about-open').onclick=()=>$('#about').showModal();$('#about-close').onclick=()=>$('#about').close();
$('#about').addEventListener('click',e=>{if(e.target===$('#about'))$('#about').close();});
document.addEventListener('keydown',e=>{if($('#about').open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a'))return;if(e.key==='ArrowRight'){e.preventDefault();show((index+1)%stops.length);}if(e.key==='ArrowLeft'&&index){e.preventDefault();show(index-1);}});
let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{map.invalidateSize();focus(false);},150);});
show(0,false);
map.whenReady(()=>base.getMaplibreMap()?.on('error',()=>$('#tile-note').hidden=false));
