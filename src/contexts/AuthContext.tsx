import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile, AuthContextType } from '../types'
import { handlePendingEnrollment } from '../utils/enrollmentHandler'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
        // Handle any pending enrollment after email confirmation
        handlePendingEnrollment(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data as Profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ data: SupabaseUser | null; error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Welcome back!')
      return { data: data.user, error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { data: null, error: err }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    profileData: Partial<Profile>
  ): Promise<{ data: SupabaseUser | null; error: Error | null }> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
          data: {
            full_name: profileData.full_name,
            role: profileData.role || 'student'
          }
        },
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned from sign up')

      // Create profile
      const profileInsertData = {
        user_id: authData.user.id,
        full_name: profileData.full_name || '',
        phone_number: profileData.phone_number || null,
        role: profileData.role || 'student',
        registration_status: profileData.registration_status || 'active',
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(profileInsertData as any)

      if (profileError) throw profileError

      toast.success('Account created successfully!')
      return { data: authData.user, error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { data: null, error: err }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
    }
  }

  const value: AuthContextType = {
    user: user ? { 
      id: user.id, 
      email: user.email || '', 
      role: profile?.role || 'student',
      created_at: user.created_at
    } : null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

