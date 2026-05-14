import { useRef } from 'react'

/*
  Synthèse audio réaliste — modèle physique machine à écrire mécanique
  Inspiré des caractéristiques acoustiques d'une Underwood No.5 / Royal Quiet De Luxe
*/

export function useTypewriterSound() {
  const acRef    = useRef(null)
  const pitchIdx = useRef(0)

  function getAC() {
    if (!acRef.current)
      acRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return acRef.current
  }

  // ── Frappe de touche ──
  // 3 couches superposées : impact papier + résonance métal + rebond bras
  function keyClick() {
    try {
      const c = getAC()
      const t = c.currentTime
      const now = t + 0.001

      // Variation humaine : chaque touche est légèrement différente
      const pitches = [1.0, 0.97, 1.03, 0.95, 1.05, 0.98, 1.02, 0.96]
      const pv = pitches[pitchIdx.current % pitches.length]
      pitchIdx.current++
      const vol = 0.28 + Math.random() * 0.14

      // 1. Impact principal — bruit blanc court filtré passe-bande
      //    Simule le marteau qui frappe le ruban et le papier
      ;(function impact() {
        const len = Math.floor(c.sampleRate * 0.009)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d   = buf.getChannelData(0)
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.5)
        const src = c.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = pv

        const bp = c.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 1600 + Math.random() * 800
        bp.Q.value = 0.8

        const hp = c.createBiquadFilter()
        hp.type = 'highpass'
        hp.frequency.value = 400

        const g = c.createGain()
        g.gain.setValueAtTime(vol * 1.2, now)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.018)

        src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(c.destination)
        src.start(now)
      })()

      // 2. Résonance du bras porte-caractère en métal
      //    Oscillateur court filtré = vibration mécanique
      ;(function metalRing() {
        const osc = c.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = (2800 + Math.random() * 600) * pv

        const lp = c.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 5000

        const g = c.createGain()
        g.gain.setValueAtTime(vol * 0.08, now)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.022)

        osc.connect(lp); lp.connect(g); g.connect(c.destination)
        osc.start(now); osc.stop(now + 0.025)
      })()

      // 3. Retour du bras — petit click grave décalé
      //    Le bras revient en position après la frappe
      ;(function armReturn() {
        const len = Math.floor(c.sampleRate * 0.006)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d   = buf.getChannelData(0)
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
        const src = c.createBufferSource()
        src.buffer = buf
        src.playbackRate.value = pv * 0.7

        const bp = c.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.value = 900 + Math.random() * 300
        bp.Q.value = 1.5

        const g = c.createGain()
        g.gain.setValueAtTime(vol * 0.35, now + 0.016)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.028)

        src.connect(bp); bp.connect(g); g.connect(c.destination)
        src.start(now + 0.016)
      })()

    } catch(e) {}
  }

  // ── Clochette de fin de ligne ──
  // Modèle physique d'une cloche métallique : fondamentale + harmoniques + attaque
  function ding() {
    try {
      const c = getAC()
      const t = c.currentTime + 0.001

      // Attaque : bruit bref filtré passe-haut = "tink" métallique initial
      ;(function tink() {
        const len = Math.floor(c.sampleRate * 0.004)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d   = buf.getChannelData(0)
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
        const src = c.createBufferSource(); src.buffer = buf
        const hp  = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000
        const g   = c.createGain()
        g.gain.setValueAtTime(0.4, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.008)
        src.connect(hp); hp.connect(g); g.connect(c.destination)
        src.start(t)
      })()

      // Corps de la cloche : 3 partiels sinusoïdaux
      // Fréquences typiques d'une clochette de machine à écrire Underwood
      const partials = [
        { f: 1760, a: 0.30, d: 1.6 },   // fondamentale La5
        { f: 2637, a: 0.14, d: 1.0 },   // Mi6 (quinte)
        { f: 3520, a: 0.07, d: 0.6 },   // La6 (octave)
        { f: 5274, a: 0.03, d: 0.3 },   // Mi7
      ]

      partials.forEach(({ f, a, d }) => {
        const osc = c.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = f

        const g = c.createGain()
        g.gain.setValueAtTime(0.0001, t)
        g.gain.linearRampToValueAtTime(a, t + 0.003)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)

        osc.connect(g); g.connect(c.destination)
        osc.start(t); osc.stop(t + d + 0.05)
      })

    } catch(e) {}
  }

  // ── Retour chariot ──
  // 4 phases : choc initial + glissement + clac d'arrêt + cliquet rouleau
  function carriageReturn() {
    try {
      const c = getAC()
      const t = c.currentTime + 0.001

      // Phase 1 : Choc initial du déclenchement
      ;(function choc() {
        const len = Math.floor(c.sampleRate * 0.055)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d   = buf.getChannelData(0)
        for (let i = 0; i < len; i++) {
          const tt = i / c.sampleRate
          d[i] = (Math.random() * 2 - 1) * Math.exp(-tt / 0.010)
               + Math.sin(2 * Math.PI * 88 * tt) * Math.exp(-tt / 0.022) * 0.7
        }
        const src = c.createBufferSource(); src.buffer = buf
        const lp  = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500
        const g   = c.createGain(); g.gain.value = 0.75
        src.connect(lp); lp.connect(g); g.connect(c.destination)
        src.start(t)
      })()

      // Phase 2 : Glissement du chariot (0.03s après)
      ;(function slide() {
        const len = Math.floor(c.sampleRate * 0.20)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d   = buf.getChannelData(0)
        for (let i = 0; i < len; i++) {
          const tt  = i / c.sampleRate
          const env = Math.min(tt / 0.025, 1) * Math.exp(-tt / 0.08)
          d[i] = (Math.random() * 2 - 1) * env * 0.3
        }
        const src = c.createBufferSource(); src.buffer = buf
        const bp  = c.createBiquadFilter(); bp.type = 'bandpass'
        bp.frequency.value = 550; bp.Q.value = 0.4
        const g   = c.createGain(); g.gain.value = 0.55
        src.connect(bp); bp.connect(g); g.connect(c.destination)
        src.start(t + 0.03)
      })()

      // Phase 3 : Clac d'arrêt en bout de course (0.25s après)
      ;(function stop() {
        const len = Math.floor(c.sampleRate * 0.030)
        const buf = c.createBuffer(1, len, c.sampleRate)
        const d   = buf.getChannelData(0)
        for (let i = 0; i < len; i++) {
          const tt = i / c.sampleRate
          d[i] = (Math.random() * 2 - 1) * Math.exp(-tt / 0.009)
               + Math.sin(2 * Math.PI * 160 * tt) * Math.exp(-tt / 0.014) * 0.5
        }
        const src = c.createBufferSource(); src.buffer = buf
        const g   = c.createGain(); g.gain.value = 0.6
        src.connect(g); g.connect(c.destination)
        src.start(t + 0.25)
      })()

      // Phase 4 : Cliquet du rouleau (avancement papier)
      for (let i = 0; i < 4; i++) {
        ;(function cliquet(idx) {
          const len = Math.floor(c.sampleRate * 0.005)
          const buf = c.createBuffer(1, len, c.sampleRate)
          const d   = buf.getChannelData(0)
          for (let j = 0; j < len; j++)
            d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (c.sampleRate * 0.001))
          const src = c.createBufferSource(); src.buffer = buf
          const hp  = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200
          const g   = c.createGain(); g.gain.value = 0.18
          src.connect(hp); hp.connect(g); g.connect(c.destination)
          src.start(t + 0.29 + idx * 0.038)
        })(i)
      }

    } catch(e) {}
  }

  // ── Tampon officiel ──
  function stamp() {
    try {
      const c = getAC()
      const t = c.currentTime + 0.001

      const len = Math.floor(c.sampleRate * 0.11)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d   = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        const tt = i / c.sampleRate
        d[i] = (Math.random() * 2 - 1) * 0.75 * Math.exp(-tt / 0.011)
             + Math.sin(2 * Math.PI * 105 * tt) * 0.45 * Math.exp(-tt / 0.038)
             + Math.sin(2 * Math.PI * 210 * tt) * 0.20 * Math.exp(-tt / 0.022)
      }
      const src = c.createBufferSource(); src.buffer = buf
      const lp  = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200
      const g   = c.createGain(); g.gain.value = 0.7
      src.connect(lp); lp.connect(g); g.connect(c.destination)
      src.start(t)

      // Second impact léger (rebond du tampon)
      setTimeout(() => {
        try {
          const len2 = Math.floor(c.sampleRate * 0.05)
          const buf2 = c.createBuffer(1, len2, c.sampleRate)
          const d2   = buf2.getChannelData(0)
          for (let i = 0; i < len2; i++) {
            const tt = i / c.sampleRate
            d2[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-tt / 0.008)
          }
          const src2 = c.createBufferSource(); src2.buffer = buf2
          const g2   = c.createGain(); g2.gain.value = 0.35
          src2.connect(g2); g2.connect(c.destination)
          src2.start(c.currentTime)
        } catch(e) {}
      }, 90)

    } catch(e) {}
  }

  return { keyClick, ding, carriageReturn, stamp }
}
