// Realistic Acoustic Sound Generator using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAcousticSound(type: string, durationSeconds = 3.5): () => void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, now);
    masterGain.connect(ctx.destination);

    let isStopped = false;
    const cleanupFns: Array<() => void> = [];

    const stop = () => {
      if (isStopped) return;
      isStopped = true;
      try {
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        setTimeout(() => {
          cleanupFns.forEach(fn => fn());
        }, 100);
      } catch {
        // ignore
      }
    };

    if (type.toLowerCase().includes('siren')) {
      // European / Police Siren (Two-tone / sweep)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Siren sweep modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.7, now);
      lfoGain.gain.setValueAtTime(320, now);
      
      osc.frequency.setValueAtTime(750, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0.2, now);
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now);
      lfo.start(now);
      
      cleanupFns.push(() => {
        try { osc.stop(); lfo.stop(); } catch {}
      });
    } else if (type.toLowerCase().includes('horn')) {
      // Vehicle dual-tone horn
      [420, 510].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slight vibrato
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        mod.frequency.setValueAtTime(12, now);
        modGain.gain.setValueAtTime(8, now);
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(now);
        mod.start(now);
        cleanupFns.push(() => {
          try { osc.stop(); mod.stop(); } catch {}
        });
      });
    } else if (type.toLowerCase().includes('exhaust') || type.toLowerCase().includes('vehicle')) {
      // Modified exhaust revving rumble + noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.Q.setValueAtTime(8, now);
      
      // Throttle sweeps
      filter.frequency.linearRampToValueAtTime(450, now + 1.2);
      filter.frequency.linearRampToValueAtTime(150, now + 2.4);
      filter.frequency.linearRampToValueAtTime(500, now + 3.2);

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.linearRampToValueAtTime(140, now + 1.2);
      osc.frequency.linearRampToValueAtTime(60, now + 2.4);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      osc.connect(masterGain);

      whiteNoise.start(now);
      osc.start(now);

      cleanupFns.push(() => {
        try { whiteNoise.stop(); osc.stop(); } catch {}
      });
    } else {
      // Construction / Jackhammer / Industrial pulses
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(240, now);
      filter.Q.setValueAtTime(3, now);

      const panner = ctx.createGain();
      // Fast pulsing envelope for jackhammer
      for (let t = 0; t < durationSeconds; t += 0.08) {
        panner.gain.setValueAtTime(0.4, now + t);
        panner.gain.exponentialRampToValueAtTime(0.01, now + t + 0.06);
      }

      whiteNoise.connect(filter);
      filter.connect(panner);
      panner.connect(masterGain);

      whiteNoise.start(now);
      cleanupFns.push(() => {
        try { whiteNoise.stop(); } catch {}
      });
    }

    // Auto stop after duration
    setTimeout(stop, durationSeconds * 1000);

    return stop;
  } catch (err) {
    console.warn('Web Audio synthesis error:', err);
    return () => {};
  }
}

export function playChirp(isPositive = true) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    if (isPositive) {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    } else {
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
    }
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch {}
}
