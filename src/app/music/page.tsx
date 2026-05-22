'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ============================================================
// SoundCloud Widget API types
// ============================================================
declare global {
  interface Window {
    SC: any
  }
}

// ============================================================
// Constants
// ============================================================
const SC_PLAYLIST_URL = 'https://soundcloud.com/moncef-hssan/sets/lumina-radio'

const MOOD_FILTERS = [
  { id: 'all',      label: 'All',     emoji: '✦' },
  { id: 'alive',    label: 'Energy',  emoji: '⚡' },
  { id: 'joyful',   label: 'Joyful',  emoji: '✨' },
  { id: 'soft',     label: 'Tender',  emoji: '🌸' },
  { id: 'drifting', label: 'Adrift',  emoji: '🌙' },
  { id: 'healing',  label: 'Healing', emoji: '🌱' },
  { id: 'heavy',    label: 'Release', emoji: '🌧' },
  { id: 'calm',     label: 'Still',   emoji: '🌊' },
]

const PLAYLIST_CARDS = [
  { id: 'arabic-fire',    scIndex: 0,  title: 'Arabic Fire 🔥',    desc: 'High-energy Arabic pop to ignite your night.',           emoji: '🔥',  grad: 'linear-gradient(135deg,rgba(239,68,68,0.65) 0%,rgba(245,158,11,0.6) 100%)',   moods: ['alive','joyful'] },
  { id: 'arabic-soft',    scIndex: 8,  title: 'Arabic Soft 🌸',    desc: 'Tender voices and warm melodies.',                       emoji: '🌸',  grad: 'linear-gradient(135deg,rgba(236,72,153,0.55) 0%,rgba(196,181,253,0.55) 100%)', moods: ['soft','healing','calm'] },
  { id: 'arabic-nights',  scIndex: 13, title: 'Arabic Nights 🌙',  desc: 'Late nights and longing hearts.',                        emoji: '🌙',  grad: 'linear-gradient(135deg,rgba(139,92,246,0.65) 0%,rgba(30,27,75,0.8) 100%)',   moods: ['drifting','heavy'] },
  { id: 'arabic-healing', scIndex: 18, title: 'Arabic Healing 🌿', desc: 'Songs that understand your heart.',                      emoji: '🌿',  grad: 'linear-gradient(135deg,rgba(34,197,94,0.5) 0%,rgba(6,182,212,0.5) 100%)',   moods: ['healing','soft'] },
  { id: 'britney',        scIndex: 23, title: 'Britney Era ⚡',     desc: 'Early 2000s pop energy. Iconic, unapologetic, electric.', emoji: '⚡', grad: 'linear-gradient(135deg,rgba(234,179,8,0.65) 0%,rgba(249,115,22,0.6) 100%)',  moods: ['alive','joyful'] },
  { id: 'bruno',          scIndex: 33, title: 'Bruno Vibes 🌟',     desc: 'Smooth, feel-good grooves.',                             emoji: '🌟',  grad: 'linear-gradient(135deg,rgba(251,191,36,0.55) 0%,rgba(234,179,8,0.5) 100%)',  moods: ['joyful','alive','soft'] },
  { id: 'dystinct',       scIndex: 40, title: 'DYSTINCT Mode 👑',   desc: 'Arabic trap swagger. Walk tall, feel unstoppable.',      emoji: '👑',  grad: 'linear-gradient(135deg,rgba(79,70,229,0.7) 0%,rgba(139,92,246,0.65) 100%)',  moods: ['alive','joyful'] },
  { id: 'french',         scIndex: 42, title: 'French Drift 🌧️',   desc: 'French sounds for rainy evenings.',                      emoji: '🌧️', grad: 'linear-gradient(135deg,rgba(99,102,241,0.65) 0%,rgba(59,130,246,0.55) 100%)', moods: ['soft','drifting','calm'] },
  { id: 'queen',          scIndex: 47, title: 'Queen Catharsis 🎸', desc: 'For when you need to feel it all.',                      emoji: '🎸',  grad: 'linear-gradient(135deg,rgba(99,102,241,0.7) 0%,rgba(139,92,246,0.65) 100%)', moods: ['heavy','healing','alive'] },
]

