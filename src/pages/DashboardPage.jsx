import { useState, useEffect } from 'react'
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

/* ── Modale générique ── */
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={onClose}>
      <div className="paper-sheet page-in" style={{ maxWidth:'560px', width:'100%', minHeight:'auto', maxHeight:'85vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingBottom:'12px', borderBottom:'2px solid var(--ink)' }}>
          <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'16px', letterSpacing:'3px', textTransform:'uppercase' }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid var(--ink-3)', color:'var(--ink-3)', padding:'3px 10px', cursor:'pointer', fontFamily:"'Special Elite',cursive", fontSize:'11px' }}>✕ Fermer</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Champ de formulaire ── */
function Field({ label, children }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { ranger, signOut, isAdmin, canEditOrg } = useAuth()
  const snd = useTypewriterSound()
  const [activeTab, setActiveTab] = useState('accueil')

  function switchTab(id) { snd.keyClick(); setActiveTab(id) }

  return (
    <div>
      {/* ── HEADER ── */}
      <header style={{ background:'linear-gradient(180deg,var(--metal-l) 0%,var(--metal) 60%,#180e08 100%)', borderBottom:'3px solid #0a0604', padding:'0 24px', position:'sticky', top:0, zIndex:500, boxShadow:'0 4px 20px rgba(0,0,0,.8)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'52px', borderBottom:'1px solid rgba(90,64,48,.5)', gap:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <span style={{ fontSize:'20px', filter:'sepia(1) brightness(.6)' }}>⭐</span>
            <div>
              <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'13px', letterSpacing:'4px', color:'var(--chrome)', textTransform:'uppercase' }}>U.S. Rangers</div>
              <div style={{ fontSize:'8px', letterSpacing:'3px', color:'rgba(180,150,100,.4)', textTransform:'uppercase' }}>Bureau de Commandement — New Austin</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'12px', letterSpacing:'2px', color:'var(--chrome)' }}>{ranger?.prenom_rp} {ranger?.nom_rp}</div>
              <div style={{ fontSize:'9px', letterSpacing:'2px', color:'rgba(180,150,100,.45)', textTransform:'uppercase' }}>
                {ranger?.grade} {isAdmin && <span style={{ color:'var(--red)', marginLeft:'4px' }}>★ Admin</span>}
              </div>
            </div>
            <div style={{ width:'32px', height:'32px', borderRadius:'50%', border:'1.5px solid var(--paper-dark)', overflow:'hidden', background:'var(--metal)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0 }}>
              {ranger?.photo_url ? <img src={ranger.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '👤'}
            </div>
            <button onClick={signOut} style={{ background:'none', border:'1px solid rgba(139,26,26,.4)', color:'rgba(139,26,26,.7)', padding:'4px 10px', fontFamily:"'Special Elite',cursive", fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer' }}>Quitter</button>
          </div>
        </div>
        {/* Onglets */}
        <nav style={{ display:'flex', alignItems:'flex-end', gap:'2px', padding:'8px 0 0', overflowX:'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{
              flexShrink:0, padding: activeTab===t.id ? '7px 12px 11px' : '7px 12px 9px',
              background: activeTab===t.id ? 'var(--paper)' : 'linear-gradient(180deg,#3a2820,#2a1c12)',
              border:'1px solid', borderColor: activeTab===t.id ? 'var(--ink-3)' : '#5a4030',
              borderBottom:'none', fontFamily:"'Special Elite',cursive", fontSize:'9px', letterSpacing:'2px',
              textTransform:'uppercase', color: activeTab===t.id ? 'var(--ink)' : 'rgba(180,150,100,.5)',
              cursor:'pointer', clipPath:'polygon(0 25%,10% 0,90% 0,100% 25%,100% 100%,0 100%)',
              whiteSpace:'nowrap', transition:'all .15s'
            }}>
              <span style={{ display:'block', fontSize:'10px', textAlign:'center', marginBottom:'1px' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── CONTENU ── */}
      <main style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 16px 40px' }}>
        <div className="paper-sheet page-in">
          <div className="hole" style={{ top:'50px' }} />
          <div className="hole" style={{ top:'45%' }} />
          <div className="hole" style={{ bottom:'50px' }} />
          {activeTab==='accueil'      && <TabAccueil ranger={ranger} />}
          {activeTab==='organigramme' && <TabOrganigramme canEdit={canEditOrg} snd={snd} />}
          {activeTab==='logistique'   && <TabLogistique snd={snd} />}
          {activeTab==='armes'        && <TabArmes snd={snd} />}
          {activeTab==='comptes'      && <TabComptes snd={snd} />}
          {activeTab==='rapports'     && <TabRapports ranger={ranger} snd={snd} />}
          {activeTab==='admin'        && <TabAdmin isAdmin={isAdmin} ranger={ranger} snd={snd} />}
        </div>
      </main>
    </div>
  )
}

/* ════════ ACCUEIL ════════ */
function TabAccueil({ ranger }) {
  const [stats, setStats] = useState({ rangers:0, volees:0, solde:0, rapports:0 })
  const now = new Date()
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`

  useEffect(()=>{
    async function load() {
      const [{ count:rangers },{ count:volees },{ data:comptes },{ count:rapports }] = await Promise.all([
        supabase.from('rangers').select('*',{count:'exact',head:true}).eq('statut','actif'),
        supabase.from('stock_armes').select('*',{count:'exact',head:true}).eq('statut','volee'),
        supabase.from('comptes').select('montant,operation'),
        supabase.from('rapports').select('*',{count:'exact',head:true}),
      ])
      const solde=(comptes||[]).reduce((s,r)=>r.operation==='ajout'?s+Number(r.montant):s-Number(r.montant),0)
      setStats({ rangers:rangers||0, volees:volees||0, solde, rapports:rapports||0 })
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
        « Bienvenue, {ranger?.grade} {ranger?.prenom_rp} {ranger?.nom_rp}. Tous les Rangers sont priés de vérifier leur équipement avant la prochaine patrouille. »
        <div style={{ marginTop:'8px', fontSize:'10px', letterSpacing:'2px', color:'var(--ink-3)', fontStyle:'normal' }}>— Le Commandant, New Austin · 1900</div>
      </div>
    </div>
  )
}

/* ════════ ORGANIGRAMME ════════ */
function TabOrganigramme({ canEdit, snd }) {
  const [rangers, setRangers] = useState([])
  const [modal, setModal]     = useState(null) // 'edit-member' | 'add-member'
  const [selected, setSelected] = useState(null)
  const [form, setForm]       = useState({ grade:'', pole:'', role_special:'', prenom_rp:'', nom_rp:'' })
  const [msg, setMsg]         = useState('')

  useEffect(()=>{ load() },[])

  async function load() {
    const { data } = await supabase.from('rangers').select('*').eq('statut','actif').order('grade')
    setRangers(data||[])
  }

  function openEdit(r) {
    snd.keyClick()
    setSelected(r)
    setForm({ grade:r.grade, pole:r.pole||'', role_special:r.role_special||'', prenom_rp:r.prenom_rp, nom_rp:r.nom_rp })
    setModal('edit')
  }

  async function saveEdit() {
    snd.carriageReturn()
    const { error } = await supabase.from('rangers').update({
      grade:        form.grade,
      pole:         form.pole||null,
      role_special: form.role_special||null,
      prenom_rp:    form.prenom_rp,
      nom_rp:       form.nom_rp,
    }).eq('id', selected.id)
    if (error) { setMsg('⚠ Erreur : '+error.message); return }
    snd.ding()
    setMsg('✓ Modifié avec succès')
    await load()
    setTimeout(()=>{ setModal(null); setMsg('') }, 1000)
  }

  const byGrade  = (g) => rangers.filter(r=>r.grade===g)
  const byPole   = (p) => rangers.filter(r=>r.pole===p && r.grade!=='commandant')
  const deputies = rangers.filter(r=>r.grade==='deputy')

  const POLES = [
    { id:'logistique',    label:'Pôle Logistique' },
    { id:'operationnel',  label:'Pôle Opérationnel' },
    { id:'admin',         label:'Pôle Admin & Formation' },
  ]

  return (
    <div className="page-in">
      <PageHeader title="Organigramme" sub="Structure hiérarchique — U.S. Rangers">
        {canEdit && <button className="btn btn-primary" onClick={()=>{ snd.keyClick() }}>✎ Modifier un membre</button>}
      </PageHeader>

      {/* Arbre */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', fontFamily:"'Special Elite',cursive", overflowX:'auto' }}>

        {/* Commandant */}
        <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center' }}>
          {byGrade('commandant').length > 0
            ? byGrade('commandant').map(r=>(
                <OrgNode key={r.id} role="Commandant" name={`${r.prenom_rp} ${r.nom_rp}`} isTop onClick={canEdit?()=>openEdit(r):null} />
              ))
            : <OrgNode role="Commandant" name="— Vacant —" isTop />
          }
        </div>
        <div style={{ display:'flex', gap:'80px', flexWrap:'wrap', justifyContent:'center', marginTop:'0' }}>
          {byGrade('capitaine_wallace').concat([null]).slice(0,1).map((_,i)=>(
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <VLine />
              <OrgNode role="Capitaine — Fort Wallace" name="— Vacant —" />
            </div>
          ))}
          {byGrade('capitaine_mercer').concat([null]).slice(0,1).map((_,i)=>(
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <VLine />
              <OrgNode role="Capitaine — Fort Mercer" name="— Vacant —" />
            </div>
          ))}
        </div>

        {/* Pôles */}
        <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center', marginTop:'0' }}>
          {POLES.map(pole=>{
            const lts     = byPole(pole.id).filter(r=>r.grade==='lieutenant')
            const members = byPole(pole.id).filter(r=>r.grade!=='lieutenant')
            return (
              <div key={pole.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:'160px' }}>
                <VLine />
                <div style={{ fontSize:'8px', letterSpacing:'3px', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:'6px', borderBottom:'1px solid rgba(106,74,26,.3)', paddingBottom:'4px', width:'100%', textAlign:'center' }}>
                  {pole.label}
                </div>
                {lts.length>0 ? lts.map(r=>(
                  <OrgNode key={r.id} role="Lieutenant" name={`${r.prenom_rp} ${r.nom_rp}`} onClick={canEdit?()=>openEdit(r):null} />
                )) : <OrgNode role="Lieutenant" name="— Vacant —" />}
                {members.map(r=>(
                  <div key={r.id} onClick={canEdit?()=>openEdit(r):null} style={{ fontSize:'11px', letterSpacing:'1px', color:'var(--ink-2)', padding:'4px 8px', borderBottom:'1px dashed rgba(160,130,70,.2)', width:'100%', textAlign:'center', cursor:canEdit?'pointer':'default', transition:'background .15s' }}
                    onMouseEnter={e=>canEdit&&(e.currentTarget.style.background='rgba(180,150,80,.1)')}
                    onMouseLeave={e=>canEdit&&(e.currentTarget.style.background='')}>
                    <span style={{ fontSize:'8px', color:'var(--ink-3)', display:'block' }}>{r.grade}{r.role_special?` — ${r.role_special}`:''}</span>
                    {r.prenom_rp} {r.nom_rp}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Deputies */}
        {deputies.length>0 && (
          <>
            <VLine />
            <div style={{ fontSize:'8px', letterSpacing:'3px', textTransform:'uppercase', color:'var(--ink-3)', margin:'4px 0 10px', borderBottom:'1px solid rgba(106,74,26,.3)', paddingBottom:'4px', minWidth:'200px', textAlign:'center' }}>Deputies</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center' }}>
              {deputies.map(r=>(
                <div key={r.id} onClick={canEdit?()=>openEdit(r):null} style={{ fontSize:'11px', letterSpacing:'1px', color:'var(--ink-2)', padding:'4px 12px', border:'1px solid rgba(160,130,70,.3)', minWidth:'130px', textAlign:'center', cursor:canEdit?'pointer':'default', fontFamily:"'Special Elite',cursive", transition:'all .15s' }}
                  onMouseEnter={e=>canEdit&&(e.currentTarget.style.background='rgba(180,150,80,.1)')}
                  onMouseLeave={e=>canEdit&&(e.currentTarget.style.background='')}>
                  {r.prenom_rp} {r.nom_rp}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {canEdit && (
        <div style={{ marginTop:'20px', fontSize:'10px', color:'var(--ink-3)', fontStyle:'italic', textAlign:'center' }}>
          ✎ Cliquez sur un membre pour modifier son grade, pôle ou rôle
        </div>
      )}

      {/* Modal édition */}
      {modal==='edit' && selected && (
        <Modal title={`Modifier — ${selected.prenom_rp} ${selected.nom_rp}`} onClose={()=>setModal(null)}>
          {msg && <div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <Field label="Prénom (RP)">
            <input type="text" value={form.prenom_rp} onChange={e=>{setForm(f=>({...f,prenom_rp:e.target.value}));snd.keyClick()}} />
          </Field>
          <Field label="Nom (RP)">
            <input type="text" value={form.nom_rp} onChange={e=>{setForm(f=>({...f,nom_rp:e.target.value}));snd.keyClick()}} />
          </Field>
          <Field label="Grade">
            <select value={form.grade} onChange={e=>{setForm(f=>({...f,grade:e.target.value}));snd.keyClick()}}>
              <option value="commandant">Commandant</option>
              <option value="lieutenant">Lieutenant</option>
              <option value="sergent">Sergent</option>
              <option value="confirme">Confirmé</option>
              <option value="deputy">Deputy</option>
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
          <Field label="Rôle spécial">
            <input type="text" value={form.role_special} onChange={e=>{setForm(f=>({...f,role_special:e.target.value}));snd.keyClick()}} placeholder="ex: Œil de lynx, Cynophile..." />
          </Field>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={saveEdit}>✓ Enregistrer</button>
            <button className="btn" onClick={()=>setModal(null)}>✕ Annuler</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ LOGISTIQUE ════════ */
function TabLogistique({ snd }) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm]     = useState({ article:'', categorie:'Papeterie', qte_wallace:0, qte_blackwater:0, qte_mercer:0, qte_armadillo:0, min_blackwater:0 })
  const [msg, setMsg]       = useState('')

  useEffect(()=>{ load() },[])
  async function load() {
    const { data } = await supabase.from('logistique').select('*').order('categorie')
    setItems(data||[]); setLoading(false)
  }

  function openAdd() {
    snd.keyClick()
    setEditItem(null)
    setForm({ article:'', categorie:'Papeterie', qte_wallace:0, qte_blackwater:0, qte_mercer:0, qte_armadillo:0, min_blackwater:0 })
    setModal(true)
  }

  function openEdit(item) {
    snd.keyClick()
    setEditItem(item)
    setForm({ article:item.article, categorie:item.categorie, qte_wallace:item.qte_wallace, qte_blackwater:item.qte_blackwater, qte_mercer:item.qte_mercer, qte_armadillo:item.qte_armadillo, min_blackwater:item.min_blackwater })
    setModal(true)
  }

  async function save() {
    snd.carriageReturn()
    if (!form.article) { setMsg('⚠ Article requis'); return }
    let error
    if (editItem) {
      ({ error } = await supabase.from('logistique').update(form).eq('id', editItem.id))
    } else {
      ({ error } = await supabase.from('logistique').insert(form))
    }
    if (error) { setMsg('⚠ '+error.message); return }
    snd.ding(); setMsg('✓ Enregistré')
    await load()
    setTimeout(()=>{ setModal(false); setMsg('') }, 800)
  }

  async function deleteItem(id) {
    if (!confirm('Supprimer cet article ?')) return
    snd.carriageReturn()
    await supabase.from('logistique').delete().eq('id', id)
    await load()
  }

  const CATS = ['Papeterie','Armurerie','Fourniture','Alimentaire','Soins']

  return (
    <div className="page-in">
      <PageHeader title="Logistique" sub="Inventaire des fournitures par poste">
        <button className="btn btn-primary" onClick={openAdd}>+ Ajouter un article</button>
      </PageHeader>
      {loading ? <Loader /> : (
        <table className="register-table">
          <thead>
            <tr>
              <th>Article</th><th>Catégorie</th><th>Fort Wallace</th><th>Bur. Blackwater</th><th>Fort Mercer</th><th>Camp Armadillo</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item=>(
              <tr key={item.id}>
                <td>{item.article}</td>
                <td>{item.categorie}</td>
                <td>{item.qte_wallace}</td>
                <td style={{ color:item.qte_blackwater<item.min_blackwater?'var(--red)':'inherit' }}>
                  {item.qte_blackwater}{item.min_blackwater>0?` (${item.min_blackwater})`:''}
                </td>
                <td>{item.qte_mercer}</td>
                <td>{item.qte_armadillo||'—'}</td>
                <td style={{ display:'flex', gap:'4px' }}>
                  <button className="btn" style={{ padding:'2px 8px', fontSize:'9px' }} onClick={()=>openEdit(item)}>✎</button>
                  <button className="btn btn-danger" style={{ padding:'2px 8px', fontSize:'9px' }} onClick={()=>deleteItem(item.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ fontSize:'10px', color:'var(--ink-3)', fontStyle:'italic' }}>* Parenthèses = stock minimum requis</div>

      {modal && (
        <Modal title={editItem?`Modifier — ${editItem.article}`:'Nouvel article'} onClose={()=>setModal(false)}>
          {msg && <div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <Field label="Nom de l'article">
            <input type="text" value={form.article} onChange={e=>{setForm(f=>({...f,article:e.target.value}));snd.keyClick()}} placeholder="ex: Carnet d'amendes" />
          </Field>
          <Field label="Catégorie">
            <select value={form.categorie} onChange={e=>{setForm(f=>({...f,categorie:e.target.value}));snd.keyClick()}}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="two-col">
            <Field label="Fort Wallace"><input type="number" value={form.qte_wallace} onChange={e=>{setForm(f=>({...f,qte_wallace:+e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Bur. Blackwater"><input type="number" value={form.qte_blackwater} onChange={e=>{setForm(f=>({...f,qte_blackwater:+e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Fort Mercer"><input type="number" value={form.qte_mercer} onChange={e=>{setForm(f=>({...f,qte_mercer:+e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Camp Armadillo"><input type="number" value={form.qte_armadillo} onChange={e=>{setForm(f=>({...f,qte_armadillo:+e.target.value}));snd.keyClick()}} /></Field>
          </div>
          <Field label="Stock min. Blackwater">
            <input type="number" value={form.min_blackwater} onChange={e=>{setForm(f=>({...f,min_blackwater:+e.target.value}));snd.keyClick()}} />
          </Field>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save}>✓ Enregistrer</button>
            <button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ ARMES ════════ */
function TabArmes({ snd }) {
  const [armes, setArmes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [editArme, setEditArme] = useState(null)
  const [rangers, setRangers] = useState([])
  const [form, setForm]     = useState({ type_arme:'', numero_serie:'', date_fabrication:'', emplacement:'', statut:'en_stock', affecte_a:'' })
  const [msg, setMsg]       = useState('')

  useEffect(()=>{ load() },[])
  async function load() {
    const [{ data:a },{ data:r }] = await Promise.all([
      supabase.from('stock_armes').select('*, ranger:affecte_a(prenom_rp,nom_rp)').order('type_arme'),
      supabase.from('rangers').select('id,prenom_rp,nom_rp').eq('statut','actif'),
    ])
    setArmes(a||[]); setRangers(r||[]); setLoading(false)
  }

  function openAdd() {
    snd.keyClick()
    setEditArme(null)
    setForm({ type_arme:'', numero_serie:'', date_fabrication:'', emplacement:'Registre Blackwater', statut:'en_stock', affecte_a:'' })
    setModal(true)
  }

  function openEdit(a) {
    snd.keyClick()
    setEditArme(a)
    setForm({ type_arme:a.type_arme, numero_serie:a.numero_serie, date_fabrication:a.date_fabrication||'', emplacement:a.emplacement||'', statut:a.statut, affecte_a:a.affecte_a||'' })
    setModal(true)
  }

  async function save() {
    snd.carriageReturn()
    if (!form.type_arme||!form.numero_serie) { setMsg('⚠ Type et numéro requis'); return }
    const payload = { type_arme:form.type_arme, numero_serie:form.numero_serie, date_fabrication:form.date_fabrication||null, emplacement:form.emplacement||null, statut:form.statut, affecte_a:form.affecte_a||null }
    let error
    if (editArme) {
      ({ error } = await supabase.from('stock_armes').update(payload).eq('id',editArme.id))
    } else {
      ({ error } = await supabase.from('stock_armes').insert(payload))
    }
    if (error) { setMsg('⚠ '+error.message); return }
    snd.ding(); setMsg('✓ Enregistré')
    await load()
    setTimeout(()=>{ setModal(false); setMsg('') }, 800)
  }

  async function deleteArme(id) {
    if (!confirm('Supprimer cette arme ?')) return
    snd.carriageReturn()
    await supabase.from('stock_armes').delete().eq('id',id)
    await load()
  }

  const TYPES = ['Cattleman','Navy','Winchester','Springfield','Pompe','Verrou','Rolling Block','Autre']
  const EMPLACEMENTS = ['Registre Blackwater','Registre Wallace','Fort Mercer','Camp Armadillo']
  const volees=armes.filter(a=>a.statut==='volee').length
  const affectees=armes.filter(a=>a.statut==='affectee').length

  return (
    <div className="page-in">
      <PageHeader title="Stock d'Armes" sub="Registre des armes à feu — U.S. Rangers">
        <div className="btn-row" style={{ margin:0 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ Enregistrer</button>
          <button className="btn btn-danger" onClick={()=>{ snd.keyClick(); setForm(f=>({...f,statut:'volee'})); setEditArme(null); setModal(true) }}>⚠ Signaler un vol</button>
        </div>
      </PageHeader>
      <div className="info-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        <StatCard label="Total" value={armes.length} sub="armes enregistrées" />
        <StatCard label="Volées" value={volees} sub={volees>0?'En investigation':'Aucune alerte'} accent={volees>0?'red':''} />
        <StatCard label="Affectées" value={affectees} sub="à des Rangers" />
      </div>
      {loading ? <Loader /> : (
        <table className="register-table">
          <thead><tr><th>Type</th><th>N° Série</th><th>Date fab.</th><th>Emplacement</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {armes.map(a=>(
              <tr key={a.id} style={a.statut==='volee'?{background:'rgba(139,26,26,.06)'}:{}}>
                <td><strong>{a.type_arme}</strong></td>
                <td style={{ letterSpacing:'2px' }}>{a.numero_serie}</td>
                <td>{a.date_fabrication?new Date(a.date_fabrication).toLocaleDateString('fr-FR'):'—'}</td>
                <td>{a.ranger?`${a.ranger.prenom_rp} ${a.ranger.nom_rp}`:(a.emplacement||'—')}</td>
                <td><span className={`status-badge ${a.statut==='en_stock'?'status-ok':a.statut==='volee'?'status-vol':'status-att'}`}>{a.statut==='en_stock'?'En stock':a.statut==='volee'?'⚠ VOLÉE':'Affectée'}</span></td>
                <td style={{ display:'flex', gap:'4px' }}>
                  <button className="btn" style={{ padding:'2px 8px', fontSize:'9px' }} onClick={()=>openEdit(a)}>✎</button>
                  <button className="btn btn-danger" style={{ padding:'2px 8px', fontSize:'9px' }} onClick={()=>deleteArme(a.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <Modal title={editArme?`Modifier — ${editArme.type_arme} ${editArme.numero_serie}`:'Nouvelle arme'} onClose={()=>setModal(false)}>
          {msg && <div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div className="two-col">
            <Field label="Type d'arme">
              <select value={form.type_arme} onChange={e=>{setForm(f=>({...f,type_arme:e.target.value}));snd.keyClick()}}>
                <option value="">— Sélectionner —</option>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="N° de série">
              <input type="text" value={form.numero_serie} onChange={e=>{setForm(f=>({...f,numero_serie:e.target.value}));snd.keyClick()}} placeholder="147600" />
            </Field>
          </div>
          <div className="two-col">
            <Field label="Date de fabrication">
              <input type="date" value={form.date_fabrication} onChange={e=>{setForm(f=>({...f,date_fabrication:e.target.value}));snd.keyClick()}} />
            </Field>
            <Field label="Statut">
              <select value={form.statut} onChange={e=>{setForm(f=>({...f,statut:e.target.value}));snd.keyClick()}}>
                <option value="en_stock">En stock</option>
                <option value="affectee">Affectée</option>
                <option value="volee">Volée</option>
                <option value="hors_service">Hors service</option>
              </select>
            </Field>
          </div>
          {form.statut==='affectee' ? (
            <Field label="Affectée à">
              <select value={form.affecte_a} onChange={e=>{setForm(f=>({...f,affecte_a:e.target.value}));snd.keyClick()}}>
                <option value="">— Sélectionner un Ranger —</option>
                {rangers.map(r=><option key={r.id} value={r.id}>{r.prenom_rp} {r.nom_rp}</option>)}
              </select>
            </Field>
          ) : (
            <Field label="Emplacement">
              <select value={form.emplacement} onChange={e=>{setForm(f=>({...f,emplacement:e.target.value}));snd.keyClick()}}>
                {EMPLACEMENTS.map(e=><option key={e}>{e}</option>)}
              </select>
            </Field>
          )}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save}>✓ Enregistrer</button>
            <button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ COMPTES ════════ */
function TabComptes({ snd }) {
  const { ranger } = useAuth()
  const [ops, setOps]       = useState([])
  const [solde, setSolde]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [modal, setModal]   = useState(false)
  const [type, setType]     = useState('ajout')
  const [form, setForm]     = useState({ objet:'', nom_prenom:'', type_permis:'', montant:'' })
  const [msg, setMsg]       = useState('')

  useEffect(()=>{ load() },[])
  async function load() {
    const { data } = await supabase.from('comptes').select('*, ranger:enregistre_par(prenom_rp,nom_rp)').order('date_op',{ascending:false}).limit(50)
    const d=data||[]
    setOps(d)
    setSolde(d.reduce((s,r)=>r.operation==='ajout'?s+Number(r.montant):s-Number(r.montant),0))
    setLoading(false)
  }

  function openModal(t) { snd.keyClick(); setType(t); setForm({ objet:'', nom_prenom:'', type_permis:'', montant:'' }); setMsg(''); setModal(true) }

  async function save() {
    snd.carriageReturn()
    if (!form.objet||!form.montant) { setMsg('⚠ Objet et montant requis'); return }
    const { error } = await supabase.from('comptes').insert({
      objet:         form.objet,
      nom_prenom:    form.nom_prenom||null,
      type_permis:   form.type_permis||null,
      montant:       parseFloat(form.montant),
      operation:     type,
      date_op:       new Date().toISOString().split('T')[0],
      enregistre_par: ranger?.id,
    })
    if (error) { setMsg('⚠ '+error.message); return }
    snd.ding(); setMsg('✓ Opération enregistrée')
    await load()
    setTimeout(()=>{ setModal(false); setMsg('') }, 800)
  }

  const PERMIS = ['','Permis Mine','Permis Chasse','Permis Pêche','Permis Chasse et Pêche','Permis Coupe','Nourriture','Équipements Divers','Publicité','Autre']

  return (
    <div className="page-in">
      <PageHeader title="Gestion des Comptes" sub="État financier du Bureau">
        <div className="btn-row" style={{ margin:0 }}>
          <button className="btn btn-success" onClick={()=>openModal('ajout')}>+ Entrée</button>
          <button className="btn btn-danger"  onClick={()=>openModal('retrait')}>− Sortie</button>
        </div>
      </PageHeader>

      <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'clamp(24px,5vw,38px)', color:'var(--ink)', letterSpacing:'4px', padding:'14px 18px', border:'2px solid var(--ink)', display:'inline-block', position:'relative', marginBottom:'20px' }}>
        <span style={{ position:'absolute', top:'-10px', left:'10px', background:'var(--paper)', padding:'0 6px', fontSize:'9px', letterSpacing:'3px', color:'var(--ink-3)' }}>SOLDE ACTUEL</span>
        {solde.toFixed(2)} $
      </div>

      {loading ? <Loader /> : (
        <table className="register-table">
          <thead><tr><th>Date</th><th>Objet</th><th>Nom</th><th>Par</th><th>Type</th><th>Montant</th><th>Op.</th></tr></thead>
          <tbody>
            {ops.map(op=>(
              <tr key={op.id}>
                <td>{new Date(op.date_op).toLocaleDateString('fr-FR')}</td>
                <td>{op.objet}</td>
                <td>{op.nom_prenom||'—'}</td>
                <td>{op.ranger?`${op.ranger.prenom_rp}`:op.enregistre_par?'—':'Sys.'}</td>
                <td>{op.type_permis||'—'}</td>
                <td>{Number(op.montant).toFixed(2)} $</td>
                <td><span className={`status-badge ${op.operation==='ajout'?'status-ok':'status-vol'}`} style={{ border:'1px solid', padding:'1px 6px', fontSize:'9px', fontFamily:"'Special Elite',cursive" }}>{op.operation==='ajout'?'Ajout':'Retrait'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <Modal title={type==='ajout'?'Nouvelle entrée':'Nouvelle sortie'} onClose={()=>setModal(false)}>
          {msg && <div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <Field label="Objet / Description">
            <input type="text" value={form.objet} onChange={e=>{setForm(f=>({...f,objet:e.target.value}));snd.keyClick()}} placeholder="ex: Don de la Marshall" />
          </Field>
          <div className="two-col">
            <Field label="Nom / Prénom (si applicable)">
              <input type="text" value={form.nom_prenom} onChange={e=>{setForm(f=>({...f,nom_prenom:e.target.value}));snd.keyClick()}} placeholder="DUPONT Jean" />
            </Field>
            <Field label="Type / Permis">
              <select value={form.type_permis} onChange={e=>{setForm(f=>({...f,type_permis:e.target.value}));snd.keyClick()}}>
                {PERMIS.map(p=><option key={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label={`Montant ($) — ${type==='ajout'?'Entrée':'Sortie'}`}>
            <input type="number" step="0.01" value={form.montant} onChange={e=>{setForm(f=>({...f,montant:e.target.value}));snd.keyClick()}} placeholder="0.00" style={{ fontSize:'20px', fontWeight:700 }} />
          </Field>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={save}>✓ Enregistrer</button>
            <button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ RAPPORTS ════════ */
function TabRapports({ ranger, snd }) {
  const [rapports, setRapports] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [viewModal, setViewModal] = useState(null)
  const [form, setForm]         = useState({ type_rapport:'Déposition', destinataires:'', comtes:'', date_faits:'', contenu:'', elements_supp:'' })
  const [msg, setMsg]           = useState('')

  useEffect(()=>{ load() },[])
  async function load() {
    const { data } = await supabase.from('rapports').select('*, ranger:redacteur_id(prenom_rp,nom_rp)').order('created_at',{ascending:false})
    setRapports(data||[]); setLoading(false)
  }

  async function submit() {
    snd.carriageReturn()
    if (!form.contenu) { setMsg('⚠ Contenu obligatoire'); return }
    const telNum = String(Math.floor(5000+Math.random()*4999))
    const { error } = await supabase.from('rapports').insert({
      numero_telegram: telNum, type_rapport:form.type_rapport,
      destinataires: form.destinataires.split('·').map(s=>s.trim()).filter(Boolean),
      comtes: form.comtes.split('·').map(s=>s.trim()).filter(Boolean),
      date_faits: form.date_faits||null, contenu:form.contenu,
      elements_supp:form.elements_supp, redacteur_id:ranger?.id, statut:'soumis', origine:'U.S. Rangers',
    })
    if (error) { setMsg('⚠ '+error.message); return }
    snd.ding(); setMsg(`✓ Rapport soumis — Télégramme n° ${telNum}`)
    await load()
    setTimeout(()=>{ setModal(false); setMsg('') }, 1000)
  }

  return (
    <div className="page-in">
      <PageHeader title="Rapports" sub="Registre des rapports officiels">
        <button className="btn btn-primary" onClick={()=>{ snd.keyClick(); setForm({ type_rapport:'Déposition', destinataires:'', comtes:'', date_faits:'', contenu:'', elements_supp:'' }); setMsg(''); setModal(true) }}>+ Rédiger</button>
      </PageHeader>
      {loading ? <Loader /> : (
        <table className="register-table">
          <thead><tr><th>N° Télég.</th><th>Date</th><th>Type</th><th>Rédacteur</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {rapports.map(r=>(
              <tr key={r.id}>
                <td style={{ letterSpacing:'2px' }}>{r.numero_telegram}</td>
                <td>{r.date_faits?new Date(r.date_faits).toLocaleDateString('fr-FR'):'—'}</td>
                <td>{r.type_rapport}</td>
                <td>{r.ranger?`${r.ranger.prenom_rp} ${r.ranger.nom_rp}`:'—'}</td>
                <td><span className={`status-badge ${r.statut==='archive'?'status-ok':'status-att'}`}>{r.statut}</span></td>
                <td><button className="btn" style={{ padding:'2px 10px', fontSize:'9px' }} onClick={()=>{ snd.keyClick(); setViewModal(r) }}>▶ Lire</button></td>
              </tr>
            ))}
            {rapports.length===0&&<tr><td colSpan="6" style={{ textAlign:'center', fontStyle:'italic', color:'var(--ink-3)', padding:'20px' }}>Aucun rapport archivé.</td></tr>}
          </tbody>
        </table>
      )}

      {/* Modal rédaction */}
      {modal && (
        <Modal title="Nouveau Rapport" onClose={()=>setModal(false)}>
          {msg && <div className={msg.startsWith('⚠')?'msg-error':'msg-success'}>{msg}</div>}
          <div className="two-col">
            <Field label="Type"><select value={form.type_rapport} onChange={e=>{setForm(f=>({...f,type_rapport:e.target.value}));snd.keyClick()}}>
              {['Déposition','Rapport d\'intervention','Rapport de patrouille','Rapport d\'incident','Note interne'].map(t=><option key={t}>{t}</option>)}
            </select></Field>
            <Field label="Date des faits"><input type="text" placeholder="14/04/1900 — 20h00" value={form.date_faits} onChange={e=>{setForm(f=>({...f,date_faits:e.target.value}));snd.keyClick()}} /></Field>
          </div>
          <div className="two-col">
            <Field label="Destinataires (séparés par ·)"><input type="text" placeholder="U.S. Rangers · U.S. Marshals" value={form.destinataires} onChange={e=>{setForm(f=>({...f,destinataires:e.target.value}));snd.keyClick()}} /></Field>
            <Field label="Comtés (séparés par ·)"><input type="text" placeholder="New Austin · Cholla Springs" value={form.comtes} onChange={e=>{setForm(f=>({...f,comtes:e.target.value}));snd.keyClick()}} /></Field>
          </div>
          <Field label="Contenu ★"><textarea value={form.contenu} onChange={e=>{setForm(f=>({...f,contenu:e.target.value}));snd.keyClick()}} placeholder="Je soussigné(e)..." /></Field>
          <Field label="Éléments supplémentaires"><textarea style={{ minHeight:'80px' }} value={form.elements_supp} onChange={e=>{setForm(f=>({...f,elements_supp:e.target.value}));snd.keyClick()}} placeholder="Pièces à conviction..." /></Field>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={submit}>▶ Soumettre</button>
            <button className="btn" onClick={()=>setModal(false)}>✕ Annuler</button>
          </div>
        </Modal>
      )}

      {/* Modal lecture */}
      {viewModal && (
        <Modal title={`Rapport n° ${viewModal.numero_telegram}`} onClose={()=>setViewModal(null)}>
          <div style={{ fontSize:'11px', lineHeight:'24px', color:'var(--ink-2)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px', fontSize:'10px', color:'var(--ink-3)' }}>
              <div><strong>Type :</strong> {viewModal.type_rapport}</div>
              <div><strong>Date :</strong> {viewModal.date_faits||'—'}</div>
              <div><strong>Rédacteur :</strong> {viewModal.ranger?`${viewModal.ranger.prenom_rp} ${viewModal.ranger.nom_rp}`:'—'}</div>
              <div><strong>Statut :</strong> {viewModal.statut}</div>
            </div>
            <div style={{ borderTop:'1px solid var(--ink-3)', paddingTop:'12px', whiteSpace:'pre-wrap', fontStyle:'italic' }}>{viewModal.contenu}</div>
            {viewModal.elements_supp && <div style={{ marginTop:'12px', borderTop:'1px solid rgba(106,74,26,.3)', paddingTop:'8px', fontSize:'10px', color:'var(--ink-3)' }}>{viewModal.elements_supp}</div>}
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ════════ ADMIN ════════ */
function TabAdmin({ isAdmin, ranger: currentRanger, snd }) {
  const [pending, setPending] = useState([])
  const [actifs, setActifs]   = useState([])
  const [codes, setCodes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg]         = useState('')

  useEffect(()=>{ load() },[])
  async function load() {
    const [{ data:p },{ data:a },{ data:c }] = await Promise.all([
      supabase.from('rangers').select('*').eq('statut','en_attente'),
      supabase.from('rangers').select('*').eq('statut','actif').order('grade'),
      supabase.from('codes_invitation').select('*, cree:cree_par(prenom_rp,nom_rp)').order('created_at',{ascending:false}),
    ])
    setPending(p||[]); setActifs(a||[]); setCodes(c||[]); setLoading(false)
  }

  async function approuver(id) {
    snd.stamp()
    await supabase.from('rangers').update({ statut:'actif' }).eq('id',id)
    await load(); setMsg('✓ Ranger validé')
  }

  async function refuser(id) {
    snd.carriageReturn()
    await supabase.from('rangers').update({ statut:'suspendu' }).eq('id',id)
    await load(); setMsg('✓ Demande refusée')
  }

  async function toggleAdmin(r) {
    if (!isAdmin) return
    snd.keyClick()
    const newVal = !r.is_admin
    await supabase.from('rangers').update({ is_admin:newVal }).eq('id',r.id)
    await load()
    setMsg(`✓ ${r.prenom_rp} ${newVal?'est maintenant Admin':'n\'est plus Admin'}`)
  }

  async function genererCode() {
    snd.ding()
    const code = 'USR-'+Math.floor(1000+Math.random()*8999)
    await supabase.from('codes_invitation').insert({ code, utilise:false, cree_par:currentRanger?.id })
    await load()
  }

  if (loading) return <Loader />

  return (
    <div className="page-in">
      <PageHeader title="Administration" sub="Gestion des accès — U.S. Rangers" />
      {msg && <div className="msg-success" style={{ marginBottom:'16px' }}>{msg}</div>}

      {/* Demandes en attente */}
      <div className="section-title">⏳ Demandes en attente ({pending.length})</div>
      {pending.length===0 && <div style={{ color:'var(--ink-3)', fontStyle:'italic', fontSize:'12px', marginBottom:'16px' }}>Aucune demande en attente.</div>}
      {pending.map(r=>(
        <div key={r.id} style={{ border:'1px solid rgba(160,130,70,.35)', padding:'14px 16px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'14px', background:'rgba(180,150,80,.04)', flexWrap:'wrap' }}>
          <div style={{ width:'44px', height:'44px', border:'1.5px solid var(--ink-3)', background:'var(--paper-aged)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0, overflow:'hidden' }}>
            {r.photo_url?<img src={r.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />:'👤'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'14px', letterSpacing:'2px' }}>{r.prenom_rp} {r.nom_rp}</div>
            <div style={{ fontSize:'10px', color:'var(--ink-3)', marginTop:'2px' }}>
              BP : <strong>{r.bp}</strong> · Grade : <span className={`grade-badge grade-${r.grade}`}>{r.grade}</span> · Code : {r.code_invite} · {new Date(r.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="btn btn-success" style={{ padding:'5px 12px', fontSize:'9px' }} onClick={()=>approuver(r.id)}>✓ Valider</button>
            <button className="btn btn-danger"  style={{ padding:'5px 12px', fontSize:'9px' }} onClick={()=>refuser(r.id)}>✕ Refuser</button>
          </div>
        </div>
      ))}

      {/* Rangers actifs */}
      <div className="section-title">✓ Rangers actifs ({actifs.length})</div>
      <table className="register-table">
        <thead><tr><th>Nom</th><th>BP</th><th>Grade</th><th>Pôle</th><th>Admin</th>{isAdmin&&<th>Actions</th>}</tr></thead>
        <tbody>
          {actifs.map(r=>(
            <tr key={r.id}>
              <td>{r.prenom_rp} {r.nom_rp}</td>
              <td style={{ letterSpacing:'2px', fontWeight:700 }}>{r.bp}</td>
              <td><span className={`grade-badge grade-${r.grade}`}>{r.grade}</span></td>
              <td>{r.pole||'—'}</td>
              <td>
                {r.is_admin
                  ? <span style={{ color:'var(--red)', fontFamily:"'Special Elite',cursive", fontSize:'10px', letterSpacing:'2px' }}>★ Admin</span>
                  : <span style={{ color:'var(--ink-3)', fontSize:'10px' }}>—</span>
                }
              </td>
              {isAdmin && (
                <td>
                  {r.id !== currentRanger?.id && (
                    <button className={`btn ${r.is_admin?'btn-danger':'btn-success'}`} style={{ padding:'3px 10px', fontSize:'9px' }} onClick={()=>toggleAdmin(r)}>
                      {r.is_admin?'Retirer Admin':'Donner Admin'}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Codes d'invitation */}
      <div className="section-title">🔑 Codes d'invitation</div>
      <div className="btn-row"><button className="btn btn-primary" onClick={genererCode}>+ Générer un code</button></div>
      <table className="register-table">
        <thead><tr><th>Code</th><th>Créé par</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>
          {codes.map(c=>(
            <tr key={c.id}>
              <td style={{ letterSpacing:'3px', fontWeight:700 }}>{c.code}</td>
              <td>{c.cree?`${c.cree.prenom_rp}`:'Admin'}</td>
              <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
              <td><span className={`status-badge ${c.utilise?'status-att':'status-ok'}`}>{c.utilise?'Utilisé':'Disponible'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Composants utilitaires ── */
function PageHeader({ title, sub, right, children }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'16px', borderBottom:'2px solid var(--ink)', gap:'12px', flexWrap:'wrap' }}>
      <div>
        <div style={{ fontFamily:"'Special Elite',cursive", fontSize:'clamp(18px,4vw,26px)', letterSpacing:'4px', textTransform:'uppercase' }}>{title}</div>
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
      <div className="card-value" style={{ fontSize:small?'18px':'22px', color:accent==='red'?'var(--red)':'' }}>{value}</div>
      <div className="card-sub">{sub}</div>
    </div>
  )
}

function OrgNode({ role, name, isTop, onClick }) {
  return (
    <div onClick={onClick} style={{ border:`${isTop?'2':'1.5'}px solid ${isTop?'var(--red)':'var(--ink-2)'}`, padding:'8px 18px', textAlign:'center', background:'rgba(180,150,80,.07)', minWidth:'180px', cursor:onClick?'pointer':'default', transition:'all .15s', marginBottom:'0' }}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.background='rgba(180,150,80,.15)')}
      onMouseLeave={e=>onClick&&(e.currentTarget.style.background='rgba(180,150,80,.07)')}>
      <span style={{ fontSize:'8px', letterSpacing:'3px', textTransform:'uppercase', color:isTop?'var(--red)':'var(--ink-3)', display:'block' }}>{role}</span>
      <span style={{ fontSize:'14px', letterSpacing:'2px', color:isTop?'var(--red)':'var(--ink)', display:'block', marginTop:'2px', fontFamily:"'Special Elite',cursive" }}>{name}</span>
    </div>
  )
}

function VLine() {
  return <div style={{ width:'1.5px', height:'22px', background:'var(--ink-2)', opacity:0.5, margin:'0 auto' }} />
}

function Loader() {
  return <div style={{ textAlign:'center', padding:'40px 0', color:'var(--ink-3)', fontStyle:'italic', fontSize:'12px', letterSpacing:'2px' }}>Chargement du registre...</div>
}
