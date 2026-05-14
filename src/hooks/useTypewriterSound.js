import { useRef, useEffect } from 'react'

/*
  Sons réels enregistrés sur une Hermes Precisa 305
  Source : BigSoundBank.com — Licence CC0 (domaine public)
  Auteur : Joseph SARDIN
*/

const SOUNDS = {
  key:      'https://bigsoundbank.com/UPLOAD/mp3/2842.mp3',
  space:    'https://bigsoundbank.com/UPLOAD/mp3/2843.mp3',
  ding_snd: 'https://bigsoundbank.com/UPLOAD/mp3/2844.mp3',
  mech:     'https://bigsoundbank.com/UPLOAD/mp3/2839.mp3',
}

const KEY_PITCHES = [0.95, 1.0, 1.0, 1.05, 0.98, 1.02, 0.97, 1.03]

export function useTypewriterSound() {
  const acRef       = useRef(null)
  const buffersRef  = useRef({})
  const loadedRef   = useRef(false)
  const pitchIdx    = useRef(0)

  function getAC() {
    if (!acRef.current)
      acRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return acRef.current
  }

  async function preload() {
    if (loadedRef.current) return
    const ac = getAC()
    await Promise.all(
      Object.entries(SOUNDS).map(async ([name, url]) => {
        try {
          const res = await fetch(url)
          const ab  = await res.arrayBuffer()
          buffersRef.current[name] = await ac.decodeAudioData(ab)
        } catch(e) { console.warn('Son non chargé:', name, e) }
      })
    )
    loadedRef.current = true
  }

  function play(name, { volume = 1, pitch = 1, offset = 0, duration } = {}) {
    const ac  = getAC()
    const buf = buffersRef.current[name]
    if (!buf) return
    const src  = ac.createBufferSource()
    src.buffer = buf
    src.playbackRate.value = pitch
    const gain = ac.createGain()
    gain.gain.value = volume
    src.connect(gain)
    gain.connect(ac.destination)
    src.start(ac.currentTime, offset, duration)
  }

  function keyClick() {
    const pitch = KEY_PITCHES[pitchIdx.current % KEY_PITCHES.length]
    pitchIdx.current++
    const name = pitchIdx.current % 7 === 0 ? 'space' : 'key'
    play(name, {
      volume: 0.5 + Math.random() * 0.3,
      pitch:  pitch + (Math.random() - 0.5) * 0.04,
    })
  }

  function ding() {
    play('ding_snd', { volume: 0.8 })
  }

  function carriageReturn() {
    // Frappe grave + bref = clac de retour chariot
    play('mech', { volume: 0.65, pitch: 0.85, offset: 0, duration: 0.45 })
  }

  function stamp() {
    play('key', { volume: 0.95, pitch: 0.5, duration: 0.2 })
    setTimeout(() => play('key', { volume: 0.6, pitch: 0.62, duration: 0.15 }), 85)
  }

  useEffect(() => {
    const go = () => { preload() }
    document.addEventListener('click',      go, { once: true })
    document.addEventListener('keydown',    go, { once: true })
    document.addEventListener('touchstart', go, { once: true })
  }, [])

  return { keyClick, ding, carriageReturn, stamp, preload }
}
