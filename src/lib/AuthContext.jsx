import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [ranger, setRanger] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRanger(session.user.id)
      else setLoading(false)
    })

    // Écoute des changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchRanger(session.user.id)
      else { setRanger(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchRanger(userId) {
    const { data } = await supabase
      .from('rangers')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    setRanger(data)
    setLoading(false)
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp({ email, password, prenomRp, nomRp, grade, codeInvite, photoFile }) {
    // 1. Vérifier le code d'invitation
    const { data: codeData, error: codeError } = await supabase
      .from('codes_invitation')
      .select('*')
      .eq('code', codeInvite.toUpperCase())
      .eq('utilise', false)
      .single()

    if (codeError || !codeData) {
      return { error: { message: 'Code d\'invitation invalide ou déjà utilisé.' } }
    }

    // 2. Créer le compte auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) return { error: authError }

    // 3. Upload photo si fournie
    let photoUrl = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `rangers/${authData.user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, photoFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
        photoUrl = urlData.publicUrl
      }
    }

    // 4. Créer le profil ranger
    const { error: rangerError } = await supabase.from('rangers').insert({
      prenom_rp:    prenomRp,
      nom_rp:       nomRp,
      grade,
      code_invite:  codeInvite.toUpperCase(),
      statut:       'en_attente',
      photo_url:    photoUrl,
      auth_user_id: authData.user.id,
    })
    if (rangerError) return { error: rangerError }

    // 5. Marquer le code comme utilisé
    await supabase
      .from('codes_invitation')
      .update({ utilise: true, utilise_par: authData.user.id })
      .eq('id', codeData.id)

    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const isOfficier = ranger?.grade && ['commandant','lieutenant'].includes(ranger.grade)
  const isSousOfficier = ranger?.grade && ['commandant','lieutenant','sergent'].includes(ranger.grade)

  return (
    <AuthContext.Provider value={{ session, ranger, loading, signIn, signUp, signOut, isOfficier, isSousOfficier }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