const AMBIENT_PRESETS = [
  { id: 'rain',   label: 'Rain',        emoji: '🌧️', color: 'rgba(99,102,241,0.5)',  ytId: 'mPZkdNFkNps' },
  { id: 'ocean',  label: 'Ocean',       emoji: '🌊', color: 'rgba(14,165,233,0.5)',  ytId: 'Nep1qytq9JM' },
  { id: 'forest', label: 'Forest',      emoji: '🌲', color: 'rgba(34,197,94,0.5)',   ytId: 'xNN7iTA57jM' },
  { id: 'space',  label: 'Deep Space',  emoji: '🌌', color: 'rgba(139,92,246,0.5)',  ytId: 'Cea8YLonqBk' },
  { id: 'noise',  label: 'Brown Noise', emoji: '🤎', color: 'rgba(180,120,60,0.5)',  ytId: 'RqzGzwTY-6w' },
  { id: 'cafe',   label: 'Café',        emoji: '☕', color: 'rgba(217,119,6,0.5)',   ytId: 'MYPVQccHhAQ' },
]

// ============================================================
// Ambient Engine (Web Audio, no files needed)
// ============================================================
class AmbientEngine {
  private ctx: AudioContext | null = null
  private nodes: (AudioBufferSourceNode | OscillatorNode)[] = []
  private master: GainNode | null = null
  private cafeTimer: ReturnType<typeof setInterval> | null = null

