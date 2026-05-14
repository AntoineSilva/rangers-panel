import { useRef, useEffect } from 'react'

// Hook singleton — un seul AudioContext partagé
let sharedAC = null
let pitchCounter = 0

function getAC() {
  if (!sharedAC) sharedAC = new (window.AudioContext || window.webkitAudioContext)()
  return sharedAC
}

export function useTypewriterSound() {
  // Débloquer l'audio dès la première interaction
  useEffect(() => {
    const unlock = () => { try { getAC() } catch(e){} }
    document.addEventListener('click',      unlock, { once: true })
    document.addEventListener('keydown',    unlock, { once: true })
    document.addEventListener('touchstart', unlock, { once: true })
  }, [])

  function keyClick() {
    try {
      const c   = getAC()
      const t   = c.currentTime + 0.001
      const pitches = [1.0,0.97,1.03,0.95,1.05,0.98,1.02,0.96]
      const pv  = pitches[pitchCounter % pitches.length]
      pitchCounter++
      const vol = 0.28 + Math.random() * 0.14

      // Impact marteau
      const len1 = Math.floor(c.sampleRate * 0.009)
      const buf1 = c.createBuffer(1, len1, c.sampleRate)
      const d1   = buf1.getChannelData(0)
      for (let i=0;i<len1;i++) d1[i]=(Math.random()*2-1)*Math.pow(1-i/len1,1.5)
      const s1=c.createBufferSource(); s1.buffer=buf1; s1.playbackRate.value=pv
      const bp1=c.createBiquadFilter(); bp1.type='bandpass'; bp1.frequency.value=1600+Math.random()*800; bp1.Q.value=0.8
      const g1=c.createGain(); g1.gain.setValueAtTime(vol*1.2,t); g1.gain.exponentialRampToValueAtTime(0.0001,t+0.018)
      s1.connect(bp1); bp1.connect(g1); g1.connect(c.destination); s1.start(t)

      // Résonance métal
      const osc=c.createOscillator(); osc.type='triangle'; osc.frequency.value=(2800+Math.random()*600)*pv
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=5000
      const g2=c.createGain(); g2.gain.setValueAtTime(vol*0.08,t); g2.gain.exponentialRampToValueAtTime(0.0001,t+0.022)
      osc.connect(lp); lp.connect(g2); g2.connect(c.destination); osc.start(t); osc.stop(t+0.025)

      // Retour bras
      const len3=Math.floor(c.sampleRate*0.006)
      const buf3=c.createBuffer(1,len3,c.sampleRate)
      const d3=buf3.getChannelData(0)
      for(let i=0;i<len3;i++) d3[i]=(Math.random()*2-1)*Math.pow(1-i/len3,2)
      const s3=c.createBufferSource(); s3.buffer=buf3; s3.playbackRate.value=pv*0.7
      const bp3=c.createBiquadFilter(); bp3.type='bandpass'; bp3.frequency.value=900+Math.random()*300; bp3.Q.value=1.5
      const g3=c.createGain(); g3.gain.setValueAtTime(vol*0.35,t+0.016); g3.gain.exponentialRampToValueAtTime(0.0001,t+0.028)
      s3.connect(bp3); bp3.connect(g3); g3.connect(c.destination); s3.start(t+0.016)
    } catch(e){}
  }

  function ding() {
    try {
      const c=getAC(); const t=c.currentTime+0.001
      const len=Math.floor(c.sampleRate*0.004)
      const buf=c.createBuffer(1,len,c.sampleRate)
      const d=buf.getChannelData(0)
      for(let i=0;i<len;i++) d[i]=Math.random()*2-1
      const s=c.createBufferSource(); s.buffer=buf
      const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=6000
      const g=c.createGain(); g.gain.setValueAtTime(0.4,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.008)
      s.connect(hp); hp.connect(g); g.connect(c.destination); s.start(t)
      [[1760,0.30,1.6],[2637,0.14,1.0],[3520,0.07,0.6],[5274,0.03,0.3]].forEach(([f,a,decay])=>{
        const o=c.createOscillator(); o.type='sine'; o.frequency.value=f
        const gg=c.createGain()
        gg.gain.setValueAtTime(0.0001,t); gg.gain.linearRampToValueAtTime(a,t+0.003); gg.gain.exponentialRampToValueAtTime(0.0001,t+decay)
        o.connect(gg); gg.connect(c.destination); o.start(t); o.stop(t+decay+0.05)
      })
    } catch(e){}
  }

  function carriageReturn() {
    try {
      const c=getAC(); const t=c.currentTime+0.001
      const len=Math.floor(c.sampleRate*0.055)
      const buf=c.createBuffer(1,len,c.sampleRate)
      const d=buf.getChannelData(0)
      for(let i=0;i<len;i++){const tt=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-tt/0.010)+Math.sin(2*Math.PI*88*tt)*Math.exp(-tt/0.022)*0.7}
      const s=c.createBufferSource(); s.buffer=buf
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2500
      const g=c.createGain(); g.gain.value=0.75
      s.connect(lp); lp.connect(g); g.connect(c.destination); s.start(t)
      const len2=Math.floor(c.sampleRate*0.20)
      const buf2=c.createBuffer(1,len2,c.sampleRate)
      const d2=buf2.getChannelData(0)
      for(let i=0;i<len2;i++){const tt=i/c.sampleRate;d2[i]=(Math.random()*2-1)*Math.min(tt/0.025,1)*Math.exp(-tt/0.08)*0.3}
      const s2=c.createBufferSource(); s2.buffer=buf2
      const bp2=c.createBiquadFilter(); bp2.type='bandpass'; bp2.frequency.value=550; bp2.Q.value=0.4
      const g2=c.createGain(); g2.gain.value=0.55
      s2.connect(bp2); bp2.connect(g2); g2.connect(c.destination); s2.start(t+0.03)
      const len3=Math.floor(c.sampleRate*0.030)
      const buf3=c.createBuffer(1,len3,c.sampleRate)
      const d3=buf3.getChannelData(0)
      for(let i=0;i<len3;i++){const tt=i/c.sampleRate;d3[i]=(Math.random()*2-1)*Math.exp(-tt/0.009)+Math.sin(2*Math.PI*160*tt)*Math.exp(-tt/0.014)*0.5}
      const s3=c.createBufferSource(); s3.buffer=buf3
      const g3=c.createGain(); g3.gain.value=0.6
      s3.connect(g3); g3.connect(c.destination); s3.start(t+0.25)
      for(let i=0;i<4;i++){
        const len4=Math.floor(c.sampleRate*0.005)
        const buf4=c.createBuffer(1,len4,c.sampleRate)
        const d4=buf4.getChannelData(0)
        for(let j=0;j<len4;j++) d4[j]=(Math.random()*2-1)*Math.exp(-j/(c.sampleRate*0.001))
        const s4=c.createBufferSource(); s4.buffer=buf4
        const hp4=c.createBiquadFilter(); hp4.type='highpass'; hp4.frequency.value=1200
        const g4=c.createGain(); g4.gain.value=0.18
        s4.connect(hp4); hp4.connect(g4); g4.connect(c.destination); s4.start(t+0.29+i*0.038)
      }
    } catch(e){}
  }

  function stamp() {
    try {
      const c=getAC(); const t=c.currentTime+0.001
      const len=Math.floor(c.sampleRate*0.11)
      const buf=c.createBuffer(1,len,c.sampleRate)
      const d=buf.getChannelData(0)
      for(let i=0;i<len;i++){const tt=i/c.sampleRate;d[i]=(Math.random()*2-1)*0.75*Math.exp(-tt/0.011)+Math.sin(2*Math.PI*105*tt)*0.45*Math.exp(-tt/0.038)}
      const s=c.createBufferSource(); s.buffer=buf
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=3200
      const g=c.createGain(); g.gain.value=0.7
      s.connect(lp); lp.connect(g); g.connect(c.destination); s.start(t)
      setTimeout(()=>{try{
        const len2=Math.floor(c.sampleRate*0.05)
        const buf2=c.createBuffer(1,len2,c.sampleRate)
        const d2=buf2.getChannelData(0)
        for(let i=0;i<len2;i++){const tt=i/c.sampleRate;d2[i]=(Math.random()*2-1)*0.3*Math.exp(-tt/0.008)}
        const s2=c.createBufferSource(); s2.buffer=buf2
        const g2=c.createGain(); g2.gain.value=0.35
        s2.connect(g2); g2.connect(c.destination); s2.start(c.currentTime)
      }catch(e){}},90)
    } catch(e){}
  }

  return { keyClick, ding, carriageReturn, stamp }
}
