import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { useTypewriterSound } from '../hooks/useTypewriterSound'

const TABS = [
  { id:'accueil',      label:'Accueil',      icon:'🏠' },
  { id:'organigramme', label:'Organigramme', icon:'🌿' },
  { id:'logistique',   label:'Logistique',   icon:'📦' },
  { id:'armes',        label:'Stock Armes',  icon:'🔫' },
  { id:'comptes',      label:'Comptes',      icon:'💰' },
  { id:'rapports',     label:'Rapports',     icon:'📄' },
  { id:'admin',        label:'Admin',        icon:'⚙'  },
]

/* ── Modale ── */
function Modal({ title, onClose, children, wide }) {
  const ref = useRef()
  useEffect(()=>{ ref.current?.scrollIntoView({ behavior:'smooth', block:'start' }) },[])
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={ref} className="modal-box" style={{ maxWidth: wide?'720px':'580px' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px', paddingBottom:'10px', borderBottom:'2px solid var(--ink)' }}>
          <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'15px', letterSpacing:'3px', textTransform:'uppercase' }}>{title}</div>
          <button onClick={onClose} className="btn btn-sm">✕ Fermer</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div className="field-group"><label>{label}</label>{children}</div>
}

function PageHeader({ title, sub, right, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', paddingBottom:'14px', borderBottom:'2px solid var(--ink)', gap:'12px', flexWrap:'wrap' }}>
      <div>
        <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'clamp(17px,4vw,24px)', letterSpacing:'4px', textTransform:'uppercase' }}>{title}</div>
        {sub && <div style={{ fontSize:'10px', letterSpacing:'3px', color:'var(--ink-3)', textTransform:'uppercase', marginTop:'4px' }}>{sub}</div>}
      </div>
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
        {right && <div style={{ textAlign:'right', fontSize:'10px', letterSpacing:'2px', color:'var(--ink-3)', lineHeight:'1.8', whiteSpace:'pre' }}>{right}</div>}
        {children}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent, small }) {
  return (
    <div className={`info-card ${accent==='red'?'accent-red':accent==='green'?'accent-green':''}`}>
      <span className="card-label">{label}</span>
      <div className="card-value" style={{ fontSize:small?'16px':'20px', color:accent==='red'?'var(--red)':'' }}>{value}</div>
      <div className="card-sub">{sub}</div>
    </div>
  )
}

function OrgNode({ role, name, isTop, onClick }) {
  return (
    <div onClick={onClick} style={{ border:`${isTop?'2':'1.5'}px solid ${isTop?'var(--red)':'var(--ink-2)'}`, padding:'7px 16px', textAlign:'center', background:'rgba(180,150,80,.07)', minWidth:'160px', cursor:onClick?'pointer':'default', transition:'background .15s' }}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.background='rgba(180,150,80,.16)')}
      onMouseLeave={e=>onClick&&(e.currentTarget.style.background='rgba(180,150,80,.07)')}>
      <span style={{ fontSize:'8px', letterSpacing:'3px', textTransform:'uppercase', color:isTop?'var(--red)':'var(--ink-3)', display:'block' }}>{role}</span>
      <span style={{ fontSize:'13px', letterSpacing:'2px', color:isTop?'var(--red)':'var(--ink)', display:'block', marginTop:'2px', fontFamily:"'Special Elite',cursive" }}>{name}</span>
    </div>
  )
}
function VLine() { return <div style={{ width:'1.5px', height:'20px', background:'var(--ink-2)', opacity:.5, margin:'0 auto' }} /> }
function Loader() { return <div style={{ textAlign:'center', padding:'36px 0', color:'var(--ink-3)', fontStyle:'italic', fontSize:'12px', letterSpacing:'2px' }}>Chargement du registre...</div> }

