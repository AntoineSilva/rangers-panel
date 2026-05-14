import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { useTypewriterSound } from '../hooks/useTypewriterSound'

const TABS = [
  { id:'accueil',      label:'Accueil',    icon:'🏠' },
  { id:'profil',       label:'Profil',     icon:'👤' },
  { id:'organigramme', label:'Organi.',    icon:'🌿' },
  { id:'logistique',   label:'Logistique', icon:'📦' },
  { id:'armes',        label:'Armes',      icon:'🔫' },
  { id:'comptes',      label:'Comptes',    icon:'💰' },
  { id:'rapports',     label:'Rapports',   icon:'📄' },
  { id:'enquetes',     label:'Enquêtes',   icon:'🔍' },
  { id:'admin',        label:'Admin',      icon:'⚙'  },
]

/* ════════════════════════════════════════
   PAGE SUPERPOSÉE (remplace Modal)
════════════════════════════════════════ */
function SlidePage({ title, onClose, children, wide }) {
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:700,
      background:'rgba(10,6,0,0.88)',
      display:'flex', alignItems:'flex-start', justifyContent:'center',
      padding:'0', overflowY:'auto',
    }} onClick={onClose}>
      <div style={{
        width:'100%', maxWidth: wide?'860px':'640px',
        minHeight:'100vh',
        background:'#f2e4bf',
        backgroundImage:'repeating-linear-gradient(transparent 0px,transparent 29px,rgba(160,130,70,.18) 29px,rgba(160,130,70,.18) 30px)',
        borderLeft:'3px solid #1c0f00', borderRight:'3px solid #1c0f00',
        padding:'32px 40px 60px 64px',
        position:'relative',
        animation:'slideIn .25s ease both',
      }} onClick={e=>e.stopPropagation()}>
        {/* Marge rouge */}
        <div style={{position:'absolute',top:0,bottom:0,left:'50px',width:'1.5px',background:'rgba(139,26,26,.28)',pointerEvents:'none'}}/>
        {/* Trous */}
        <div style={{position:'absolute',left:'18px',top:'60px',width:'13px',height:'13px',borderRadius:'50%',background:'radial-gradient(circle at 40% 35%,#1a1008,#050300)',boxShadow:'inset 0 1px 3px rgba(0,0,0,.9),0 0 0 2px rgba(120,100,50,.3)'}}/>
        <div style={{position:'absolute',left:'18px',top:'50%',width:'13px',height:'13px',borderRadius:'50%',background:'radial-gradient(circle at 40% 35%,#1a1008,#050300)',boxShadow:'inset 0 1px 3px rgba(0,0,0,.9),0 0 0 2px rgba(120,100,50,.3)'}}/>
        <div style={{position:'absolute',left:'18px',bottom:'60px',width:'13px',height:'13px',borderRadius:'50%',background:'radial-gradient(circle at 40% 35%,#1a1008,#050300)',boxShadow:'inset 0 1px 3px rgba(0,0,0,.9),0 0 0 2px rgba(120,100,50,.3)'}}/>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',paddingBottom:'12px',borderBottom:'2px solid #1c0f00'}}>
          <div style={{fontFamily:"'Special Elite',cursive",fontSize:'clamp(14px,3vw,20px)',letterSpacing:'4px',textTransform:'uppercase',color:'#1c0f00'}}>{title}</div>
          <button onClick={onClose} className="btn btn-sm">← Retour</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Champ formulaire ── */
function Field({label,children,style}){
  return <div className="field-group" style={style}><label>{label}</label>{children}</div>
}

function PageHeader({title,sub,children}){
  return(
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'22px',paddingBottom:'12px',borderBottom:'2px solid var(--ink)',gap:'10px',flexWrap:'wrap'}}>
      <div>
        <div style={{fontFamily:"'Special Elite',cursive",fontSize:'clamp(16px,4vw,23px)',letterSpacing:'4px',textTransform:'uppercase'}}>{title}</div>
        {sub&&<div style={{fontSize:'9px',letterSpacing:'3px',color:'var(--ink-3)',textTransform:'uppercase',marginTop:'3px'}}>{sub}</div>}
      </div>
      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}}>{children}</div>
    </div>
  )
}

function StatCard({label,value,sub,accent,small}){
  return(
    <div className={`info-card ${accent==='red'?'accent-red':accent==='green'?'accent-green':accent==='blue'?'accent-blue':accent==='orange'?'accent-orange':''}`}>
      <span className="card-label">{label}</span>
      <div className="card-value" style={{fontSize:small?'15px':'19px',color:accent==='red'?'var(--red)':accent==='blue'?'#2a5a7a':''}}>{value}</div>
      <div className="card-sub">{sub}</div>
    </div>
  )
}

function VLine(){return <div style={{width:'1.5px',height:'18px',background:'var(--ink-2)',opacity:.5,margin:'0 auto'}}/>}
function Loader(){return <div style={{textAlign:'center',padding:'32px 0',color:'var(--ink-3)',fontStyle:'italic',fontSize:'12px',letterSpacing:'2px'}}>Chargement du registre...</div>}

const PRIORITE_COLORS = {basse:'#5a7a3a',normale:'var(--ink-2)',haute:'#8a6020',urgente:'var(--red)'}
const STATUT_ENQUETE  = {en_cours:'🔍 En cours',en_traque:'🎯 En traque',resolue:'✓ Résolue',classee:'📁 Classée'}
const ELEM_ICONS = {note:'📝',preuve:'🔬',temoin:'👁',photo:'📷',lieu:'📍',suspect:'🎯',rapport_lié:'📄'}

/* ════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════ */
export default function DashboardPage() {
  const { ranger, signOut, isAdmin, canEditOrg } = useAuth()
  const snd = useTypewriterSound()
  const [activeTab, setActiveTab] = useState('accueil')
  function switchTab(id){ snd.keyClick(); setActiveTab(id) }

  return (
    <div>
      <header style={{background:'linear-gradient(180deg,var(--metal-l) 0%,var(--metal) 60%,#180e08 100%)',borderBottom:'3px solid #0a0604',padding:'0 18px',position:'sticky',top:0,zIndex:500,boxShadow:'0 4px 20px rgba(0,0,0,.8)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:'48px',borderBottom:'1px solid rgba(90,64,48,.5)',gap:'8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'16px',filter:'sepia(1) brightness(.6)'}}>⭐</span>
            <div>
              <div style={{fontFamily:"'Special Elite',cursive",fontSize:'11px',letterSpacing:'4px',color:'var(--chrome)',textTransform:'uppercase'}}>U.S. Rangers</div>
              <div style={{fontSize:'8px',letterSpacing:'3px',color:'rgba(180,150,100,.4)',textTransform:'uppercase'}}>Bureau de Commandement</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:"'Special Elite',cursive",fontSize:'11px',letterSpacing:'2px',color:'var(--chrome)'}}>{ranger?.prenom_rp} {ranger?.nom_rp}</div>
              <div style={{fontSize:'8px',letterSpacing:'2px',color:'rgba(180,150,100,.45)',textTransform:'uppercase'}}>
                {ranger?.grade} {isAdmin&&<span style={{color:'var(--red)'}}>★ Admin</span>}
              </div>
            </div>
            <div onClick={()=>switchTab('profil')} style={{width:'30px',height:'30px',borderRadius:'50%',border:'1.5px solid var(--paper-dark)',overflow:'hidden',background:'var(--metal)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,cursor:'pointer'}}>
              {ranger?.photo_url?<img src={ranger.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'👤'}
            </div>
            <button onClick={signOut} style={{background:'none',border:'1px solid rgba(139,26,26,.4)',color:'rgba(139,26,26,.7)',padding:'3px 8px',fontFamily:"'Special Elite',cursive",fontSize:'8px',letterSpacing:'2px',textTransform:'uppercase',cursor:'pointer'}}>Quitter</button>
          </div>
        </div>
        <nav style={{display:'flex',alignItems:'flex-end',gap:'2px',padding:'5px 0 0',overflowX:'auto'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{
              flexShrink:0,padding:activeTab===t.id?'5px 10px 9px':'5px 10px 7px',
              background:activeTab===t.id?'var(--paper)':'linear-gradient(180deg,#3a2820,#2a1c12)',
              border:'1px solid',borderColor:activeTab===t.id?'var(--ink-3)':'#5a4030',
              borderBottom:'none',fontFamily:"'Special Elite',cursive",fontSize:'8px',letterSpacing:'2px',
              textTransform:'uppercase',color:activeTab===t.id?'var(--ink)':'rgba(180,150,100,.5)',
              cursor:'pointer',clipPath:'polygon(0 25%,10% 0,90% 0,100% 25%,100% 100%,0 100%)',
              whiteSpace:'nowrap',transition:'all .15s'
            }}>
              <span style={{display:'block',fontSize:'9px',textAlign:'center',marginBottom:'1px'}}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'0 14px 40px'}}>
        <div className="paper-sheet page-in">
          <div className="hole" style={{top:'48px'}}/>
          <div className="hole" style={{top:'45%'}}/>
          <div className="hole" style={{bottom:'48px'}}/>
          {activeTab==='accueil'      && <TabAccueil ranger={ranger} switchTab={switchTab}/>}
          {activeTab==='profil'       && <TabProfil ranger={ranger} snd={snd}/>}
          {activeTab==='organigramme' && <TabOrganigramme canEdit={isAdmin||canEditOrg} snd={snd}/>}
          {activeTab==='logistique'   && <TabLogistique snd={snd} ranger={ranger}/>}
          {activeTab==='armes'        && <TabArmes snd={snd} ranger={ranger} isAdmin={isAdmin}/>}
          {activeTab==='comptes'      && <TabComptes snd={snd} ranger={ranger}/>}
          {activeTab==='rapports'     && <TabRapports ranger={ranger} snd={snd}/>}
          {activeTab==='enquetes'     && <TabEnquetes ranger={ranger} snd={snd}/>}
          {activeTab==='admin'        && <TabAdmin isAdmin={isAdmin} currentRanger={ranger} snd={snd}/>}
        </div>
      </main>
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  )
}

