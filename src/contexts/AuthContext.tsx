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
      console.log('Fetching profile for user ID:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Supabase profile fetch error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      console.log('Profile fetched successfully:', data)
      setProfile(data as Profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      
      // If profile doesn't exist, create a default one for the user
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as any
        
        if (supabaseError.code === 'PGRST116' || supabaseError.message?.includes('No rows found')) {
          console.log('Profile not found, attempting to create default profile for user:', userId)
          
          try {
            // Get user email from auth
            const { data: authUser } = await supabase.auth.getUser()
            if (authUser.user) {
              const defaultProfile = {
                user_id: userId,
                full_name: authUser.user.email?.split('@')[0] || 'User',
                role: 'student' as const,
                registration_status: 'active' as const,
              }
              
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .single()
              
              if (createError) {
                console.error('Failed to create default profile:', createError)
              } else {
                console.log('Default profile created successfully:', newProfile)
                setProfile(newProfile as Profile)
                return
              }
            }
          } catch (createError) {
            console.error('Error creating default profile:', createError)
          }
        }
      }
      
      // Set loading to false even on error to prevent infinite loading
      setLoading(false)
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

