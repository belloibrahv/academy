import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { RegisterFormData, InviteLinkWithCohort } from '../types'

const Register = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [inviteData, setInviteData] = useState<InviteLinkWithCohort | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  })
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    verifyInviteToken()
  }, [token])

  const verifyInviteToken = async (): Promise<void> => {
    if (!token) {
      toast.error('Invalid invitation link')
      navigate('/login')
      return
    }

    try {
      const { data, error } = await supabase
        .from('invite_links')
        .select('*, cohorts(name, program_type)')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (error || !data) {
        toast.error('Invalid or expired invitation link')
        navigate('/login')
        return
      }

      const inviteLink = data as unknown as InviteLinkWithCohort

      // Check if expired
      if (new Date(inviteLink.expires_at) < new Date()) {
        toast.error('This invitation link has expired')
        navigate('/login')
        return
      }

      setInviteData(inviteLink)
      // Note: We don't have email in invite_links table, so we'll get it from the form
    } catch (error) {
      toast.error('Error verifying invitation')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!inviteData) {
      toast.error('Invalid invitation data')
      return
    }

    setSubmitting(true)

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          role: 'student',
          registration_status: 'active',
        }
      )

      if (signUpError) throw signUpError
      if (!authData) throw new Error('No user data returned')

      // Check if email confirmation is required
      if (authData && !(authData as any).email_confirmed_at) {
        // Email confirmation required - show success message with instructions
        toast.success('Registration successful! Please check your email and click the confirmation link to complete your registration.')
        
        // Store invite data for after email confirmation
        localStorage.setItem('pending_invite', JSON.stringify({
          token: token,
          cohort_id: inviteData.cohort_id,
          email: formData.email
        }))
        
        setTimeout(() => {
          navigate('/login?message=check-email')
        }, 3000)
        return
      }

      // If email is already confirmed (shouldn't happen in normal flow)
      const userId = typeof authData === 'object' && 'id' in authData ? (authData as { id: string }).id : null
      if (!userId) throw new Error('No user ID returned')

      // Enroll student in cohort
      const enrollmentData = {
        student_id: userId,
        cohort_id: inviteData.cohort_id,
        enrollment_date: new Date().toISOString(),
        completion_status: 0,
      }
      
      const { error: enrollError } = await supabase
        .from('student_cohorts')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(enrollmentData as any)

      if (enrollError) throw enrollError

      // Mark invite as used
      const updateData = {
        used: true,
        used_at: new Date().toISOString()
      }
      
      const { error: updateError } = await (supabase as any)
        .from('invite_links')
        .update(updateData)
        .eq('token', token || '')

      if (updateError) throw updateError

      toast.success('Registration successful! Redirecting to your dashboard...')
      setTimeout(() => {
        navigate('/student/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      
      // Handle rate limiting specifically
      if (errorMessage.includes('48 seconds') || errorMessage.includes('rate limit')) {
        toast.error('Please wait a moment before trying again. This is a security feature to prevent spam.')
      } else if (errorMessage.includes('already registered')) {
        toast.error('This email is already registered. Please use a different email or try logging in.')
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-dark-light">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-gray-100 px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/TechVaults-Logo-b2.png" 
              alt="TechVaults Academy" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">Academy Student Registration</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Welcome Message */}
        {inviteData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Welcome to TechVaults Academy!</p>
              <p className="text-green-700 text-sm mt-1">
                You've been invited to join the <strong>{inviteData.cohorts?.name}</strong> program.
              </p>
            </div>
          </div>
        )}

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-card-hover p-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Create Your Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-dark mb-2">
                Full Name *
              </label>
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-dark mb-2">
                Phone Number
              </label>
              <input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="+234 123 456 7890"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-dark"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