  private gc(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  stop() {
    if (this.cafeTimer) { clearInterval(this.cafeTimer); this.cafeTimer = null }
    this.nodes.forEach(n => { try { n.stop(); n.disconnect() } catch {} })
    this.nodes = []
    if (this.master) { this.master.disconnect(); this.master = null }
  }

  setVolume(v: number) {
    if (this.master) this.master.gain.setTargetAtTime(v, this.gc().currentTime, 0.1)
  }

  async play(id: string, vol: number) {
    this.stop()
    const ctx = this.gc()
    if (ctx.state === 'suspended') await ctx.resume()
    this.master = ctx.createGain()
    this.master.gain.value = vol
    this.master.connect(ctx.destination)

    const mkNoise = (type: 'white'|'pink'|'brown') => {
      const sz = ctx.sampleRate * 4
      const buf = ctx.createBuffer(1, sz, ctx.sampleRate)
      const d = buf.getChannelData(0)
      if (type === 'white') { for (let i=0;i<sz;i++) d[i]=Math.random()*2-1 }
      else if (type === 'brown') { let l=0; for (let i=0;i<sz;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5} }
      else { let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0; for(let i=0;i<sz;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926} }
      const s = ctx.createBufferSource(); s.buffer=buf; s.loop=true; return s
    }
    const mkOsc = (f: number) => { const o=ctx.createOscillator(); o.frequency.value=f; return o }
    const mkFilt = (t: BiquadFilterType, f: number) => { const b=ctx.createBiquadFilter(); b.type=t; b.frequency.value=f; return b }
    const mkGain = (v: number) => { const g=ctx.createGain(); g.gain.value=v; return g }
    const chain = (...nn: AudioNode[]) => { for(let i=0;i<nn.length-1;i++) nn[i].connect(nn[i+1]) }
    const go = (n: AudioBufferSourceNode|OscillatorNode) => { n.start(); this.nodes.push(n) }
    const M = this.master

    if (id==='rain') {
      const n=mkNoise('pink'),f=mkFilt('lowpass',1200),g=mkGain(.4); chain(n,f,g,M); go(n)
      const r=mkNoise('brown'),rg=mkGain(.15); chain(r,rg,M); go(r)
    } else if (id==='ocean') {
      const n=mkNoise('pink'),f=mkFilt('lowpass',800),g=mkGain(.35)
      const lfo=mkOsc(.12),lg=mkGain(.28); chain(lfo,lg,g.gain as any); chain(n,f,g,M); go(n); go(lfo)
      const d=mkNoise('brown'),dg=mkGain(.12); chain(d,dg,M); go(d)
    } else if (id==='forest') {
      const n=mkNoise('pink'),f=mkFilt('bandpass',3000),g=mkGain(.18); chain(n,f,g,M); go(n)
      const w=mkNoise('white'),wf=mkFilt('highpass',4000),wg=mkGain(.06); chain(w,wf,wg,M); go(w)
    } else if (id==='space') {
      ;[55,82.5,110,165].forEach((f,i)=>{const o=mkOsc(f+i*.3),g=mkGain(.06);const lfo=mkOsc(.04+i*.015),lg=mkGain(.03);chain(lfo,lg,g.gain as any);chain(o,g,M);go(o);go(lfo)})
      const n=mkNoise('brown'),nf=mkFilt('lowpass',200),ng=mkGain(.05); chain(n,nf,ng,M); go(n)
    } else if (id==='noise') {
      const n=mkNoise('brown'),f=mkFilt('lowpass',600),g=mkGain(.5); chain(n,f,g,M); go(n)
    } else if (id==='cafe') {
      const n=mkNoise('pink'),f=mkFilt('bandpass',1200),g=mkGain(.2); chain(n,f,g,M); go(n)
      const clink=()=>{
        if(!this.ctx||!this.master)return
        const o=this.ctx.createOscillator(); o.type='sine'; o.frequency.value=1800+Math.random()*400
        const g2=this.ctx.createGain(),now=this.ctx.currentTime
        g2.gain.setValueAtTime(0,now); g2.gain.linearRampToValueAtTime(.06,now+.01); g2.gain.exponentialRampToValueAtTime(.001,now+.4)
        o.connect(g2); g2.connect(this.master); o.start(); o.stop(now+.41)
      }
      clink(); this.cafeTimer=setInterval(clink,2500+Math.random()*3000)
      const h=mkNoise('white'),hf=mkFilt('highpass',6000),hg=mkGain(.06); chain(h,hf,hg,M); go(h)
    }
  }

  cleanup() { this.stop(); if(this.ctx){this.ctx.close();this.ctx=null} }
}

// ============================================================
// Main Page
// ============================================================
export default function MusicPage() {
  const router = useRouter()
  const [moodFilter, setMoodFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'playlists'|'ambient'>('playlists')
  const [playerReady, setPlayerReady] = useState(false)
  const [playerVisible, setPlayerVisible] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<string|null>(null)
  const [activeAmbient, setActiveAmbient] = useState<string|null>(null)
  const [ambientVol, setAmbientVol] = useState(0.4)
  const [volume, setVolumeState] = useState(0.8)
  const [progress, setProgress] = useState(0)
  const [scLoaded, setScLoaded] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement|null>(null)
  const widgetRef = useRef<any>(null)
  const ambientRef = useRef<AmbientEngine|null>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval>|null>(null)
  const ytRefs = useRef<Record<string, HTMLIFrameElement|null>>({})

  // Load SC Widget API + init ambient engine
  useEffect(() => {
    ambientRef.current = new AmbientEngine()
    if ((window as any).SC) { setScLoaded(true); return }
    const s = document.createElement('script')
    s.src = 'https://w.soundcloud.com/player/api.js'
    s.onload = () => setScLoaded(true)
    document.head.appendChild(s)
    return () => { ambientRef.current?.cleanup() }
  }, [])

  // Init widget after SC loaded + iframe mounted
  useEffect(() => {
    if (!scLoaded || !iframeRef.current || widgetRef.current) return
    const SC = (window as any).SC
    const widget = SC.Widget(iframeRef.current)
    widgetRef.current = widget
    widget.bind(SC.Widget.Events.READY, () => {
      setPlayerReady(true)
      widget.setVolume(volume * 100)
    })
    widget.bind(SC.Widget.Events.PLAY, () => {
      setIsPlaying(true)
      widget.getCurrentSound((s: any) => { if (s) setNowPlaying(s.title) })
    })
    widget.bind(SC.Widget.Events.PAUSE, () => setIsPlaying(false))
    widget.bind(SC.Widget.Events.FINISH, () => setIsPlaying(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scLoaded])

  // Progress tracking
  useEffect(() => {
    if (progressTimer.current) clearInterval(progressTimer.current)
    if (isPlaying && widgetRef.current) {
      progressTimer.current = setInterval(() => {
        widgetRef.current.getPosition((pos: number) => {
          widgetRef.current.getDuration((dur: number) => {
            if (dur > 0) setProgress(pos / dur)
          })
        })
      }, 500)
    }
    return () => { if (progressTimer.current) clearInterval(progressTimer.current) }
  }, [isPlaying])

  const playPlaylist = useCallback((idx: number) => {
    setPlayerVisible(true)
    if (!playerReady || !widgetRef.current) return
    widgetRef.current.skip(idx)
    widgetRef.current.play()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [playerReady])

  const togglePlay = useCallback(() => {
    if (!widgetRef.current) return
    widgetRef.current.isPaused((paused: boolean) => {
      if (paused) widgetRef.current.play()
      else widgetRef.current.pause()
    })
  }, [])

  const handleVolume = useCallback((v: number) => {
    setVolumeState(v)
    widgetRef.current?.setVolume(v * 100)
  }, [])

  const postToYT = (id: string, cmd: object) => {
    const iframe = ytRefs.current[id]
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify(cmd), '*')
    }
  }

  const handleAmbient = useCallback((id: string) => {
    if (activeAmbient === id) {
      // Pause current
      postToYT(id, { event: 'command', func: 'pauseVideo', args: [] })
      setActiveAmbient(null)
    } else {
      // Pause previous if any
      if (activeAmbient) postToYT(activeAmbient, { event: 'command', func: 'pauseVideo', args: [] })
      // Play new — slight delay to ensure iframe is ready
      setTimeout(() => {
        postToYT(id, { event: 'command', func: 'playVideo', args: [] })
        postToYT(id, { event: 'command', func: 'setVolume', args: [Math.round(ambientVol * 100)] })
      }, 300)
      setActiveAmbient(id)
    }
  }, [activeAmbient, ambientVol])

  const handleAmbientVol = useCallback((v: number) => {
    setAmbientVol(v)
    if (activeAmbient) postToYT(activeAmbient, { event: 'command', func: 'setVolume', args: [Math.round(v * 100)] })
  }, [activeAmbient])

  const filtered = moodFilter === 'all' ? PLAYLIST_CARDS : PLAYLIST_CARDS.filter(p => p.moods.includes(moodFilter))

  const scUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(SC_PLAYLIST_URL)}&color=%23a78bfa&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&buying=false&sharing=false&download=false`

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#080612}
        .pg{min-height:100dvh;background:linear-gradient(180deg,#080612 0%,#0e0a1f 50%,#0a0f1e 100%);font-family:'Sora','Inter',sans-serif;color:#fff;overflow-x:hidden;padding-bottom:100px}
        .st{height:env(safe-area-inset-top,16px)}
        .hdr{padding:20px 20px 12px}
        .hdr-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.3);margin-bottom:4px}
        .hdr-h1{font-size:26px;font-weight:600;background:linear-gradient(135deg,#e2d9f3,#a78bfa,#f9a8d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hdr-sub{font-size:13px;font-weight:300;color:rgba(255,255,255,.3);margin-top:6px}
        .sc-wrap{margin:0 16px 20px;border-radius:20px;overflow:hidden;border:.5px solid rgba(167,139,250,.2);background:rgba(255,255,255,.03)}
        .sc-head{display:flex;align-items:center;gap:10px;padding:14px 16px 12px}
        .sc-icon{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#ff5500,#ff8800);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .sc-info{flex:1;min-width:0}
        .sc-name{font-size:13px;font-weight:600;color:rgba(255,255,255,.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sc-sub{font-size:10px;color:rgba(255,255,255,.35);margin-top:2px}
        .sc-tog{font-size:10px;color:rgba(167,139,250,.9);background:rgba(139,92,246,.15);border:.5px solid rgba(139,92,246,.3);border-radius:8px;padding:6px 12px;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0}
        .sc-frame{overflow:hidden;transition:height .3s ease}
        .sc-frame iframe{width:100%;border:none;display:block}
        .mini{display:flex;align-items:center;gap:10px;padding:0 16px 12px}
        .mini-btn{width:34px;height:34px;border-radius:50%;border:.5px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;flex-shrink:0;transition:background .15s}
        .mini-btn:active{background:rgba(139,92,246,.3)}
        .mini-play{width:42px;height:42px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border:none;font-size:16px}
        .mini-track{flex:1;min-width:0}
        .mini-title{font-size:12px;font-weight:600;color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mini-prog{margin-top:5px;height:2px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}
        .mini-prog-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#a78bfa,#60a5fa);transition:width .5s linear}
        .vol-row{display:flex;align-items:center;gap:8px;padding:0 16px 12px}
        .vol-lbl{font-size:10px;color:rgba(255,255,255,.3)}
        input[type=range]{accent-color:#a78bfa;width:100%}
        .tabs{padding:0 16px 16px;display:flex;gap:6px}
        .tab{flex:1;padding:9px;border-radius:12px;border:.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.04);color:rgba(255,255,255,.35);font-size:12px;font-weight:500;cursor:pointer;transition:all .2s;font-family:inherit}
        .tab.on{background:rgba(139,92,246,.2);border-color:rgba(139,92,246,.4);color:rgba(196,181,253,.95)}
        .filters{padding:0 16px 16px;overflow-x:auto;scrollbar-width:none}
        .filters::-webkit-scrollbar{display:none}
        .f-row{display:flex;gap:8px;white-space:nowrap}
        .f-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:999px;border:.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.05);color:rgba(255,255,255,.35);font-size:11px;font-weight:500;cursor:pointer;transition:all .2s;font-family:inherit}
        .f-btn.on{background:rgba(139,92,246,.22);border-color:rgba(139,92,246,.45);color:rgba(196,181,253,.95)}
        .s-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.25);padding:0 16px 10px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px}
        .pl{border-radius:20px;padding:18px 16px 16px;cursor:pointer;border:.5px solid rgba(255,255,255,.1);backdrop-filter:blur(12px);transition:transform .18s,box-shadow .18s;-webkit-tap-highlight-color:transparent;position:relative;overflow:hidden}
        .pl:active{transform:scale(.96)}
        .pl.now{box-shadow:0 0 0 1.5px rgba(167,139,250,.6),0 8px 32px rgba(139,92,246,.25)}
        .pl-ico{font-size:28px;margin-bottom:10px;display:block}
        .pl-title{font-size:12px;font-weight:600;color:rgba(255,255,255,.95);line-height:1.3;margin-bottom:5px}
        .pl-desc{font-size:10px;color:rgba(255,255,255,.45);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px}
        .pl-hint{font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em;display:flex;align-items:center;gap:5px}
        .pl-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.3)}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
        .pl-dot.live{background:rgba(167,139,250,.9);animation:pulse 1s ease-in-out infinite}
        .badge{position:absolute;top:10px;right:10px;background:rgba(139,92,246,.3);border:.5px solid rgba(167,139,250,.5);border-radius:6px;padding:2px 7px;font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:rgba(196,181,253,.9)}
        .empty{text-align:center;padding:60px 20px}
        .empty-ico{font-size:32px;margin-bottom:8px}
        .empty-txt{font-size:13px;color:rgba(255,255,255,.3)}
        .amb{padding:0 16px}
        .amb-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .amb-title{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.3)}
        .amb-sub{font-size:11px;color:rgba(255,255,255,.3);font-weight:300;margin-top:2px}
        .amb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .amb-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:16px;border:.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);cursor:pointer;font-family:inherit;transition:all .25s;-webkit-tap-highlight-color:transparent}
        .amb-btn.on{border-color:rgba(139,92,246,.5);background:rgba(139,92,246,.12)}
        .amb-ico{font-size:22px}
        .amb-lbl{font-size:10px;font-weight:500;color:rgba(255,255,255,.4)}
        .amb-lbl.on{color:rgba(255,255,255,.9)}
        .bars{display:flex;gap:2px;align-items:flex-end;height:12px}
        .bar{width:3px;border-radius:2px;background:rgba(255,255,255,.6)}
        @keyframes bd{0%,100%{height:3px}50%{height:12px}}
        .bar.on{animation:bd .8s ease-in-out infinite}
        .amb-vol{display:flex;align-items:center;gap:8px;margin-top:12px}
        .amb-tip{text-align:center;margin-top:12px;font-size:10px;color:rgba(255,255,255,.2)}
        .nav{position:fixed;bottom:0;left:0;right:0;z-index:30;background:rgba(8,6,18,.9);border-top:.5px solid rgba(255,255,255,.07);backdrop-filter:blur(20px);display:flex;justify-content:space-around;padding:10px 8px calc(12px + env(safe-area-inset-bottom,0px))}
        .nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:4px 12px;border-radius:14px;transition:background .2s;font-family:inherit;-webkit-tap-highlight-color:transparent}
        .nav-btn.on{background:rgba(139,92,246,.12)}
        .nav-ico{font-size:18px}
        .nav-lbl{font-size:8px;text-transform:uppercase;letter-spacing:.08em}
        .dot{display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(167,139,250,.7);animation:ld .8s ease-in-out infinite;margin-left:2px}
        .dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
        @keyframes ld{0%,100%{opacity:.3}50%{opacity:1}}
      `}</style>

      <div className="pg">
        <div className="st" />

        <div className="hdr">
          <p className="hdr-lbl">Lumina Radio</p>
          <h1 className="hdr-h1">Your Soundtrack</h1>
          <p className="hdr-sub">Music that meets you where you are.</p>
        </div>

        {/* SoundCloud Player */}
        <div className="sc-wrap">
          <div className="sc-head">
            <div className="sc-icon">☁️</div>
            <div className="sc-info">
              <p className="sc-name">{nowPlaying ?? 'Lumina Radio'}</p>
              <p className="sc-sub">
                {!playerReady
                  ? <span>Loading<span className="dot"/><span className="dot"/><span className="dot"/></span>
                  : isPlaying ? '▶ Now playing' : 'Ready · tap a playlist below'}
              </p>
            </div>
            <button className="sc-tog" onClick={() => setPlayerVisible(v => !v)}>
              {playerVisible ? '▲ Hide' : '▼ Show'}
            </button>
          </div>

          <div className="sc-frame" style={{ height: playerVisible ? 166 : 0 }}>
            <iframe ref={iframeRef} src={scUrl} height="166" allow="autoplay" title="Lumina Radio" />
          </div>

          {/* Mini controls when iframe is hidden */}
          {!playerVisible && (
            <>
              <div className="mini">
                <button className="mini-btn" onClick={() => widgetRef.current?.prev()}>⏮</button>
                <button className="mini-btn mini-play" onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</button>
                <button className="mini-btn" onClick={() => widgetRef.current?.next()}>⏭</button>
                <div className="mini-track">
                  <p className="mini-title">{nowPlaying ?? '—'}</p>
                  <div className="mini-prog"><div className="mini-prog-fill" style={{width:`${progress*100}%`}} /></div>
                </div>
              </div>
              <div className="vol-row">
                <span className="vol-lbl">🔉</span>
                <input type="range" min={0} max={1} step={0.02} value={volume}
                  onChange={e => handleVolume(parseFloat(e.target.value))} />
                <span className="vol-lbl">🔊</span>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[{id:'playlists',label:'🎵 Playlists'},{id:'ambient',label:'🔮 Ambiance'}].map(t => (
            <button key={t.id} className={`tab${activeTab===t.id?' on':''}`}
              onClick={() => setActiveTab(t.id as any)}>{t.label}</button>
          ))}
        </div>

        {activeTab === 'playlists' ? (
          <>
            <div className="filters">
              <div className="f-row">
                {MOOD_FILTERS.map(f => (
                  <button key={f.id} className={`f-btn${moodFilter===f.id?' on':''}`}
                    onClick={() => setMoodFilter(f.id)}>
                    <span>{f.emoji}</span><span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="s-lbl">Browse by vibe</p>
            {filtered.length === 0
              ? <div className="empty"><div className="empty-ico">🎵</div><p className="empty-txt">No playlists for this mood.</p></div>
              : <div className="grid">
                  {filtered.map((pl, i) => {
                    const active = isPlaying && nowPlaying !== null && i === 0 && pl.scIndex === 0
                    return (
                      <div key={pl.id} className={`pl${active?' now':''}`}
                        style={{background:pl.grad}} onClick={() => playPlaylist(pl.scIndex)}>
                        {active && <div className="badge">Playing</div>}
                        <span className="pl-ico">{pl.emoji}</span>
                        <p className="pl-title">{pl.title}</p>
                        <p className="pl-desc">{pl.desc}</p>
                        <div className="pl-hint">
                          <div className={`pl-dot${active?' live':''}`} />
                          <span>{playerReady ? 'Tap to play' : 'Loading…'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </>
        ) : (
          <div className="amb">
            {/* Hidden YouTube iframes — one per preset, loaded once, controlled via postMessage */}
            <div style={{position:'absolute',width:0,height:0,overflow:'hidden',pointerEvents:'none',opacity:0}}>
              {AMBIENT_PRESETS.map(p => (
                <iframe
                  key={p.id}
                  ref={el => { ytRefs.current[p.id] = el }}
                  src={`https://www.youtube.com/embed/${p.ytId}?enablejsapi=1&loop=1&playlist=${p.ytId}&autoplay=0&controls=0&mute=0`}
                  allow="autoplay"
                  title={p.label}
                />
              ))}
            </div>

            <div className="amb-hdr">
              <div>
                <p className="amb-title">Ambient Sounds</p>
                <p className="amb-sub">Real sounds from YouTube · tap to play</p>
              </div>
            </div>
            <div className="amb-grid">
              {AMBIENT_PRESETS.map(p => {
                const on = activeAmbient === p.id
                return (
                  <button key={p.id} className={`amb-btn${on?' on':''}`}
                    style={on?{borderColor:p.color,background:p.color.replace('.5)','.15)')}:{}}
                    onClick={() => handleAmbient(p.id)}>
                    <span className="amb-ico">{p.emoji}</span>
                    <span className={`amb-lbl${on?' on':''}`}>{p.label}</span>
                    {on && <div className="bars">{[0,1,2].map(j=><div key={j} className="bar on" style={{animationDelay:`${j*.18}s`}}/>)}</div>}
                  </button>
                )
              })}
            </div>
            {activeAmbient && (
              <div className="amb-vol">
                <span className="vol-lbl" style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>🔉</span>
                <input type="range" min={0} max={1} step={0.05} value={ambientVol} style={{flex:1}}
                  onChange={e => handleAmbientVol(parseFloat(e.target.value))} />
                <span className="vol-lbl" style={{fontSize:10,color:'rgba(255,255,255,.3)'}}>🔊</span>
              </div>
            )}
            {!activeAmbient && <p className="amb-tip">Tap a sound to start playing</p>}
          </div>
        )}
      </div>

      <nav className="nav">
        {[
          {icon:'🏠',label:'Home',href:'/home'},
          {icon:'🎵',label:'Music',href:'/music'},
          {icon:'✦',label:'Lumina',href:'/lumina'},
          {icon:'📚',label:'Library',href:'/library'},
          {icon:'📖',label:'Journal',href:'/journal'},
          {icon:'🤍',label:'You',href:'/you'},
        ].map(t => (
          <button key={t.href} className={`nav-btn${t.href==='/music'?' on':''}`}
            onClick={() => router.push(t.href as any)}>
            <span className="nav-ico">{t.icon}</span>
            <span className="nav-lbl" style={{color:t.href==='/music'?'rgba(196,181,253,.8)':'rgba(255,255,255,.3)'}}>{t.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
