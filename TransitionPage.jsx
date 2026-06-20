import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function TransitionPage({ onDone }) {
  const { ranger } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [displayGrade, setDisplayGrade] = useState('')
  const [displayBureau, setDisplayBureau] = useState('')
  const [showPhoto, setShowPhoto] = useState(false)
  const [showStamp, setShowStamp] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const acRef = useRef(null)

  function getAC() {
    if (!acRef.current) acRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return acRef.current
  }

  function playClick() {
    try {
      const c = getAC(), t = c.currentTime
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.042), c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++)
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.007))
      const s = c.createBufferSource(); s.buffer = buf
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800 + Math.random() * 600; f.Q.value = 1.2
      const g = c.createGain(); g.gain.value = 0.18
      s.connect(f); f.connect(g); g.connect(c.destination); s.start(t)
    } catch(e) {}
  }

  function playDing() {
    try {
      const c = getAC(), t = c.currentTime
      [[1760,.28,1.4],[3520,.12,.9],[5280,.05,.5]].forEach(([freq,amp,decay]) => {
        const o = c.createOscillator(), g = c.createGain()
        o.type = 'sine'; o.frequency.value = freq
        g.gain.setValueAtTime(0.001, t)
        g.gain.linearRampToValueAtTime(amp, t + 0.004)
        g.gain.exponentialRampToValueAtTime(0.001, t + decay)
        o.connect(g); g.connect(c.destination)
        o.start(t); o.stop(t + decay + 0.1)
      })
    } catch(e) {}
  }

  function playReturn() {
    try {
      const c = getAC(), t = c.currentTime
      const len = Math.floor(c.sampleRate * 0.18)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        const tt = i / c.sampleRate
        d[i] = (Math.random()*2-1)*.4*Math.exp(-tt/.04)+Math.sin(2*Math.PI*90*tt)*.15*Math.exp(-tt/.07)
      }
      const s = c.createBufferSource(); s.buffer = buf
      const g = c.createGain(); g.gain.value = 0.4
      s.connect(g); g.connect(c.destination); s.start(t)
    } catch(e) {}
  }

  function playStamp() {
    try {
      const c = getAC(), t = c.currentTime
      const len = Math.floor(c.sampleRate * 0.1)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) {
        const tt = i / c.sampleRate
        d[i] = (Math.random()*2-1)*.7*Math.exp(-tt/.012)+Math.sin(2*Math.PI*110*tt)*.4*Math.exp(-tt/.04)
      }
      const s = c.createBufferSource(); s.buffer = buf
      const g = c.createGain(); g.gain.value = 0.6
      s.connect(g); g.connect(c.destination); s.start(t)
    } catch(e) {}
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function typeText(setText, text, speed = 85) {
    let current = ''
    for (const ch of text) {
      current += ch
      setText(current)
      playClick()
      await sleep(speed + (Math.random() - 0.45) * speed * 0.6)
    }
    playReturn()
    await sleep(200)
  }

  useEffect(() => {
    if (!ranger) return
    const fullName = `${ranger.prenom_rp.toUpperCase()}  ${ranger.nom_rp.toUpperCase()}`
    const grade = `— ${ranger.grade.toUpperCase()} —`
    const bureau = ranger.pole || 'West Elizabeth'

    async function sequence() {
      await sleep(800)
      setShowPhoto(true)
      await sleep(600)
      playDing()
      await sleep(400)
      await typeText(setDisplayName, fullName, 90)
      playDing()
      await sleep(300)
      await typeText(setDisplayGrade, grade, 65)
      await typeText(setDisplayBureau, bureau, 50)
      await sleep(500)
      playStamp()
      setShowStamp(true)
      await sleep(300)
      playDing()
      await sleep(2200)
      setFadeOut(true)
      await sleep(1200)
      onDone()
    }

    sequence()
  }, [ranger])

  const gradeLabel = { commandant: 'Commandant', lieutenant: 'Lieutenant', sergent: 'Sergent', confirme: 'Confirmé', deputy: 'Deputy' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.1'/%3E%3C/svg%3E\")", animation: 'grain .1s steps(1) infinite' }} />

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,.75) 100%)', pointerEvents: 'none', zIndex: 99 }} />

      {/* Scène */}
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', maxWidth: '440px', width: '100%', opacity: fadeOut ? 0 : 1, transition: 'opacity 1.2s ease' }}>

        <div style={{ fontFamily: "'Special Elite',cursive", color: 'rgba(245,230,195,0.15)', letterSpacing: '14px', marginBottom: '24px', fontSize: '16px', animation: 'pageIn 1s ease .3s both' }}>
          ★ ★ ★ ★ ★
        </div>

        {/* Cadre photo */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <div style={{
            width: '150px', height: '190px',
            border: '2px solid rgba(245,230,195,0.5)',
            overflow: 'hidden',
            boxShadow: '0 0 0 4px rgba(0,0,0,.8), 0 0 0 5px rgba(245,230,195,.15), 0 20px 60px rgba(0,0,0,.9)',
            filter: 'sepia(.5) contrast(1.1) brightness(.9)',
            transform: showPhoto ? 'translateY(0)' : 'translateY(50px)',
            opacity: showPhoto ? 1 : 0,
            transition: 'transform 1.4s cubic-bezier(.22,1,.36,1), opacity 1.4s ease',
          }}>
            {ranger?.photo_url
              ? <img src={ranger.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,#d4c49a,#c0a870)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
                  <svg viewBox="0 0 100 130" style={{ width: '90px', marginBottom: '-8px' }} fill="#8a6a3a">
                    <ellipse cx="50" cy="45" rx="30" ry="5"/>
                    <path d="M26 45 Q28 30 50 28 Q72 30 74 45 Z"/>
                    <ellipse cx="50" cy="32" rx="13" ry="15"/>
                    <rect x="43" y="46" width="14" height="8"/>
                    <path d="M18 54 Q32 50 50 52 Q68 50 82 54 L79 100 L21 100 Z"/>
                    <text x="50" y="78" textAnchor="middle" fontSize="12" fill="#6a4a20">★</text>
                    <rect x="28" y="98" width="18" height="32" rx="2"/>
                    <rect x="54" y="98" width="18" height="32" rx="2"/>
                  </svg>
                </div>
              )
            }
            {/* Lignes scan */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(0,0,0,.08) 3px,rgba(0,0,0,.08) 4px)', pointerEvents: 'none' }} />
          </div>

          {/* Tampon autorisé */}
          <div style={{
            position: 'absolute', top: '16px', right: '-16px',
            border: '3px solid rgba(45,107,34,.85)', color: 'rgba(45,107,34,.85)',
            padding: '4px 10px', fontFamily: "'Special Elite',cursive",
            fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
            transform: showStamp ? 'rotate(-15deg) scale(1)' : 'rotate(-15deg) scale(0)',
            opacity: showStamp ? 1 : 0,
            transition: 'transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s',
            whiteSpace: 'nowrap'
          }}>✓ Autorisé</div>
        </div>

        {/* Infos */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', opacity: showPhoto ? 1 : 0, transition: 'opacity .4s ease .5s' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,transparent,rgba(245,230,195,.3))' }} />
            <span style={{ fontFamily: "'Special Elite',cursive", fontSize: '9px', letterSpacing: '4px', color: 'rgba(245,230,195,.3)', textTransform: 'uppercase' }}>Identification</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left,transparent,rgba(245,230,195,.3))' }} />
          </div>

          <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(20px,5vw,30px)', color: '#f5e6c3', letterSpacing: '4px', textTransform: 'uppercase', textShadow: '0 0 30px rgba(245,230,195,.2)', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {displayName}
            <span style={{ display: 'inline-block', width: '2px', height: '28px', background: '#f5e6c3', marginLeft: '3px', verticalAlign: 'middle', animation: 'cur .7s step-start infinite' }} />
          </div>

          <div style={{ fontSize: '12px', letterSpacing: '5px', color: 'rgba(245,230,195,.5)', textTransform: 'uppercase', marginTop: '6px', minHeight: '20px', fontFamily: 'Courier Prime, monospace' }}>
            {displayGrade}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(245,230,195,.3)', marginTop: '4px', letterSpacing: '2px', fontStyle: 'italic', minHeight: '18px' }}>
            {displayBureau}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cur { 50% { opacity: 0; } }
        @keyframes grain {
          0%{background-position:0 0} 25%{background-position:-15px 8px}
          50%{background-position:12px -12px} 75%{background-position:-8px -6px}
        }
      `}</style>
    </div>
  )
}
