export const VIEW = { width: 640, height: 360, tile: 32, speed: 77 } as const;
export type Outfit = 'real' | 'artist' | 'explorer';
export type Skin = 'light' | 'medium' | 'dark';
export type Face = 'cheeks' | 'freckles' | 'glasses';
export type Direction = 'front' | 'back' | 'left' | 'right';
export type Look = { outfit: Outfit; skin: Skin; face: Face };
export const DEFAULT_LOOK: Look = { outfit: 'real', skin: 'light', face: 'cheeks' };
export const OUTFITS = [
  { value: 'real', label: 'Cotidiana', detail: 'Gorra azul, denim y pequeños dijes.' },
  { value: 'artist', label: 'Artista', detail: 'Lila, dos lápices y un poco de pintura.' },
  { value: 'explorer', label: 'Exploradora lunar', detail: 'Vestido blanco y una capa de estrellas.' },
] as const;
export const SKINS = [
  {value:'light', label:'Claro cálido', color:'#f3c5a2'},
  {value:'medium', label:'Medio cálido', color:'#c48960'},
  {value:'dark', label:'Oscuro cálido', color:'#835034'},
] as const;
export const FACES = [{value:'cheeks',label:'Mejillas rosadas'},{value:'freckles',label:'Pecas'},{value:'glasses',label:'Gafas redondas'}] as const;
export type Line = { speaker: string; text: string; thought?: boolean };
export const CLASSROOM: Line[] = [
  { speaker:'Profesor', text:'Todo ecosistema depende de un delicado equilibrio…' },
  { speaker:'Moonie', thought:true, text:'Yo también estoy intentando mantener el equilibrio entre escuchar y no dormirme.' },
  { speaker:'Narrador', text:'El equilibrio duró siete segundos.' },
];
export const AWAKENING: Line[] = [
  { speaker:'Moonie', text:'¿Profesor…?' },
  { speaker:'Moonie', text:'Esto definitivamente no es Humanística III.' },
  { speaker:'Moonie', text:'Aunque sigue habiendo bastante naturaleza.' },
];
export const FLOWER_LINES: Line[] = [
  { speaker:'Moonie', text:'Brilla, es bonita y probablemente no debería tocarla.' },
  { speaker:'Moonie', text:'Voy a tocarla.' },
];
export const BOOK_ONE: Line[] = [
  {speaker:'Los que encontraron un lugar',text:'Quienes no encajaban en ninguna historia se reunieron bajo la misma luna. Juntos inventaron un lugar al que sí pertenecían.'},
  {speaker:'Moonie',text:'Suena como un buen club.'},
];
export const SIGN_LINES: Line[] = [
  {speaker:'Letrero',text:'Abre bien los hojos.'},
  {speaker:'Moonie',text:'...'},
  {speaker:'Narrador',text:'Decidió respetar la ortografía del bosque.'},
];
export const BOOK_TWO: Line[] = [
  {speaker:'El último encargo del cuervo',text:'El cuervo aceptó un último encargo: encontrar la estrella que había desaparecido del cielo. Todas las pistas conducían al bosque.'},
  {speaker:'Moonie',text:'Una estrella desaparecida…'},
  {speaker:'Moonie',text:'Perfecto. Desperté en una escena del crimen.'},
];
export const SECOND_FLOWER_LINES: Line[] = [
  {speaker:'Moonie',text:'La principal sospechosa parece ser una flor.'},
  {speaker:'Moonie',text:'Tiene sentido para este bosque.'},
];
export type Scene = 'title' | 'customize' | 'classroom' | 'dream' | 'forest' | 'letter' | 'closing' | 'end';
export const CHEST_LINES:Line[] = [
  {speaker:'Moonie',text:'Tres flores mágicas, un bosque imposible y una estrella misteriosa…'},
  {speaker:'Moonie',text:'Definitivamente esto no estaba en el programa de Humanística III.'},
];
export const LETTER = ['Para Moonie 🌙','La próxima aventura comienza el...','Sábado 05/09/2026','Te espero. ❤️'] as const;
export const BOOK_THREE:Line[] = [
  {speaker:'Cartas bajo la misma luna',text:'Las cartas más importantes no siempre llegaban por correo. Algunas esperaban bajo la misma luna hasta que una estrella encontraba a la persona correcta.'},
  {speaker:'Moonie',text:'Qué sistema de entrega tan complicado.'},
];
export const STAR_LINES:Line[] = [
  {speaker:'Moonie',text:'Hola.'},
  {speaker:'Moonie',text:'Voy a interpretar eso como que sabes adónde vamos.'},
];
export const ROOT_LINES:Line[] = [{speaker:'Moonie',text:'Eso no parece difícil.'}];
export const FALL_LINES:Line[] = [
  {speaker:'Narrador',text:'Moonie se cayó.'},
  {speaker:'Narrador',text:'Por suerte, esta vez no necesitó muletas.'},
  {speaker:'Moonie',text:'El bosque no necesitaba conocer mis antecedentes.'},
];
export const SIMON_LINES:Line[] = [
  {speaker:'Moonie',text:'¿Simón?'},
  {speaker:'Narrador',text:'Parecía estar esperando que alguien tomara la foto.'},
  {speaker:'Moonie',text:'Claro. El bosque mágico también necesita contenido.'},
];
export const THIRD_FLOWER_LINES:Line[] = [{speaker:'Moonie',text:'Déjame adivinar… ¿tú también quieres que la toque?'}];
export type DialogueKind = 'class' | 'wake' | 'flower' | 'book1' | 'sign' | 'book2' | 'flower2' | 'book3' | 'star' | 'roots' | 'fall' | 'simon' | 'flower3' | 'chest';
export const SCRIPTS = { class:CLASSROOM, wake:AWAKENING, flower:FLOWER_LINES,book1:BOOK_ONE,sign:SIGN_LINES,book2:BOOK_TWO,flower2:SECOND_FLOWER_LINES,book3:BOOK_THREE,star:STAR_LINES,roots:ROOT_LINES,fall:FALL_LINES,simon:SIMON_LINES,flower3:THIRD_FLOWER_LINES,chest:CHEST_LINES };
export type Progress = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
// Only completing the next mandatory scene advances the story. Simón is separate.
export const SEQUENCE = ['book1','sign','book2','flower2','book3','star','fall','flower3'] as const;
export const LANDMARKS = {
  book1:{x:187,y:-236,radius:49,label:'Leer libro'},
  sign:{x:416,y:-295,radius:47,label:'Leer letrero'},
  book2:{x:461,y:-382,radius:49,label:'Leer libro'},
  flower2:{x:360,y:-560,radius:39,label:'Tocar'},
  book3:{x:195,y:-1000,radius:49,label:'Leer libro'},
  simon:{x:430,y:-1250,radius:54,label:'Acercarse a Simón'},
  flower3:{x:342,y:-1320,radius:40,label:'Tocar'},
  chest:{x:320,y:-1620,radius:59,label:'Abrir cofre'},
};
export const SECOND_FLOWER = LANDMARKS.flower2;
export const THIRD_FLOWER = LANDMARKS.flower3;
export function completeScene(progress:Progress,kind:DialogueKind):Progress {
  if(progress===8)return progress;
  return kind===SEQUENCE[progress]?(progress+1) as Progress:progress;
}
export function nearbyInteraction(x:number,y:number,bloomed:boolean,progress:Progress,simonMet=false) {
  if(!bloomed)return Math.hypot(x-FLOWER.x,y-FLOWER.y)<FLOWER.radius?'flower':null;
  if(progress>=7&&!simonMet&&Math.hypot(x-LANDMARKS.simon.x,y-LANDMARKS.simon.y)<LANDMARKS.simon.radius)return 'simon';
  if(progress===8)return Math.hypot(x-LANDMARKS.chest.x,y-LANDMARKS.chest.y)<LANDMARKS.chest.radius?'chest':null;
  const kind=SEQUENCE[progress];if(!kind)return null;
  if(kind==='star'||kind==='fall')return null;
  const target=LANDMARKS[kind];return Math.hypot(x-target.x,y-target.y)<target.radius?kind:null;
}
export const cameraY=(y:number)=>Math.round(Math.max(-1760,Math.min(0,y-160-Math.max(0,Math.min(80,(-y-1440)*.5)))));
export const PATH = [
  {x:325,y:95,r:31},{x:325,y:-35,r:31},{x:325,y:-90,r:31},
  {x:330,y:-145,r:34},{x:295,y:-195,r:40},{x:251,y:-227,r:57},
  {x:298,y:-270,r:35},{x:365,y:-310,r:39},{x:377,y:-350,r:44},
  {x:417,y:-366,r:31},{x:325,y:-411,r:39},
  {x:320,y:-485,r:27},{x:320,y:-540,r:30},{x:325,y:-565,r:57},
  {x:325,y:-625,r:28},{x:325,y:-700,r:28},
  {x:325,y:-780,r:28},{x:315,y:-830,r:27},{x:350,y:-885,r:32},
  {x:305,y:-940,r:29},{x:285,y:-990,r:32},{x:325,y:-1025,r:31},
  {x:350,y:-1075,r:30},{x:342,y:-1135,r:33},{x:310,y:-1180,r:27},
  {x:320,y:-1240,r:36},{x:335,y:-1295,r:34},{x:325,y:-1340,r:32},
  {x:320,y:-1400,r:28},
  {x:320,y:-1460,r:30},{x:320,y:-1530,r:49},{x:320,y:-1620,r:60},
];
function onTrail(x:number,y:number) {
  if(Math.hypot((x-320)/148,(y+1590)/92)<1)return true;
  // Optional side nook rejoins the main route; it is never a mandatory gate.
  if(Math.hypot((x-380)/77,(y+1250)/30)<1)return true;
  if(Math.hypot((x-244)/77,(y+1000)/31)<1)return true;
  // Bridges the maze's own exit (x328) to the legacy trail's next confirmed point
  // (325,-411): the old detour through x365-417 left a collision gap right where
  // the compact maze now opens, and Moonie could walk forward and simply stop.
  if(Math.hypot((x-327)/30,(y+376)/45)<1)return true;
  // Same fix at the maze ENTRANCE: the legacy tube drifts to x>=332 just below the maze,
  // whose corridor is x312-342, so walking straight up the visible path hit a diagonal
  // wall at (306,-313)-(334,-331). This capsule joins both along the drawn path.
  {const ax=318,ay=-296,bx=327,by=-346,dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
   if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<24)return true;} // straight-sided capsule: no concave slivers
  return PATH.some((a,i)=>{
    const b=PATH[i+1]||a,dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
    const t=length?Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/length)):0;
    return Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<a.r+(b.r-a.r)*t;
  });
}
export const FLOWER = { x:365, y:212, radius:36 };
export const SPAWN = { x:284, y:239 };
export const WALK_AREA = [[188,122],[262,99],[296,93],[298,72],[354,72],[356,99],[416,122],[445,160],[482,197],[467,241],[416,277],[355,294],[350,356],[286,356],[278,294],[226,277],[181,245],[155,205],[171,163]];
export const ROCKS = [{x:220,y:265,rx:16,ry:8},{x:429,y:129,rx:16,ry:8},{x:157,y:127,rx:17,ry:9}];
export function insidePolygon(x:number,y:number, polygon=WALK_AREA) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [xi,yi]=polygon[i], [xj,yj]=polygon[j];
    if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
export function canWalk(x:number,y:number,bloomed:boolean,progress:Progress=0,secondAge=Infinity,thirdAge=Infinity) {
  if(bloomed&&y<90) {
    if(y<-1680 || (y<-610&&(progress<4||secondAge<2.6)) || (y<-1050&&progress<6) || (y<-1150&&progress<7) || (y<-1355&&(progress<8||thirdAge<3.2)))return false;
    // The river is never walkable: the continuous safe stepping-stone crossing is.
    if(y<-424&&y>-533&&(x<302||x>340))return false;
    if(!onTrail(x-7,y)||!onTrail(x+7,y)||!onTrail(x,y+3))return false;
    return !Object.values(LANDMARKS).some(o=>Math.hypot((x-o.x)/19,(y-o.y)/10)<1);
  }
  if(!insidePolygon(x-7,y) || !insidePolygon(x+7,y) || !insidePolygon(x,y+3)) return false;
  if(!bloomed && y<108) return false;
  if(Math.hypot((x-FLOWER.x)/17,(y-FLOWER.y)/9)<1) return false;
  return !ROCKS.some(r=>Math.hypot((x-r.x)/(r.rx+6),(y-r.y)/(r.ry+3))<1);
}
