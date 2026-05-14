import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Clé de session locale
const SESSION_KEY = 'rangers_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [ranger, setRanger]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session locale
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      const r = JSON.parse(stored)
      setRanger(r)
      setSession({ ranger_id: r.id })
    }
    setLoading(false)
  }, [])

  // Connexion : BP + mot de passe
  async function signIn(bp, password) {
    const bpClean = bp.trim().toUpperCase()

    const { data, error } = await supabase
      .from('rangers')
      .select('*')
      .eq('bp', bpClean)
      .eq('statut', 'actif')
      .single()

    if (error || !data) {
      return { error: { message: 'BP introuvable ou compte non actif.' } }
    }

    // Vérifier le mot de passe via Supabase RPC
    const { data: valid, error: hashErr } = await supabase
      .rpc('verify_ranger_password', { p_bp: bpClean, p_password: password })

    if (hashErr || !valid) {
      return { error: { message: 'Mot de passe incorrect.' } }
    }

    // Stocker la session localement
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    setRanger(data)
    setSession({ ranger_id: data.id })
    return { error: null }
  }

  // Inscription : code + prénom + nom + BP + grade + mdp + photo
  async function signUp({ bp, password, prenomRp, nomRp, grade, codeInvite, photoFile }) {
    const bpClean = bp.trim().toUpperCase()

    // 1. Vérifier le code d'invitation
    const { data: codeData, error: codeError } = await supabase
      .from('codes_invitation')
      .select('*')
      .eq('code', codeInvite.toUpperCase())
      .eq('utilise', false)
      .single()

    if (codeError || !codeData) {
      return { error: { message: "Code d'invitation invalide ou déjà utilisé." } }
    }

    // 2. Vérifier que le BP n'existe pas déjà
    const { data: existing } = await supabase
      .from('rangers')
      .select('id')
      .eq('bp', bpClean)
      .single()

    if (existing) {
      return { error: { message: 'Ce BP est déjà utilisé.' } }
    }

    // 3. Upload photo si fournie
    let photoUrl = null
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop()
      const path = `rangers/${bpClean}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('photos').upload(path, photoFile, { upsert: true })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
        photoUrl = urlData.publicUrl
      }
    }

    // 4. Créer le ranger avec mot de passe hashé via RPC
    const { data: newRanger, error: createErr } = await supabase
      .rpc('create_ranger', {
        p_bp:       bpClean,
        p_password: password,
        p_prenom:   prenomRp,
        p_nom:      nomRp,
        p_grade:    grade,
        p_code:     codeInvite.toUpperCase(),
        p_photo:    photoUrl,
      })

    if (createErr) {
      return { error: { message: createErr.message } }
    }

    // 5. Marquer le code utilisé
    await supabase.from('codes_invitation')
      .update({ utilise: true })
      .eq('id', codeData.id)

    return { error: null }
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY)
    setRanger(null)
    setSession(null)
  }

  const isOfficier     = ['commandant','lieutenant'].includes(ranger?.grade)
  const isSousOfficier = ['commandant','lieutenant','sergent'].includes(ranger?.grade)

  return (
    <AuthContext.Provider value={{ session, ranger, loading, signIn, signUp, signOut, isOfficier, isSousOfficier }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
