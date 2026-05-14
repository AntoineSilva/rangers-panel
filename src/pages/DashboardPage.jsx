import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { useTypewriterSound } from '../hooks/useTypewriterSound'

// ── Onglets disponibles ──
const TABS = [
  { id: 'accueil',       label: 'Accueil',       icon: '🏠' },
  { id: 'organigramme',  label: 'Organigramme',  icon: '🌿' },
  { id: 'logistique',    label: 'Logistique',    icon: '📦' },
  { id: 'armes',         label: 'Stock Armes',   icon: '🔫' },
  { id: 'comptes',       label: 'Comptes',       icon: '💰' },
  { id: 'rapports',      label: 'Rapports',      icon: '📄' },
  { id: 'admin',         label: 'Admin',         icon: '⚙',  adminOnly: true },
]

export default function DashboardPage() {
  const { ranger, signOut, isOfficier } = useAuth()
  const snd = useTypewriterSound()
  const [activeTab, setActiveTab] = useState('accueil')

  function switchTab(id) {
    snd.carriageReturn()
    setActiveTab(id)
  }

  const visibleTabs = TABS.filter(t => !t.adminOnly || isOfficier)

  return (
    <div>
      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(180deg,var(--metal-l) 0%,var(--metal) 60%,#180e08 100%)',
        borderBottom: '3px solid #0a0604',
        padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '52px', borderBottom: '1px solid rgba(90,64,48,.5)' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px', filter: 'sepia(1) brightness(.6)' }}>⭐</span>
            <div>
              <div style={{ fontFamily: "'Special Elite',cursive", fontSize: '13px', letterSpacing: '4px', color: 'var(--chrome)', textTransform: 'uppercase' }}>U.S. Rangers</div>
              <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(180,150,100,.4)', textTransform: 'uppercase' }}>Bureau de Commandement — New Austin</div>
            </div>
          </div>

          {/* Ranger info + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Special Elite',cursive", fontSize: '12px', letterSpacing: '2px', color: 'var(--chrome)' }}>
                {ranger?.prenom_rp} {ranger?.nom_rp}
              </div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: 'rgba(180,150,100,.45)', textTransform: 'uppercase' }}>
                {ranger?.grade}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--paper-dark)', overflow: 'hidden', background: 'var(--metal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--chrome)', filter: 'sepia(.4)', flexShrink: 0 }}>
              {ranger?.photo_url ? <img src={ranger.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <button onClick={signOut} style={{ background: 'none', border: '1px solid rgba(139,26,26,.4)', color: 'rgba(139,26,26,.7)', padding: '4px 10px', fontFamily: "'Special Elite',cursive", fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Quitter
            </button>
          </div>
        </div>

        {/* Onglets */}
        <nav style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '8px 0 0', overflowX: 'auto' }}>
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => switchTab(t.id)} style={{
              flexShrink: 0, padding: activeTab === t.id ? '8px 14px 12px' : '8px 14px 10px',
              background: activeTab === t.id ? 'var(--paper)' : 'linear-gradient(180deg,#3a2820,#2a1c12)',
              border: '1px solid', borderColor: activeTab === t.id ? 'var(--ink-3)' : '#5a4030',
              borderBottom: 'none',
              fontFamily: "'Special Elite',cursive", fontSize: '10px', letterSpacing: '2px',
              textTransform: 'uppercase',
              color: activeTab === t.id ? 'var(--ink)' : 'rgba(180,150,100,.5)',
              cursor: 'pointer',
              clipPath: 'polygon(0 25%,10% 0,90% 0,100% 25%,100% 100%,0 100%)',
              whiteSpace: 'nowrap',
              zIndex: activeTab === t.id ? 2 : 1, position: 'relative',
              transition: 'all .15s'
            }}>
              <span style={{ display: 'block', fontSize: '11px', textAlign: 'center', marginBottom: '1px' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── CONTENU ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 40px' }}>
        <div className="paper-sheet page-in">
          <div className="hole" style={{ top: '50px' }} />
          <div className="hole" style={{ top: '45%' }} />
          <div className="hole" style={{ bottom: '50px' }} />

          {activeTab === 'accueil'      && <TabAccueil ranger={ranger} />}
          {activeTab === 'organigramme' && <TabOrganigramme />}
          {activeTab === 'logistique'   && <TabLogistique isOfficier={isOfficier} />}
          {activeTab === 'armes'        && <TabArmes isOfficier={isOfficier} />}
          {activeTab === 'comptes'      && <TabComptes isOfficier={isOfficier} />}
          {activeTab === 'rapports'     && <TabRapports ranger={ranger} snd={snd} />}
          {activeTab === 'admin'        && isOfficier && <TabAdmin />}
        </div>
      </main>
    </div>
  )
}