/* ════════ ACCUEIL ════════ */
function TabAccueil({ranger,switchTab}){
  const [stats,setStats]=useState({rangers:0,volees:0,solde:0,enquetes:0})
  useEffect(()=>{
    async function load(){
      const [{count:r},{count:v},{data:c},{count:e}]=await Promise.all([
        supabase.from('rangers').select('*',{count:'exact',head:true}).eq('statut','actif'),
        supabase.from('stock_armes').select('*',{count:'exact',head:true}).eq('statut','volee'),
        supabase.from('comptes').select('montant,operation'),
        supabase.from('enquetes').select('*',{count:'exact',head:true}).in('statut',['en_cours','en_traque']),
      ])
      setSolde((c||[]).reduce((s,x)=>x.operation==='ajout'?s+Number(x.montant):s-Number(x.montant),0))
      setStats({rangers:r||0,volees:v||0,solde:(c||[]).reduce((s,x)=>x.operation==='ajout'?s+Number(x.montant):s-Number(x.montant),0),enquetes:e||0})
    }
    load()
  },[])
  const now=new Date()
  return(
    <div className="page-in">
      <PageHeader title="Tableau de Bord" sub="U.S. Rangers — Bureau de New Austin">
        <div style={{textAlign:'right',fontSize:'9px',letterSpacing:'2px',color:'var(--ink-3)',lineHeight:'1.7'}}>{String(now.getDate()).padStart(2,'0')}/{String(now.getMonth()+1).padStart(2,'0')}/{now.getFullYear()}</div>
      </PageHeader>
      <div className="info-grid">
        <StatCard label="Effectif actif" value={stats.rangers} sub="Rangers"/>
        <StatCard label="Armes volées" value={stats.volees} sub={stats.volees>0?'En investigation':'RAS'} accent={stats.volees>0?'red':''}/>
        <StatCard label="Solde Bureau" value={`${stats.solde.toFixed(2)} $`} sub="Trésorerie" accent="green" small/>
        <StatCard label="Enquêtes actives" value={stats.enquetes} sub="En cours / En traque" accent={stats.enquetes>0?'orange':''}/>
      </div>
      <div className="ornament">★ Message du Commandement ★</div>
      <div style={{borderLeft:'3px solid var(--ink-3)',padding:'10px 14px',background:'rgba(180,150,80,.06)',fontSize:'13px',lineHeight:'28px',color:'var(--ink-2)',fontStyle:'italic'}}>
        « Bienvenue, {ranger?.grade} {ranger?.prenom_rp} {ranger?.nom_rp}. Que la justice guide votre main. »
        <div style={{marginTop:'6px',fontSize:'9px',letterSpacing:'2px',color:'var(--ink-3)',fontStyle:'normal'}}>— Le Commandant, New Austin · 1900</div>
      </div>
      <div style={{marginTop:'16px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
        <button className="btn btn-primary btn-sm" onClick={()=>switchTab('enquetes')}>🔍 Enquêtes</button>
        <button className="btn btn-sm" onClick={()=>switchTab('rapports')}>📄 Rapports</button>
        <button className="btn btn-sm" onClick={()=>switchTab('profil')}>👤 Mon profil</button>
      </div>
    </div>
  )
}

/* ════════ PROFIL ════════ */
const COMPETENCES_LIST=['Pistage','Tireur d\'élite','Interrogatoire','Médecine','Droit','Infiltration','Équitation','Cynophile','Explosifs','Navigation','Langues étrangères','Combat rapproché','Photographie','Enquête','Renseignement','Négociation','Surveillance','Camouflage']

function TabProfil({ranger,snd}){
  const {refreshRanger}=useAuth()
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState({surnom:'',bio:'',competences:[]})
  const [photoFile,setPhotoFile]=useState(null)
  const [photoPreview,setPhotoPreview]=useState(null)
  const [msg,setMsg]=useState('')
  const [saving,setSaving]=useState(false)

  useEffect(()=>{
    if(ranger) setForm({surnom:ranger.surnom||'',bio:ranger.bio||'',competences:ranger.competences||[]})
  },[ranger])

  function toggleComp(c){snd.keyClick();setForm(f=>({...f,competences:f.competences.includes(c)?f.competences.filter(x=>x!==c):[...f.competences,c]}))}

  function handlePhotoChange(e){
    const file=e.target.files[0]; if(!file)return
    setPhotoFile(file)
    const reader=new FileReader()
    reader.onload=ev=>setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function save(){
    snd.carriageReturn(); setSaving(true)
    let photoUrl=ranger?.photo_url

    // Upload nouvelle photo si fournie
    if(photoFile){
      const ext=photoFile.name.split('.').pop()
      const path=`rangers/${ranger.bp}.${ext}`
      const{error:upErr}=await supabase.storage.from('photos').upload(path,photoFile,{upsert:true})
      if(!upErr){
        const{data:urlData}=supabase.storage.from('photos').getPublicUrl(path)
        photoUrl=urlData.publicUrl+'?t='+Date.now() // cache bust
      } else {
        setMsg('⚠ Erreur upload photo : '+upErr.message)
        setSaving(false); return
      }
    }

    const{error}=await supabase.from('rangers').update({
      surnom:form.surnom||null,
      bio:form.bio||null,
      competences:form.competences,
      photo_url:photoUrl,
    }).eq('id',ranger.id)

    setSaving(false)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding()
    setMsg('✓ Profil mis à jour')
    setEditing(false)
    setPhotoFile(null); setPhotoPreview(null)
    if(refreshRanger) await refreshRanger()
    setTimeout(()=>setMsg(''),2500)
  }

  if(!ranger) return <Loader/>

  return(
    <div className="page-in">
      <PageHeader title="Mon Dossier" sub="Fiche personnelle — U.S. Rangers">
        {!editing&&<button className="btn btn-primary btn-sm" onClick={()=>{snd.keyClick();setEditing(true)}}>✎ Modifier</button>}
      </PageHeader>
      {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}

      {/* Carte identité */}
      <div style={{display:'flex',gap:'20px',alignItems:'flex-start',flexWrap:'wrap',marginBottom:'22px',padding:'14px',border:'1px solid rgba(160,130,70,.35)',background:'rgba(180,150,80,.04)'}}>
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:'88px',height:'110px',border:'2px solid var(--ink)',overflow:'hidden',background:'var(--paper-aged)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',filter:'sepia(.3)'}}>
            {(photoPreview||ranger.photo_url)?<img src={photoPreview||ranger.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'👤'}
          </div>
          {editing&&(
            <label style={{position:'absolute',bottom:'-10px',left:'50%',transform:'translateX(-50%)',background:'var(--ink)',color:'var(--paper)',padding:'2px 8px',fontFamily:"'Special Elite',cursive",fontSize:'8px',letterSpacing:'2px',cursor:'pointer',whiteSpace:'nowrap',border:'1px solid var(--ink-2)'}}>
              📷 Changer
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{display:'none'}}/>
            </label>
          )}
        </div>
        <div style={{flex:1,paddingTop:'4px'}}>
          <div style={{fontFamily:"'Special Elite',cursive",fontSize:'clamp(16px,4vw,24px)',letterSpacing:'4px',color:'var(--ink)',textTransform:'uppercase'}}>{ranger.prenom_rp} {ranger.nom_rp}</div>
          {ranger.surnom&&<div style={{fontFamily:"'Special Elite',cursive",fontSize:'13px',color:'var(--ink-3)',fontStyle:'italic',marginTop:'2px'}}>« {ranger.surnom} »</div>}
          <div style={{marginTop:'8px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
            <span className={`grade-badge grade-${ranger.grade}`}>{ranger.grade}</span>
            {ranger.is_admin&&<span style={{border:'1px solid var(--red)',color:'var(--red)',padding:'1px 6px',fontSize:'9px',letterSpacing:'2px',fontFamily:"'Special Elite',cursive"}}>★ Admin</span>}
            {ranger.pole&&<span style={{border:'1px solid var(--ink-3)',color:'var(--ink-3)',padding:'1px 6px',fontSize:'9px',letterSpacing:'2px',fontFamily:"'Special Elite',cursive"}}>{ranger.pole}</span>}
          </div>
          <div style={{marginTop:'5px',fontSize:'10px',color:'var(--ink-3)',letterSpacing:'1px'}}>BP : <strong>{ranger.bp}</strong></div>
        </div>
      </div>

      {editing?(
        <>
          <Field label="Surnom / Alias">
            <input type="text" value={form.surnom} onChange={e=>{setForm(f=>({...f,surnom:e.target.value}));snd.keyClick()}} placeholder="ex: L'Ombre, Le Loup..."/>
          </Field>
          <Field label="Biographie / Notes personnelles">
            <textarea value={form.bio} onChange={e=>{setForm(f=>({...f,bio:e.target.value}));snd.keyClick()}} placeholder="Décrivez votre parcours..." style={{minHeight:'90px'}}/>
          </Field>
          <div className="field-group">
            <label>Compétences</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'6px'}}>
              {COMPETENCES_LIST.map(c=>(
                <span key={c} className={`comp-tag ${form.competences.includes(c)?'active':''}`} onClick={()=>toggleComp(c)}>{c}</span>
              ))}
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'⟳ Enregistrement...':'✓ Enregistrer'}</button>
            <button className="btn" onClick={()=>{setEditing(false);setPhotoFile(null);setPhotoPreview(null);setForm({surnom:ranger.surnom||'',bio:ranger.bio||'',competences:ranger.competences||[]})}}>✕ Annuler</button>
          </div>
        </>
      ):(
        <>
          {ranger.bio&&(
            <div style={{marginBottom:'16px'}}>
              <div className="section-title">Biographie</div>
              <div style={{fontSize:'13px',lineHeight:'28px',color:'var(--ink-2)',fontStyle:'italic',whiteSpace:'pre-wrap'}}>{ranger.bio}</div>
            </div>
          )}
          <div className="section-title">Compétences</div>
          {(ranger.competences||[]).length>0
            ?<div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{(ranger.competences||[]).map(c=><span key={c} className="comp-tag active">{c}</span>)}</div>
            :<div style={{color:'var(--ink-3)',fontStyle:'italic',fontSize:'12px'}}>Aucune compétence renseignée. Cliquez sur Modifier.</div>
          }
        </>
      )}
    </div>
  )
}

