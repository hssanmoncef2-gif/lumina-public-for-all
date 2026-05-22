// ============================================================
// LUMINA — Ambient Audio Engine
// Generates real ambient soundscapes via Web Audio API
// No audio files needed — everything synthesized in the browser
// ============================================================

export type AmbientPreset =
  | 'rain'
  | 'ocean'
  | 'night-forest'
  | 'deep-space'
  | 'brown-noise'
  | 'pink-noise'
  | 'cafe'
  | 'thunder-rain'
  | 'crystal-bowl'
  | 'wind'

interface AmbientNode {
  source: AudioBufferSourceNode | OscillatorNode
  gain: GainNode
}

class AmbientAudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private activeNodes: AmbientNode[] = []
  private isRunning = false
  private currentPreset: AmbientPreset | null = null
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.connect(this.ctx.destination)
      this.masterGain.gain.value = 0.5
    }
    return this.ctx
  }

  // Create noise buffer (white/pink/brown)
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown' = 'white'): AudioBuffer {
    const ctx = this.getCtx()
    const bufferSize = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      let lastOut = 0.0

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1

        if (type === 'white') {
          data[i] = white
        } else if (type === 'pink') {
          b0 = 0.99886 * b0 + white * 0.0555179
          b1 = 0.99332 * b1 + white * 0.0750759
          b2 = 0.96900 * b2 + white * 0.1538520
          b3 = 0.86650 * b3 + white * 0.3104856
          b4 = 0.55000 * b4 + white * 0.5329522
          b5 = -0.7616 * b5 - white * 0.0168980
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
          b6 = white * 0.115926
        } else if (type === 'brown') {
          lastOut = (lastOut + (0.02 * white)) / 1.02
          data[i] = lastOut * 3.5
        }
      }
    }
    return buffer
  }

  // Create a looping noise source
  private createNoiseSource(
    type: 'white' | 'pink' | 'brown',
    gainValue: number,
    lowpass?: number,
    highpass?: number
  ): AmbientNode {
    const ctx = this.getCtx()
    const buffer = this.createNoiseBuffer(type)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.value = gainValue

    let node: AudioNode = source

    if (highpass) {
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = highpass
      node.connect(hp)
      node = hp
    }

    if (lowpass) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = lowpass
      node.connect(lp)
      node = lp
    }

    node.connect(gain)
    gain.connect(this.masterGain!)
    source.start()

    return { source, gain }
  }

  // Create oscillator tone
  private createTone(
    freq: number,
    gainValue: number,
    type: OscillatorType = 'sine',
    detune = 0
  ): AmbientNode {
    const ctx = this.getCtx()
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = detune

    const gain = ctx.createGain()
    gain.gain.value = gainValue

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = freq * 2

    osc.connect(lp)
    lp.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()

    return { source: osc, gain }
  }

  // Rain preset: layered noise + occasional drip tones
  private buildRain(): void {
    // Heavy rain body (brown noise low-freq)
    this.activeNodes.push(this.createNoiseSource('brown', 0.18, 800))
    // Rain texture (pink noise)
    this.activeNodes.push(this.createNoiseSource('pink', 0.08, 3000, 200))
    // High frequency rain sparkle
    this.activeNodes.push(this.createNoiseSource('white', 0.03, 8000, 4000))
    // Low rumble
    this.activeNodes.push(this.createNoiseSource('brown', 0.06, 150))
  }

  // Ocean preset: deep waves + foam
  private buildOcean(): void {
    // Deep wave rumble
    this.activeNodes.push(this.createNoiseSource('brown', 0.22, 200))
    // Mid wave body
    this.activeNodes.push(this.createNoiseSource('pink', 0.12, 600, 80))
    // Foam and surface
    this.activeNodes.push(this.createNoiseSource('white', 0.04, 2000, 800))
    // Sub bass
    this.activeNodes.push(this.createNoiseSource('brown', 0.1, 80))
  }

  // Night forest: cricket-like drones + pink noise
  private buildNightForest(): void {
    // Forest ambiance
    this.activeNodes.push(this.createNoiseSource('pink', 0.06, 1200, 300))
    // Cricket drones (high freq oscillators)
    const cricketFreqs = [2800, 3200, 3600, 4100]
    cricketFreqs.forEach((f, i) => {
      const node = this.createTone(f, 0.008, 'sine', i * 5)
      // Modulate gain slowly
      const ctx = this.getCtx()
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.8 + i * 0.3
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.005
      lfo.connect(lfoGain)
      lfoGain.connect(node.gain)
      lfo.start()
      this.activeNodes.push(node)
    })
    // Night wind
    this.activeNodes.push(this.createNoiseSource('brown', 0.04, 100))
  }

  // Deep space: drones + sub bass
  private buildDeepSpace(): void {
    // Sub-bass drone
    this.activeNodes.push(this.createTone(40, 0.15, 'sine'))
    this.activeNodes.push(this.createTone(60, 0.1, 'sine'))
    this.activeNodes.push(this.createTone(80, 0.07, 'sine', 12))
    // Space atmosphere
    this.activeNodes.push(this.createNoiseSource('pink', 0.015, 400))
    // High harmonic shimmer
    this.activeNodes.push(this.createTone(320, 0.02, 'sine', -7))
    this.activeNodes.push(this.createTone(480, 0.015, 'sine', 5))
  }

  // Brown noise (for focus/calm)
  private buildBrownNoise(): void {
    this.activeNodes.push(this.createNoiseSource('brown', 0.25, 400))
    this.activeNodes.push(this.createNoiseSource('brown', 0.08, 100))
  }

  // Pink noise (balanced, gentle)
  private buildPinkNoise(): void {
    this.activeNodes.push(this.createNoiseSource('pink', 0.2, 2000))
    this.activeNodes.push(this.createNoiseSource('pink', 0.05, 500))
  }

  // Thunder rain
  private buildThunderRain(): void {
    this.buildRain()
    // Low thunder rumble
    this.activeNodes.push(this.createNoiseSource('brown', 0.08, 60))
    // Thunder tone
    this.activeNodes.push(this.createTone(55, 0.04, 'sine'))
  }

  // Crystal bowl / singing bowl
  private buildCrystalBowl(): void {
    const frequencies = [174, 285, 396, 417, 528, 639, 741, 852]
    frequencies.forEach((f, i) => {
      const node = this.createTone(f, 0.015, 'sine', i * 3)
      this.activeNodes.push(node)
    })
    // Soft background shimmer
    this.activeNodes.push(this.createNoiseSource('pink', 0.01, 1000))
  }

  // Wind
  private buildWind(): void {
    this.activeNodes.push(this.createNoiseSource('pink', 0.12, 600, 100))
    this.activeNodes.push(this.createNoiseSource('brown', 0.06, 200))
    this.activeNodes.push(this.createNoiseSource('white', 0.03, 4000, 1500))
  }

  // ---- Public API ----

  async play(preset: AmbientPreset, volume = 0.5): Promise<void> {
    if (typeof window === 'undefined') return

    const ctx = this.getCtx()

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    // Already playing this preset
    if (this.isRunning && this.currentPreset === preset) return

    // Stop existing
    await this.stop(true)

    this.currentPreset = preset
    this.masterGain!.gain.value = 0

    // Build the preset
    switch (preset) {
      case 'rain':         this.buildRain();        break
      case 'ocean':        this.buildOcean();       break
      case 'night-forest': this.buildNightForest(); break
      case 'deep-space':   this.buildDeepSpace();   break
      case 'brown-noise':  this.buildBrownNoise();  break
      case 'pink-noise':   this.buildPinkNoise();   break
      case 'thunder-rain': this.buildThunderRain(); break
      case 'crystal-bowl': this.buildCrystalBowl(); break
      case 'wind':         this.buildWind();        break
      case 'cafe':         this.buildPinkNoise();   break
      default:             this.buildBrownNoise();  break
    }

    // Fade in
    this.masterGain!.gain.setTargetAtTime(volume, ctx.currentTime, 1.5)
    this.isRunning = true
  }

  async stop(instant = false): Promise<void> {
    if (!this.ctx || !this.masterGain) return

    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout)
      this.fadeTimeout = null
    }

    if (!instant) {
      // Fade out over 2s
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5)
      await new Promise(r => setTimeout(r, 2000))
    } else {
      this.masterGain.gain.value = 0
    }

    this.activeNodes.forEach(({ source }) => {
      try { source.stop() } catch { /* already stopped */ }
    })
    this.activeNodes = []
    this.isRunning = false
    this.currentPreset = null
  }

  setVolume(v: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), this.ctx.currentTime, 0.1)
    }
  }

  isPlaying(): boolean { return this.isRunning }
  getPreset(): AmbientPreset | null { return this.currentPreset }
}