/* ════════════════════════════════════════
   ONGLET ACCUEIL
════════════════════════════════════════ */
function TabAccueil({ ranger }) {
  const [stats, setStats] = useState({ rangers: 0, armes_volees: 0, solde: 0, rapports: 0 })
  const now = new Date()
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`

  useEffect(() => {
    async function load() {
      const [{ count: rangers }, { count: volees }, { data: comptes }, { count: rapports }] = await Promise.all([
        supabase.from('rangers').select('*', { count: 'exact', head: true }).eq('statut','actif'),
        supabase.from('stock_armes').select('*', { count: 'exact', head: true }).eq('statut','volee'),
        supabase.from('comptes').select('montant,operation'),
        supabase.from('rapports').select('*', { count: 'exact', head: true }),
      ])
      const solde = (comptes || []).reduce((s,r) => r.operation === 'ajout' ? s + Number(r.montant) : s - Number(r.montant), 0)
      setStats({ rangers: rangers || 0, armes_volees: volees || 0, solde, rapports: rapports || 0 })
    }
    load()
  }, [])

  return (
    <div className="page-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,28px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Tableau de Bord</div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>U.S. Rangers — Bureau de New Austin</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-3)', lineHeight: '1.8' }}>New Austin<br />{dateStr}</div>
      </div>

      <div className="info-grid">
        <div className="info-card"><span className="card-label">Effectif actif</span><div className="card-value">{stats.rangers}</div><div className="card-sub">Rangers</div></div>
        <div className={`info-card ${stats.armes_volees > 0 ? 'accent-red' : ''}`}>
          <span className="card-label">Armes volées</span>
          <div className="card-value" style={stats.armes_volees > 0 ? { color: 'var(--red)' } : {}}>{stats.armes_volees}</div>
          <div className="card-sub">{stats.armes_volees > 0 ? 'En investigation' : 'Aucune alerte'}</div>
        </div>
        <div className="info-card accent-green">
          <span className="card-label">Solde Bureau</span>
          <div className="card-value" style={{ fontSize: '18px' }}>{stats.solde.toFixed(2)} $</div>
          <div className="card-sub">Trésorerie</div>
        </div>
        <div className="info-card">
          <span className="card-label">Rapports</span>
          <div className="card-value">{stats.rapports}</div>
          <div className="card-sub">Total archivés</div>
        </div>
      </div>

      <div className="ornament">★ Bienvenue ★</div>
      <div style={{ borderLeft: '3px solid var(--ink-3)', padding: '12px 16px', background: 'rgba(180,150,80,.06)', fontSize: '13px', lineHeight: '30px', color: 'var(--ink-2)', fontStyle: 'italic' }}>
        « Bienvenue, {ranger?.grade} {ranger?.prenom_rp} {ranger?.nom_rp}. Tous les Rangers sont priés de vérifier leur équipement avant la prochaine patrouille. Le rapport hebdomadaire est dû avant le vendredi 18h00. »
        <div style={{ marginTop: '8px', fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-3)', fontStyle: 'normal' }}>— Le Commandant, New Austin · 1900</div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   ONGLET ORGANIGRAMME
════════════════════════════════════════ */
function TabOrganigramme() {
  const [rangers, setRangers] = useState([])

  useEffect(() => {
    supabase.from('rangers').select('*').eq('statut','actif').then(({ data }) => setRangers(data || []))
  }, [])

  const byGrade = (grade) => rangers.filter(r => r.grade === grade)
  const byPole = (pole) => rangers.filter(r => r.pole === pole)

  return (
    <div className="page-in">
      <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,26px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Organigramme</div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>Structure hiérarchique — U.S. Rangers</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', fontFamily: "'Special Elite',cursive" }}>
        {/* Commandant */}
        {byGrade('commandant').map(r => (
          <OrgNode key={r.id} role="Commandant" name={`${r.prenom_rp} ${r.nom_rp}`} isTop />
        ))}
        {byGrade('commandant').length === 0 && <OrgNode role="Commandant" name="— Vacant —" isTop />}
        <VLine />

        {/* Lieutenants par pôle */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['logistique','operationnel','admin'].map(pole => {
            const lts = rangers.filter(r => r.grade === 'lieutenant' && r.pole === pole)
            const members = rangers.filter(r => r.pole === pole && r.grade !== 'lieutenant')
            return (
              <div key={pole} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
                <VLine />
                <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px', borderBottom: '1px solid rgba(106,74,26,.3)', paddingBottom: '4px', minWidth: '140px', textAlign: 'center' }}>
                  Pôle {pole === 'logistique' ? 'Logistique' : pole === 'operationnel' ? 'Opérationnel' : 'Admin & Formation'}
                </div>
                {lts.length > 0
                  ? lts.map(r => <OrgNode key={r.id} role="Lieutenant" name={`${r.prenom_rp} ${r.nom_rp}`} />)
                  : <OrgNode role="Lieutenant" name="— Vacant —" />
                }
                {members.map(r => (
                  <div key={r.id} style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--ink-2)', padding: '3px 0', borderBottom: '1px dashed rgba(160,130,70,.2)', width: '100%', textAlign: 'center' }}>
                    <span style={{ fontSize: '8px', color: 'var(--ink-3)', display: 'block', letterSpacing: '1px' }}>{r.grade}{r.role_special ? ` — ${r.role_special}` : ''}</span>
                    {r.prenom_rp} {r.nom_rp}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Deputies */}
        {byGrade('deputy').length > 0 && (
          <>
            <VLine />
            <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '8px 0 10px', borderBottom: '1px solid rgba(106,74,26,.3)', paddingBottom: '4px', minWidth: '200px', textAlign: 'center' }}>
              Deputies
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {byGrade('deputy').map(r => (
                <div key={r.id} style={{ fontSize: '11px', letterSpacing: '1px', color: 'var(--ink-2)', padding: '4px 12px', border: '1px solid rgba(160,130,70,.3)', minWidth: '130px', textAlign: 'center', fontFamily: "'Special Elite',cursive" }}>
                  {r.prenom_rp} {r.nom_rp}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function OrgNode({ role, name, isTop }) {
  return (
    <div style={{ border: `${isTop ? '2' : '1.5'}px solid ${isTop ? 'var(--red)' : 'var(--ink-2)'}`, padding: '8px 18px', textAlign: 'center', background: 'rgba(180,150,80,.07)', minWidth: '180px' }}>
      <span style={{ fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: isTop ? 'var(--red)' : 'var(--ink-3)', display: 'block' }}>{role}</span>
      <span style={{ fontSize: '14px', letterSpacing: '2px', color: isTop ? 'var(--red)' : 'var(--ink)', display: 'block', marginTop: '2px', fontFamily: "'Special Elite',cursive" }}>{name}</span>
    </div>
  )
}

function VLine() {
  return <div style={{ width: '1.5px', height: '22px', background: 'var(--ink-2)', opacity: 0.5 }} />
}

/* ════════════════════════════════════════
   ONGLET LOGISTIQUE
════════════════════════════════════════ */
function TabLogistique({ isOfficier }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('logistique').select('*').order('categorie').then(({ data }) => {
      setItems(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="page-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,26px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Logistique</div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>Inventaire des fournitures par poste</div>
        </div>
        {isOfficier && <button className="btn btn-primary">+ Ajouter un article</button>}
      </div>

      {loading ? <Loader /> : (
        <table className="register-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Catégorie</th>
              <th>Fort Wallace</th>
              <th>Bur. Blackwater</th>
              <th>Fort Mercer</th>
              <th>Camp Armadillo</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.article}</td>
                <td>{item.categorie}</td>
                <td>{item.qte_wallace}</td>
                <td style={{ color: item.qte_blackwater < item.min_blackwater ? 'var(--red)' : 'inherit' }}>
                  {item.qte_blackwater}{item.min_blackwater > 0 ? ` (${item.min_blackwater})` : ''}
                </td>
                <td>{item.qte_mercer}</td>
                <td>{item.qte_armadillo || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ fontSize: '10px', color: 'var(--ink-3)', fontStyle: 'italic' }}>* Chiffres entre parenthèses = stock minimum requis</div>
    </div>
  )
}

/* ════════════════════════════════════════
   ONGLET STOCK ARMES
════════════════════════════════════════ */
function TabArmes({ isOfficier }) {
  const [armes, setArmes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('stock_armes').select('*, ranger:affecte_a(prenom_rp,nom_rp)').order('type_arme').then(({ data }) => {
      setArmes(data || [])
      setLoading(false)
    })
  }, [])

  const volees = armes.filter(a => a.statut === 'volee').length
  const affectees = armes.filter(a => a.statut === 'affectee').length

  return (
    <div className="page-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,26px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Stock d'Armes</div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>Registre des armes à feu — U.S. Rangers</div>
        </div>
        {isOfficier && (
          <div className="btn-row" style={{ margin: 0 }}>
            <button className="btn btn-primary">+ Enregistrer</button>
            <button className="btn btn-danger">⚠ Signaler un vol</button>
          </div>
        )}
      </div>

      <div className="info-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="info-card"><span className="card-label">Total</span><div className="card-value">{armes.length}</div><div className="card-sub">armes enregistrées</div></div>
        <div className={`info-card ${volees > 0 ? 'accent-red' : ''}`}>
          <span className="card-label">Volées</span>
          <div className="card-value" style={volees > 0 ? { color: 'var(--red)' } : {}}>{volees}</div>
          <div className="card-sub">{volees > 0 ? 'En investigation' : 'Aucune alerte'}</div>
        </div>
        <div className="info-card"><span className="card-label">Affectées</span><div className="card-value">{affectees}</div><div className="card-sub">à des Rangers</div></div>
      </div>

      {loading ? <Loader /> : (
        <table className="register-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>N° Série</th>
              <th>Date fabrication</th>
              <th>Emplacement / Affectataire</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {armes.map(a => (
              <tr key={a.id} style={a.statut === 'volee' ? { background: 'rgba(139,26,26,.06)' } : {}}>
                <td><strong>{a.type_arme}</strong></td>
                <td style={{ letterSpacing: '2px' }}>{a.numero_serie}</td>
                <td>{a.date_fabrication ? new Date(a.date_fabrication).toLocaleDateString('fr-FR') : '—'}</td>
                <td>{a.ranger ? `${a.ranger.prenom_rp} ${a.ranger.nom_rp}` : (a.emplacement || '—')}</td>
                <td>
                  <span className={`status-badge ${a.statut === 'en_stock' ? 'status-ok' : a.statut === 'volee' ? 'status-vol' : 'status-att'}`}>
                    {a.statut === 'en_stock' ? 'En stock' : a.statut === 'volee' ? '⚠ VOLÉE' : a.statut === 'affectee' ? 'Affectée' : a.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   ONGLET COMPTES
════════════════════════════════════════ */
function TabComptes({ isOfficier }) {
  const [ops, setOps] = useState([])
  const [loading, setLoading] = useState(true)
  const [solde, setSolde] = useState(0)

  useEffect(() => {
    supabase.from('comptes').select('*, ranger:enregistre_par(prenom_rp,nom_rp)').order('date_op', { ascending: false }).limit(50).then(({ data }) => {
      const d = data || []
      setOps(d)
      setSolde(d.reduce((s,r) => r.operation === 'ajout' ? s + Number(r.montant) : s - Number(r.montant), 0))
      setLoading(false)
    })
  }, [])

  return (
    <div className="page-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,26px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Gestion des Comptes</div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>État financier du Bureau</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(24px,5vw,38px)', color: 'var(--ink)', letterSpacing: '4px', padding: '14px 18px', border: '2px solid var(--ink)', display: 'inline-block', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '-10px', left: '10px', background: 'var(--paper)', padding: '0 6px', fontSize: '9px', letterSpacing: '3px', color: 'var(--ink-3)' }}>SOLDE ACTUEL</span>
          {solde.toFixed(2)} $
        </div>
        {isOfficier && (
          <div className="btn-row" style={{ margin: 0 }}>
            <button className="btn btn-success">+ Entrée</button>
            <button className="btn btn-danger">− Sortie</button>
          </div>
        )}
      </div>

      {loading ? <Loader /> : (
        <table className="register-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Objet</th>
              <th>Nom / Prénom</th>
              <th>Par</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Op.</th>
            </tr>
          </thead>
          <tbody>
            {ops.map(op => (
              <tr key={op.id}>
                <td>{new Date(op.date_op).toLocaleDateString('fr-FR')}</td>
                <td>{op.objet}</td>
                <td>{op.nom_prenom || '—'}</td>
                <td>{op.ranger ? `${op.ranger.prenom_rp}` : '—'}</td>
                <td>{op.type_permis || '—'}</td>
                <td>{Number(op.montant).toFixed(2)} $</td>
                <td><span className={`status-badge ${op.operation === 'ajout' ? 'status-ok' : 'status-vol'}`} style={{ border: '1px solid', padding: '1px 6px', fontSize: '9px', fontFamily: "'Special Elite',cursive", letterSpacing: '1px' }}>{op.operation === 'ajout' ? 'Ajout' : 'Retrait'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   ONGLET RAPPORTS
════════════════════════════════════════ */
function TabRapports({ ranger, snd }) {
  const [rapports, setRapports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type_rapport: 'Déposition', destinataires: '', comtes: '', date_faits: '', contenu: '', elements_supp: '', signature: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('rapports').select('*, ranger:redacteur_id(prenom_rp,nom_rp)').order('created_at', { ascending: false }).then(({ data }) => {
      setRapports(data || [])
      setLoading(false)
    })
  }, [])

  async function submitReport() {
    snd.carriageReturn()
    if (!form.contenu) { setMsg('⚠ Le contenu est obligatoire.'); return }
    setSaving(true)
    const telNum = String(Math.floor(5000 + Math.random() * 4999))
    const { error } = await supabase.from('rapports').insert({
      numero_telegram: telNum,
      type_rapport:    form.type_rapport,
      destinataires:   form.destinataires.split('·').map(s => s.trim()).filter(Boolean),
      comtes:          form.comtes.split('·').map(s => s.trim()).filter(Boolean),
      date_faits:      form.date_faits || null,
      contenu:         form.contenu,
      elements_supp:   form.elements_supp,
      redacteur_id:    ranger?.id,
      statut:          'soumis',
      origine:         'U.S. Rangers',
    })
    setSaving(false)
    if (error) { setMsg('⚠ Erreur : ' + error.message); return }
    snd.ding()
    setMsg(`✓ Rapport soumis — Télégramme n° ${telNum}`)
    setShowForm(false)
    supabase.from('rapports').select('*, ranger:redacteur_id(prenom_rp,nom_rp)').order('created_at',{ascending:false}).then(({data}) => setRapports(data||[]))
  }

  return (
    <div className="page-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,26px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Rapports</div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>Registre des rapports officiels</div>
        </div>
        {!showForm && <button className="btn btn-primary" onClick={() => { snd.carriageReturn(); setShowForm(true); setMsg('') }}>+ Rédiger un rapport</button>}
      </div>

      {msg && <div className={msg.startsWith('⚠') ? 'msg-error' : 'msg-success'}>{msg}</div>}

      {!showForm ? (
        loading ? <Loader /> : (
          <table className="register-table">
            <thead><tr><th>N° Télég.</th><th>Date</th><th>Type</th><th>Rédacteur</th><th>Statut</th></tr></thead>
            <tbody>
              {rapports.map(r => (
                <tr key={r.id}>
                  <td style={{ letterSpacing: '2px' }}>{r.numero_telegram}</td>
                  <td>{r.date_faits ? new Date(r.date_faits).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>{r.type_rapport}</td>
                  <td>{r.ranger ? `${r.ranger.prenom_rp} ${r.ranger.nom_rp}` : '—'}</td>
                  <td><span className={`status-badge ${r.statut === 'archive' ? 'status-ok' : 'status-att'}`}>{r.statut}</span></td>
                </tr>
              ))}
              {rapports.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-3)', padding: '20px' }}>Aucun rapport archivé.</td></tr>}
            </tbody>
          </table>
        )
      ) : (
        <div>
          <div className="ornament">★ Nouveau Rapport ★</div>
          <div className="two-col">
            <div className="field-group">
              <label>Type de rapport</label>
              <select value={form.type_rapport} onChange={e => setForm(f => ({ ...f, type_rapport: e.target.value }))}>
                <option>Déposition</option><option>Rapport d'intervention</option>
                <option>Rapport de patrouille</option><option>Rapport d'incident</option>
                <option>Note interne</option>
              </select>
            </div>
            <div className="field-group">
              <label>Date et heure des faits</label>
              <input type="text" placeholder="14/04/1900 — 20h00" value={form.date_faits} onChange={e => { setForm(f => ({ ...f, date_faits: e.target.value })); snd.keyClick() }} />
            </div>
          </div>
          <div className="two-col">
            <div className="field-group">
              <label>Destinataire(s) <span style={{ opacity: 0.5 }}>(séparés par ·)</span></label>
              <input type="text" placeholder="U.S. Rangers · U.S. Marshals" value={form.destinataires} onChange={e => { setForm(f => ({ ...f, destinataires: e.target.value })); snd.keyClick() }} />
            </div>
            <div className="field-group">
              <label>Comté(s) <span style={{ opacity: 0.5 }}>(séparés par ·)</span></label>
              <input type="text" placeholder="New Austin · Cholla Springs" value={form.comtes} onChange={e => { setForm(f => ({ ...f, comtes: e.target.value })); snd.keyClick() }} />
            </div>
          </div>
          <div className="field-group">
            <label>Contenu de la déposition ★</label>
            <textarea placeholder={"Rédigez ici le contenu du rapport...\n\nJe soussigné(e), ..."} value={form.contenu} onChange={e => { setForm(f => ({ ...f, contenu: e.target.value })); snd.keyClick() }} />
          </div>
          <div className="field-group">
            <label>Pièces à conviction / éléments supplémentaires</label>
            <textarea style={{ minHeight: '80px' }} placeholder="Photos, références, témoignages..." value={form.elements_supp} onChange={e => { setForm(f => ({ ...f, elements_supp: e.target.value })); snd.keyClick() }} />
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={submitReport} disabled={saving}>▶ Soumettre le rapport</button>
            <button className="btn" onClick={() => { snd.carriageReturn(); setShowForm(false) }}>✕ Annuler</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   ONGLET ADMIN
════════════════════════════════════════ */
function TabAdmin() {
  const [pending, setPending] = useState([])
  const [actifs, setActifs] = useState([])
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const snd = useTypewriterSound()

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: a }, { data: c }] = await Promise.all([
        supabase.from('rangers').select('*').eq('statut','en_attente'),
        supabase.from('rangers').select('*').eq('statut','actif'),
        supabase.from('codes_invitation').select('*, cree:cree_par(prenom_rp,nom_rp)').order('created_at',{ascending:false}),
      ])
      setPending(p || []); setActifs(a || []); setCodes(c || [])
      setLoading(false)
    }
    load()
  }, [])

  async function approuver(id) {
    snd.stamp()
    await supabase.from('rangers').update({ statut: 'actif' }).eq('id', id)
    setPending(p => p.filter(r => r.id !== id))
    const { data } = await supabase.from('rangers').select('*').eq('statut','actif')
    setActifs(data || [])
  }

  async function refuser(id) {
    snd.carriageReturn()
    await supabase.from('rangers').update({ statut: 'suspendu' }).eq('id', id)
    setPending(p => p.filter(r => r.id !== id))
  }

  async function genererCode() {
    snd.ding()
    const code = 'USR-' + Math.floor(1000 + Math.random() * 8999)
    await supabase.from('codes_invitation').insert({ code, utilise: false })
    const { data } = await supabase.from('codes_invitation').select('*, cree:cree_par(prenom_rp,nom_rp)').order('created_at',{ascending:false})
    setCodes(data || [])
  }

  if (loading) return <Loader />

  return (
    <div className="page-in">
      <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid var(--ink)' }}>
        <div style={{ fontFamily: "'Special Elite',cursive", fontSize: 'clamp(18px,4vw,26px)', letterSpacing: '4px', textTransform: 'uppercase' }}>Administration</div>
        <div style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-3)', textTransform: 'uppercase', marginTop: '4px' }}>Gestion des accès — Réservé aux officiers</div>
      </div>

      <div className="section-title">⏳ Demandes en attente ({pending.length})</div>
      {pending.length === 0 && <div style={{ color: 'var(--ink-3)', fontStyle: 'italic', fontSize: '12px', marginBottom: '16px' }}>Aucune demande en attente.</div>}
      {pending.map(r => (
        <div key={r.id} style={{ border: '1px solid rgba(160,130,70,.35)', padding: '14px 16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(180,150,80,.04)', flexWrap: 'wrap' }}>
          <div style={{ width: '44px', height: '44px', border: '1.5px solid var(--ink-3)', background: 'var(--paper-aged)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, overflow: 'hidden' }}>
            {r.photo_url ? <img src={r.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Special Elite',cursive", fontSize: '14px', letterSpacing: '2px' }}>{r.prenom_rp} {r.nom_rp}</div>
            <div style={{ fontSize: '10px', color: 'var(--ink-3)', marginTop: '2px', letterSpacing: '1px' }}>
              Grade demandé : <span className={`grade-badge grade-${r.grade}`}>{r.grade}</span>
              &nbsp;· Code : {r.code_invite}
              &nbsp;· Reçu le : {new Date(r.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-success" style={{ padding: '5px 12px', fontSize: '9px' }} onClick={() => approuver(r.id)}>✓ Valider</button>
            <button className="btn btn-danger"  style={{ padding: '5px 12px', fontSize: '9px' }} onClick={() => refuser(r.id)}>✕ Refuser</button>
          </div>
        </div>
      ))}

      <div className="section-title">✓ Rangers actifs ({actifs.length})</div>
      <table className="register-table">
        <thead><tr><th>Nom</th><th>Grade</th><th>Pôle</th><th>Depuis</th></tr></thead>
        <tbody>
          {actifs.map(r => (
            <tr key={r.id}>
              <td>{r.prenom_rp} {r.nom_rp}</td>
              <td><span className={`grade-badge grade-${r.grade}`}>{r.grade}</span></td>
              <td>{r.pole || '—'}</td>
              <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title">🔑 Codes d'invitation</div>
      <div className="btn-row"><button className="btn btn-primary" onClick={genererCode}>+ Générer un code</button></div>
      <table className="register-table">
        <thead><tr><th>Code</th><th>Créé par</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>
          {codes.map(c => (
            <tr key={c.id}>
              <td style={{ letterSpacing: '3px', fontWeight: 700 }}>{c.code}</td>
              <td>{c.cree ? `${c.cree.prenom_rp}` : 'Admin'}</td>
              <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
              <td><span className={`status-badge ${c.utilise ? 'status-att' : 'status-ok'}`}>{c.utilise ? 'Utilisé' : 'Disponible'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Loader ── */
function Loader() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontStyle: 'italic', fontSize: '12px', letterSpacing: '2px' }}>
      Chargement du registre...
    </div>
  )
}
