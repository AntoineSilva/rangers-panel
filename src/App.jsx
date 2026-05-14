import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import LoginPage from './pages/LoginPage'
import TransitionPage from './pages/TransitionPage'
import DashboardPage from './pages/DashboardPage'
import './index.css'

function AppRoutes() {
  const { session, ranger, loading } = useAuth()
  const [showTransition, setShowTransition] = useState(true)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Special Elite',cursive", color: 'rgba(210,185,140,0.4)', letterSpacing: '4px', fontSize: '12px', animation: 'pageIn .5s ease infinite alternate' }}>
          Chargement...
        </div>
      </div>
    )
  }

  // Non connecté
  if (!session) return <LoginPage />

  // Connecté mais en attente de validation
  if (ranger?.statut === 'en_attente') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ maxWidth: '480px', width: '100%' }} className="paper-sheet page-in">
          <div className="hole" style={{ top: '50px' }} />
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: "'Special Elite',cursive", fontSize: '24px', letterSpacing: '4px', color: 'var(--ink)', marginBottom: '12px' }}>Dossier en attente</div>
            <div style={{ color: 'var(--ink-3)', fontSize: '12px', lineHeight: '30px', fontStyle: 'italic' }}>
              Votre demande d'accès est en cours d'examen<br />
              par l'Administration des U.S. Rangers.<br /><br />
              Vous serez notifié dès validation de votre dossier.
            </div>
            <div style={{ marginTop: '24px', border: '2px solid var(--ink-3)', padding: '10px 16px', display: 'inline-block', fontFamily: "'Special Elite',cursive", fontSize: '11px', letterSpacing: '3px', color: 'var(--ink-3)', transform: 'rotate(-1deg)' }}>
              EN ATTENTE DE VALIDATION
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connecté — afficher transition puis dashboard
  if (session && ranger?.statut === 'actif' && showTransition) {
    return <TransitionPage onDone={() => setShowTransition(false)} />
  }

  // Dashboard
  return <DashboardPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
