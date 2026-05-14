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

  async function signIn(bp, password) {
    const bpClean = bp.trim().toUpperCase()
    const { data, error } = await supabase
      .from('rangers').select('*').eq('bp', bpClean).eq('statut', 'actif').single()
    if (error || !data) return { error: { message: 'BP introuvable ou compte non actif.' } }

    const encoder    = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password))
    const hashHex    = Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('')

    if (data.password_hash !== hashHex) return { error: { message: 'Mot de passe incorrect.' } }

    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    setRanger(data); setSession({ ranger_id: data.id })
    return { error: null }
  }

  async function signUp({ bp, password, prenomRp, nomRp, grade, codeInvite, photoFile }) {
    const bpClean = bp.trim().toUpperCase()
    const { data: codeData, error: codeError } = await supabase
      .from('codes_invitation').select('*').eq('code', codeInvite.toUpperCase()).eq('utilise', false).single()
    if (codeError || !codeData) return { error: { message: "Code d'invitation invalide ou déjà utilisé." } }

    const { data: existing } = await supabase.from('rangers').select('id').eq('bp', bpClean).maybeSingle()
    if (existing) return { error: { message: 'Ce BP est déjà utilisé.' } }

    const encoder    = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password))
    const hashHex    = Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('')

    let photoUrl = null
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop()
      const path = `rangers/${bpClean}.${ext}`
      const { error: upErr } = await supabase.storage.from('photos').upload(path, photoFile, { upsert: true })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
        photoUrl = urlData.publicUrl
      }
    }

    const { error: insertErr } = await supabase.from('rangers').insert({
      bp: bpClean, password_hash: hashHex,
      prenom_rp: prenomRp, nom_rp: nomRp,
      grade, code_invite: codeInvite.toUpperCase(),
      photo_url: photoUrl, statut: 'en_attente', is_admin: false,
    })
    if (insertErr) return { error: { message: insertErr.message } }

    await supabase.from('codes_invitation').update({ utilise: true }).eq('id', codeData.id)
    return { error: null }
  }

  async function refreshRanger() {
    if (!ranger?.id) return
    const { data } = await supabase.from('rangers').select('*').eq('id', ranger.id).single()
    if (data) { setRanger(data); localStorage.setItem(SESSION_KEY, JSON.stringify(data)) }
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY)
    setRanger(null); setSession(null)
  }

  const isAdmin        = ranger?.is_admin === true
  const canEditOrg     = ['commandant','lieutenant'].includes(ranger?.grade)

  return (
    <AuthContext.Provider value={{ session, ranger, loading, signIn, signUp, signOut, refreshRanger, isAdmin, canEditOrg }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
