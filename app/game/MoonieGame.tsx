'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Maximize, Pause, Play, Volume2, VolumeX, Flower2, Moon, Keyboard } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FALL_DURATION, RISE_DURATION } from './animation';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { MoonieAudio } from './audio';
import { MoonieRenderer, World } from './render';
import { freshChallenges, nearAction, activateChallenge, tickChallenges, walkAllowed, objectiveFor, gameCamera, storyY, startCinema, busy, tryRiverStep } from './challenges';
import { DEFAULT_LOOK, Direction, DialogueKind, FLOWER, FACES, Look, OUTFITS, SKINS, SPAWN, SCRIPTS, Scene, VIEW, canWalk, Progress, LANDMARKS, nearbyInteraction, completeScene, cameraY, LETTER } from './story';

type Dialogue = {kind:DialogueKind;index:number};
const directionList:Direction[]=['front','right','back','left'];
export default function MoonieGame() {
  const [scene,setScene]=useState<Scene>('title');
  const [look,setLook]=useState<Look>(DEFAULT_LOOK);
  const [ready,setReady]=useState(false);
  const [loadError,setLoadError]=useState('');
  const [dialogue,setDialogue]=useState<Dialogue|null>(null);
  const [visibleChars,setVisibleChars]=useState(0);
  const [paused,setPaused]=useState(false);
  const [bloomed,setBloomed]=useState(false);
  const [bloomNotice,setBloomNotice]=useState(false);
  const [nearby,setNearby]=useState<ReturnType<typeof nearAction>>(null);
  const [objective,setObjective]=useState<{text:string;detail?:string}>({text:'Explora el claro bajo la luna'});
  // The stone-crossing retry cinema (riverError) zooms the camera in on Moonie's face;
  // the persistent objective box must step aside only for that one close shot.
  const [closeUp,setCloseUp]=useState(false);
  const [noticeOpacity,setNoticeOpacity]=useState(0);
  const [progress,setProgress]=useState<Progress>(0);
  const [camera,setCamera]=useState(0);
  const [inSendero,setInSendero]=useState(false);
  const secondBloomed=progress>=4,thirdBloomed=progress===8;
  const [moved,setMoved]=useState(false);
  const finished=scene==='end';
  const [opening,setOpening]=useState(false);
  const [previewDir,setPreviewDir]=useState<Direction>('front');
  const [music,setMusic]=useState(45),[effects,setEffects]=useState(55),[muted,setMuted]=useState(false);
  const [audioOn,setAudioOn]=useState(false);
  const [fullError,setFullError]=useState('');
  const canvas=useRef<HTMLCanvasElement>(null),preview=useRef<HTMLCanvasElement>(null),frame=useRef<HTMLDivElement>(null);
  const renderer=useRef<MoonieRenderer|null>(null),audio=useRef<MoonieAudio|null>(null);
  const keys=useRef(new Set<string>()),stepTimer=useRef(0),dialogueTimer=useRef(0),advanceRef=useRef(()=>{});
  const live=useRef({scene,look,paused,dialogue,bloomed,finished,visibleChars,progress});
  live.current={scene,look,paused,dialogue,bloomed,finished,visibleChars,progress};
  const world=useRef<World>({scene:'title',...SPAWN,direction:'front',walking:false,time:0,bloomed:false,bloomTime:0,dreamTime:0,sleeping:false,look:DEFAULT_LOOK,animationTime:0,interactionTime:-1,progress:0,secondBloomTime:0,reading:null,thirdBloomTime:0,motion:null,motionTime:0,starTime:0,simonMet:false,simonTime:-1,starGreeting:false,flowerPulse:false,challenges:freshChallenges()});
  const beginAudio=useCallback(()=>{
    if(!audio.current)audio.current=new MoonieAudio();
    void audio.current.start().then(()=>setAudioOn(true)).catch(()=>setAudioOn(false));
  },[]);
  useEffect(()=>{audio.current?.setVolumes(music/100,effects/100,muted);},[music,effects,muted,audioOn]);
  useEffect(()=>{audio.current?.setScene(scene);},[scene,audioOn]);
  useEffect(()=>{keys.current.clear();audio.current?.pause(paused);},[paused]);
  const openDialogue=useCallback((kind:DialogueKind)=>{dialogueTimer.current=0;setVisibleChars(0);setDialogue({kind,index:0});keys.current.clear();if(kind!=='class'&&kind!=='wake')world.current.interactionTime=0;},[]);
  const line=dialogue?SCRIPTS[dialogue.kind][dialogue.index]:null;
  const reset=useCallback(()=>{
    keys.current.clear();setDialogue(null);setVisibleChars(0);dialogueTimer.current=0;stepTimer.current=0;setBloomNotice(false);setBloomed(false);setNearby(null);setProgress(0);setCamera(0);setInSendero(false);setMoved(false);setOpening(false);setPaused(false);setCloseUp(false);setScene('title');
    Object.assign(world.current,{...SPAWN,direction:'front',walking:false,bloomed:false,bloomTime:0,sleeping:false,dreamTime:0,progress:0,secondBloomTime:0,animationTime:0,interactionTime:-1,reading:null,thirdBloomTime:0,motion:null,motionTime:0,starTime:0,simonMet:false,simonTime:-1,starGreeting:false,flowerPulse:false,chestTime:undefined,finalTime:0,challenges:freshChallenges()});
  },[]);
  const advance=useCallback(()=>{
    const s=live.current;
    if(s.paused)return;
    if(s.scene==='end'){reset();return;}
    if(s.scene==='letter'){world.current.finalTime=0;world.current.direction='front';setScene('closing');audio.current?.paper();return;}
    if(s.scene==='closing'||world.current.chestTime!==undefined||busy(world.current.challenges!))return;
    if(world.current.motion==='fall'||world.current.motion==='rise')return;
    if(s.dialogue) {
      const lines=SCRIPTS[s.dialogue.kind],current=lines[s.dialogue.index];
      if(s.visibleChars<current.text.length){setVisibleChars(current.text.length);dialogueTimer.current=current.text.length*.026+.7;return;}
      if(dialogueTimer.current<.35)return;
      audio.current?.click();
      if(s.dialogue.index<lines.length-1){dialogueTimer.current=0;setVisibleChars(0);setDialogue({...s.dialogue,index:s.dialogue.index+1});}
      else {
        setDialogue(null);keys.current.clear();
        if(s.dialogue.kind==='class'){world.current.sleeping=true;world.current.dreamTime=0;setScene('dream');audio.current?.dream();}
        if(s.dialogue.kind==='flower'){startCinema(world.current,'ritual',0,4.5);return;}
        if(s.dialogue.kind==='flower2'){startCinema(world.current,'bloom2',0,4);return;}
        if(s.dialogue.kind==='flower3'){startCinema(world.current,'bloom3',0,4.5);return;}
        const next=completeScene(s.progress,s.dialogue.kind);
        setProgress(next);world.current.progress=next;
        if(s.dialogue.kind==='book3'){world.current.starTime=world.current.time;audio.current?.star();openDialogue('star');}
        if(s.dialogue.kind==='roots'){world.current.direction='right';world.current.motion='fall';world.current.motionTime=0;audio.current?.fall();}
        if(s.dialogue.kind==='fall'){world.current.motion='rise';world.current.motionTime=0;}
        if(s.dialogue.kind==='simon'){world.current.simonMet=true;world.current.simonTime=world.current.time;audio.current?.simon();}
        if(s.dialogue.kind==='chest'){world.current.chestTime=world.current.time;setNearby(null);setOpening(true);audio.current?.chest();}
      }
    } else if(s.scene==='forest') {
      const w=world.current,action=nearAction(w);
      if(action){
        const dx=action.x-w.x,dy=action.y-w.y;w.direction=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'front':'back';
        if(action.type==='story')openDialogue(action.kind!);
        else {activateChallenge(w,action);w.interactionTime=0;audio.current?.click();setNearby(nearAction(w));setObjective(objectiveFor(w));}
      }
    }
  },[openDialogue,reset]);
  advanceRef.current=advance;
  useEffect(()=>{
    let dead=false,raf=0,last=0,lastUi=0,lastSound=0;
    setReady(false);
    const r=new MoonieRenderer();renderer.current=r;
    r.load().then(()=>{if(!dead)setReady(true);}).catch((err:Error)=>{if(!dead)setLoadError(err.message);});
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick(ms:number) {
      if(dead)return;
      const dt=Math.min((ms-(last||ms))/1000,.04);last=ms;
      const w=world.current,s=live.current;w.scene=s.scene;w.look=s.look;w.bloomed=s.bloomed;w.progress=s.progress;
      w.reading=s.dialogue?.kind==='book1'||s.dialogue?.kind==='book2'||s.dialogue?.kind==='book3'?s.dialogue.kind:null;
      w.starGreeting=s.dialogue?.kind==='star';w.flowerPulse=s.dialogue?.kind==='flower3';
      if(!s.paused) {
        const wasWalking=w.walking;
        w.time+=dt;
        if(w.interactionTime>=0){w.interactionTime+=dt;if(w.interactionTime>.5)w.interactionTime=-1;}
        if(s.dialogue){dialogueTimer.current+=dt;if(ms-lastUi>25){setVisibleChars(v=>Math.max(v,Math.floor(dialogueTimer.current/.026)));lastUi=ms;}}
        w.walking=false;
        if(s.scene==='forest'&&w.chestTime!==undefined&&w.time-w.chestTime>=1.5){setScene('letter');setOpening(false);audio.current?.paper();}
        if(s.scene==='closing'){
          const before=w.finalTime||0;w.finalTime=before+dt;
          if(before<3&&w.finalTime>=3)audio.current?.ascend();
          audio.current?.setEndingFade(Math.max(0,Math.min(1,(w.finalTime-7)/3)));
          if(w.finalTime>=10){setScene('end');audio.current?.finish();}
        }
        if(w.motion==='fall'||w.motion==='rise') {
          w.motionTime+=dt;
          if(w.motionTime>=(w.motion==='fall'?FALL_DURATION:RISE_DURATION)){if(w.motion==='fall'){w.motion='fallen';openDialogue('fall');}else{w.motion=null;w.animationTime=0;}}
        }
        if(s.scene==='dream') {
          w.dreamTime+=dt;
          if(w.dreamTime>3.1){setScene('forest');openDialogue('wake');w.sleeping=false;}
        }
        if(s.scene==='classroom')w.sleeping=s.dialogue?.index===2;
        if(s.scene==='forest'&&!s.dialogue&&!w.motion&&w.chestTime===undefined) {
          tickChallenges(w,dt);
          const q=w.challenges!;
          if(q.soundSerial!==lastSound){lastSound=q.soundSerial;audio.current?.challengeNote(q.sound);}
          if(q.pendingBloom){const flower=q.pendingBloom;q.pendingBloom=0;if(flower===1){w.bloomed=true;w.bloomTime=w.time;setBloomed(true);}else if(flower===2){w.progress=4;setProgress(4);w.secondBloomTime=w.time;}else{w.progress=8;setProgress(8);w.thirdBloomTime=w.time;}q.notice=4.5;audio.current?.bloom();}
          const k=keys.current;
          let dx=Number(k.has('d')||k.has('arrowright'))-Number(k.has('a')||k.has('arrowleft'));
          let dy=Number(k.has('s')||k.has('arrowdown'))-Number(k.has('w')||k.has('arrowup'));
          const jumped=(dx||dy)&&!busy(q)&&tryRiverStep(w,dx,dy);
          if(jumped)keys.current.clear();
          if((dx||dy)&&!busy(q)&&q.river!=='returning'&&!jumped) {
            w.direction=Math.abs(dx)>0?(dx>0?'right':'left'):(dy>0?'front':'back');
            const length=Math.hypot(dx,dy);dx=dx/length*VIEW.speed*dt;dy=dy/length*VIEW.speed*dt;
            const beforeX=w.x,beforeY=w.y;
            if(walkAllowed(w,w.x+dx,w.y))w.x+=dx;
            if(walkAllowed(w,w.x,w.y+dy))w.y+=dy;
            w.walking=Math.abs(w.x-beforeX)+Math.abs(w.y-beforeY)>.01;
            if(w.walking){setMoved(true);stepTimer.current+=dt;if(stepTimer.current>.29){stepTimer.current=0;audio.current?.step();}}
          }
          setNearby(nearAction(w));setObjective(objectiveFor(w));setCloseUp(w.challenges!.cinema?.kind==='riverError');
          const notice=w.challenges!.notice;setBloomNotice(notice>0);setNoticeOpacity(Math.min(1,notice/.5,(4.5-notice)/.35));
          setCamera(gameCamera(w.y));setInSendero(w.y<0);
          audio.current?.setStream(Math.max(0,1-Math.abs(storyY(w.y)+480)/150));audio.current?.setFinalArea(storyY(w.y)<-1440);
          if(s.progress===6&&storyY(w.y)<-1105){setNearby(null);openDialogue('roots');}
        }
        w.animationTime=wasWalking===w.walking?w.animationTime+dt:0;
      } else w.walking=false;
      const ctx=canvas.current?.getContext('2d');if(ctx&&r.clearing){r.draw(ctx,w,reduced);canvas.current!.dataset.x=w.x.toFixed(2);canvas.current!.dataset.y=w.y.toFixed(2);canvas.current!.dataset.facing=w.direction;}
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);
    const keyDown=(e:KeyboardEvent)=>{
      const target=e.target as HTMLElement;
      const interactive=!!target.closest('input,button,[role="radio"],[role="slider"],[role="dialog"]');
      const key=e.key.toLowerCase(),s=live.current;
      const movementKey=['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key);
      if(key==='escape'){if(e.defaultPrevented)return;e.preventDefault();setPaused(!s.paused);return;}
      if(s.paused)return;
      // Return keyboard focus to the game after using sound/fullscreen controls.
      if(s.scene==='forest'&&movementKey&&interactive&&!target.closest('[role="dialog"]'))target.blur();
      if(interactive && !((s.dialogue||s.scene==='letter'||s.scene==='end')&&(key==='e'||key===' ')) && !(s.scene==='forest'&&movementKey&&!target.closest('[role="dialog"]')))return;
      if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e',' '].includes(key))e.preventDefault();
      if(key==='e'||key===' '){if(!e.repeat)advanceRef.current();return;}
      if(s.scene==='forest'&&!s.dialogue&&!world.current.motion&&world.current.chestTime===undefined&&!busy(world.current.challenges!)&&world.current.challenges!.river!=='returning'&&movementKey){
        // Preserve very short taps that fall entirely between animation frames.
        if(!e.repeat&&!keys.current.has(key)){
          const dx=Number(key==='d'||key==='arrowright')-Number(key==='a'||key==='arrowleft');
          const dy=Number(key==='s'||key==='arrowdown')-Number(key==='w'||key==='arrowup');
          const w=world.current,nudge=VIEW.speed/30;
          if(w.challenges!.river==='crossing'&&e.repeat)return;
          if(tryRiverStep(w,dx,dy)){keys.current.clear();return;}
          w.direction=dx?(dx>0?'right':'left'):(dy>0?'front':'back');
          if(walkAllowed(w,w.x+dx*nudge,w.y))w.x+=dx*nudge;
          if(walkAllowed(w,w.x,w.y+dy*nudge))w.y+=dy*nudge;
          setMoved(true);
        }
        keys.current.add(key);
      }
    };
    const keyUp=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());
    const blur=()=>{keys.current.clear();if(['forest','classroom','dream','letter','closing'].includes(live.current.scene))setPaused(true);};
    const visibility=()=>{if(document.hidden)blur();};
    window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',blur);document.addEventListener('visibilitychange',visibility);
    return()=>{dead=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',visibility);audio.current?.dispose();audio.current=null;};
  },[openDialogue]);
  useEffect(()=>{if(ready&&preview.current)renderer.current?.preview(preview.current,look,previewDir);},[look,previewDir,ready,scene]);
  const startStory=()=>{beginAudio();audio.current?.click();setScene('classroom');openDialogue('class');(document.activeElement as HTMLElement)?.blur();};
  const fullScreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();setFullError('');}catch{setFullError('Puedes ampliar la ventana del navegador para jugar.');}};
  const target=nearby;
  const bookPage=dialogue?.index===0&&(dialogue.kind==='book1'||dialogue.kind==='book2'||dialogue.kind==='book3');
  return <main className="moonie-shell">
    <div className="game-frame" ref={frame} data-scene={scene}>
      <canvas ref={canvas} width={640} height={360} className="world-canvas" aria-label="Claro del bosque lunar de Moonie" onClick={()=>{(document.activeElement as HTMLElement)?.blur();advance();}} />
      {!ready&&<div className="loading-screen"><Moon size={32}/><p>{loadError?'No pudimos abrir el cuento.':'Preparando un pequeño cuento…'}</p>{loadError&&<button className="moon-button" onClick={()=>window.location.reload()}>Volver a intentar</button>}</div>}
      {ready&&<>
        <div className="utility-bar">
          <button className="utility" aria-label={muted?'Activar sonido':'Silenciar sonido'} onClick={()=>{beginAudio();setMuted(v=>!v);}}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</button>
          <button className="utility" aria-label="Pantalla completa" onClick={fullScreen}><Maximize size={18}/></button>
          <button className="utility" aria-label="Pausa y ajustes" onClick={()=>setPaused(true)}><Pause size={19}/></button>
        </div>
        {fullError&&<p className="fullscreen-note" role="status">{fullError}</p>}
        {scene==='title'&&<section className="title-screen">
          <h1><span>Tales of</span>Moonie</h1>
          <p className="title-subtitle">Un pequeño cuento bajo la luna</p>
          <button className="moon-button start-button" onClick={()=>{beginAudio();audio.current?.click();setScene('customize');}}>Comenzar <ChevronRight size={18}/></button>
          <p className="title-footnote"><Keyboard size={15}/> Teclado · Sonido recomendado</p>
        </section>}
        {scene==='customize'&&<section className="customize-screen">
          <div className="customize-heading"><p className="eyebrow">ANTES DE EMPEZAR</p><h2>¿Cómo aparecerá Moonie<br/>en este cuento?</h2></div>
          <div className="customize-layout">
            <div className="character-stage">
              <canvas ref={preview} width={192} height={256} aria-label={`Moonie con atuendo ${look.outfit}, piel ${look.skin} y ${look.face}`} />
              <div className="turn-controls"><button aria-label="Girar a la izquierda" onClick={()=>setPreviewDir(d=>directionList[(directionList.indexOf(d)+3)%4])}><ArrowLeft size={16}/></button><span>Moonie</span><button aria-label="Girar a la derecha" onClick={()=>setPreviewDir(d=>directionList[(directionList.indexOf(d)+1)%4])}><ArrowRight size={16}/></button></div>
            </div>
            <div className="choices">
              <fieldset><legend>01 <span>Atuendo</span></legend><RadioGroup value={look.outfit} onValueChange={v=>{setLook(l=>({...l,outfit:v as Look['outfit']}));audio.current?.click();}} className="outfit-options" aria-label="Atuendo">
                {OUTFITS.map(o=><label key={o.value} className={`outfit-choice ${look.outfit===o.value?'selected':''}`}><RadioGroupItem value={o.value} id={`outfit-${o.value}`} /><span>{o.label}</span>{look.outfit===o.value&&<Check size={14}/>}</label>)}
              </RadioGroup><p className="choice-detail">{OUTFITS.find(o=>o.value===look.outfit)?.detail}</p></fieldset>
              <fieldset><legend>02 <span>Tono de piel</span></legend><RadioGroup value={look.skin} onValueChange={v=>setLook(l=>({...l,skin:v as Look['skin']}))} className="skin-options" aria-label="Tono de piel">
                {SKINS.map(s=><label key={s.value} className={`skin-choice ${look.skin===s.value?'selected':''}`}><RadioGroupItem value={s.value} id={`skin-${s.value}`} aria-label={s.label}/><span className="skin-dot" style={{background:s.color}}/>{s.label}</label>)}
              </RadioGroup></fieldset>
              <fieldset><legend>03 <span>Rasgo facial</span></legend><RadioGroup value={look.face} onValueChange={v=>setLook(l=>({...l,face:v as Look['face']}))} className="face-options" aria-label="Rasgo facial">
                {FACES.map(f=><label key={f.value} className={`face-choice ${look.face===f.value?'selected':''}`}><RadioGroupItem value={f.value} id={`face-${f.value}`}/><span>{f.label}</span></label>)}
              </RadioGroup></fieldset>
            </div>
          </div>
          <div className="customize-footer"><button className="text-button" onClick={()=>setScene('title')}><ArrowLeft size={16}/> Volver</button><button className="moon-button" onClick={startStory}>Entrar en el cuento <ChevronRight size={17}/></button></div>
        </section>}
        {scene==='classroom'&&<div className="scene-caption"><span>EL MUNDO DE TODOS LOS DÍAS</span><p>Humanística III</p></div>}
        {scene==='dream'&&<div className="dream-overlay" aria-label="Moonie se duerme y sueña con el bosque"/>}
        {scene==='forest'&&<>
          <div className={`quest${closeUp?' quest-safe':''}`} role="status"><span className="eyebrow">Objetivo</span><p>{objective.text}</p>{objective.detail&&<small>{objective.detail}</small>}</div>
          <div className={`flower-counter ${bloomed?'awake':''}`}><Flower2 size={18}/><span>Flores lunares: <strong>{thirdBloomed?'3':secondBloomed?'2':bloomed?'1':'0'}/3</strong></span></div>
          {!dialogue&&!opening&&target&&<button className="interact-prompt" style={{left:`${target.x/640*100}%`,top:`${Math.max(80,target.y-camera-51)/360*100}%`}} onClick={advance}><kbd>E</kbd> {target.label}</button>}
          {!dialogue&&!opening&&<div className="movement-hint"><span><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> Mover</span><span><kbd>E</kbd> Interactuar</span><span><kbd>Esc</kbd> Pausa</span></div>}
          {bloomNotice&&!dialogue&&<div className="bloom-toast" style={{opacity:noticeOpacity}} role="status"><Flower2 size={14}/> Una flor lunar ha despertado</div>}
        </>}
        {line&&<div className={`dialogue ${bookPage?'book-reading':''}`} role="group" aria-label={`Diálogo de ${line.speaker}`}>
          <span className="speaker">{line.speaker}{line.thought&&<span> · pensando</span>}</span>
          {bookPage&&<div className="book-vignette" aria-hidden="true"><img src={renderer.current?.bookPages[dialogue?.kind==='book3'?2:dialogue?.kind==='book2'?1:0]} width={512} height={340} alt="" loading="eager" decoding="sync"/></div>}
          <p aria-live="polite" aria-label={line.text}><span aria-hidden="true">{line.text.slice(0,visibleChars)}</span><span className="sr-only">{line.text}</span></p>
          <button className="advance" aria-label="Continuar diálogo" onClick={advance}><kbd>E</kbd><span>Continuar</span><ChevronRight size={16}/></button>
        </div>}
        <section className={`letter-screen ${scene==='letter'?'letter-visible':''}`} aria-label="Carta para Moonie" aria-hidden={scene!=='letter'} inert={scene!=='letter'}><div className="letter-page"><img className="letter-paper" src="/assets/letter-paper.png" alt="" width={1122} height={1402} loading="eager" decoding="sync"/><div className="letter-copy"><h2>{LETTER[0]}</h2><p>{LETTER[1]}</p><p className="letter-date">{LETTER[2]}</p><p className="letter-signature">{LETTER[3]}</p></div></div><button className="letter-continue" onClick={advance} aria-label="Terminar de leer la carta"><kbd>E</kbd> Continuar <ChevronRight size={16}/></button></section>
        {finished&&<section className="ending-screen"><h2>FIN… POR AHORA 🌙</h2><p>Tales of Moonie</p><button onClick={reset}>Pulsa E para volver al inicio</button></section>}
      </>}
      <Dialog open={paused} onOpenChange={setPaused}><DialogContent className="pause-dialog" showCloseButton={false}><DialogTitle>Un pequeño descanso</DialogTitle><DialogDescription>El bosque te espera.</DialogDescription><label className="volume-label">Música <span>{music}%</span></label><Slider aria-label="Volumen de música" value={[music]} onValueChange={v=>setMusic(v[0])} max={100} step={5}/><label className="volume-label">Efectos y ambiente <span>{effects}%</span></label><Slider aria-label="Volumen de efectos" value={[effects]} onValueChange={v=>setEffects(v[0])} max={100} step={5}/><p className="pause-help">WASD o flechas para moverte.<br/>E, espacio o clic para avanzar el diálogo.</p><button className="moon-button" onClick={()=>{beginAudio();setPaused(false);(document.activeElement as HTMLElement)?.blur();}}><Play size={17}/> Continuar</button></DialogContent></Dialog>
    </div>
    <div className="below-game"><span>Tales of Moonie</span></div>
  </main>;
}