/* ════════ ORGANIGRAMME ════════ */
function TabOrganigramme({canEdit,snd}){
  const [rangers,setRangers]=useState([])
  const [page,setPage]=useState('list') // 'list' | 'edit-member' | 'add-member'
  const [selected,setSelected]=useState(null)
  const [form,setForm]=useState({grade:'',pole:'',role_special:'',prenom_rp:'',nom_rp:''})
  const [msg,setMsg]=useState('')

  useEffect(()=>{load()},[])
  async function load(){const{data}=await supabase.from('rangers').select('*').eq('statut','actif').order('grade');setRangers(data||[])}

  function openEdit(r){
    if(!canEdit)return
    snd.keyClick()
    setSelected(r)
    setForm({grade:r.grade,pole:r.pole||'',role_special:r.role_special||'',prenom_rp:r.prenom_rp,nom_rp:r.nom_rp})
    setMsg('')
    setPage('edit-member')
  }

  async function save(){
    snd.carriageReturn()
    const{error}=await supabase.from('rangers').update({
      grade:form.grade,pole:form.pole||null,
      role_special:form.role_special||null,
      prenom_rp:form.prenom_rp,nom_rp:form.nom_rp,
    }).eq('id',selected.id)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();setMsg('✓ Modifié');await load()
    setTimeout(()=>{setPage('list');setMsg('')},700)
  }

  const byGrade=g=>rangers.filter(r=>r.grade===g)
  const byPole=p=>rangers.filter(r=>r.pole===p&&r.grade!=='commandant')
  const POLES=[{id:'logistique',label:'Logistique'},{id:'operationnel',label:'Opérationnel'},{id:'admin',label:'Admin & Formation'}]

  // ── Page édition membre ──
  if(page==='edit-member'&&selected){
    return(
      <SlidePage title={`Modifier — ${selected.prenom_rp} ${selected.nom_rp}`} onClose={()=>setPage('list')}>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <div className="two-col">
          <Field label="Prénom (RP)"><input type="text" value={form.prenom_rp} onChange={e=>{setForm(f=>({...f,prenom_rp:e.target.value}));snd.keyClick()}}/></Field>
          <Field label="Nom (RP)"><input type="text" value={form.nom_rp} onChange={e=>{setForm(f=>({...f,nom_rp:e.target.value}));snd.keyClick()}}/></Field>
        </div>
        <Field label="Grade">
          <select value={form.grade} onChange={e=>{setForm(f=>({...f,grade:e.target.value}));snd.keyClick()}}>
            {['commandant','lieutenant','sergent','confirme','deputy'].map(g=><option key={g}>{g}</option>)}
          </select>
        </Field>
        <div className="two-col">
          <Field label="Pôle">
            <select value={form.pole} onChange={e=>{setForm(f=>({...f,pole:e.target.value}));snd.keyClick()}}>
              <option value="">— Aucun —</option>
              <option value="logistique">Logistique</option>
              <option value="operationnel">Opérationnel</option>
              <option value="admin">Admin & Formation</option>
            </select>
          </Field>
          <Field label="Rôle spécial"><input type="text" value={form.role_special} onChange={e=>{setForm(f=>({...f,role_special:e.target.value}));snd.keyClick()}} placeholder="Œil de lynx, Cynophile..."/></Field>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={save}>✓ Enregistrer</button>
          <button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button>
        </div>
      </SlidePage>
    )
  }

  // ── Arbre organigramme ──
  return(
    <div className="page-in">
      <PageHeader title="Organigramme" sub="Structure hiérarchique — U.S. Rangers">
        {canEdit&&<div style={{fontSize:'9px',color:'var(--ink-3)',fontStyle:'italic'}}>✎ Cliquez sur un membre pour modifier</div>}
      </PageHeader>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',overflowX:'auto',gap:'0',fontFamily:"'Special Elite',cursive"}}>

        {/* Commandant */}
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap',justifyContent:'center'}}>
          {byGrade('commandant').length>0
            ?byGrade('commandant').map(r=><OrgNodeComp key={r.id} role="Commandant" name={`${r.prenom_rp} ${r.nom_rp}`} isTop onClick={canEdit?()=>openEdit(r):null} extra={r.role_special}/>)
            :<OrgNodeComp role="Commandant" name="— Vacant —" isTop onClick={canEdit?()=>{
              setSelected({id:null,grade:'commandant',pole:'',role_special:'',prenom_rp:'',nom_rp:''})
              setForm({grade:'commandant',pole:'',role_special:'',prenom_rp:'',nom_rp:''})
              setPage('edit-member')
            }:null}/>
          }
        </div>

        {/* Pôles */}
        <div style={{display:'flex',gap:'24px',flexWrap:'wrap',justifyContent:'center',marginTop:'4px'}}>
          {POLES.map(pole=>{
            const lts=byPole(pole.id).filter(r=>r.grade==='lieutenant')
            const members=byPole(pole.id).filter(r=>r.grade!=='lieutenant')
            return(
              <div key={pole.id} style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:'150px'}}>
                <VLine/>
                <div style={{fontSize:'8px',letterSpacing:'2px',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:'3px',borderBottom:'1px solid rgba(106,74,26,.3)',paddingBottom:'2px',width:'100%',textAlign:'center'}}>{pole.label}</div>
                {lts.length>0
                  ?lts.map(r=><OrgNodeComp key={r.id} role="Lieutenant" name={`${r.prenom_rp} ${r.nom_rp}`} extra={r.role_special} onClick={canEdit?()=>openEdit(r):null}/>)
                  :<OrgNodeComp role="Lieutenant" name="— Vacant —"/>
                }
                {members.map(r=>(
                  <div key={r.id} onClick={canEdit?()=>openEdit(r):null}
                    style={{fontSize:'11px',color:'var(--ink-2)',padding:'3px 6px',borderBottom:'1px dashed rgba(160,130,70,.2)',width:'100%',textAlign:'center',cursor:canEdit?'pointer':'default',transition:'background .15s'}}
                    onMouseEnter={e=>canEdit&&(e.currentTarget.style.background='rgba(180,150,80,.12)')}
                    onMouseLeave={e=>canEdit&&(e.currentTarget.style.background='')}>
                    <span style={{fontSize:'8px',color:'var(--ink-3)',display:'block'}}>{r.grade}{r.role_special?` — ${r.role_special}`:''}</span>
                    {r.prenom_rp} {r.nom_rp}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Sergents hors pôle */}
        {rangers.filter(r=>r.grade==='sergent'&&!r.pole).length>0&&(
          <><VLine/>
          <div style={{fontSize:'8px',letterSpacing:'2px',textTransform:'uppercase',color:'var(--ink-3)',margin:'3px 0 6px',borderBottom:'1px solid rgba(106,74,26,.3)',paddingBottom:'2px',minWidth:'160px',textAlign:'center'}}>Sergents</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'5px',justifyContent:'center'}}>
            {rangers.filter(r=>r.grade==='sergent'&&!r.pole).map(r=>(
              <OrgNodeComp key={r.id} role="Sergent" name={`${r.prenom_rp} ${r.nom_rp}`} extra={r.role_special} onClick={canEdit?()=>openEdit(r):null}/>
            ))}
          </div></>
        )}

        {/* Deputies */}
        {byGrade('deputy').length>0&&(
          <><VLine/>
          <div style={{fontSize:'8px',letterSpacing:'2px',textTransform:'uppercase',color:'var(--ink-3)',margin:'3px 0 6px',borderBottom:'1px solid rgba(106,74,26,.3)',paddingBottom:'2px',minWidth:'160px',textAlign:'center'}}>Deputies</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'5px',justifyContent:'center'}}>
            {byGrade('deputy').map(r=>(
              <div key={r.id} onClick={canEdit?()=>openEdit(r):null}
                style={{fontSize:'11px',color:'var(--ink-2)',padding:'3px 9px',border:'1px solid rgba(160,130,70,.3)',minWidth:'110px',textAlign:'center',cursor:canEdit?'pointer':'default',fontFamily:"'Special Elite',cursive",transition:'all .15s'}}
                onMouseEnter={e=>canEdit&&(e.currentTarget.style.background='rgba(180,150,80,.12)')}
                onMouseLeave={e=>canEdit&&(e.currentTarget.style.background='')}>
                {r.prenom_rp} {r.nom_rp}
                {r.role_special&&<span style={{fontSize:'8px',color:'var(--ink-3)',display:'block'}}>{r.role_special}</span>}
              </div>
            ))}
          </div></>
        )}
      </div>
    </div>
  )
}

function OrgNodeComp({role,name,isTop,onClick,extra}){
  return(
    <div onClick={onClick}
      style={{border:`${isTop?'2':'1.5'}px solid ${isTop?'var(--red)':'var(--ink-2)'}`,padding:'7px 14px',textAlign:'center',background:'rgba(180,150,80,.07)',minWidth:'150px',cursor:onClick?'pointer':'default',transition:'background .15s',marginBottom:'0'}}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.background='rgba(180,150,80,.17)')}
      onMouseLeave={e=>onClick&&(e.currentTarget.style.background='rgba(180,150,80,.07)')}>
      <span style={{fontSize:'8px',letterSpacing:'3px',textTransform:'uppercase',color:isTop?'var(--red)':'var(--ink-3)',display:'block'}}>{role}</span>
      <span style={{fontSize:'13px',letterSpacing:'2px',color:isTop?'var(--red)':'var(--ink)',display:'block',marginTop:'1px',fontFamily:"'Special Elite',cursive"}}>{name}</span>
      {extra&&<span style={{fontSize:'8px',color:'var(--ink-3)',display:'block',marginTop:'1px',fontStyle:'italic'}}>{extra}</span>}
    </div>
  )
}

