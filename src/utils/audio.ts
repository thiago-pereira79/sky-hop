let audioCtx: AudioContext | null = null;
let isSoundEnabled = true;

// Initialize Audio Context on human interaction
export function initAudio() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    } catch (e) {
      console.warn("Web Audio API is not supported in this browser.", e);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function setSoundEnabled(enabled: boolean) {
  isSoundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('skyhop_sound_enabled', enabled ? 'true' : 'false');
  }
}

export function getSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('skyhop_sound_enabled');
    if (saved !== null) {
      return saved === 'true';
    }
  }
  return true; // Default to sound enabled
}

function createOscillator(
  type: OscillatorType,
  freq: number,
  startTime: number,
  duration: number,
  gainStart: number
): { osc: OscillatorNode; gainNode: GainNode } | null {
  if (!audioCtx || !isSoundEnabled) return null;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  gainNode.gain.setValueAtTime(gainStart, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  return { osc, gainNode };
}

// Sparkly 2-tone retro chime
export function playCoinSound() {
  initAudio();
  if (!audioCtx || !isSoundEnabled) return;
  
  const now = audioCtx.currentTime;
  
  // Tone 1: high C
  const tone1 = createOscillator('sine', 523.25, now, 0.08, 0.08);
  if (tone1) {
    tone1.osc.start(now);
    tone1.osc.stop(now + 0.08);
  }
  
  // Tone 2: high E
  const tone2 = createOscillator('sine', 659.25, now + 0.05, 0.15, 0.08);
  if (tone2) {
    tone2.osc.start(now + 0.05);
    tone2.osc.stop(now + 0.20);
  }
}

// Light soft wing flap/impulse
export function playFlapSound() {
  initAudio();
  if (!audioCtx || !isSoundEnabled) return;
  
  const now = audioCtx.currentTime;
  const flap = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  flap.type = 'triangle';
  // Immediate downward frequency sweep
  flap.frequency.setValueAtTime(140, now);
  flap.frequency.exponentialRampToValueAtTime(70, now + 0.1);
  
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  
  flap.connect(gain);
  gain.connect(audioCtx.destination);
  
  flap.start(now);
  flap.stop(now + 0.1);
}

// Sequence of retro bass tones cascading downwards
export function playGameOverSound() {
  initAudio();
  if (!audioCtx || !isSoundEnabled) return;
  
  const now = audioCtx.currentTime;
  const notes = [293.66, 261.63, 220.00, 146.83]; // D4, C4, A3, D3
  const step = 0.12;
  const duration = 0.22;
  
  notes.forEach((freq, idx) => {
    const t = now + idx * step;
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    const filter = audioCtx!.createBiquadFilter();
    
    // warm sawtooth wave
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx!.destination);
    
    osc.start(t);
    osc.stop(t + duration);
  });
}

// Bright ascending triumphant fanfare ladder
export function playVictorySound() {
  initAudio();
  if (!audioCtx || !isSoundEnabled) return;
  
  const now = audioCtx.currentTime;
  const scale = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const step = 0.08;
  
  scale.forEach((freq, idx) => {
    const t = now + idx * step;
    const isLast = idx === scale.length - 1;
    const duration = isLast ? 0.40 : 0.15;
    
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (isLast) {
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, t + duration);
    }
    
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx!.destination);
    
    osc.start(t);
    osc.stop(t + duration);
  });
}