// Singleton — lazy, client-only
let _engine: AmbientAudioEngine | null = null

export function getAmbientEngine(): AmbientAudioEngine | null {
  if (typeof window === 'undefined') return null
  if (!_engine) _engine = new AmbientAudioEngine()
  return _engine
}

/** @deprecated use getAmbientEngine() */
export const ambientEngine = typeof window !== 'undefined'
  ? (() => { _engine = new AmbientAudioEngine(); return _engine })()
  : null

// Mood → best ambient preset mapping
export const MOOD_TO_AMBIENT: Record<string, AmbientPreset> = {
  calm:     'ocean',
  drifting: 'night-forest',
  soft:     'pink-noise',
  alive:    'wind',
  heavy:    'rain',
  anxious:  'brown-noise',
  joyful:   'crystal-bowl',
  healing:  'rain',
}

export const AMBIENT_PRESETS: Array<{
  id: AmbientPreset
  label: string
  emoji: string
  description: string
  color: string
}> = [
  { id: 'rain',         label: 'Rain',          emoji: '🌧',  description: 'Soft rainfall to quiet the mind',   color: 'rgba(99,102,241,0.5)' },
  { id: 'ocean',        label: 'Ocean',         emoji: '🌊',  description: 'Deep waves and coastal breeze',     color: 'rgba(14,165,233,0.5)' },
  { id: 'night-forest', label: 'Night Forest',  emoji: '🌲',  description: 'Crickets and wind through leaves',  color: 'rgba(34,197,94,0.5)'  },
  { id: 'deep-space',   label: 'Deep Space',    emoji: '🌌',  description: 'Cosmic drones and silence',         color: 'rgba(139,92,246,0.5)' },
  { id: 'brown-noise',  label: 'Brown Noise',   emoji: '🟤',  description: 'Rich, grounding rumble for focus',  color: 'rgba(120,80,50,0.5)'  },
  { id: 'pink-noise',   label: 'Pink Noise',    emoji: '🌸',  description: 'Balanced, gentle and soothing',     color: 'rgba(236,72,153,0.5)' },
  { id: 'crystal-bowl', label: 'Crystal Bowl',  emoji: '🔮',  description: 'Healing frequencies and overtones', color: 'rgba(167,139,250,0.5)'},
  { id: 'thunder-rain', label: 'Thunder Rain',  emoji: '⛈',  description: 'Heavy rain with distant thunder',   color: 'rgba(79,70,229,0.5)'  },
  { id: 'wind',         label: 'Wind',          emoji: '💨',  description: 'Open air, moving and free',         color: 'rgba(148,163,184,0.5)'},
]