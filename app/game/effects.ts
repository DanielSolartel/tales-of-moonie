// Three local photographs, spaced well below a rapid strobe. Game time pauses
// with the story, so posing, light and particles cannot drift apart.
export const PHOTO_TIMES = [.30,.95,1.60] as const;
export const PHOTO_POSE_DURATION = 2.4;
export function photoFlash(age:number,at:number) {
  const t=age-at;
  return t<0||t>.26?0:t<.055?t/.055:Math.pow(1-(t-.055)/.205,2);
}
export const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
export const gateRetreat=(age:number,third=false)=>clamp01((age-(third?1.2:.6))/2);
export const thirdBloomEnvelope=(age:number)=>age<0?0:clamp01(age/.8)*clamp01((6-age)/2);

// Firefly flight (final aesthetic pass). Each of the 27 fireflies keeps its approved home spot
// but gets its own speed, phase, path (two incommensurate sines per axis, so the loop never
// visibly repeats) and blink rate. They live on a far decorative plane that drifts at 12% of
// the camera, fading near the band edges so wrapping never pops. Whole pixels only.
export const FIREFLY_PLANE=.12;
export function fireflyAt(i:number,time:number,camera:number){
  const r=(k:number)=>{const s=Math.sin(i*91.7+k*47.3)*43758.5453;return s-Math.floor(s);};
  const fx=.14+r(1)*.26,fy=.11+r(2)*.24,ax=4+r(3)*7,ay=3+r(4)*5,px=r(5)*6.283,py=r(6)*6.283,blink=.7+r(7)*.8;
  const band=((((i*89)%290)-camera*FIREFLY_PLANE)%290+290)%290,edge=Math.min(1,band/24,(290-band)/24);
  const x=Math.round((i*137%590)+25+Math.sin(time*fx+px)*ax+Math.sin(time*fx*2.37+py)*ax*.35);
  const y=Math.round(band+35+Math.cos(time*fy+py)*ay+Math.sin(time*fy*1.71+px)*ay*.4);
  return {x,y,opacity:(.3+Math.sin(time*blink+i)*.2)*edge,edge};
}