/* ════════ LOGISTIQUE ════════ */
function TabLogistique({snd,ranger}){
  const [items,setItems]=useState([])
  const [histo,setHisto]=useState([])
  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState('list') // 'list'|'add'|'edit'|'mouv'|'histo'
  const [editItem,setEditItem]=useState(null)
  const [form,setForm]=useState({article:'',categorie:'Papeterie',qte_wallace:0,qte_blackwater:0,qte_mercer:0,qte_armadillo:0,min_blackwater:0})
  const [mouv,setMouv]=useState({poste:'wallace',type:'ajout',quantite:1})
  const [msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){
    const [{data:i},{data:h}]=await Promise.all([
      supabase.from('logistique').select('*').order('categorie'),
      supabase.from('logistique_historique').select('*').order('created_at',{ascending:false}).limit(60),
    ])
    setItems(i||[]);setHisto(h||[]);setLoading(false)
  }
  function openAdd(){snd.keyClick();setEditItem(null);setForm({article:'',categorie:'Papeterie',qte_wallace:0,qte_blackwater:0,qte_mercer:0,qte_armadillo:0,min_blackwater:0});setMsg('');setPage('add')}
  function openEdit(item){snd.keyClick();setEditItem(item);setForm({article:item.article,categorie:item.categorie,qte_wallace:item.qte_wallace,qte_blackwater:item.qte_blackwater,qte_mercer:item.qte_mercer,qte_armadillo:item.qte_armadillo,min_blackwater:item.min_blackwater});setMsg('');setPage('edit')}
  function openMouv(item){snd.keyClick();setEditItem(item);setMouv({poste:'wallace',type:'ajout',quantite:1});setMsg('');setPage('mouv')}
  async function save(){
    snd.carriageReturn()
    if(!form.article){setMsg('⚠ Article requis');return}
    const{error}=editItem?await supabase.from('logistique').update(form).eq('id',editItem.id):await supabase.from('logistique').insert(form)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await load();setPage('list')
  }
  async function saveMouv(){
    snd.carriageReturn()
    if(!mouv.quantite||mouv.quantite<1){setMsg('⚠ Quantité invalide');return}
    const col=`qte_${mouv.poste}`
    const qteAvant=editItem[col]||0
    const delta=mouv.type==='ajout'?Number(mouv.quantite):-Number(mouv.quantite)
    const qteApres=Math.max(0,qteAvant+delta)
    const{error}=await supabase.from('logistique').update({[col]:qteApres}).eq('id',editItem.id)
    if(error){setMsg('⚠ '+error.message);return}
    await supabase.from('logistique_historique').insert({article_id:editItem.id,article_nom:editItem.article,poste:mouv.poste,type_mouv:mouv.type,quantite:Number(mouv.quantite),qte_avant:qteAvant,qte_apres:qteApres,ranger_bp:ranger?.bp,ranger_nom:ranger?`${ranger.prenom_rp} ${ranger.nom_rp}`:null})
    snd.ding();await load();setPage('list')
  }
  async function del(id){if(!confirm('Supprimer ?'))return;snd.carriageReturn();await supabase.from('logistique').delete().eq('id',id);await load()}
  const CATS=['Papeterie','Armurerie','Fourniture','Alimentaire','Soins']
  const POSTES=[{id:'wallace',label:'Fort Wallace'},{id:'blackwater',label:'Bur. Blackwater'},{id:'mercer',label:'Fort Mercer'},{id:'armadillo',label:'Camp Armadillo'}]

  if(page==='add'||page==='edit'){
    return(
      <SlidePage title={editItem?`Modifier — ${editItem.article}`:'Nouvel article'} onClose={()=>setPage('list')}>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <div className="two-col">
          <Field label="Nom de l'article"><input type="text" value={form.article} onChange={e=>{setForm(f=>({...f,article:e.target.value}));snd.keyClick()}} placeholder="ex: Bandage"/></Field>
          <Field label="Catégorie"><select value={form.categorie} onChange={e=>{setForm(f=>({...f,categorie:e.target.value}));snd.keyClick()}}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
        </div>
        <div className="two-col">
          <Field label="Fort Wallace"><input type="number" min="0" value={form.qte_wallace} onChange={e=>{setForm(f=>({...f,qte_wallace:+e.target.value}));snd.keyClick()}}/></Field>
          <Field label="Bur. Blackwater"><input type="number" min="0" value={form.qte_blackwater} onChange={e=>{setForm(f=>({...f,qte_blackwater:+e.target.value}));snd.keyClick()}}/></Field>
          <Field label="Fort Mercer"><input type="number" min="0" value={form.qte_mercer} onChange={e=>{setForm(f=>({...f,qte_mercer:+e.target.value}));snd.keyClick()}}/></Field>
          <Field label="Camp Armadillo"><input type="number" min="0" value={form.qte_armadillo} onChange={e=>{setForm(f=>({...f,qte_armadillo:+e.target.value}));snd.keyClick()}}/></Field>
        </div>
        <Field label="Stock min. Blackwater"><input type="number" min="0" value={form.min_blackwater} onChange={e=>{setForm(f=>({...f,min_blackwater:+e.target.value}));snd.keyClick()}}/></Field>
        <div className="btn-row"><button className="btn btn-primary" onClick={save}>✓ Enregistrer</button><button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button></div>
      </SlidePage>
    )
  }
  if(page==='mouv'&&editItem){
    return(
      <SlidePage title={`Mouvement de stock — ${editItem.article}`} onClose={()=>setPage('list')}>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'14px'}}>
          {POSTES.map(p=>(
            <div key={p.id} style={{border:`2px solid ${mouv.poste===p.id?'var(--ink)':'rgba(160,130,70,.3)'}`,padding:'10px',textAlign:'center',cursor:'pointer',background:mouv.poste===p.id?'rgba(26,16,8,.07)':'transparent',transition:'all .15s'}} onClick={()=>{setMouv(m=>({...m,poste:p.id}));snd.keyClick()}}>
              <div style={{fontFamily:"'Special Elite',cursive",fontSize:'9px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase'}}>{p.label}</div>
              <div style={{fontSize:'22px',fontWeight:700,color:'var(--ink)',marginTop:'4px'}}>{editItem[`qte_${p.id}`]||0}</div>
            </div>
          ))}
        </div>
        <Field label="Type d'opération">
          <div style={{display:'flex',gap:'14px',marginTop:'6px'}}>
            {['ajout','retrait'].map(t=>(
              <label key={t} style={{display:'flex',alignItems:'center',gap:'7px',cursor:'pointer',fontFamily:"'Special Elite',cursive",fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase',color:mouv.type===t?'var(--ink)':'var(--ink-3)'}}>
                <input type="radio" checked={mouv.type===t} onChange={()=>{setMouv(m=>({...m,type:t}));snd.keyClick()}} style={{accentColor:'var(--ink)'}}/>
                {t==='ajout'?'✚ Ajout':'✖ Retrait'}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Quantité">
          <div className="qty-control" style={{marginTop:'6px'}}>
            <button className="qty-btn" onClick={()=>{setMouv(m=>({...m,quantite:Math.max(1,m.quantite-1)}));snd.keyClick()}}>−</button>
            <span className="qty-value">{mouv.quantite}</span>
            <button className="qty-btn" onClick={()=>{setMouv(m=>({...m,quantite:m.quantite+1}));snd.keyClick()}}>+</button>
            <input type="number" min="1" value={mouv.quantite} onChange={e=>setMouv(m=>({...m,quantite:+e.target.value}))} style={{width:'55px',textAlign:'center',marginLeft:'8px',fontSize:'13px'}}/>
          </div>
        </Field>
        <div style={{marginTop:'12px',padding:'10px',background:'rgba(180,150,80,.08)',border:'1px solid rgba(160,130,70,.3)',fontSize:'12px',color:'var(--ink-2)'}}>
          Résultat : <strong>{editItem[`qte_${mouv.poste}`]||0}</strong> → <strong style={{color:mouv.type==='ajout'?'var(--green)':'var(--red)'}}>{Math.max(0,(editItem[`qte_${mouv.poste}`]||0)+(mouv.type==='ajout'?mouv.quantite:-mouv.quantite))}</strong>
          <span style={{fontSize:'9px',color:'var(--ink-3)',marginLeft:'8px'}}>({mouv.type==='ajout'?'+':'-'}{mouv.quantite} à {POSTES.find(p=>p.id===mouv.poste)?.label})</span>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={saveMouv}>✓ Confirmer</button><button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button></div>
      </SlidePage>
    )
  }
  if(page==='histo'){
    return(
      <SlidePage title="Historique des mouvements" onClose={()=>setPage('list')} wide>
        <table className="register-table">
          <thead><tr><th>Date / Heure</th><th>Article</th><th>Poste</th><th>Op.</th><th>Qté</th><th>Avant → Après</th><th>Par</th></tr></thead>
          <tbody>
            {histo.map(h=>(
              <tr key={h.id}>
                <td style={{fontSize:'9px'}}>{new Date(h.created_at).toLocaleDateString('fr-FR')} {new Date(h.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</td>
                <td style={{fontSize:'11px'}}>{h.article_nom}</td>
                <td style={{fontSize:'9px',textTransform:'capitalize'}}>{h.poste}</td>
                <td><span className={`status-badge ${h.type_mouv==='ajout'?'status-ok':'status-vol'}`}>{h.type_mouv==='ajout'?'+':'-'}</span></td>
                <td style={{fontWeight:700}}>{h.quantite}</td>
                <td style={{fontSize:'11px'}}>{h.qte_avant} → <strong>{h.qte_apres}</strong></td>
                <td style={{fontSize:'10px'}}>{h.ranger_nom||'—'}</td>
              </tr>
            ))}
            {histo.length===0&&<tr><td colSpan="7" style={{textAlign:'center',fontStyle:'italic',color:'var(--ink-3)',padding:'14px'}}>Aucun mouvement.</td></tr>}
          </tbody>
        </table>
      </SlidePage>
    )
  }

  return(
    <div className="page-in">
      <PageHeader title="Logistique" sub="Inventaire des fournitures">
        <div className="btn-row" style={{margin:0,gap:'5px'}}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Article</button>
          <button className="btn btn-sm" onClick={()=>{snd.keyClick();setPage('histo')}}>📋 Historique</button>
        </div>
      </PageHeader>
      {loading?<Loader/>:(
        <table className="register-table">
          <thead><tr><th>Article</th><th>Catégorie</th><th>Wallace</th><th>Blackwater</th><th>Mercer</th><th>Armadillo</th><th></th></tr></thead>
          <tbody>
            {items.map(item=>(
              <tr key={item.id}>
                <td><strong>{item.article}</strong></td>
                <td style={{fontSize:'10px'}}>{item.categorie}</td>
                <td>{item.qte_wallace}</td>
                <td style={{color:item.qte_blackwater<item.min_blackwater?'var(--red)':'inherit',fontWeight:item.qte_blackwater<item.min_blackwater?700:'normal'}}>
                  {item.qte_blackwater}{item.min_blackwater>0?` (${item.min_blackwater})`:''}
                </td>
                <td>{item.qte_mercer}</td>
                <td>{item.qte_armadillo||'—'}</td>
                <td><div style={{display:'flex',gap:'2px'}}>
                  <button className="btn btn-success btn-sm" onClick={()=>openMouv(item)} title="Mouvement stock">±</button>
                  <button className="btn btn-sm" onClick={()=>openEdit(item)}>✎</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>del(item.id)}>✕</button>
                </div></td>
              </tr>
            ))}
            {items.length===0&&<tr><td colSpan="7" style={{textAlign:'center',fontStyle:'italic',color:'var(--ink-3)',padding:'18px'}}>Aucun article — Cliquez sur + Article</td></tr>}
          </tbody>
        </table>
      )}
      <div style={{fontSize:'9px',color:'var(--ink-3)',fontStyle:'italic'}}>* Parenthèses = stock minimum · Bouton ± pour mouvements</div>
    </div>
  )
}

/* ════════ ARMES ════════ */
function TabArmes({snd,ranger,isAdmin}){
  const [armes,setArmes]=useState([])
  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState('list')
  const [editArme,setEditArme]=useState(null)
  const [rangers,setRangers]=useState([])
  const [form,setForm]=useState({type_arme:'',numero_serie:'',date_fabrication:'',emplacement:'Registre Blackwater',statut:'en_stock',affecte_a:'',nom_affecte:''})
  const [msg,setMsg]=useState('')
  const [tooltip,setTooltip]=useState({show:false,text:'',x:0,y:0})

  useEffect(()=>{load()},[])
  async function load(){
    const [{data:a},{data:r}]=await Promise.all([
      supabase.from('stock_armes').select('*, ranger:affecte_a(prenom_rp,nom_rp)').order('type_arme'),
      supabase.from('rangers').select('id,prenom_rp,nom_rp').eq('statut','actif'),
    ])
    setArmes(a||[]);setRangers(r||[]);setLoading(false)
  }

  const canModifyAffect = isAdmin || ['commandant','lieutenant','sergent'].includes(ranger?.grade)

  function openAdd(){snd.keyClick();setEditArme(null);setForm({type_arme:'',numero_serie:'',date_fabrication:'',emplacement:'Registre Blackwater',statut:'en_stock',affecte_a:'',nom_affecte:''});setMsg('');setPage('add')}
  function openEdit(a){
    if(!canModifyAffect)return
    snd.keyClick();setEditArme(a)
    setForm({type_arme:a.type_arme,numero_serie:a.numero_serie,date_fabrication:a.date_fabrication||'',emplacement:a.emplacement||'',statut:a.statut,affecte_a:a.affecte_a||'',nom_affecte:a.ranger?`${a.ranger.prenom_rp} ${a.ranger.nom_rp}`:''})
    setMsg('');setPage('edit')
  }

  async function save(){
    snd.carriageReturn()
    if(!form.type_arme||!form.numero_serie){setMsg('⚠ Type et numéro requis');return}
    const payload={
      type_arme:form.type_arme,numero_serie:form.numero_serie,
      date_fabrication:form.date_fabrication||null,
      emplacement:form.statut==='affectee'?null:form.emplacement,
      statut:form.statut,
      affecte_a:form.statut==='affectee'?form.affecte_a||null:null,
    }
    const{error}=editArme?await supabase.from('stock_armes').update(payload).eq('id',editArme.id):await supabase.from('stock_armes').insert(payload)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await load();setPage('list')
  }

  async function del(id){if(!confirm('Supprimer ?'))return;snd.carriageReturn();await supabase.from('stock_armes').delete().eq('id',id);await load()}

  const TYPES=['Cattleman','Navy','Winchester','Springfield','Pompe','Verrou','Rolling Block','Autre']
  const EMPLACEMENTS=['Registre Blackwater','Registre Wallace','Fort Mercer','Camp Armadillo']
  const volees=armes.filter(a=>a.statut==='volee').length
  const affectees=armes.filter(a=>a.statut==='affectee').length

  if(page==='add'||page==='edit'){
    return(
      <SlidePage title={editArme?`Modifier — ${editArme.type_arme} N°${editArme.numero_serie}`:'Nouvelle arme'} onClose={()=>setPage('list')}>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <div className="two-col">
          <Field label="Type d'arme">
            <select value={form.type_arme} onChange={e=>{setForm(f=>({...f,type_arme:e.target.value}));snd.keyClick()}}>
              <option value="">— Sélectionner —</option>
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="N° de série"><input type="text" value={form.numero_serie} onChange={e=>{setForm(f=>({...f,numero_serie:e.target.value}));snd.keyClick()}} placeholder="147600"/></Field>
        </div>
        <div className="two-col">
          <Field label="Date fabrication"><input type="date" value={form.date_fabrication} onChange={e=>{setForm(f=>({...f,date_fabrication:e.target.value}));snd.keyClick()}}/></Field>
          <Field label="Statut">
            <select value={form.statut} onChange={e=>{setForm(f=>({...f,statut:e.target.value}));snd.keyClick()}}>
              <option value="en_stock">En stock</option>
              <option value="affectee">Affectée à un Ranger</option>
              <option value="volee">Volée</option>
              <option value="hors_service">Hors service</option>
            </select>
          </Field>
        </div>

        {form.statut==='affectee'?(
          <Field label="Affectée à quel Ranger">
            <select value={form.affecte_a} onChange={e=>{setForm(f=>({...f,affecte_a:e.target.value}));snd.keyClick()}}>
              <option value="">— Sélectionner un Ranger —</option>
              {rangers.map(r=><option key={r.id} value={r.id}>{r.prenom_rp} {r.nom_rp}</option>)}
            </select>
          </Field>
        ):(
          <Field label="Emplacement">
            <select value={form.emplacement} onChange={e=>{setForm(f=>({...f,emplacement:e.target.value}));snd.keyClick()}}>
              {EMPLACEMENTS.map(e=><option key={e}>{e}</option>)}
            </select>
          </Field>
        )}

        <div className="btn-row">
          <button className="btn btn-primary" onClick={save}>✓ Enregistrer</button>
          <button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button>
        </div>
      </SlidePage>
    )
  }

  return(
    <div className="page-in">
      {/* Tooltip survol */}
      {tooltip.show&&(
        <div style={{position:'fixed',left:tooltip.x+12,top:tooltip.y-8,background:'#1c0f00',color:'#f2e4bf',padding:'4px 10px',fontFamily:"'Special Elite',cursive",fontSize:'11px',letterSpacing:'1px',pointerEvents:'none',zIndex:600,border:'1px solid rgba(245,230,195,.2)',boxShadow:'0 4px 12px rgba(0,0,0,.5)',whiteSpace:'nowrap'}}>
          👤 {tooltip.text}
        </div>
      )}

      <PageHeader title="Stock d'Armes" sub="Registre des armes à feu">
        <div className="btn-row" style={{margin:0,gap:'5px'}}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Enregistrer</button>
          <button className="btn btn-danger btn-sm" onClick={()=>{snd.keyClick();setEditArme(null);setForm(f=>({...f,statut:'volee',type_arme:'',numero_serie:''}));setMsg('');setPage('add')}}>⚠ Signaler vol</button>
        </div>
      </PageHeader>

      <div className="info-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <StatCard label="Total" value={armes.length} sub="enregistrées"/>
        <StatCard label="Volées" value={volees} sub={volees>0?'En investigation':'RAS'} accent={volees>0?'red':''}/>
        <StatCard label="Affectées" value={affectees} sub="à des Rangers"/>
      </div>

      {loading?<Loader/>:(
        <table className="register-table">
          <thead><tr><th>Type</th><th>N° Série</th><th>Date fab.</th><th>Emplacement / Affectataire</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {armes.map(a=>(
              <tr key={a.id} style={a.statut==='volee'?{background:'rgba(139,26,26,.06)'}:{}}>
                <td><strong>{a.type_arme}</strong></td>
                <td style={{letterSpacing:'2px',fontSize:'11px'}}>{a.numero_serie}</td>
                <td style={{fontSize:'10px'}}>{a.date_fabrication?new Date(a.date_fabrication).toLocaleDateString('fr-FR'):'—'}</td>
                <td>
                  {a.statut==='affectee'&&a.ranger?(
                    <span
                      onMouseEnter={e=>setTooltip({show:true,text:`Affectée à : ${a.ranger.prenom_rp} ${a.ranger.nom_rp}`,x:e.clientX,y:e.clientY})}
                      onMouseMove={e=>setTooltip(t=>({...t,x:e.clientX,y:e.clientY}))}
                      onMouseLeave={()=>setTooltip(t=>({...t,show:false}))}
                      style={{cursor:'help',borderBottom:'1px dashed var(--ink-3)',fontStyle:'italic'}}>
                      {a.ranger.prenom_rp} {a.ranger.nom_rp}
                    </span>
                  ):(a.emplacement||'—')}
                </td>
                <td>
                  <span className={`status-badge ${a.statut==='en_stock'?'status-ok':a.statut==='volee'?'status-vol':'status-att'}`}>
                    {a.statut==='en_stock'?'En stock':a.statut==='volee'?'⚠ VOLÉE':a.statut==='affectee'?'Affectée':'Hors service'}
                  </span>
                </td>
                <td>
                  <div style={{display:'flex',gap:'2px'}}>
                    {canModifyAffect&&<button className="btn btn-sm" onClick={()=>openEdit(a)} title="Modifier / Affecter">✎</button>}
                    {canModifyAffect&&<button className="btn btn-danger btn-sm" onClick={()=>del(a.id)}>✕</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!canModifyAffect&&<div style={{fontSize:'9px',color:'var(--ink-3)',fontStyle:'italic',marginTop:'8px'}}>* Seuls les Commandants, Lieutenants et Sergents peuvent modifier le registre</div>}
    </div>
  )
}

/* ════════ COMPTES ════════ */
function TabComptes({snd,ranger}){
  const [ops,setOps]=useState([])
  const [solde,setSolde]=useState(0)
  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState('list')
  const [type,setType]=useState('ajout')
  const [form,setForm]=useState({type_op:'Règlement de facture',autre_precis:'',description:'',nom_prenom:'',montant:''})
  const [msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){
    const{data}=await supabase.from('comptes').select('*, ranger:enregistre_par(prenom_rp,nom_rp)').order('date_op',{ascending:false}).limit(60)
    const d=data||[];setOps(d);setSolde(d.reduce((s,r)=>r.operation==='ajout'?s+Number(r.montant):s-Number(r.montant),0));setLoading(false)
  }
  function openPage(t){snd.keyClick();setType(t);setForm({type_op:'Règlement de facture',autre_precis:'',description:'',nom_prenom:'',montant:''});setMsg('');setPage('form')}
  async function save(){
    snd.carriageReturn()
    if(!form.montant){setMsg('⚠ Montant requis');return}
    const isAutre=form.type_op==='Autre'
    const objet=isAutre?(form.autre_precis||'Autre'):(form.description||form.type_op)
    const typePermis=isAutre?(form.autre_precis||'Autre'):form.type_op
    if(!objet){setMsg('⚠ Description requise');return}
    const{error}=await supabase.from('comptes').insert({objet,nom_prenom:form.nom_prenom||null,type_permis:typePermis,montant:parseFloat(form.montant),operation:type,date_op:new Date().toISOString().split('T')[0],enregistre_par:ranger?.id})
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await load();setPage('list')
  }
  const TYPES_OP=['Règlement de facture','Don / Subvention','Amende encaissée','Équipement','Nourriture / Ravitaillement','Salaire','Remboursement','Autre']

  if(page==='form'){
    return(
      <SlidePage title={type==='ajout'?'Nouvelle entrée — Ajout de fonds':'Nouvelle sortie — Retrait de fonds'} onClose={()=>setPage('list')}>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <Field label="Type d'opération">
          <select value={form.type_op} onChange={e=>{setForm(f=>({...f,type_op:e.target.value}));snd.keyClick()}}>
            {TYPES_OP.map(t=><option key={t}>{t}</option>)}
          </select>
        </Field>
        {form.type_op==='Autre'&&(
          <Field label="Préciser l'opération ★">
            <input type="text" value={form.autre_precis} onChange={e=>{setForm(f=>({...f,autre_precis:e.target.value}));snd.keyClick()}} placeholder="Décrivez l'opération en détail..."/>
          </Field>
        )}
        <Field label={form.type_op==='Autre'?'Description complémentaire (optionnel)':'Description complémentaire (optionnel)'}>
          <input type="text" value={form.description} onChange={e=>{setForm(f=>({...f,description:e.target.value}));snd.keyClick()}} placeholder="ex: Facture Valentine, marchand Armadillo..."/>
        </Field>
        <Field label="Nom / Prénom concerné (optionnel)">
          <input type="text" value={form.nom_prenom} onChange={e=>{setForm(f=>({...f,nom_prenom:e.target.value}));snd.keyClick()}} placeholder="DUPONT Jean"/>
        </Field>
        <Field label={`Montant en dollars ($) — ${type==='ajout'?'Entrée ↑':'Sortie ↓'}`}>
          <input type="number" step="0.01" min="0" value={form.montant} onChange={e=>{setForm(f=>({...f,montant:e.target.value}));snd.keyClick()}} placeholder="0.00" style={{fontSize:'28px',fontWeight:700,letterSpacing:'2px'}}/>
        </Field>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={save}>✓ Enregistrer l'opération</button>
          <button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button>
        </div>
      </SlidePage>
    )
  }

  return(
    <div className="page-in">
      <PageHeader title="Gestion des Comptes" sub="État financier du Bureau">
        <div className="btn-row" style={{margin:0,gap:'5px'}}>
          <button className="btn btn-success btn-sm" onClick={()=>openPage('ajout')}>+ Entrée</button>
          <button className="btn btn-danger btn-sm" onClick={()=>openPage('retrait')}>− Sortie</button>
        </div>
      </PageHeader>
      <div style={{fontFamily:"'Special Elite',cursive",fontSize:'clamp(20px,5vw,34px)',color:'var(--ink)',letterSpacing:'4px',padding:'12px 16px',border:'2px solid var(--ink)',display:'inline-block',position:'relative',marginBottom:'16px'}}>
        <span style={{position:'absolute',top:'-10px',left:'10px',background:'var(--paper)',padding:'0 6px',fontSize:'9px',letterSpacing:'3px',color:'var(--ink-3)'}}>SOLDE ACTUEL</span>
        {solde.toFixed(2)} $
      </div>
      {loading?<Loader/>:(
        <table className="register-table">
          <thead><tr><th>Date</th><th>Objet</th><th>Nom</th><th>Par</th><th>Type</th><th>Montant</th><th>Op.</th></tr></thead>
          <tbody>
            {ops.map(op=>(
              <tr key={op.id}>
                <td style={{fontSize:'9px'}}>{new Date(op.date_op).toLocaleDateString('fr-FR')}</td>
                <td style={{fontSize:'11px'}}>{op.objet}</td>
                <td style={{fontSize:'10px'}}>{op.nom_prenom||'—'}</td>
                <td style={{fontSize:'10px'}}>{op.ranger?`${op.ranger.prenom_rp}`:'—'}</td>
                <td style={{fontSize:'10px'}}>{op.type_permis||'—'}</td>
                <td style={{fontWeight:700}}>{Number(op.montant).toFixed(2)} $</td>
                <td><span className={`status-badge ${op.operation==='ajout'?'status-ok':'status-vol'}`} style={{border:'1px solid',padding:'1px 5px',fontSize:'9px',fontFamily:"'Special Elite',cursive"}}>{op.operation==='ajout'?'Ajout':'Retrait'}</span></td>
              </tr>
            ))}
            {ops.length===0&&<tr><td colSpan="7" style={{textAlign:'center',fontStyle:'italic',color:'var(--ink-3)',padding:'16px'}}>Aucune opération.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ════════ RAPPORTS ════════ */
function TabRapports({ranger,snd}){
  const [rapports,setRapports]=useState([])
  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState('list')
  const [viewRapport,setViewRapport]=useState(null)
  const [form,setForm]=useState({type_rapport:'Déposition',destinataires:'',comtes:'',date_faits:'',contenu:'',elements_supp:''})
  const [msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){const{data}=await supabase.from('rapports').select('*, ranger:redacteur_id(prenom_rp,nom_rp)').order('created_at',{ascending:false});setRapports(data||[]);setLoading(false)}
  async function submit(){
    snd.carriageReturn()
    if(!form.contenu){setMsg('⚠ Contenu obligatoire');return}
    const tel=String(Math.floor(5000+Math.random()*4999))
    const{error}=await supabase.from('rapports').insert({numero_telegram:tel,type_rapport:form.type_rapport,destinataires:form.destinataires.split('·').map(s=>s.trim()).filter(Boolean),comtes:form.comtes.split('·').map(s=>s.trim()).filter(Boolean),date_faits:form.date_faits||null,contenu:form.contenu,elements_supp:form.elements_supp,redacteur_id:ranger?.id,statut:'soumis',origine:'U.S. Rangers'})
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();setMsg(`✓ Télégramme n° ${tel}`);await load();setTimeout(()=>{setPage('list');setMsg('')},900)
  }

  if(page==='new'){
    return(
      <SlidePage title="Nouveau Rapport Officiel" onClose={()=>setPage('list')} wide>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <div className="two-col">
          <Field label="Type de rapport">
            <select value={form.type_rapport} onChange={e=>{setForm(f=>({...f,type_rapport:e.target.value}));snd.keyClick()}}>
              {['Déposition','Rapport d\'intervention','Rapport de patrouille','Rapport d\'incident','Note interne'].map(t=><option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Date des faits"><input type="text" placeholder="14/04/1900 — 20h00" value={form.date_faits} onChange={e=>{setForm(f=>({...f,date_faits:e.target.value}));snd.keyClick()}}/></Field>
        </div>
        <div className="two-col">
          <Field label="Destinataires (séparés par ·)"><input type="text" placeholder="U.S. Rangers · U.S. Marshals" value={form.destinataires} onChange={e=>{setForm(f=>({...f,destinataires:e.target.value}));snd.keyClick()}}/></Field>
          <Field label="Comtés (séparés par ·)"><input type="text" placeholder="New Austin · Cholla Springs" value={form.comtes} onChange={e=>{setForm(f=>({...f,comtes:e.target.value}));snd.keyClick()}}/></Field>
        </div>
        <Field label="Contenu de la déposition ★">
          <textarea value={form.contenu} onChange={e=>{setForm(f=>({...f,contenu:e.target.value}));snd.keyClick()}} placeholder="Je soussigné(e)..." style={{minHeight:'160px'}}/>
        </Field>
        <Field label="Éléments supplémentaires / Pièces à conviction">
          <textarea style={{minHeight:'70px'}} value={form.elements_supp} onChange={e=>{setForm(f=>({...f,elements_supp:e.target.value}));snd.keyClick()}} placeholder="Photos, références..."/>
        </Field>
        <div className="btn-row"><button className="btn btn-primary" onClick={submit}>▶ Soumettre le rapport</button><button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button></div>
      </SlidePage>
    )
  }

  if(page==='view'&&viewRapport){
    return(
      <SlidePage title={`Rapport — Télégramme n° ${viewRapport.numero_telegram}`} onClose={()=>setPage('list')} wide>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'14px',padding:'10px',background:'rgba(180,150,80,.06)',border:'1px solid rgba(160,130,70,.3)'}}>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'2px'}}>Type</div><div style={{fontFamily:"'Special Elite',cursive",fontSize:'12px'}}>{viewRapport.type_rapport}</div></div>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'2px'}}>Date des faits</div><div style={{fontSize:'12px'}}>{viewRapport.date_faits||'—'}</div></div>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'2px'}}>Rédacteur</div><div style={{fontFamily:"'Special Elite',cursive",fontSize:'12px'}}>{viewRapport.ranger?`${viewRapport.ranger.prenom_rp} ${viewRapport.ranger.nom_rp}`:'—'}</div></div>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'2px'}}>Statut</div><div style={{fontSize:'12px'}}>{viewRapport.statut}</div></div>
        </div>
        <div style={{borderTop:'2px solid var(--ink)',paddingTop:'14px',whiteSpace:'pre-wrap',fontStyle:'italic',fontSize:'13px',lineHeight:'28px',color:'var(--ink-2)'}}>{viewRapport.contenu}</div>
        {viewRapport.elements_supp&&<div style={{marginTop:'14px',borderTop:'1px solid rgba(106,74,26,.3)',paddingTop:'10px',fontSize:'11px',color:'var(--ink-3)'}}><strong style={{fontFamily:"'Special Elite',cursive",letterSpacing:'2px',fontSize:'9px',textTransform:'uppercase'}}>Éléments supplémentaires</strong><br/>{viewRapport.elements_supp}</div>}
      </SlidePage>
    )
  }

  return(
    <div className="page-in">
      <PageHeader title="Rapports" sub="Registre officiel — U.S. Rangers">
        <button className="btn btn-primary btn-sm" onClick={()=>{snd.keyClick();setForm({type_rapport:'Déposition',destinataires:'',comtes:'',date_faits:'',contenu:'',elements_supp:''});setMsg('');setPage('new')}}>+ Rédiger</button>
      </PageHeader>
      {loading?<Loader/>:(
        <table className="register-table">
          <thead><tr><th>N° Télég.</th><th>Date</th><th>Type</th><th>Rédacteur</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {rapports.map(r=>(
              <tr key={r.id}>
                <td style={{letterSpacing:'2px',fontWeight:700}}>{r.numero_telegram}</td>
                <td style={{fontSize:'10px'}}>{r.date_faits?new Date(r.date_faits).toLocaleDateString('fr-FR'):'—'}</td>
                <td>{r.type_rapport}</td>
                <td style={{fontSize:'10px'}}>{r.ranger?`${r.ranger.prenom_rp} ${r.ranger.nom_rp}`:'—'}</td>
                <td><span className={`status-badge ${r.statut==='archive'?'status-ok':'status-att'}`}>{r.statut}</span></td>
                <td><button className="btn btn-sm" onClick={()=>{snd.keyClick();setViewRapport(r);setPage('view')}}>▶ Lire</button></td>
              </tr>
            ))}
            {rapports.length===0&&<tr><td colSpan="6" style={{textAlign:'center',fontStyle:'italic',color:'var(--ink-3)',padding:'16px'}}>Aucun rapport.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ════════ ENQUÊTES ════════ */
function TabEnquetes({ranger,snd}){
  const [enquetes,setEnquetes]=useState([])
  const [loading,setLoading]=useState(true)
  const [selected,setSelected]=useState(null)
  const [page,setPage]=useState('list') // 'list'|'dossier'|'new-enquete'|'new-elem'
  const [rangers,setRangers]=useState([])
  const [elements,setElements]=useState([])
  const [form,setForm]=useState({titre:'',description:'',type_enquete:'Générale',priorite:'normale',lieu_principal:'',comtes:'',date_debut:new Date().toISOString().split('T')[0]})
  const [elemForm,setElemForm]=useState({type_elem:'note',titre:'',contenu:'',lieu:'',date_evenement:'',importance:'normale',photo_url:''})
  const [msg,setMsg]=useState('')
  const [filterStatut,setFilterStatut]=useState('all')

  useEffect(()=>{load()},[])
  async function load(){
    const [{data:e},{data:r}]=await Promise.all([
      supabase.from('enquetes').select('*').order('created_at',{ascending:false}),
      supabase.from('rangers').select('id,prenom_rp,nom_rp').eq('statut','actif'),
    ])
    setEnquetes(e||[]);setRangers(r||[]);setLoading(false)
  }
  async function loadElements(enqId){
    const{data}=await supabase.from('enquete_elements').select('*, ranger:ajoute_par(prenom_rp,nom_rp)').eq('enquete_id',enqId).order('created_at',{ascending:false})
    setElements(data||[])
  }
  function openDossier(e){snd.keyClick();setSelected(e);loadElements(e.id);setPage('dossier')}

  async function createEnquete(){
    snd.carriageReturn()
    if(!form.titre){setMsg('⚠ Titre requis');return}
    const{data,error}=await supabase.from('enquetes').insert({titre:form.titre,description:form.description,type_enquete:form.type_enquete,priorite:form.priorite,lieu_principal:form.lieu_principal||null,comtes:form.comtes?form.comtes.split('·').map(s=>s.trim()).filter(Boolean):[],date_debut:form.date_debut,statut:'en_cours',cree_par:ranger?.id,rangers_assignes:[ranger?.id].filter(Boolean)}).select().single()
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await load();setSelected(data);loadElements(data.id);setPage('dossier')
  }

  async function updateStatut(enq,statut){
    snd.keyClick()
    await supabase.from('enquetes').update({statut,updated_at:new Date().toISOString()}).eq('id',enq.id)
    await load();if(selected?.id===enq.id) setSelected(s=>({...s,statut}))
  }

  async function addElement(){
    snd.carriageReturn()
    if(!elemForm.titre){setMsg('⚠ Titre requis');return}
    const{error}=await supabase.from('enquete_elements').insert({enquete_id:selected.id,type_elem:elemForm.type_elem,titre:elemForm.titre,contenu:elemForm.contenu||null,lieu:elemForm.lieu||null,date_evenement:elemForm.date_evenement||null,importance:elemForm.importance,photo_url:elemForm.photo_url||null,ajoute_par:ranger?.id})
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await loadElements(selected.id);setPage('dossier')
    setElemForm({type_elem:'note',titre:'',contenu:'',lieu:'',date_evenement:'',importance:'normale',photo_url:''})
  }

  async function deleteElement(id){if(!confirm('Supprimer ?'))return;snd.carriageReturn();await supabase.from('enquete_elements').delete().eq('id',id);await loadElements(selected.id)}
  async function deleteEnquete(id){if(!confirm('Supprimer ce dossier ?'))return;snd.carriageReturn();await supabase.from('enquetes').delete().eq('id',id);await load();setPage('list');setSelected(null)}

  const filtered=enquetes.filter(e=>filterStatut==='all'||e.statut===filterStatut)
  const TYPES_ENQ=['Générale','Meurtre','Vol / Braquage','Enlèvement','Contrebande','Fugitif','Corruption','Espionnage','Autre']
  const IMPORTANCES=['basse','normale','haute','critique']
  const TYPES_ELEM=[
    {id:'note',label:'Note',icon:'📝'},{id:'preuve',label:'Preuve',icon:'🔬'},
    {id:'temoin',label:'Témoignage',icon:'👁'},{id:'photo',label:'Photo/Desc.',icon:'📷'},
    {id:'lieu',label:'Lieu',icon:'📍'},{id:'suspect',label:'Suspect',icon:'🎯'},
    {id:'rapport_lié',label:'Rapport lié',icon:'📄'},
  ]

  // ── Nouvel élément ──
  if(page==='new-elem'){
    return(
      <SlidePage title="Ajouter un élément au dossier" onClose={()=>setPage('dossier')} wide>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <Field label="Type d'élément">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'5px',marginTop:'4px'}}>
            {TYPES_ELEM.map(t=>(
              <div key={t.id} onClick={()=>{setElemForm(f=>({...f,type_elem:t.id}));snd.keyClick()}} style={{border:`1.5px solid ${elemForm.type_elem===t.id?'var(--ink)':'rgba(160,130,70,.35)'}`,padding:'7px 8px',cursor:'pointer',textAlign:'center',background:elemForm.type_elem===t.id?'rgba(26,16,8,.07)':'transparent',transition:'all .15s',fontFamily:"'Special Elite',cursive",fontSize:'9px',letterSpacing:'1px'}}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>
        </Field>
        <div className="two-col">
          <Field label="Titre / Nom ★"><input type="text" value={elemForm.titre} onChange={e=>{setElemForm(f=>({...f,titre:e.target.value}));snd.keyClick()}} placeholder={elemForm.type_elem==='suspect'?'Nom du suspect...':'Titre de l\'élément...'}/></Field>
          <Field label="Importance"><select value={elemForm.importance} onChange={e=>{setElemForm(f=>({...f,importance:e.target.value}));snd.keyClick()}}>{IMPORTANCES.map(i=><option key={i} value={i}>{i.charAt(0).toUpperCase()+i.slice(1)}</option>)}</select></Field>
        </div>
        <div className="two-col">
          <Field label="Lieu (si applicable)"><input type="text" value={elemForm.lieu} onChange={e=>{setElemForm(f=>({...f,lieu:e.target.value}));snd.keyClick()}} placeholder="ex: Fort Mercer..."/></Field>
          <Field label="Date de l'événement"><input type="date" value={elemForm.date_evenement} onChange={e=>{setElemForm(f=>({...f,date_evenement:e.target.value}));snd.keyClick()}}/></Field>
        </div>
        <Field label="Description / Contenu">
          <textarea value={elemForm.contenu} onChange={e=>{setElemForm(f=>({...f,contenu:e.target.value}));snd.keyClick()}} placeholder="Description détaillée, témoignage, notes..." style={{minHeight:'100px'}}/>
        </Field>
        <Field label="URL Photo / Image (optionnel)">
          <input type="text" value={elemForm.photo_url} onChange={e=>{setElemForm(f=>({...f,photo_url:e.target.value}));snd.keyClick()}} placeholder="https://..."/>
        </Field>
        {elemForm.photo_url&&<div style={{marginBottom:'10px'}}><img src={elemForm.photo_url} alt="" style={{maxWidth:'140px',maxHeight:'100px',objectFit:'cover',filter:'sepia(.3)',border:'1px solid var(--ink-3)'}} onError={ev=>ev.target.style.display='none'}/></div>}
        <div className="btn-row">
          <button className="btn btn-primary" onClick={addElement}>✓ Ajouter au dossier</button>
          <button className="btn" onClick={()=>setPage('dossier')}>✕ Annuler</button>
        </div>
      </SlidePage>
    )
  }

  // ── Nouvelle enquête ──
  if(page==='new-enquete'){
    return(
      <SlidePage title="Ouvrir un dossier d'enquête" onClose={()=>setPage('list')} wide>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <Field label="Titre du dossier ★"><input type="text" value={form.titre} onChange={e=>{setForm(f=>({...f,titre:e.target.value}));snd.keyClick()}} placeholder="ex: Meurtre à Fort Mercer, Gang Lamasdrones..."/></Field>
        <div className="two-col">
          <Field label="Type d'enquête"><select value={form.type_enquete} onChange={e=>{setForm(f=>({...f,type_enquete:e.target.value}));snd.keyClick()}}>{TYPES_ENQ.map(t=><option key={t}>{t}</option>)}</select></Field>
          <Field label="Priorité"><select value={form.priorite} onChange={e=>{setForm(f=>({...f,priorite:e.target.value}));snd.keyClick()}}><option value="basse">Basse</option><option value="normale">Normale</option><option value="haute">Haute</option><option value="urgente">Urgente</option></select></Field>
        </div>
        <div className="two-col">
          <Field label="Lieu principal"><input type="text" value={form.lieu_principal} onChange={e=>{setForm(f=>({...f,lieu_principal:e.target.value}));snd.keyClick()}} placeholder="ex: Fort Mercer..."/></Field>
          <Field label="Comtés (séparés par ·)"><input type="text" value={form.comtes} onChange={e=>{setForm(f=>({...f,comtes:e.target.value}));snd.keyClick()}} placeholder="New Austin · Cholla Springs"/></Field>
        </div>
        <Field label="Date d'ouverture"><input type="date" value={form.date_debut} onChange={e=>{setForm(f=>({...f,date_debut:e.target.value}));snd.keyClick()}}/></Field>
        <Field label="Description / Résumé initial"><textarea value={form.description} onChange={e=>{setForm(f=>({...f,description:e.target.value}));snd.keyClick()}} placeholder="Décrivez les faits initiaux..." style={{minHeight:'90px'}}/></Field>
        <div className="btn-row"><button className="btn btn-primary" onClick={createEnquete}>▶ Ouvrir le dossier</button><button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button></div>
      </SlidePage>
    )
  }

  // ── Dossier ouvert ──
  if(page==='dossier'&&selected){
    const suspects=elements.filter(e=>e.type_elem==='suspect')
    const autres=elements.filter(e=>e.type_elem!=='suspect')
    return(
      <div className="page-in">
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px',paddingBottom:'10px',borderBottom:'2px solid var(--ink)',flexWrap:'wrap'}}>
          <button className="btn btn-sm" onClick={()=>{snd.keyClick();setPage('list')}}>← Retour</button>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Special Elite',cursive",fontSize:'clamp(14px,3vw,20px)',letterSpacing:'3px',textTransform:'uppercase'}}>{selected.titre}</div>
            <div style={{fontSize:'9px',letterSpacing:'2px',color:'var(--ink-3)',marginTop:'1px'}}>#{selected.id.slice(0,8).toUpperCase()} · {selected.type_enquete}</div>
          </div>
          <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
            <select value={selected.statut} onChange={e=>updateStatut(selected,e.target.value)} style={{fontFamily:"'Special Elite',cursive",fontSize:'9px',letterSpacing:'2px',padding:'4px 8px',border:'1.5px solid var(--ink-2)',background:'var(--paper)',color:'var(--ink)',cursor:'pointer',textTransform:'uppercase'}}>
              <option value="en_cours">🔍 En cours</option>
              <option value="en_traque">🎯 En traque</option>
              <option value="resolue">✓ Résolue</option>
              <option value="classee">📁 Classée</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={()=>{snd.keyClick();setMsg('');setPage('new-elem')}}>+ Ajouter</button>
            <button className="btn btn-danger btn-sm" onClick={()=>deleteEnquete(selected.id)}>Supprimer</button>
          </div>
        </div>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}

        {/* Infos */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'8px',marginBottom:'16px',padding:'10px',border:'1px solid rgba(160,130,70,.3)',background:'rgba(180,150,80,.04)'}}>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'1px'}}>Statut</div><div style={{fontFamily:"'Special Elite',cursive",fontSize:'11px'}}>{STATUT_ENQUETE[selected.statut]}</div></div>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'1px'}}>Priorité</div><div style={{fontFamily:"'Special Elite',cursive",fontSize:'11px',color:PRIORITE_COLORS[selected.priorite],textTransform:'uppercase'}}>{selected.priorite}</div></div>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'1px'}}>Lieu</div><div style={{fontSize:'11px'}}>{selected.lieu_principal||'—'}</div></div>
          <div><div style={{fontSize:'8px',letterSpacing:'2px',color:'var(--ink-3)',textTransform:'uppercase',marginBottom:'1px'}}>Ouvert le</div><div style={{fontSize:'11px'}}>{selected.date_debut?new Date(selected.date_debut).toLocaleDateString('fr-FR'):'—'}</div></div>
        </div>

        {selected.description&&<div style={{marginBottom:'14px',padding:'9px 13px',borderLeft:'3px solid var(--ink-3)',background:'rgba(180,150,80,.05)',fontSize:'12px',lineHeight:'24px',color:'var(--ink-2)',fontStyle:'italic'}}>{selected.description}</div>}

        {/* Suspects */}
        {suspects.length>0&&(
          <div style={{marginBottom:'16px'}}>
            <div className="section-title">🎯 Suspects / Cibles ({suspects.length})</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:'8px'}}>
              {suspects.map(e=>(
                <div key={e.id} style={{border:`1px solid ${e.importance==='critique'?'var(--red)':'rgba(160,130,70,.35)'}`,padding:'10px 12px',background:e.importance==='critique'?'rgba(139,26,26,.05)':'rgba(180,150,80,.04)'}}>
                  <div style={{fontFamily:"'Special Elite',cursive",fontSize:'13px',letterSpacing:'2px',color:'var(--ink)'}}>{e.titre}</div>
                  {e.lieu&&<div style={{fontSize:'9px',color:'var(--ink-3)',marginTop:'2px'}}>📍 {e.lieu}</div>}
                  {e.date_evenement&&<div style={{fontSize:'9px',color:'var(--ink-3)'}}>📅 {new Date(e.date_evenement).toLocaleDateString('fr-FR')}</div>}
                  {e.contenu&&<div style={{fontSize:'11px',color:'var(--ink-2)',marginTop:'4px',fontStyle:'italic'}}>{e.contenu}</div>}
                  {e.photo_url&&<img src={e.photo_url} alt="" style={{width:'100%',marginTop:'5px',filter:'sepia(.3)',border:'1px solid var(--ink-3)',maxHeight:'120px',objectFit:'cover'}} onError={ev=>ev.target.style.display='none'}/>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'5px'}}>
                    <span className={`status-badge ${e.importance==='critique'?'status-vol':e.importance==='haute'?'status-att':'status-info'}`}>{e.importance}</span>
                    <button className="btn btn-danger btn-sm" onClick={()=>deleteElement(e.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Éléments */}
        <div className="section-title">📂 Éléments du dossier ({autres.length})</div>
        {autres.length===0&&<div style={{color:'var(--ink-3)',fontStyle:'italic',fontSize:'12px',marginBottom:'14px',padding:'14px',border:'1px dashed rgba(160,130,70,.3)',textAlign:'center'}}>Aucun élément — Cliquez sur « + Ajouter »</div>}
        {autres.map(e=>(
          <div key={e.id} className={`elem-card ${e.importance==='critique'?'critique':''}`} data-icon={ELEM_ICONS[e.type_elem]||'📝'}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap',marginBottom:'2px'}}>
                  <strong style={{fontFamily:"'Special Elite',cursive",fontSize:'12px',letterSpacing:'1px'}}>{e.titre}</strong>
                  <span className={`status-badge ${e.importance==='critique'?'status-vol':e.importance==='haute'?'status-att':e.importance==='basse'?'status-info':'status-ok'}`}>{e.importance}</span>
                  {e.date_evenement&&<span style={{fontSize:'9px',color:'var(--ink-3)'}}>📅 {new Date(e.date_evenement).toLocaleDateString('fr-FR')}</span>}
                  {e.lieu&&<span style={{fontSize:'9px',color:'var(--ink-3)'}}>📍 {e.lieu}</span>}
                </div>
                {e.contenu&&<div style={{fontSize:'12px',color:'var(--ink-2)',marginTop:'3px',fontStyle:'italic',lineHeight:'22px'}}>{e.contenu}</div>}
                {e.photo_url&&<div style={{marginTop:'6px'}}><img src={e.photo_url} alt="" style={{maxWidth:'180px',maxHeight:'130px',objectFit:'cover',filter:'sepia(.3)',border:'1px solid var(--ink-3)'}} onError={ev=>ev.target.style.display='none'}/></div>}
                <div style={{fontSize:'9px',color:'var(--ink-3)',marginTop:'3px'}}>Par {e.ranger?`${e.ranger.prenom_rp} ${e.ranger.nom_rp}`:'—'} · {new Date(e.created_at).toLocaleDateString('fr-FR')}</div>
              </div>
              <button className="btn btn-danger btn-sm" style={{flexShrink:0}} onClick={()=>deleteElement(e.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── Liste enquêtes ──
  return(
    <div className="page-in">
      <PageHeader title="Enquêtes" sub="Bureau des investigations — U.S. Rangers">
        <button className="btn btn-primary btn-sm" onClick={()=>{snd.keyClick();setForm({titre:'',description:'',type_enquete:'Générale',priorite:'normale',lieu_principal:'',comtes:'',date_debut:new Date().toISOString().split('T')[0]});setMsg('');setPage('new-enquete')}}>+ Ouvrir un dossier</button>
      </PageHeader>
      <div style={{display:'flex',gap:'5px',flexWrap:'wrap',marginBottom:'14px'}}>
        {['all','en_cours','en_traque','resolue','classee'].map(s=>(
          <button key={s} className={`btn btn-sm ${filterStatut===s?'btn-primary':''}`} onClick={()=>{snd.keyClick();setFilterStatut(s)}}>{s==='all'?'Toutes':STATUT_ENQUETE[s]}</button>
        ))}
      </div>
      <div className="info-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:'14px'}}>
        <StatCard label="En cours" value={enquetes.filter(e=>e.statut==='en_cours').length} sub="dossiers" accent="blue"/>
        <StatCard label="En traque" value={enquetes.filter(e=>e.statut==='en_traque').length} sub="cibles" accent="orange"/>
        <StatCard label="Résolues" value={enquetes.filter(e=>e.statut==='resolue').length} sub="dossiers" accent="green"/>
        <StatCard label="Classées" value={enquetes.filter(e=>e.statut==='classee').length} sub="dossiers"/>
      </div>
      {loading?<Loader/>:(
        filtered.length===0
          ?<div style={{textAlign:'center',padding:'28px',fontStyle:'italic',color:'var(--ink-3)',border:'1px dashed rgba(160,130,70,.3)'}}>Aucun dossier — Cliquez sur « + Ouvrir un dossier »</div>
          :filtered.map(e=>(
            <div key={e.id} className={`enquete-card ${e.priorite}`} onClick={()=>openDossier(e)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px',flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap',marginBottom:'3px'}}>
                    <span style={{fontFamily:"'Special Elite',cursive",fontSize:'13px',letterSpacing:'2px',color:'var(--ink)'}}>{e.titre}</span>
                    <span style={{fontFamily:"'Special Elite',cursive",fontSize:'9px',letterSpacing:'2px',color:PRIORITE_COLORS[e.priorite]||'var(--ink-3)',border:`1px solid ${PRIORITE_COLORS[e.priorite]||'var(--ink-3)'}`,padding:'1px 5px',textTransform:'uppercase'}}>{e.priorite}</span>
                  </div>
                  <div style={{fontSize:'9px',color:'var(--ink-3)',display:'flex',gap:'10px',flexWrap:'wrap'}}>
                    <span>{e.type_enquete}</span>
                    {e.lieu_principal&&<span>📍 {e.lieu_principal}</span>}
                    <span>Ouvert le {e.date_debut?new Date(e.date_debut).toLocaleDateString('fr-FR'):'—'}</span>
                  </div>
                  {e.description&&<div style={{fontSize:'11px',color:'var(--ink-2)',marginTop:'4px',fontStyle:'italic'}}>{e.description.slice(0,110)}{e.description.length>110?'...':''}</div>}
                </div>
                <span className={`status-badge ${e.statut==='resolue'?'status-ok':e.statut==='classee'?'status-info':e.statut==='en_traque'?'status-att':'status-vol'}`}>{STATUT_ENQUETE[e.statut]}</span>
              </div>
            </div>
          ))
      )}
    </div>
  )
}

/* ════════ ADMIN ════════ */
function TabAdmin({isAdmin,currentRanger,snd}){
  const [pending,setPending]=useState([])
  const [actifs,setActifs]=useState([])
  const [codes,setCodes]=useState([])
  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState('list')
  const [editRanger,setEditRanger]=useState(null)
  const [form,setForm]=useState({grade:'',pole:'',is_admin:false})
  const [msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){
    const [{data:p},{data:a},{data:c}]=await Promise.all([
      supabase.from('rangers').select('*').eq('statut','en_attente'),
      supabase.from('rangers').select('*').eq('statut','actif').order('grade'),
      supabase.from('codes_invitation').select('*, cree:cree_par(prenom_rp,nom_rp)').order('created_at',{ascending:false}),
    ])
    setPending(p||[]);setActifs(a||[]);setCodes(c||[]);setLoading(false)
  }
  async function approuver(id){snd.stamp();await supabase.from('rangers').update({statut:'actif'}).eq('id',id);await load();setMsg('✓ Ranger validé')}
  async function refuser(id){snd.carriageReturn();await supabase.from('rangers').update({statut:'suspendu'}).eq('id',id);await load();setMsg('✓ Demande refusée')}

  function openEdit(r){
    if(!isAdmin)return
    snd.keyClick()
    setEditRanger(r)
    setForm({grade:r.grade,pole:r.pole||'',is_admin:r.is_admin||false})
    setMsg('')
    setPage('edit')
  }

  async function saveEdit(){
    snd.carriageReturn()
    if(editRanger.id===currentRanger?.id&&!form.is_admin){setMsg('⚠ Impossible de retirer vos propres droits admin');return}
    const{error}=await supabase.from('rangers').update({grade:form.grade,pole:form.pole||null,is_admin:form.is_admin}).eq('id',editRanger.id)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();setMsg('✓ Modifié');await load();setPage('list');setTimeout(()=>setMsg(''),2000)
  }

  async function genererCode(){
    snd.ding()
    const code='USR-'+Math.floor(1000+Math.random()*8999)
    await supabase.from('codes_invitation').insert({code,utilise:false,cree_par:currentRanger?.id})
    await load()
  }

  if(page==='edit'&&editRanger){
    return(
      <SlidePage title={`Modifier — ${editRanger.prenom_rp} ${editRanger.nom_rp}`} onClose={()=>setPage('list')}>
        {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
        <div style={{padding:'10px 14px',border:'1px solid rgba(160,130,70,.35)',background:'rgba(180,150,80,.05)',marginBottom:'16px',fontFamily:"'Special Elite',cursive",fontSize:'12px',letterSpacing:'2px'}}>
          BP : {editRanger.bp}
        </div>
        <Field label="Grade">
          <select value={form.grade} onChange={e=>{setForm(f=>({...f,grade:e.target.value}));snd.keyClick()}}>
            {['commandant','lieutenant','sergent','confirme','deputy'].map(g=><option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Pôle">
          <select value={form.pole} onChange={e=>{setForm(f=>({...f,pole:e.target.value}));snd.keyClick()}}>
            <option value="">— Aucun —</option>
            <option value="logistique">Logistique</option>
            <option value="operationnel">Opérationnel</option>
            <option value="admin">Admin & Formation</option>
          </select>
        </Field>
        <div className="field-group">
          <label>Droits Administrateur</label>
          <label style={{display:'flex',alignItems:'center',gap:'9px',cursor:'pointer',marginTop:'8px',fontFamily:"'Special Elite',cursive",fontSize:'11px',letterSpacing:'2px'}}>
            <input type="checkbox" checked={form.is_admin} onChange={e=>{setForm(f=>({...f,is_admin:e.target.checked}));snd.keyClick()}} style={{accentColor:'var(--ink)',width:'16px',height:'16px'}}/>
            {form.is_admin?'★ Est Administrateur':'Pas Administrateur'}
          </label>
          {editRanger.id===currentRanger?.id&&<div style={{fontSize:'10px',color:'var(--red)',marginTop:'4px',fontStyle:'italic'}}>⚠ Vous ne pouvez pas retirer vos propres droits</div>}
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={saveEdit}>✓ Enregistrer</button>
          <button className="btn" onClick={()=>setPage('list')}>✕ Annuler</button>
        </div>
      </SlidePage>
    )
  }

  if(loading)return <Loader/>
  return(
    <div className="page-in">
      <PageHeader title="Administration" sub="Gestion des accès — U.S. Rangers"/>
      {msg&&<div className="msg-success">{msg}</div>}

      <div className="section-title">⏳ Demandes en attente ({pending.length})</div>
      {pending.length===0&&<div style={{color:'var(--ink-3)',fontStyle:'italic',fontSize:'12px',marginBottom:'12px'}}>Aucune demande.</div>}
      {pending.map(r=>(
        <div key={r.id} style={{border:'1px solid rgba(160,130,70,.35)',padding:'11px 13px',marginBottom:'7px',display:'flex',alignItems:'center',gap:'10px',background:'rgba(180,150,80,.04)',flexWrap:'wrap'}}>
          <div style={{width:'38px',height:'38px',border:'1.5px solid var(--ink-3)',background:'var(--paper-aged)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'17px',flexShrink:0,overflow:'hidden'}}>
            {r.photo_url?<img src={r.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'👤'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Special Elite',cursive",fontSize:'12px',letterSpacing:'2px'}}>{r.prenom_rp} {r.nom_rp}</div>
            <div style={{fontSize:'9px',color:'var(--ink-3)',marginTop:'1px'}}>BP : <strong>{r.bp}</strong> · <span className={`grade-badge grade-${r.grade}`}>{r.grade}</span> · {r.code_invite} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
          </div>
          <div style={{display:'flex',gap:'5px'}}>
            <button className="btn btn-success btn-sm" onClick={()=>approuver(r.id)}>✓ Valider</button>
            <button className="btn btn-danger btn-sm" onClick={()=>refuser(r.id)}>✕ Refuser</button>
          </div>
        </div>
      ))}

      <div className="section-title">✓ Rangers actifs ({actifs.length})</div>
      <table className="register-table">
        <thead><tr><th>Nom</th><th>BP</th><th>Grade</th><th>Pôle</th><th>Admin</th>{isAdmin&&<th>Actions</th>}</tr></thead>
        <tbody>
          {actifs.map(r=>(
            <tr key={r.id}>
              <td>{r.prenom_rp} {r.nom_rp}</td>
              <td style={{letterSpacing:'2px',fontWeight:700,fontSize:'10px'}}>{r.bp}</td>
              <td><span className={`grade-badge grade-${r.grade}`}>{r.grade}</span></td>
              <td style={{fontSize:'10px'}}>{r.pole||'—'}</td>
              <td>{r.is_admin?<span style={{color:'var(--red)',fontFamily:"'Special Elite',cursive",fontSize:'10px'}}>★ Admin</span>:<span style={{color:'var(--ink-3)',fontSize:'10px'}}>—</span>}</td>
              {isAdmin&&<td><button className="btn btn-sm" onClick={()=>openEdit(r)}>✎ Modifier</button></td>}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title">🔑 Codes d'invitation</div>
      <div className="btn-row"><button className="btn btn-primary btn-sm" onClick={genererCode}>+ Générer un code</button></div>
      <table className="register-table">
        <thead><tr><th>Code</th><th>Créé par</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>
          {codes.map(c=>(
            <tr key={c.id}>
              <td style={{letterSpacing:'3px',fontWeight:700}}>{c.code}</td>
              <td style={{fontSize:'10px'}}>{c.cree?`${c.cree.prenom_rp} ${c.cree.nom_rp}`:'Admin'}</td>
              <td style={{fontSize:'10px'}}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
              <td><span className={`status-badge ${c.utilise?'status-att':'status-ok'}`}>{c.utilise?'Utilisé':'Disponible'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