/* ════════════════════════════════
   DASHBOARD
════════════════════════════════ */
export default function DashboardPage() {
  const { ranger, signOut, isAdmin, canEditOrg } = useAuth()
  const snd = useTypewriterSound()
  const [activeTab, setActiveTab] = useState('accueil')
  function switchTab(id) { snd.keyClick(); setActiveTab(id) }

  return (
    <div>
      <header style={{ background:'linear-gradient(180deg,var(--metal-l) 0%,var(--metal) 60%,#180e08 100%)', borderBottom:'3px solid #0a0604', padding:'0 20px', position:'sticky', top:0, zIndex:500, boxShadow:'0 4px 20px rgba(0,0,0,.8)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'50px', borderBottom:'1px solid rgba(90,64,48,.5)', gap:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'18px', filter:'sepia(1) brightness(.6)' }}>⭐</span>
            <div>
              <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'12px', letterSpacing:'4px', color:'var(--chrome)', textTransform:'uppercase' }}>U.S. Rangers</div>
              <div style={{ fontSize:'8px', letterSpacing:'3px', color:'rgba(180,150,100,.4)', textTransform:'uppercase' }}>Bureau de Commandement</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'11px', letterSpacing:'2px', color:'var(--chrome)' }}>{ranger?.prenom_rp} {ranger?.nom_rp}</div>
              <div style={{ fontSize:'8px', letterSpacing:'2px', color:'rgba(180,150,100,.45)', textTransform:'uppercase' }}>
                {ranger?.grade} {isAdmin && <span style={{ color:'var(--red)' }}>★ Admin</span>}
              </div>
            </div>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', border:'1.5px solid var(--paper-dark)', overflow:'hidden', background:'var(--metal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0 }}>
              {ranger?.photo_url?<img src={ranger.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />:'👤'}
            </div>
            <button onClick={signOut} style={{ background:'none', border:'1px solid rgba(139,26,26,.4)', color:'rgba(139,26,26,.7)', padding:'3px 8px', fontFamily:"'Special Elite',cursive", fontSize:'8px', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer' }}>Quitter</button>
          </div>
        </div>
        <nav style={{ display:'flex', alignItems:'flex-end', gap:'2px', padding:'6px 0 0', overflowX:'auto' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{
              flexShrink:0, padding:activeTab===t.id?'6px 11px 10px':'6px 11px 8px',
              background:activeTab===t.id?'var(--paper)':'linear-gradient(180deg,#3a2820,#2a1c12)',
              border:'1px solid', borderColor:activeTab===t.id?'var(--ink-3)':'#5a4030',
              borderBottom:'none', fontFamily:"'Special Elite',cursive", fontSize:'9px', letterSpacing:'2px',
              textTransform:'uppercase', color:activeTab===t.id?'var(--ink)':'rgba(180,150,100,.5)',
              cursor:'pointer', clipPath:'polygon(0 25%,10% 0,90% 0,100% 25%,100% 100%,0 100%)',
              whiteSpace:'nowrap', transition:'all .15s'
            }}>
              <span style={{ display:'block', fontSize:'10px', textAlign:'center', marginBottom:'1px' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 14px 40px' }}>
        <div className="paper-sheet page-in">
          <div className="hole" style={{ top:'50px' }} />
          <div className="hole" style={{ top:'45%' }} />
          <div className="hole" style={{ bottom:'50px' }} />
          {activeTab==='accueil'      && <TabAccueil ranger={ranger} />}
          {activeTab==='organigramme' && <TabOrganigramme canEdit={canEditOrg} snd={snd} />}
          {activeTab==='logistique'   && <TabLogistique snd={snd} ranger={ranger} />}
          {activeTab==='armes'        && <TabArmes snd={snd} />}
          {activeTab==='comptes'      && <TabComptes snd={snd} ranger={ranger} />}
          {activeTab==='rapports'     && <TabRapports ranger={ranger} snd={snd} />}
          {activeTab==='admin'        && <TabAdmin isAdmin={isAdmin} currentRanger={ranger} snd={snd} />}
        </div>
      </main>
    </div>
  )
}

/* ════════ ACCUEIL ════════ */
function TabAccueil({ ranger }) {
  const [stats, setStats] = useState({ rangers:0, volees:0, solde:0, rapports:0 })
  const now=new Date()
  const dateStr=`${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`
  useEffect(()=>{
    async function load(){
      const [{count:r},{count:v},{data:c},{count:rp}]=await Promise.all([
        supabase.from('rangers').select('*',{count:'exact',head:true}).eq('statut','actif'),
        supabase.from('stock_armes').select('*',{count:'exact',head:true}).eq('statut','volee'),
        supabase.from('comptes').select('montant,operation'),
        supabase.from('rapports').select('*',{count:'exact',head:true}),
      ])
      const solde=(c||[]).reduce((s,x)=>x.operation==='ajout'?s+Number(x.montant):s-Number(x.montant),0)
      setStats({rangers:r||0,volees:v||0,solde,rapports:rp||0})
    }
    load()
  },[])
  return (
    <div className="page-in">
      <PageHeader title="Tableau de Bord" sub="U.S. Rangers — Bureau de New Austin" right={`New Austin\n${dateStr}`} />
      <div className="info-grid">
        <StatCard label="Effectif actif" value={stats.rangers} sub="Rangers" />
        <StatCard label="Armes volées" value={stats.volees} sub={stats.volees>0?'En investigation':'Aucune alerte'} accent={stats.volees>0?'red':''} />
        <StatCard label="Solde Bureau" value={`${stats.solde.toFixed(2)} $`} sub="Trésorerie" accent="green" small />
        <StatCard label="Rapports" value={stats.rapports} sub="Total archivés" />
      </div>
      <div className="ornament">★ Message du Commandement ★</div>
      <div style={{ borderLeft:'3px solid var(--ink-3)', padding:'12px 16px', background:'rgba(180,150,80,.06)', fontSize:'13px', lineHeight:'30px', color:'var(--ink-2)', fontStyle:'italic' }}>
        « Bienvenue, {ranger?.grade} {ranger?.prenom_rp} {ranger?.nom_rp}. »
        <div style={{ marginTop:'6px', fontSize:'10px', letterSpacing:'2px', color:'var(--ink-3)', fontStyle:'normal' }}>— Le Commandant, New Austin · 1900</div>
      </div>
    </div>
  )
}

/* ════════ ORGANIGRAMME ════════ */
function TabOrganigramme({ canEdit, snd }) {
  const [rangers, setRangers]=useState([])
  const [modal, setModal]=useState(false)
  const [selected, setSelected]=useState(null)
  const [form, setForm]=useState({ grade:'', pole:'', role_special:'', prenom_rp:'', nom_rp:'' })
  const [msg, setMsg]=useState('')
  useEffect(()=>{ load() },[])
  async function load(){
    const{data}=await supabase.from('rangers').select('*').eq('statut','actif').order('grade')
    setRangers(data||[])
  }
  function openEdit(r){ snd.keyClick(); setSelected(r); setForm({grade:r.grade,pole:r.pole||'',role_special:r.role_special||'',prenom_rp:r.prenom_rp,nom_rp:r.nom_rp}); setModal(true) }
  async function save(){
    snd.carriageReturn()
    const{error}=await supabase.from('rangers').update({grade:form.grade,pole:form.pole||null,role_special:form.role_special||null,prenom_rp:form.prenom_rp,nom_rp:form.nom_rp}).eq('id',selected.id)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding(); setMsg('✓ Modifié'); await load(); setTimeout(()=>{setModal(false);setMsg('')},800)
  }
  const byGrade=g=>rangers.filter(r=>r.grade===g)
  const byPole=p=>rangers.filter(r=>r.pole===p&&r.grade!=='commandant')
  const POLES=[{id:'logistique',label:'Logistique'},{id:'operationnel',label:'Opérationnel'},{id:'admin',label:'Admin & Formation'}]
  return (
    <div className="page-in">
      <PageHeader title="Organigramme" sub="Structure hiérarchique">
        {canEdit && <button className="btn btn-primary btn-sm" onClick={()=>{}}>✎ Cliquer sur un membre</button>}
      </PageHeader>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', fontFamily:"'Special Elite',cursive", overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center' }}>
          {byGrade('commandant').length>0?byGrade('commandant').map(r=><OrgNode key={r.id} role="Commandant" name={`${r.prenom_rp} ${r.nom_rp}`} isTop onClick={canEdit?()=>openEdit(r):null} />):<OrgNode role="Commandant" name="— Vacant —" isTop />}
        </div>
        <div style={{ display:'flex', gap:'30px', flexWrap:'wrap', justifyContent:'center' }}>
          {POLES.map(pole=>{
            const lts=byPole(pole.id).filter(r=>r.grade==='lieutenant')
            const members=byPole(pole.id).filter(r=>r.grade!=='lieutenant')
            return (
              <div key={pole.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'155px' }}>
                <VLine />
                <div style={{ fontSize:'8px', letterSpacing:'2px', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:'4px', borderBottom:'1px solid rgba(106,74,26,.3)', paddingBottom:'3px', width:'100%', textAlign:'center' }}>{pole.label}</div>
                {lts.length>0?lts.map(r=><OrgNode key={r.id} role="Lieutenant" name={`${r.prenom_rp} ${r.nom_rp}`} onClick={canEdit?()=>openEdit(r):null} />):<OrgNode role="Lieutenant" name="— Vacant —" />}
                {members.map(r=>(
                  <div key={r.id} onClick={canEdit?()=>openEdit(r):null} style={{ fontSize:'11px', color:'var(--ink-2)', padding:'3px 6px', borderBottom:'1px dashed rgba(160,130,70,.2)', width:'100%', textAlign:'center', cursor:canEdit?'pointer':'default', transition:'background .15s' }}
                    onMouseEnter={e=>canEdit&&(e.currentTarget.style.background='rgba(180,150,80,.12)')}
                    onMouseLeave={e=>canEdit&&(e.currentTarget.style.background='')}>
                    <span style={{ fontSize:'8px', color:'var(--ink-3)', display:'block' }}>{r.grade}{r.role_special?` — ${r.role_special}`:''}</span>
                    {r.prenom_rp} {r.nom_rp}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        {byGrade('deputy').length>0&&(
          <>
            <VLine />
            <div style={{ fontSize:'8px', letterSpacing:'2px', textTransform:'uppercase', color:'var(--ink-3)', margin:'4px 0 8px', borderBottom:'1px solid rgba(106,74,26,.3)', paddingBottom:'3px', minWidth:'180px', textAlign:'center' }}>Deputies</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', justifyContent:'center' }}>
              {byGrade('deputy').map(r=>(
                <div key={r.id} onClick={canEdit?()=>openEdit(r):null} style={{ fontSize:'11px', color:'var(--ink-2)', padding:'4px 10px', border:'1px solid rgba(160,130,70,.3)', minWidth:'120px', textAlign:'center', cursor:canEdit?'pointer':'default', fontFamily:"'Special Elite',cursive", transition:'all .15s' }}
                  onMouseEnter={e=>canEdit&&(e.currentTarget.style.background='rgba(180,150,80,.12)')}
                  onMouseLeave={e=>canEdit&&(e.currentTarget.style.background='')}>
                  {r.prenom_rp} {r.nom_rp}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {canEdit&&<div style={{ marginTop:'14px', fontSize:'9px', color:'var(--ink-3)', fontStyle:'italic', textAlign:'center' }}>✎ Cliquez sur un membre pour modifier son poste</div>}
      {modal&&selected&&(
        <Modal title={`Modifier — ${selected.prenom_rp} ${selected.nom_rp}`} onClose={()=>setModal(false)}>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div className="two-col">
            <Field label="Prénom (RP)"><input type="text" value={form.prenom_rp} onChange={e=>{setForm(f=>({...f,prenom_rp:e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Nom (RP)"><input type="text" value={form.nom_rp} onChange={e=>{setForm(f=>({...f,nom_rp:e.target.value}));snd.keyClick()}} /></Field>
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
            <Field label="Rôle spécial">
              <input type="text" value={form.role_special} onChange={e=>{setForm(f=>({...f,role_special:e.target.value}));snd.keyClick()}} placeholder="Œil de lynx, Cynophile..." />
            </Field>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save}>✓ Enregistrer</button>
            <button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ LOGISTIQUE ════════ */
function TabLogistique({ snd, ranger }) {
  const [items, setItems]=useState([])
  const [histo, setHisto]=useState([])
  const [loading, setLoading]=useState(true)
  const [modal, setModal]=useState(false) // 'add' | 'edit' | 'mouv' | 'histo'
  const [editItem, setEditItem]=useState(null)
  const [form, setForm]=useState({ article:'', categorie:'Papeterie', qte_wallace:0, qte_blackwater:0, qte_mercer:0, qte_armadillo:0, min_blackwater:0 })
  const [mouv, setMouv]=useState({ poste:'wallace', type:'ajout', quantite:1 })
  const [msg, setMsg]=useState('')

  useEffect(()=>{ load() },[])
  async function load(){
    const[{data:i},{data:h}]=await Promise.all([
      supabase.from('logistique').select('*').order('categorie'),
      supabase.from('logistique_historique').select('*').order('created_at',{ascending:false}).limit(50),
    ])
    setItems(i||[]); setHisto(h||[]); setLoading(false)
  }

  function openAdd(){ snd.keyClick(); setEditItem(null); setForm({article:'',categorie:'Papeterie',qte_wallace:0,qte_blackwater:0,qte_mercer:0,qte_armadillo:0,min_blackwater:0}); setMsg(''); setModal('add') }
  function openEdit(item){ snd.keyClick(); setEditItem(item); setForm({article:item.article,categorie:item.categorie,qte_wallace:item.qte_wallace,qte_blackwater:item.qte_blackwater,qte_mercer:item.qte_mercer,qte_armadillo:item.qte_armadillo,min_blackwater:item.min_blackwater}); setMsg(''); setModal('edit') }
  function openMouv(item){ snd.keyClick(); setEditItem(item); setMouv({poste:'wallace',type:'ajout',quantite:1}); setMsg(''); setModal('mouv') }

  async function save(){
    snd.carriageReturn()
    if(!form.article){setMsg('⚠ Article requis');return}
    const{error}=editItem
      ? await supabase.from('logistique').update(form).eq('id',editItem.id)
      : await supabase.from('logistique').insert(form)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding(); await load(); setModal(false)
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
    // Enregistrer dans l'historique
    await supabase.from('logistique_historique').insert({
      article_id:  editItem.id,
      article_nom: editItem.article,
      poste:       mouv.poste,
      type_mouv:   mouv.type,
      quantite:    Number(mouv.quantite),
      qte_avant:   qteAvant,
      qte_apres:   qteApres,
      ranger_bp:   ranger?.bp,
      ranger_nom:  ranger?`${ranger.prenom_rp} ${ranger.nom_rp}`:null,
    })
    snd.ding(); await load(); setModal(false)
  }

  async function del(id){ if(!confirm('Supprimer cet article ?'))return; snd.carriageReturn(); await supabase.from('logistique').delete().eq('id',id); await load() }

  const CATS=['Papeterie','Armurerie','Fourniture','Alimentaire','Soins']
  const POSTES=[{id:'wallace',label:'Fort Wallace'},{id:'blackwater',label:'Bur. Blackwater'},{id:'mercer',label:'Fort Mercer'},{id:'armadillo',label:'Camp Armadillo'}]

  return (
    <div className="page-in">
      <PageHeader title="Logistique" sub="Inventaire des fournitures">
        <div className="btn-row" style={{ margin:0, gap:'6px' }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Article</button>
          <button className="btn btn-sm" onClick={()=>{ snd.keyClick(); setModal('histo') }}>📋 Historique</button>
        </div>
      </PageHeader>
      {loading?<Loader />:(
        <table className="register-table">
          <thead><tr><th>Article</th><th>Catégorie</th><th>Wallace</th><th>Blackwater</th><th>Mercer</th><th>Armadillo</th><th></th></tr></thead>
          <tbody>
            {items.map(item=>(
              <tr key={item.id}>
                <td><strong>{item.article}</strong></td>
                <td>{item.categorie}</td>
                <td>{item.qte_wallace}</td>
                <td style={{ color:item.qte_blackwater<item.min_blackwater?'var(--red)':'inherit', fontWeight:item.qte_blackwater<item.min_blackwater?700:'normal' }}>
                  {item.qte_blackwater}{item.min_blackwater>0?` (min:${item.min_blackwater})`:''}
                </td>
                <td>{item.qte_mercer}</td>
                <td>{item.qte_armadillo||'—'}</td>
                <td>
                  <div style={{ display:'flex', gap:'3px' }}>
                    <button className="btn btn-success btn-sm" onClick={()=>openMouv(item)} title="Mouvement stock">±</button>
                    <button className="btn btn-sm" onClick={()=>openEdit(item)}>✎</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(item.id)}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length===0&&<tr><td colSpan="7" style={{ textAlign:'center', fontStyle:'italic', color:'var(--ink-3)', padding:'20px' }}>Aucun article. Cliquez sur + Article pour commencer.</td></tr>}
          </tbody>
        </table>
      )}
      <div style={{ fontSize:'9px', color:'var(--ink-3)', fontStyle:'italic' }}>* Parenthèses = stock minimum requis — Bouton ± pour ajouter/retirer du stock</div>

      {/* Modal ajout/édition article */}
      {(modal==='add'||modal==='edit')&&(
        <Modal title={editItem?`Modifier — ${editItem.article}`:'Nouvel article'} onClose={()=>setModal(false)}>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div className="two-col">
            <Field label="Nom de l'article"><input type="text" value={form.article} onChange={e=>{setForm(f=>({...f,article:e.target.value}));snd.keyClick()}} placeholder="ex: Bandage" /></Field>
            <Field label="Catégorie"><select value={form.categorie} onChange={e=>{setForm(f=>({...f,categorie:e.target.value}));snd.keyClick()}}>{CATS.map(c=><option key={c}>{c}</option>)}</select></Field>
          </div>
          <div className="two-col">
            <Field label="Fort Wallace"><input type="number" min="0" value={form.qte_wallace} onChange={e=>{setForm(f=>({...f,qte_wallace:+e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Bur. Blackwater"><input type="number" min="0" value={form.qte_blackwater} onChange={e=>{setForm(f=>({...f,qte_blackwater:+e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Fort Mercer"><input type="number" min="0" value={form.qte_mercer} onChange={e=>{setForm(f=>({...f,qte_mercer:+e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Camp Armadillo"><input type="number" min="0" value={form.qte_armadillo} onChange={e=>{setForm(f=>({...f,qte_armadillo:+e.target.value}));snd.keyClick()}} /></Field>
          </div>
          <Field label="Stock minimum Blackwater (alerte rouge si en-dessous)">
            <input type="number" min="0" value={form.min_blackwater} onChange={e=>{setForm(f=>({...f,min_blackwater:+e.target.value}));snd.keyClick()}} />
          </Field>
          <div className="btn-row"><button className="btn btn-primary" onClick={save}>✓ Enregistrer</button><button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button></div>
        </Modal>
      )}

      {/* Modal mouvement de stock */}
      {modal==='mouv'&&editItem&&(
        <Modal title={`Mouvement — ${editItem.article}`} onClose={()=>setModal(false)}>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
            {POSTES.map(p=>(
              <div key={p.id} style={{ border:`2px solid ${mouv.poste===p.id?'var(--ink)':'rgba(160,130,70,.3)'}`, padding:'10px', textAlign:'center', cursor:'pointer', background:mouv.poste===p.id?'rgba(26,16,8,.06)':'transparent', transition:'all .15s' }}
                onClick={()=>{ setMouv(m=>({...m,poste:p.id})); snd.keyClick() }}>
                <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'10px', letterSpacing:'2px', color:'var(--ink-3)', textTransform:'uppercase' }}>{p.label}</div>
                <div style={{ fontSize:'20px', fontWeight:700, color:'var(--ink)', marginTop:'4px' }}>{editItem[`qte_${p.id}`]||0}</div>
              </div>
            ))}
          </div>
          <Field label="Type d'opération">
            <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
              {['ajout','retrait'].map(t=>(
                <label key={t} style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontFamily:"'Special Elite',cursive", fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase', color:mouv.type===t?'var(--ink)':'var(--ink-3)' }}>
                  <input type="radio" checked={mouv.type===t} onChange={()=>{ setMouv(m=>({...m,type:t})); snd.keyClick() }} style={{ accentColor:'var(--ink)' }} />
                  {t==='ajout'?'✚ Ajout':'✖ Retrait'}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Quantité">
            <div className="qty-control" style={{ marginTop:'8px' }}>
              <button className="qty-btn" onClick={()=>{ setMouv(m=>({...m,quantite:Math.max(1,m.quantite-1)})); snd.keyClick() }}>−</button>
              <span className="qty-value">{mouv.quantite}</span>
              <button className="qty-btn" onClick={()=>{ setMouv(m=>({...m,quantite:m.quantite+1})); snd.keyClick() }}>+</button>
              <input type="number" min="1" value={mouv.quantite} onChange={e=>setMouv(m=>({...m,quantite:+e.target.value}))} style={{ width:'60px', textAlign:'center', marginLeft:'8px', fontSize:'14px' }} />
            </div>
          </Field>
          <div style={{ marginTop:'12px', padding:'10px', background:'rgba(180,150,80,.08)', border:'1px solid rgba(160,130,70,.3)', fontSize:'11px', color:'var(--ink-2)' }}>
            <strong>{editItem[`qte_${mouv.poste}`]||0}</strong> → <strong style={{ color:mouv.type==='ajout'?'var(--green)':'var(--red)' }}>{Math.max(0,(editItem[`qte_${mouv.poste}`]||0)+(mouv.type==='ajout'?mouv.quantite:-mouv.quantite))}</strong>
            <span style={{ fontSize:'9px', color:'var(--ink-3)', marginLeft:'8px' }}>({mouv.type==='ajout'?'+':'-'}{mouv.quantite} à {POSTES.find(p=>p.id===mouv.poste)?.label})</span>
          </div>
          <div className="btn-row"><button className="btn btn-primary" onClick={saveMouv}>✓ Confirmer le mouvement</button><button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button></div>
        </Modal>
      )}

      {/* Modal historique */}
      {modal==='histo'&&(
        <Modal title="Historique des mouvements" onClose={()=>setModal(false)} wide>
          <table className="register-table">
            <thead><tr><th>Date</th><th>Article</th><th>Poste</th><th>Type</th><th>Qté</th><th>Avant → Après</th><th>Par</th></tr></thead>
            <tbody>
              {histo.map(h=>(
                <tr key={h.id}>
                  <td style={{ fontSize:'10px' }}>{new Date(h.created_at).toLocaleDateString('fr-FR')} {new Date(h.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td>{h.article_nom}</td>
                  <td style={{ fontSize:'10px', textTransform:'capitalize' }}>{h.poste}</td>
                  <td><span className={`status-badge ${h.type_mouv==='ajout'?'status-ok':'status-vol'}`}>{h.type_mouv==='ajout'?'Ajout':'Retrait'}</span></td>
                  <td style={{ fontWeight:700 }}>{h.type_mouv==='ajout'?'+':'-'}{h.quantite}</td>
                  <td style={{ fontSize:'11px' }}>{h.qte_avant} → <strong>{h.qte_apres}</strong></td>
                  <td style={{ fontSize:'10px' }}>{h.ranger_nom||'—'}</td>
                </tr>
              ))}
              {histo.length===0&&<tr><td colSpan="7" style={{ textAlign:'center', fontStyle:'italic', color:'var(--ink-3)', padding:'16px' }}>Aucun mouvement enregistré.</td></tr>}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  )
}

/* ════════ ARMES ════════ */
function TabArmes({ snd }) {
  const [armes,setArmes]=useState([])
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [editArme,setEditArme]=useState(null)
  const [rangers,setRangers]=useState([])
  const [form,setForm]=useState({type_arme:'',numero_serie:'',date_fabrication:'',emplacement:'Registre Blackwater',statut:'en_stock',affecte_a:''})
  const [msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){
    const[{data:a},{data:r}]=await Promise.all([
      supabase.from('stock_armes').select('*, ranger:affecte_a(prenom_rp,nom_rp)').order('type_arme'),
      supabase.from('rangers').select('id,prenom_rp,nom_rp').eq('statut','actif'),
    ])
    setArmes(a||[]);setRangers(r||[]);setLoading(false)
  }
  function openAdd(){snd.keyClick();setEditArme(null);setForm({type_arme:'',numero_serie:'',date_fabrication:'',emplacement:'Registre Blackwater',statut:'en_stock',affecte_a:''});setMsg('');setModal(true)}
  function openEdit(a){snd.keyClick();setEditArme(a);setForm({type_arme:a.type_arme,numero_serie:a.numero_serie,date_fabrication:a.date_fabrication||'',emplacement:a.emplacement||'',statut:a.statut,affecte_a:a.affecte_a||''});setMsg('');setModal(true)}
  async function save(){
    snd.carriageReturn()
    if(!form.type_arme||!form.numero_serie){setMsg('⚠ Type et numéro requis');return}
    const payload={type_arme:form.type_arme,numero_serie:form.numero_serie,date_fabrication:form.date_fabrication||null,emplacement:form.statut==='affectee'?null:form.emplacement,statut:form.statut,affecte_a:form.statut==='affectee'?form.affecte_a||null:null}
    const{error}=editArme?await supabase.from('stock_armes').update(payload).eq('id',editArme.id):await supabase.from('stock_armes').insert(payload)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await load();setModal(false)
  }
  async function del(id){if(!confirm('Supprimer cette arme ?'))return;snd.carriageReturn();await supabase.from('stock_armes').delete().eq('id',id);await load()}
  const TYPES=['Cattleman','Navy','Winchester','Springfield','Pompe','Verrou','Rolling Block','Autre']
  const EMPLACEMENTS=['Registre Blackwater','Registre Wallace','Fort Mercer','Camp Armadillo']
  const volees=armes.filter(a=>a.statut==='volee').length
  const affectees=armes.filter(a=>a.statut==='affectee').length
  return (
    <div className="page-in">
      <PageHeader title="Stock d'Armes" sub="Registre des armes à feu">
        <div className="btn-row" style={{margin:0,gap:'6px'}}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Enregistrer</button>
          <button className="btn btn-danger btn-sm" onClick={()=>{snd.keyClick();setEditArme(null);setForm(f=>({...f,statut:'volee'}));setMsg('');setModal(true)}}>⚠ Signaler vol</button>
        </div>
      </PageHeader>
      <div className="info-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <StatCard label="Total" value={armes.length} sub="enregistrées" />
        <StatCard label="Volées" value={volees} sub={volees>0?'En investigation':'Aucune alerte'} accent={volees>0?'red':''} />
        <StatCard label="Affectées" value={affectees} sub="à des Rangers" />
      </div>
      {loading?<Loader />:(
        <table className="register-table">
          <thead><tr><th>Type</th><th>N° Série</th><th>Date fab.</th><th>Emplacement</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {armes.map(a=>(
              <tr key={a.id} style={a.statut==='volee'?{background:'rgba(139,26,26,.06)'}:{}}>
                <td><strong>{a.type_arme}</strong></td>
                <td style={{letterSpacing:'2px'}}>{a.numero_serie}</td>
                <td>{a.date_fabrication?new Date(a.date_fabrication).toLocaleDateString('fr-FR'):'—'}</td>
                <td>{a.ranger?`${a.ranger.prenom_rp} ${a.ranger.nom_rp}`:(a.emplacement||'—')}</td>
                <td><span className={`status-badge ${a.statut==='en_stock'?'status-ok':a.statut==='volee'?'status-vol':'status-att'}`}>{a.statut==='en_stock'?'En stock':a.statut==='volee'?'⚠ VOLÉE':'Affectée'}</span></td>
                <td><div style={{display:'flex',gap:'3px'}}>
                  <button className="btn btn-sm" onClick={()=>openEdit(a)}>✎</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>del(a.id)}>✕</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modal&&(
        <Modal title={editArme?`Modifier — ${editArme.type_arme}`:'Nouvelle arme'} onClose={()=>setModal(false)}>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div className="two-col">
            <Field label="Type d'arme"><select value={form.type_arme} onChange={e=>{setForm(f=>({...f,type_arme:e.target.value}));snd.keyClick()}}><option value="">— Sélectionner —</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select></Field>
            <Field label="N° de série"><input type="text" value={form.numero_serie} onChange={e=>{setForm(f=>({...f,numero_serie:e.target.value}));snd.keyClick()}} placeholder="147600" /></Field>
          </div>
          <div className="two-col">
            <Field label="Date fabrication"><input type="date" value={form.date_fabrication} onChange={e=>{setForm(f=>({...f,date_fabrication:e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Statut"><select value={form.statut} onChange={e=>{setForm(f=>({...f,statut:e.target.value}));snd.keyClick()}}><option value="en_stock">En stock</option><option value="affectee">Affectée</option><option value="volee">Volée</option><option value="hors_service">Hors service</option></select></Field>
          </div>
          {form.statut==='affectee'
            ?<Field label="Affectée à"><select value={form.affecte_a} onChange={e=>{setForm(f=>({...f,affecte_a:e.target.value}));snd.keyClick()}}><option value="">— Sélectionner un Ranger —</option>{rangers.map(r=><option key={r.id} value={r.id}>{r.prenom_rp} {r.nom_rp}</option>)}</select></Field>
            :<Field label="Emplacement"><select value={form.emplacement} onChange={e=>{setForm(f=>({...f,emplacement:e.target.value}));snd.keyClick()}}>{EMPLACEMENTS.map(e=><option key={e}>{e}</option>)}</select></Field>
          }
          <div className="btn-row"><button className="btn btn-primary" onClick={save}>✓ Enregistrer</button><button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button></div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ COMPTES ════════ */
function TabComptes({ snd, ranger }) {
  const [ops,setOps]=useState([])
  const [solde,setSolde]=useState(0)
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [type,setType]=useState('ajout')
  const [form,setForm]=useState({objet:'',nom_prenom:'',type_permis:'',montant:''})
  const [msg,setMsg]=useState('')
  useEffect(()=>{load()},[])
  async function load(){
    const{data}=await supabase.from('comptes').select('*, ranger:enregistre_par(prenom_rp,nom_rp)').order('date_op',{ascending:false}).limit(60)
    const d=data||[];setOps(d);setSolde(d.reduce((s,r)=>r.operation==='ajout'?s+Number(r.montant):s-Number(r.montant),0));setLoading(false)
  }
  function openModal(t){snd.keyClick();setType(t);setForm({objet:'',nom_prenom:'',type_permis:'',montant:''});setMsg('');setModal(true)}
  async function save(){
    snd.carriageReturn()
    if(!form.objet||!form.montant){setMsg('⚠ Objet et montant requis');return}
    const{error}=await supabase.from('comptes').insert({objet:form.objet,nom_prenom:form.nom_prenom||null,type_permis:form.type_permis||null,montant:parseFloat(form.montant),operation:type,date_op:new Date().toISOString().split('T')[0],enregistre_par:ranger?.id})
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();await load();setModal(false)
  }
  const PERMIS=['','Permis Mine','Permis Chasse','Permis Pêche','Permis Chasse et Pêche','Permis Coupe','Nourriture','Équipements Divers','Publicité','Autre']
  return (
    <div className="page-in">
      <PageHeader title="Gestion des Comptes" sub="État financier du Bureau">
        <div className="btn-row" style={{margin:0,gap:'6px'}}>
          <button className="btn btn-success btn-sm" onClick={()=>openModal('ajout')}>+ Entrée</button>
          <button className="btn btn-danger btn-sm" onClick={()=>openModal('retrait')}>− Sortie</button>
        </div>
      </PageHeader>
      <div style={{fontFamily:"'Special Elite',cursive",fontSize:'clamp(22px,5vw,36px)',color:'var(--ink)',letterSpacing:'4px',padding:'12px 16px',border:'2px solid var(--ink)',display:'inline-block',position:'relative',marginBottom:'18px'}}>
        <span style={{position:'absolute',top:'-10px',left:'10px',background:'var(--paper)',padding:'0 6px',fontSize:'9px',letterSpacing:'3px',color:'var(--ink-3)'}}>SOLDE ACTUEL</span>
        {solde.toFixed(2)} $
      </div>
      {loading?<Loader />:(
        <table className="register-table">
          <thead><tr><th>Date</th><th>Objet</th><th>Nom</th><th>Par</th><th>Type</th><th>Montant</th><th>Op.</th></tr></thead>
          <tbody>
            {ops.map(op=>(
              <tr key={op.id}>
                <td style={{fontSize:'10px'}}>{new Date(op.date_op).toLocaleDateString('fr-FR')}</td>
                <td>{op.objet}</td>
                <td style={{fontSize:'10px'}}>{op.nom_prenom||'—'}</td>
                <td style={{fontSize:'10px'}}>{op.ranger?`${op.ranger.prenom_rp}`:'—'}</td>
                <td style={{fontSize:'10px'}}>{op.type_permis||'—'}</td>
                <td style={{fontWeight:700}}>{Number(op.montant).toFixed(2)} $</td>
                <td><span className={`status-badge ${op.operation==='ajout'?'status-ok':'status-vol'}`} style={{border:'1px solid',padding:'1px 5px',fontSize:'9px',fontFamily:"'Special Elite',cursive"}}>{op.operation==='ajout'?'Ajout':'Retrait'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {modal&&(
        <Modal title={type==='ajout'?'Nouvelle entrée':'Nouvelle sortie'} onClose={()=>setModal(false)}>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <Field label="Objet / Description"><input type="text" value={form.objet} onChange={e=>{setForm(f=>({...f,objet:e.target.value}));snd.keyClick()}} placeholder="ex: Don de la Marshall" /></Field>
          <div className="two-col">
            <Field label="Nom / Prénom"><input type="text" value={form.nom_prenom} onChange={e=>{setForm(f=>({...f,nom_prenom:e.target.value}));snd.keyClick()}} placeholder="DUPONT Jean" /></Field>
            <Field label="Type / Permis"><select value={form.type_permis} onChange={e=>{setForm(f=>({...f,type_permis:e.target.value}));snd.keyClick()}}>{PERMIS.map(p=><option key={p}>{p}</option>)}</select></Field>
          </div>
          <Field label={`Montant ($)`}>
            <input type="number" step="0.01" value={form.montant} onChange={e=>{setForm(f=>({...f,montant:e.target.value}));snd.keyClick()}} placeholder="0.00" style={{fontSize:'20px',fontWeight:700}} />
          </Field>
          <div className="btn-row"><button className="btn btn-primary" onClick={save}>✓ Enregistrer</button><button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button></div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ RAPPORTS ════════ */
function TabRapports({ ranger, snd }) {
  const [rapports,setRapports]=useState([])
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [viewModal,setViewModal]=useState(null)
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
    snd.ding();setMsg(`✓ Rapport soumis — Télégramme n° ${tel}`);await load();setTimeout(()=>{setModal(false);setMsg('')},900)
  }
  return (
    <div className="page-in">
      <PageHeader title="Rapports" sub="Registre officiel">
        <button className="btn btn-primary btn-sm" onClick={()=>{snd.keyClick();setForm({type_rapport:'Déposition',destinataires:'',comtes:'',date_faits:'',contenu:'',elements_supp:''});setMsg('');setModal(true)}}>+ Rédiger</button>
      </PageHeader>
      {loading?<Loader />:(
        <table className="register-table">
          <thead><tr><th>N° Télég.</th><th>Date</th><th>Type</th><th>Rédacteur</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {rapports.map(r=>(
              <tr key={r.id}>
                <td style={{letterSpacing:'2px'}}>{r.numero_telegram}</td>
                <td style={{fontSize:'10px'}}>{r.date_faits?new Date(r.date_faits).toLocaleDateString('fr-FR'):'—'}</td>
                <td>{r.type_rapport}</td>
                <td style={{fontSize:'10px'}}>{r.ranger?`${r.ranger.prenom_rp} ${r.ranger.nom_rp}`:'—'}</td>
                <td><span className={`status-badge ${r.statut==='archive'?'status-ok':'status-att'}`}>{r.statut}</span></td>
                <td><button className="btn btn-sm" onClick={()=>{snd.keyClick();setViewModal(r)}}>▶ Lire</button></td>
              </tr>
            ))}
            {rapports.length===0&&<tr><td colSpan="6" style={{textAlign:'center',fontStyle:'italic',color:'var(--ink-3)',padding:'20px'}}>Aucun rapport.</td></tr>}
          </tbody>
        </table>
      )}
      {modal&&(
        <Modal title="Nouveau Rapport" onClose={()=>setModal(false)} wide>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div className="two-col">
            <Field label="Type"><select value={form.type_rapport} onChange={e=>{setForm(f=>({...f,type_rapport:e.target.value}));snd.keyClick()}}>{['Déposition','Rapport d\'intervention','Rapport de patrouille','Rapport d\'incident','Note interne'].map(t=><option key={t}>{t}</option>)}</select></Field>
            <Field label="Date des faits"><input type="text" placeholder="14/04/1900 — 20h00" value={form.date_faits} onChange={e=>{setForm(f=>({...f,date_faits:e.target.value}));snd.keyClick()}} /></Field>
          </div>
          <div className="two-col">
            <Field label="Destinataires (séparés par ·)"><input type="text" placeholder="U.S. Rangers · U.S. Marshals" value={form.destinataires} onChange={e=>{setForm(f=>({...f,destinataires:e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Comtés (séparés par ·)"><input type="text" placeholder="New Austin · Cholla Springs" value={form.comtes} onChange={e=>{setForm(f=>({...f,comtes:e.target.value}));snd.keyClick()}} /></Field>
          </div>
          <Field label="Contenu ★"><textarea value={form.contenu} onChange={e=>{setForm(f=>({...f,contenu:e.target.value}));snd.keyClick()}} placeholder="Je soussigné(e)..." style={{minHeight:'140px'}} /></Field>
          <Field label="Éléments supplémentaires"><textarea style={{minHeight:'70px'}} value={form.elements_supp} onChange={e=>{setForm(f=>({...f,elements_supp:e.target.value}));snd.keyClick()}} placeholder="Pièces à conviction..." /></Field>
          <div className="btn-row"><button className="btn btn-primary" onClick={submit}>▶ Soumettre</button><button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button></div>
        </Modal>
      )}
      {viewModal&&(
        <Modal title={`Rapport n° ${viewModal.numero_telegram}`} onClose={()=>setViewModal(null)} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'14px',fontSize:'10px',color:'var(--ink-3)'}}>
            <div><strong>Type :</strong> {viewModal.type_rapport}</div>
            <div><strong>Date :</strong> {viewModal.date_faits||'—'}</div>
            <div><strong>Rédacteur :</strong> {viewModal.ranger?`${viewModal.ranger.prenom_rp} ${viewModal.ranger.nom_rp}`:'—'}</div>
            <div><strong>Statut :</strong> {viewModal.statut}</div>
          </div>
          <div style={{borderTop:'1px solid var(--ink-3)',paddingTop:'12px',whiteSpace:'pre-wrap',fontStyle:'italic',fontSize:'13px',lineHeight:'28px',color:'var(--ink-2)'}}>{viewModal.contenu}</div>
          {viewModal.elements_supp&&<div style={{marginTop:'10px',borderTop:'1px solid rgba(106,74,26,.3)',paddingTop:'8px',fontSize:'10px',color:'var(--ink-3)'}}>{viewModal.elements_supp}</div>}
        </Modal>
      )}
    </div>
  )
}

/* ════════ ADMIN ════════ */
function TabAdmin({ isAdmin, currentRanger, snd }) {
  const [pending,setPending]=useState([])
  const [actifs,setActifs]=useState([])
  const [codes,setCodes]=useState([])
  const [loading,setLoading]=useState(true)
  const [editRanger,setEditRanger]=useState(null)
  const [form,setForm]=useState({grade:'',pole:'',is_admin:false})
  const [msg,setMsg]=useState('')

  useEffect(()=>{load()},[])
  async function load(){
    const[{data:p},{data:a},{data:c}]=await Promise.all([
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
  }

  async function saveEdit(){
    snd.carriageReturn()
    const{error}=await supabase.from('rangers').update({grade:form.grade,pole:form.pole||null,is_admin:form.is_admin}).eq('id',editRanger.id)
    if(error){setMsg('⚠ '+error.message);return}
    snd.ding();setMsg('✓ Modifié');await load();setEditRanger(null)
  }

  async function genererCode(){
    snd.ding()
    const code='USR-'+Math.floor(1000+Math.random()*8999)
    await supabase.from('codes_invitation').insert({code,utilise:false,cree_par:currentRanger?.id})
    await load()
  }

  if(loading)return <Loader />

  return (
    <div className="page-in">
      <PageHeader title="Administration" sub="Gestion des accès — U.S. Rangers" />
      {msg&&<div className="msg-success">{msg}</div>}

      <div className="section-title">⏳ Demandes en attente ({pending.length})</div>
      {pending.length===0&&<div style={{color:'var(--ink-3)',fontStyle:'italic',fontSize:'12px',marginBottom:'14px'}}>Aucune demande en attente.</div>}
      {pending.map(r=>(
        <div key={r.id} style={{border:'1px solid rgba(160,130,70,.35)',padding:'12px 14px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'12px',background:'rgba(180,150,80,.04)',flexWrap:'wrap'}}>
          <div style={{width:'40px',height:'40px',border:'1.5px solid var(--ink-3)',background:'var(--paper-aged)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0,overflow:'hidden'}}>
            {r.photo_url?<img src={r.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />:'👤'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Special Elite',cursive",fontSize:'13px',letterSpacing:'2px'}}>{r.prenom_rp} {r.nom_rp}</div>
            <div style={{fontSize:'9px',color:'var(--ink-3)',marginTop:'2px'}}>
              BP : <strong>{r.bp}</strong> · <span className={`grade-badge grade-${r.grade}`}>{r.grade}</span> · Code : {r.code_invite} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div style={{display:'flex',gap:'6px'}}>
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
              <td style={{letterSpacing:'2px',fontWeight:700,fontSize:'11px'}}>{r.bp}</td>
              <td><span className={`grade-badge grade-${r.grade}`}>{r.grade}</span></td>
              <td style={{fontSize:'10px'}}>{r.pole||'—'}</td>
              <td>{r.is_admin?<span style={{color:'var(--red)',fontFamily:"'Special Elite',cursive",fontSize:'10px'}}>★ Admin</span>:<span style={{color:'var(--ink-3)',fontSize:'10px'}}>—</span>}</td>
              {isAdmin&&<td>
                <button className="btn btn-sm" onClick={()=>openEdit(r)}>✎ Modifier</button>
              </td>}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal édition ranger */}
      {editRanger&&(
        <Modal title={`Modifier — ${editRanger.prenom_rp} ${editRanger.nom_rp}`} onClose={()=>setEditRanger(null)}>
          {msg&&<div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
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
            <label style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginTop:'8px',fontFamily:"'Special Elite',cursive",fontSize:'12px',letterSpacing:'2px'}}>
              <input type="checkbox" checked={form.is_admin} onChange={e=>{setForm(f=>({...f,is_admin:e.target.checked}));snd.keyClick()}} style={{accentColor:'var(--ink)',width:'16px',height:'16px'}} />
              {form.is_admin?'★ Est Administrateur':'Pas Administrateur'}
            </label>
            {form.is_admin&&editRanger?.id===currentRanger?.id&&(
              <div style={{fontSize:'10px',color:'var(--red)',marginTop:'4px',fontStyle:'italic'}}>⚠ Vous ne pouvez pas retirer vos propres droits admin</div>
            )}
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={()=>{
              if(editRanger.id===currentRanger?.id&&!form.is_admin){setMsg('⚠ Vous ne pouvez pas retirer vos propres droits admin');return}
              saveEdit()
            }}>✓ Enregistrer</button>
            <button className="btn" onClick={()=>setEditRanger(null)}>✕ Annuler</button>
          </div>
        </Modal>
      )}

      <div className="section-title">🔑 Codes d'invitation</div>
      <div className="btn-row"><button className="btn btn-primary btn-sm" onClick={genererCode}>+ Générer un code</button></div>
      <table className="register-table">
        <thead><tr><th>Code</th><th>Créé par</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>
          {codes.map(c=>(
            <tr key={c.id}>
              <td style={{letterSpacing:'3px',fontWeight:700}}>{c.code}</td>
              <td>{c.cree?`${c.cree.prenom_rp} ${c.cree.nom_rp}`:'Admin'}</td>
              <td style={{fontSize:'10px'}}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
              <td><span className={`status-badge ${c.utilise?'status-att':'status-ok'}`}>{c.utilise?'Utilisé':'Disponible'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
