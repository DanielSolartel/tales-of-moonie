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
