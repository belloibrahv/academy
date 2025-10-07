import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import { LoginFormData } from '../types.ts'
import toast from 'react-hot-toast'

const Login = () => {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const message = searchParams.get('message')
    const confirmed = searchParams.get('confirmed')
    
    if (confirmed === 'true') {
      toast.success('Email confirmed successfully! You can now login.')
    } else if (message === 'check-email') {
      toast.success('Please check your email and click the confirmation link to complete your registration.')
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await signIn(formData.email, formData.password)
    
    if (!error && data) {
      // Wait a bit for profile to load, then navigate based on role
      setTimeout(() => {
        const redirectPath = profile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'
        navigate(redirectPath)
      }, 1000)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-gray-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/TechVaults-Logo-b2.png" 
              alt="TechVaults Academy" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">Academy Student Portal</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-card-hover p-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                Email Address
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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            New student? Check your email for the registration link.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
