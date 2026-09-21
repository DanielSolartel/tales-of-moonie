// Original provisional piano/celesta sketch, created locally with Web Audio.
export class MoonieAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0;
  private beat = 0;
  private paused = false;
  private muted = false;
  private musicVolume = .45;
  private effectsVolume = .55;
  private scene = 'title';
  private endingFade=0;
  private finalArea=false;
  private ascended=false;
  private stream:GainNode|null=null;
  private streamSource:AudioBufferSourceNode|null=null;
  private streamLevel=0;
  private nodes = new Set<AudioScheduledSourceNode>();
  async start() {
    if(!this.ctx) {
      this.ctx = new AudioContext();
      this.master=this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.music=this.ctx.createGain(); this.music.connect(this.master);
      this.effects=this.ctx.createGain(); this.effects.connect(this.master);
      const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*3,this.ctx.sampleRate),data=buffer.getChannelData(0);
      let brown=0;
      for(let i=0;i<data.length;i++){brown=(brown+Math.random()*.04-.02)/1.02;data[i]=brown*3;}
      const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter();
      source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1100;
      this.stream=this.ctx.createGain();this.stream.gain.value=0;
      source.connect(filter);filter.connect(this.stream);this.stream.connect(this.effects);source.start();this.nodes.add(source);this.streamSource=source;
      this.updateVolumes();
    }
    await this.ctx.resume();
    if(!this.timer) {this.next=this.ctx.currentTime+.12;this.timer=setInterval(()=>this.schedule(),100);}
  }
  setScene(scene:string) {
    const previous=this.scene;this.scene=scene;
    if(scene!=='forest')this.setStream(0);
    if(scene==='title'){
      if(previous==='end'){
        // Returning immediately must not carry the final sustained note into a new story.
        this.nodes.forEach(n=>{if(n!==this.streamSource){try{n.stop();}catch{}}});
        this.beat=0;if(this.ctx)this.next=this.ctx.currentTime+.12;
      }
      this.endingFade=0;this.ascended=false;this.finalArea=false;
    }
    this.updateVolumes();
  }
  setFinalArea(value:boolean){this.finalArea=value;}
  setEndingFade(value:number){this.endingFade=value;this.updateVolumes();}
  setStream(value:number) {
    this.streamLevel=value;
    if(this.ctx)this.stream?.gain.setTargetAtTime(this.scene==='forest'?this.streamLevel*.2:0,this.ctx.currentTime,.25);
  }
  setVolumes(music:number,effects:number,muted:boolean) {
    this.musicVolume=music;this.effectsVolume=effects;this.muted=muted;this.updateVolumes();
  }
  private updateVolumes() {
    if(!this.ctx) return;
    this.master?.gain.setTargetAtTime(this.muted||this.paused?0:.7,this.ctx.currentTime,.05);
    this.music?.gain.setTargetAtTime(this.musicVolume*(1-this.endingFade*.92),this.ctx.currentTime,.08);
    this.effects?.gain.setTargetAtTime(this.effectsVolume,this.ctx.currentTime,.03);
  }
  pause(value:boolean) {this.paused=value;this.updateVolumes();if(this.ctx){if(value)void this.ctx.suspend();else void this.ctx.resume();}}
  private note(midi:number,at:number,duration:number,volume:number,bell=false,bus=this.music) {
    if(!this.ctx||!bus) return;
    const frequency=440*Math.pow(2,(midi-69)/12);
    [1,2,3].forEach((partial,i)=>{
      const osc=this.ctx!.createOscillator(),env=this.ctx!.createGain();
      osc.type='sine';osc.frequency.value=frequency*partial*(bell&&i===2?1.003:1);
      env.gain.setValueAtTime(0,at);env.gain.linearRampToValueAtTime(volume/(i*4+1),at+.009);
      env.gain.exponentialRampToValueAtTime(.0001,at+duration/(i+1));
      osc.connect(env);env.connect(bus!);osc.start(at);osc.stop(at+duration+.04);
      this.nodes.add(osc);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();env.disconnect();};
    });
  }
  private schedule() {
    if(!this.ctx) return;
    if(this.paused){return;}
    if(this.scene==='end'){this.next=this.ctx.currentTime+.1;return;}
    const melody=[76,null,79,83,81,null,79,null,76,null,74,76,79,null,74,null,72,null,76,79,78,null,76,null,74,null,71,74,76,null,null,null];
    while(this.next<this.ctx.currentTime+.22) {
      const n=melody[this.beat%melody.length];
      const factor=this.scene==='classroom'?.18:this.scene==='dream'?.4:this.scene==='letter'||this.scene==='closing'?.65:1;
      if(n) this.note(n,this.next,2.5,.1*factor);
      if(this.beat%4===0) this.note([48,53,57,55][Math.floor(this.beat/8)%4],this.next,3.8,.065*factor);
      if(this.beat%8===6 && !['classroom','letter'].includes(this.scene)&&(this.scene!=='closing'||this.ascended)) this.note(88,this.next,2,.023,true);
      if(this.scene==='forest' && this.beat%8===2) this.rustle(this.finalArea?.01:.025);
      this.beat++;this.next+=.48;
    }
  }
  private rustle(volume:number) {
    if(!this.ctx||!this.effects) return;
    const len=this.ctx.sampleRate*.15,buffer=this.ctx.createBuffer(1,len,this.ctx.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
    const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();
    source.buffer=buffer;filter.type='lowpass';filter.frequency.value=800;gain.gain.value=volume;
    source.connect(filter);filter.connect(gain);gain.connect(this.effects);source.start();
    this.nodes.add(source);source.onended=()=>{this.nodes.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};
  }
  step(){this.rustle(.045);}
  click(){if(this.ctx)this.note(83,this.ctx.currentTime,.15,.045,true,this.effects);}
  challengeNote(index:number){if(this.ctx&&!this.paused)this.note([76,79,83,86,88][Math.abs(index)%5],this.ctx.currentTime,.7,.075,true,this.effects);}
  star(){if(this.ctx)[88,91].forEach((n,i)=>this.note(n,this.ctx!.currentTime+i*.28,1,.065,true,this.effects));}
  fall(){this.rustle(.12);if(this.ctx)this.note(43,this.ctx.currentTime,.17,.1,false,this.effects);}
  simon(){
    if(!this.ctx||!this.effects)return;
    const at=this.ctx.currentTime,osc=this.ctx.createOscillator(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();
    osc.type='triangle';osc.frequency.setValueAtTime(330,at);osc.frequency.exponentialRampToValueAtTime(180,at+.13);
    filter.type='lowpass';filter.frequency.value=700;gain.gain.setValueAtTime(.08,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.17);
    osc.connect(filter);filter.connect(gain);gain.connect(this.effects);osc.start(at);osc.stop(at+.2);this.nodes.add(osc);
    osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();filter.disconnect();gain.disconnect();};
    this.rustle(.055);this.note(94,at+.25,.06,.035,true,this.effects);
  }
  bloom(){if(this.ctx)[76,79,83,88].forEach((n,i)=>this.note(n,this.ctx!.currentTime+i*.19,2,.16,true,this.effects));}
  dream(){if(this.ctx)[72,79,84,88].forEach((n,i)=>this.note(n,this.ctx!.currentTime+i*.36,3,.065,true,this.effects));}
  chest(){this.rustle(.08);if(this.ctx){this.note(48,this.ctx.currentTime,.4,.065,false,this.effects);this.note(91,this.ctx.currentTime+.65,1.3,.06,true,this.effects);}}
  paper(){this.rustle(.055);}
  ascend(){this.ascended=true;if(this.ctx)[83,88,91,95].forEach((n,i)=>this.note(n,this.ctx!.currentTime+i*.45,2.4,.045,true));}
  finish(){if(this.ctx)this.note(76,this.ctx.currentTime,6,.22);}
  dispose(){if(this.timer)clearInterval(this.timer);this.timer=null;this.nodes.forEach(n=>{try{n.stop();}catch{}});this.nodes.clear();void this.ctx?.close();}
}
