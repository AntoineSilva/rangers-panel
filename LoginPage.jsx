import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useTypewriterSound } from '../hooks/useTypewriterSound'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const snd = useTypewriterSound()
  const [tab, setTab]         = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState({ text: '', type: '' })

  // Login
  const [loginBP,   setLoginBP]   = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Register
  const [regCode,  setRegCode]  = useState('')
  const [regFirst, setRegFirst] = useState('')
  const [regLast,  setRegLast]  = useState('')
  const [regBP,    setRegBP]    = useState('')
  const [regGrade, setRegGrade] = useState('')
  const [regPass,  setRegPass]  = useState('')
  const [regPhoto, setRegPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  function switchTab(t) { snd.carriageReturn(); setTab(t); setMsg({ text:'', type:'' }) }

  function handlePhotoChange(e) {
    const file = e.target.files[0]; if (!file) return
    setRegPhoto(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleLogin(e) {
    e.preventDefault(); snd.carriageReturn()
    if (!loginBP || !loginPass) { setMsg({ text:'⚠ Remplissez tous les champs.', type:'error' }); return }
    setLoading(true)
    setMsg({ text:'⟳ Vérification en cours...', type:'success' })
    const { error } = await signIn(loginBP, loginPass)
    setLoading(false)
    if (error) { setMsg({ text:'⚠ ' + error.message, type:'error' }) }
    else { snd.ding(); setMsg({ text:'✓ Accès autorisé. Chargement...', type:'success' }) }
  }

  async function handleRegister(e) {
    e.preventDefault(); snd.carriageReturn()
    if (!regCode)        { setMsg({ text:"⚠ Code d'invitation requis.", type:'error' }); return }
    if (!regFirst||!regLast) { setMsg({ text:'⚠ Nom et prénom obligatoires.', type:'error' }); return }
    if (!regBP)          { setMsg({ text:'⚠ Boîte Postale requise.', type:'error' }); return }
    if (!regGrade)       { setMsg({ text:'⚠ Sélectionnez votre grade.', type:'error' }); return }
    if (!regPass)        { setMsg({ text:'⚠ Mot de passe requis.', type:'error' }); return }
    setLoading(true)
    setMsg({ text:'⟳ Transmission du dossier...', type:'success' })
    const { error } = await signUp({
      bp: regBP, password: regPass,
      prenomRp: regFirst, nomRp: regLast,
      grade: regGrade, codeInvite: regCode,
      photoFile: regPhoto,
    })
    setLoading(false)
    if (error) { setMsg({ text:'⚠ ' + error.message, type:'error' }) }
    else { snd.ding(); setMsg({ text:"✓ Demande soumise — En attente de validation.", type:'success' }) }
  }

  const tabStyle = (id) => ({
    padding: tab===id ? '8px 18px 10px' : '8px 18px',
    background: tab===id ? 'var(--paper)' : 'var(--paper-aged)',
    border:'1px solid', borderColor: tab===id ? 'var(--ink-2)' : 'var(--ink-3)',
    borderBottom: tab===id ? '1px solid var(--paper)' : '1px solid var(--ink-3)',
    fontFamily:"'Special Elite',cursive", fontSize:'10px', letterSpacing:'2px',
    textTransform:'uppercase', color: tab===id ? 'var(--ink)' : 'var(--ink-3)',
    cursor:'pointer', clipPath:'polygon(0 25%,10% 0,90% 0,100% 25%,100% 100%,0 100%)',
    zIndex: tab===id ? 3 : 1, position:'relative',
  })

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'620px' }}>

        {/* Badge */}
        <div style={{ textAlign:'center', marginBottom:'16px' }}>
          <div style={{ color:'rgba(210,185,140,0.3)', letterSpacing:'14px', fontSize:'18px' }}>★ ★ ★ ★ ★</div>
          <h1 style={{ fontFamily:"'Special Elite',cursive", color:'rgba(245,230,195,0.85)', fontSize:'clamp(16px,4vw,24px)', letterSpacing:'6px', textTransform:'uppercase', margin:'4px 0', textShadow:'0 2px 10px rgba(0,0,0,0.8)' }}>
            United States Rangers
          </h1>
          <div style={{ color:'rgba(180,150,100,0.4)', fontSize:'10px', letterSpacing:'4px', textTransform:'uppercase' }}>
            Bureau — Accès Sécurisé — West Elizabeth
          </div>
        </div>

        {/* Machine */}
        <div style={{ background:'linear-gradient(180deg,#4a3828,#2e1e12,#1e1208)', border:'1px solid #5a4030', borderBottom:'3px solid #150e08', borderRadius:'10px 10px 0 0', height:'28px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:"'Special Elite',cursive", fontSize:'8px', letterSpacing:'2px', color:'rgba(180,150,100,.45)' }}>— U.S. RANGERS RECORD MACHINE — PATENT No. 1905 —</span>
        </div>
        <div style={{ height:'16px', background:'linear-gradient(180deg,#2a1c12,#1a1008)', borderLeft:'1px solid #5a4030', borderRight:'1px solid #5a4030' }} />

        {/* Feuille */}
        <div className="paper-sheet" style={{ minHeight:'auto', animation:'pageIn .5s ease .2s both' }}>
          <div className="hole" style={{ top:'50px' }} />
          <div className="hole" style={{ top:'45%' }} />
          <div className="hole" style={{ bottom:'50px' }} />

          {/* Tampon */}
          <div style={{ position:'absolute', top:'16px', right:'12px', border:'3px solid var(--red)', color:'var(--red)', padding:'3px 9px', fontFamily:"'Special Elite',cursive", fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase', transform:'rotate(15deg)', opacity:0.55 }}>
            Confidentiel
          </div>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'24px', paddingBottom:'14px', borderBottom:'2px solid var(--ink)' }}>
            <div style={{ fontSize:'8px', letterSpacing:'3px', color:'var(--ink-3)', marginBottom:'4px' }}>★ ★ ★</div>
            <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'clamp(14px,3vw,20px)', letterSpacing:'4px', textTransform:'uppercase', color:'var(--ink)' }}>Accès Sécurisé</div>
            <div style={{ fontSize:'9px', letterSpacing:'3px', color:'var(--ink-3)', textTransform:'uppercase', marginTop:'2px' }}>Réservé au personnel autorisé</div>
          </div>

          {/* Message */}
          {msg.text && <div className={msg.type==='error' ? 'msg-error' : 'msg-success'}>{msg.text}</div>}

          {/* Onglets */}
          <div style={{ display:'flex', gap:'4px', marginBottom:'-1px', position:'relative', zIndex:2 }}>
            <button onClick={()=>switchTab('login')}    style={tabStyle('login')}>▸ Connexion</button>
            <button onClick={()=>switchTab('register')} style={tabStyle('register')}>▸ Enregistrement</button>
          </div>

          <div style={{ border:'1px solid var(--ink-2)', borderTop:'2px solid var(--ink)', padding:'28px 20px 24px', background:'var(--paper)' }}>

            {/* ── LOGIN ── */}
            {tab==='login' && (
              <form onSubmit={handleLogin}>
                <div className="field-group">
                  <label>Boîte Postale (BP)</label>
                  <input
                    type="text"
                    value={loginBP}
                    onChange={e=>{ setLoginBP(e.target.value.toUpperCase()); snd.keyClick() }}
                    placeholder="BP-0001"
                    autoComplete="off"
                    style={{ fontSize:'22px', letterSpacing:'8px', textAlign:'center', fontWeight:700 }}
                  />
                  <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'3px', fontStyle:'italic' }}>* Votre identifiant unique West Elizabeth</div>
                </div>
                <div className="field-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={e=>{ setLoginPass(e.target.value); snd.keyClick() }}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'11px', letterSpacing:'4px', marginTop:'8px' }} disabled={loading}>
                  ▶ &nbsp; Présenter les papiers &nbsp; ◀
                </button>
                <div style={{ textAlign:'center', fontSize:'10px', color:'var(--ink-3)', fontStyle:'italic', marginTop:'12px' }}>
                  Nouveau Ranger ? Cliquez sur « Enregistrement »
                </div>
              </form>
            )}

            {/* ── INSCRIPTION ── */}
            {tab==='register' && (
              <form onSubmit={handleRegister}>
                <div className="field-group">
                  <label>Code d'invitation unique ⚠</label>
                  <input
                    type="text"
                    value={regCode}
                    onChange={e=>{ setRegCode(e.target.value.toUpperCase()); snd.keyClick() }}
                    placeholder="USR-XXXX"
                    maxLength={12}
                    style={{ fontSize:'18px', letterSpacing:'8px', textAlign:'center', fontWeight:700 }}
                  />
                  <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'3px', fontStyle:'italic' }}>* Fourni par votre commandant</div>
                </div>

                <div className="two-col">
                  <div className="field-group" style={{ marginBottom:0 }}>
                    <label>Prénom (RP)</label>
                    <input type="text" value={regFirst} onChange={e=>{ setRegFirst(e.target.value); snd.keyClick() }} placeholder="John" />
                  </div>
                  <div className="field-group" style={{ marginBottom:0 }}>
                    <label>Nom (RP)</label>
                    <input type="text" value={regLast} onChange={e=>{ setRegLast(e.target.value); snd.keyClick() }} placeholder="Witch" />
                  </div>
                </div>

                <div className="field-group" style={{ marginTop:'20px' }}>
                  <label>Boîte Postale (BP) — identifiant de connexion</label>
                  <input
                    type="text"
                    value={regBP}
                    onChange={e=>{ setRegBP(e.target.value.toUpperCase()); snd.keyClick() }}
                    placeholder="BP-0001"
                    autoComplete="off"
                    style={{ fontSize:'20px', letterSpacing:'6px', textAlign:'center', fontWeight:700 }}
                  />
                  <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'3px', fontStyle:'italic' }}>* Ce BP servira à vous connecter</div>
                </div>

                <div className="field-group">
                  <label>Grade</label>
                  <select value={regGrade} onChange={e=>{ setRegGrade(e.target.value); snd.carriageReturn() }}>
                    <option value="">— Sélectionner —</option>
                    <option value="commandant">✦ Commandant</option>
                    <option value="lieutenant">✦ Lieutenant</option>
                    <option value="sergent">✦ Sergent</option>
                    <option value="confirme">✦ Confirmé</option>
                    <option value="deputy">✦ Deputy</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={e=>{ setRegPass(e.target.value); snd.keyClick() }}
                    placeholder="Choisir un mot de passe"
                    autoComplete="new-password"
                  />
                </div>

                <div className="field-group">
                  <label>Portrait du Ranger <span style={{ opacity:0.5 }}>(facultatif)</span></label>
                  <div onClick={()=>document.getElementById('photoInput').click()} style={{ border:'1px dashed var(--ink-3)', padding:'14px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer' }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width:'52px', height:'64px', objectFit:'cover', border:'1.5px solid var(--ink)', filter:'sepia(.4)' }} />
                      : <div style={{ width:'52px', height:'64px', border:'1.5px solid var(--ink-3)', background:'var(--paper-aged)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', opacity:0.5 }}>👤</div>
                    }
                    <div>
                      <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'11px', color:'var(--ink-2)', letterSpacing:'1px' }}>Déposer un portrait</div>
                      <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'4px' }}>JPG ou PNG</div>
                    </div>
                  </div>
                  <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:'none' }} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', fontSize:'11px', letterSpacing:'4px', marginTop:'8px' }} disabled={loading}>
                  ▶ &nbsp; Soumettre la demande &nbsp; ◀
                </button>
                <div style={{ textAlign:'center', fontSize:'9px', color:'var(--ink-3)', fontStyle:'italic', marginTop:'12px' }}>
                  Votre dossier sera examiné par l'administration.
                </div>
              </form>
            )}
          </div>

          <div style={{ marginTop:'16px', textAlign:'center', fontSize:'9px', letterSpacing:'3px', color:'var(--ink-3)', opacity:0.5, textTransform:'uppercase' }}>
            — United States of America — West Elizabeth — 1905 —
          </div>
        </div>

        <div style={{ height:'20px', background:'linear-gradient(0deg,#1a1008,#2a1c12)', border:'1px solid #5a4030', borderTop:'none', borderRadius:'0 0 6px 6px' }} />
      </div>
    </div>
  )
}
