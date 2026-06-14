// Sons de stylo plume / encre sur parchemin
let sharedAC = null
function getAC() {
  if (!sharedAC) sharedAC = new (window.AudioContext || window.webkitAudioContext)()
  return sharedAC
}

export function useTypewriterSound() {
  // Déverrouiller l'audio au premier clic
  if (typeof window !== 'undefined') {
    const unlock = () => { try { getAC() } catch(e){} }
    document.addEventListener('click', unlock, { once: true })
  }

  // Grattement de plume sur papier — scratch léger et organique
  function keyClick() {
    try {
      const c = getAC(), t = c.currentTime + 0.001
      const duration = 0.025 + Math.random() * 0.015
      const len = Math.floor(c.sampleRate * duration)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d = buf.getChannelData(0)

      for (let i = 0; i < len; i++) {
        const tt = i / len
        // Enveloppe rapide : attaque immédiate, déclin doux
        const env = tt < 0.1 ? tt / 0.1 : Math.exp(-(tt - 0.1) * 12)
        // Bruit de frottement + légère tonalité de fibre de papier
        const scratch = (Math.random() - 0.5) * 2
        const fiber = Math.sin(2 * Math.PI * (800 + Math.random() * 400) * i / c.sampleRate) * 0.15
        d[i] = (scratch * 0.7 + fiber) * env * 0.12
      }

      const src = c.createBufferSource()
      src.buffer = buf
      src.playbackRate.value = 0.9 + Math.random() * 0.2

      // Filtre passe-bande pour sonorité "scratch plume"
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 2500 + Math.random() * 1000
      bp.Q.value = 0.8

      // Légère réverbération de papier
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 5000

      const g = c.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.4, t + 0.003)
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration)

      src.connect(bp)
      bp.connect(lp)
      lp.connect(g)
      g.connect(c.destination)
      src.start(t)
    } catch(e) {}
  }

  // Trempage de la plume dans l'encrier — bruit doux et liquide
  function inkDip() {
    try {
      const c = getAC(), t = c.currentTime + 0.001
      // Deux petits "plop" successifs
      for (let i = 0; i < 2; i++) {
        const delay = i * 0.06
        const len = Math.floor(c.sampleRate * 0.04)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d = buf.getChannelData(0)
        for (let j = 0; j < len; j++) {
          const tt = j / c.sampleRate
          d[j] = (Math.random() - 0.5) * Math.exp(-tt / 0.006) * 0.6
                + Math.sin(2 * Math.PI * (280 + i * 60) * tt) * Math.exp(-tt / 0.02) * 0.4
        }
        const src = c.createBufferSource()
        src.buffer = buf
        const lp = c.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 1800
        const g = c.createGain()
        g.gain.value = 0.22 - i * 0.06
        src.connect(lp)
        lp.connect(g)
        g.connect(c.destination)
        src.start(t + delay)
      }
    } catch(e) {}
  }

  // Dépliement / froissement léger du parchemin
  function carriageReturn() {
    try {
      const c = getAC(), t = c.currentTime + 0.001
      const len = Math.floor(c.sampleRate * 0.18)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        const tt = i / len
        const env = Math.min(tt / 0.05, 1) * Math.exp(-tt * 6)
        d[i] = (Math.random() - 0.5) * env * 0.5
      }
      const src = c.createBufferSource()
      src.buffer = buf
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 1200
      bp.Q.value = 0.5
      const g = c.createGain()
      g.gain.value = 0.35
      src.connect(bp)
      bp.connect(g)
      g.connect(c.destination)
      src.start(t)
    } catch(e) {}
  }

  // Sceau / tampon sur document — son grave et sourd
  function stamp() {
    try {
      const c = getAC(), t = c.currentTime + 0.001
      const len = Math.floor(c.sampleRate * 0.08)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        const tt = i / c.sampleRate
        d[i] = (Math.random() - 0.5) * 0.7 * Math.exp(-tt / 0.01)
              + Math.sin(2 * Math.PI * 90 * tt) * 0.5 * Math.exp(-tt / 0.04)
              + Math.sin(2 * Math.PI * 180 * tt) * 0.2 * Math.exp(-tt / 0.025)
      }
      const src = c.createBufferSource()
      src.buffer = buf
      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2500
      const g = c.createGain()
      g.gain.value = 0.6
      src.connect(lp)
      lp.connect(g)
      g.connect(c.destination)
      src.start(t)
    } catch(e) {}
  }

  // Ding léger — son de clochette douce (stylo posé sur bureau)
  function ding() {
    try {
      const c = getAC(), t = c.currentTime + 0.001
      const osc = c.createOscillator()
      const g = c.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, t)
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.3)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.18, t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.connect(g)
      g.connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.5)
    } catch(e) {}
  }

  return { keyClick, inkDip, carriageReturn, stamp, ding }
}
