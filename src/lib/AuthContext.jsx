import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})
const SESSION_KEY = 'rangers_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [ranger, setRanger]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const r = JSON.parse(stored)
        setRanger(r)
        setSession({ ranger_id: r.id })
      } catch(e) {}
    }
    setLoading(false)
  }, [])

  // Connexion : on récupère le ranger par BP
  // et on vérifie le mot de passe côté client avec bcryptjs
  async function signIn(bp, password) {
    const bpClean = bp.trim().toUpperCase()

    // Récupérer le ranger
    const { data, error } = await supabase
      .from('rangers')
      .select('*')
      .eq('bp', bpClean)
      .eq('statut', 'actif')
      .single()

    if (error || !data) {
      return { error: { message: 'BP introuvable ou compte non actif.' } }
    }

    // Vérifier le mot de passe : on compare via SQL direct
    const { data: check, error: checkErr } = await supabase
      .from('rangers')
      .select('id')
      .eq('bp', bpClean)
      .eq('statut', 'actif')
      .filter('password_hash', 'eq', `crypt('${password}', password_hash)`)
      .single()

    // Si la comparaison directe échoue, on utilise une autre méthode
    // On stocke un hash simple SHA-256 côté client
    if (checkErr || !check) {
      // Fallback : vérification via hash stocké en texte simple
      const encoder = new TextEncoder()
      const dataEncoded = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataEncoded)
      const hashArray  = Array.from(new Uint8Array(hashBuffer))
      const hashHex    = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      if (data.password_hash !== hashHex) {
        return { error: { message: 'Mot de passe incorrect.' } }
      }
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    setRanger(data)
    setSession({ ranger_id: data.id })
    return { error: null }
  }

  async function signUp({ bp, password, prenomRp, nomRp, grade, codeInvite, photoFile }) {
    const bpClean = bp.trim().toUpperCase()

    // 1. Vérifier le code
    const { data: codeData, error: codeError } = await supabase
      .from('codes_invitation')
      .select('*')
      .eq('code', codeInvite.toUpperCase())
      .eq('utilise', false)
      .single()

    if (codeError || !codeData)
      return { error: { message: "Code d'invitation invalide ou déjà utilisé." } }

    // 2. Vérifier que le BP n'existe pas
    const { data: existing } = await supabase
      .from('rangers')
      .select('id')
      .eq('bp', bpClean)
      .maybeSingle()

    if (existing)
      return { error: { message: 'Ce BP est déjà utilisé.' } }

    // 3. Hash SHA-256 du mot de passe côté client
    const encoder = new TextEncoder()
    const dataEncoded = encoder.encode(password)
    const hashBuffer  = await crypto.subtle.digest('SHA-256', dataEncoded)
    const hashArray   = Array.from(new Uint8Array(hashBuffer))
    const hashHex     = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // 4. Upload photo
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

    // 5. Insérer le ranger
    const { error: insertErr } = await supabase.from('rangers').insert({
      bp:            bpClean,
      password_hash: hashHex,
      prenom_rp:     prenomRp,
      nom_rp:        nomRp,
      grade,
      code_invite:   codeInvite.toUpperCase(),
      photo_url:     photoUrl,
      statut:        'en_attente',
    })

    if (insertErr) return { error: { message: insertErr.message } }

    // 6. Marquer le code utilisé
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
