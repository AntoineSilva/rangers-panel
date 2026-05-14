import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useTypewriterSound } from '../hooks/useTypewriterSound'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const snd = useTypewriterSound()
  const [tab, setTab]       = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState({ text: '', type: '' })

  // Login
  const [loginBP, setLoginBP]     = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Register
  const [regCode,  setRegCode]   = useState('')
  const [regFirst, setRegFirst]  = useState('')
  const [regLast,  setRegLast]   = useState('')
  const [regBP,    setRegBP]     = useState('')
  const [regGrade, setRegGrade]  = useState('')
  const [regPass,  setRegPass]   = useState('')
  const [regPhoto, setRegPhoto]  = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  function switchTab(t) {
    snd.carriageReturn()
    setTab(t)
    setMsg({ text: '', type: '' })
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setRegPhoto(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleLogin(e) {
    e.preventDefault()
    snd.carriageReturn()
    if (!loginBP || !loginPass) {
      setMsg({ text: '⚠ Veuillez remplir tous les champs.', type: 'error' })
      return
    }
    setLoading(true)
    setMsg({ text: '⟳ Vérification en cours...', type: 'success' })
    const { error } = await signIn(loginBP, loginPass)
    setLoading(false)
    if (error) {
      setMsg({ text: '⚠ Identifiants incorrects. Vérifiez votre BP et mot de passe.', type: 'error' })
    } else {
      snd.ding()
      setMsg({ text: '✓ Accès autorisé. Chargement du dossier...', type: 'success' })
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    snd.carriageReturn()
    if (!regCode)         { setMsg({ text: "⚠ Code d'invitation requis.", type: 'error' }); return }
    if (!regFirst || !regLast) { setMsg({ text: '⚠ Nom et prénom RP obligatoires.', type: 'error' }); return }
    if (!regBP)           { setMsg({ text: '⚠ Boîte Postale requise.', type: 'error' }); return }
    if (!regGrade)        { setMsg({ text: '⚠ Sélectionnez votre grade.', type: 'error' }); return }
    if (!regPass)         { setMsg({ text: '⚠ Mot de passe requis.', type: 'error' }); return }
    setLoading(true)
    setMsg({ text: '⟳ Transmission du dossier...', type: 'success' })
    const { error } = await signUp({
      bp: regBP, password: regPass,
      prenomRp: regFirst, nomRp: regLast,
      grade: regGrade, codeInvite: regCode,
      photoFile: regPhoto,
    })
    setLoading(false)
    if (error) {
      setMsg({ text: '⚠ ' + error.message, type: 'error' })
    } else {
      snd.ding()
      setMsg({ text: "✓ Demande soumise. En attente de validation par l'Administration.", type: 'success' })
    }
  }

  const S = {
    wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '620px' },
    badge: { textAlign: 'center', marginBottom: '16px', animation: 'pageIn .8s ease' },
    stars: { color: 'rgba(210,185,140,0.3)', letterSpacing: '14px', fontSize: '18px' },
    h1: { fontFamily:"'Special Elite',cursive", color:'rgba(245,230,195,0.85)', fontSize:'clamp(16px,4vw,24px)', letterSpacing:'6px', textTransform:'uppercase', margin:'4px 0', textShadow:'0 2px 10px rgba(0,0,0,0.8)' },
    sub: { color:'rgba(180,150,100,0.4)', fontSize:'10px', letterSpacing:'4px', textTransform:'uppercase' },
    topBar: { background:'linear-gradient(180deg,#4a3828,#2e1e12,#1e1208)', border:'1px solid #5a4030', borderBottom:'3px solid #150e08', borderRadius:'10px 10px 0 0', height:'28px', display:'flex', alignItems:'center', justifyContent:'center' },
    topTxt: { fontFamily:"'Special Elite',cursive", fontSize:'8px', letterSpacing:'2px', color:'rgba(180,150,100,.45)' },
    roller: { height:'16px', background:'linear-gradient(180deg,#2a1c12,#1a1008)', borderLeft:'1px solid #5a4030', borderRight:'1px solid #5a4030' },
    footer: { height:'20px', background:'linear-gradient(0deg,#1a1008,#2a1c12)', border:'1px solid #5a4030', borderTop:'none', borderRadius:'0 0 6px 6px' },
    stamp: { position:'absolute', top:'16px', right:'12px', border:'3px solid var(--red)', color:'var(--red)', padding:'3px 9px', fontFamily:"'Special Elite',cursive", fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase', transform:'rotate(15deg)', opacity:0.55 },
    hdr: { textAlign:'center', marginBottom:'24px', paddingBottom:'14px', borderBottom:'2px solid var(--ink)' },
    tabRow: { display:'flex', gap:'4px', marginBottom:'-1px', position:'relative', zIndex:2 },
    formArea: { border:'1px solid var(--ink-2)', borderTop:'2px solid var(--ink)', padding:'28px 20px 24px', background:'var(--paper)' },
    btn: { width:'100%', justifyContent:'center', padding:'13px', fontSize:'11px', letterSpacing:'4px', marginTop:'8px' },
    note: { textAlign:'center', fontSize:'9px', color:'var(--ink-3)', fontStyle:'italic', marginTop:'12px' },
    docFoot: { marginTop:'16px', textAlign:'center', fontSize:'9px', letterSpacing:'3px', color:'var(--ink-3)', opacity:0.5, textTransform:'uppercase' },
  }

  function TabBtn({ id, label }) {
    const active = tab === id
    return (
      <button onClick={() => switchTab(id)} style={{
        padding: active ? '8px 18px 10px' : '8px 18px',
        background: active ? 'var(--paper)' : 'var(--paper-aged)',
        border:'1px solid', borderColor: active ? 'var(--ink-2)' : 'var(--ink-3)',
        borderBottom: active ? '1px solid var(--paper)' : '1px solid var(--ink-3)',
        fontFamily:"'Special Elite',cursive", fontSize:'10px', letterSpacing:'2px',
        textTransform:'uppercase', color: active ? 'var(--ink)' : 'var(--ink-3)',
        cursor:'pointer', clipPath:'polygon(0 25%,10% 0,90% 0,100% 25%,100% 100%,0 100%)',
        zIndex: active ? 3 : 1, position:'relative',
      }}>▸ {label}</button>
    )
  }

  return (
    <div style={S.wrap}>
      <div style={S.card}>

        {/* Badge */}
        <div style={S.badge}>
          <div style={S.stars}>★ ★ ★ ★ ★</div>
          <h1 style={S.h1}>United States Rangers</h1>
          <div style={S.sub}>Bureau — Accès Sécurisé — New Austin</div>
        </div>

        {/* Machine */}
        <div style={S.topBar}><span style={S.topTxt}>— U.S. RANGERS RECORD MACHINE — PATENT No. 1899 —</span></div>
        <div style={S.roller} />

        {/* Feuille */}
        <div className="paper-sheet" style={{ minHeight:'auto', animation:'pageIn .5s ease .2s both' }}>
          <div className="hole" style={{ top:'50px' }} />
          <div className="hole" style={{ top:'45%' }} />
          <div className="hole" style={{ bottom:'50px' }} />
          <div style={S.stamp}>Confidentiel</div>

          {/* Header doc */}
          <div style={S.hdr}>
            <div style={{ fontSize:'8px', letterSpacing:'3px', color:'var(--ink-3)', marginBottom:'4px' }}>★ ★ ★</div>
            <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'clamp(14px,3vw,20px)', letterSpacing:'4px', textTransform:'uppercase', color:'var(--ink)' }}>Accès Sécurisé</div>
            <div style={{ fontSize:'9px', letterSpacing:'3px', color:'var(--ink-3)', textTransform:'uppercase', marginTop:'2px' }}>Réservé au personnel autorisé</div>
          </div>

          {/* Message */}
          {msg.text && <div className={msg.type === 'error' ? 'msg-error' : 'msg-success'}>{msg.text}</div>}

          {/* Onglets */}
          <div style={S.tabRow}>
            <TabBtn id="login"    label="Connexion" />
            <TabBtn id="register" label="Enregistrement" />
          </div>

          <div style={S.formArea}>

            {/* ══ LOGIN ══ */}
            {tab === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="field-group">
                  <label>Boîte Postale (BP)</label>
                  <input
                    type="text"
                    value={loginBP}
                    onChange={e => { setLoginBP(e.target.value); snd.keyClick() }}
                    placeholder="ex: BP-0042"
                    style={{ fontSize:'18px', letterSpacing:'6px', textAlign:'center', fontWeight:700, textTransform:'uppercase' }}
                  />
                  <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'3px', fontStyle:'italic' }}>* Votre identifiant unique U.S. Rangers</div>
                </div>
                <div className="field-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={e => { setLoginPass(e.target.value); snd.keyClick() }}
                    placeholder="••••••••••"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={S.btn} disabled={loading}>
                  ▶ &nbsp; Présenter les papiers &nbsp; ◀
                </button>
                <div style={S.note}>Nouveau Ranger ? Cliquez sur « Enregistrement »</div>
              </form>
            )}

            {/* ══ INSCRIPTION ══ */}
            {tab === 'register' && (
              <form onSubmit={handleRegister}>

                <div className="field-group">
                  <label>Code d'invitation unique ⚠</label>
                  <input
                    type="text"
                    value={regCode}
                    onChange={e => { setRegCode(e.target.value.toUpperCase()); snd.keyClick() }}
                    placeholder="USR — XXXX"
                    maxLength={12}
                    style={{ fontSize:'18px', letterSpacing:'8px', textAlign:'center', fontWeight:700 }}
                  />
                  <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'3px', fontStyle:'italic' }}>* Fourni par votre commandant</div>
                </div>

                <div className="two-col">
                  <div className="field-group" style={{ marginBottom:0 }}>
                    <label>Prénom (RP)</label>
                    <input type="text" value={regFirst} onChange={e => { setRegFirst(e.target.value); snd.keyClick() }} placeholder="John" />
                  </div>
                  <div className="field-group" style={{ marginBottom:0 }}>
                    <label>Nom (RP)</label>
                    <input type="text" value={regLast} onChange={e => { setRegLast(e.target.value); snd.keyClick() }} placeholder="Witch" />
                  </div>
                </div>

                <div className="field-group" style={{ marginTop:'20px' }}>
                  <label>Boîte Postale (BP) — votre identifiant de connexion</label>
                  <input
                    type="text"
                    value={regBP}
                    onChange={e => { setRegBP(e.target.value.toUpperCase()); snd.keyClick() }}
                    placeholder="BP — XXXX"
                    style={{ fontSize:'18px', letterSpacing:'6px', textAlign:'center', fontWeight:700 }}
                  />
                  <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'3px', fontStyle:'italic' }}>* Ce BP servira à vous connecter</div>
                </div>

                <div className="field-group">
                  <label>Grade</label>
                  <select value={regGrade} onChange={e => { setRegGrade(e.target.value); snd.carriageReturn() }}>
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
                  <input type="password" value={regPass} onChange={e => { setRegPass(e.target.value); snd.keyClick() }} placeholder="Choisir un mot de passe" />
                </div>

                <div className="field-group">
                  <label>Portrait du Ranger <span style={{ opacity:0.5 }}>(facultatif)</span></label>
                  <div
                    onClick={() => document.getElementById('photoInput').click()}
                    style={{ border:'1px dashed var(--ink-3)', padding:'14px', display:'flex', alignItems:'center', gap:'16px', cursor:'pointer' }}
                  >
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width:'52px', height:'64px', objectFit:'cover', border:'1.5px solid var(--ink)', filter:'sepia(.4)' }} />
                      : <div style={{ width:'52px', height:'64px', border:'1.5px solid var(--ink-3)', background:'var(--paper-aged)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', opacity:0.5 }}>👤</div>
                    }
                    <div>
                      <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'11px', color:'var(--ink-2)', letterSpacing:'1px' }}>Déposer un portrait</div>
                      <div style={{ fontSize:'9px', color:'var(--ink-3)', marginTop:'4px' }}>JPG ou PNG — Photo de personnage</div>
                    </div>
                  </div>
                  <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:'none' }} />
                </div>

                <button type="submit" className="btn btn-primary" style={S.btn} disabled={loading}>
                  ▶ &nbsp; Soumettre la demande &nbsp; ◀
                </button>
                <div style={S.note}>Votre dossier sera examiné par l'administration.</div>

              </form>
            )}
          </div>

          <div style={S.docFoot}>— United States of America — New Austin — 1899 —</div>
        </div>

        <div style={S.footer} />
      </div>
    </div>
  )
}
