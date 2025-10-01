import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import { useInviteLinks } from '../../hooks/useInviteLinks'
import { useCohorts } from '../../hooks/useCohorts'
import { ArrowLeft, Link2, Calendar, Users, Info } from 'lucide-react'

const GenerateInviteLink = () => {
  const navigate = useNavigate()
  const { generateInviteLink } = useInviteLinks()
  const { cohorts, loading: loadingCohorts } = useCohorts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    cohortId: '',
    expiresAt: '',
    maxUses: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cohortId) {
      newErrors.cohortId = 'Please select a cohort'
    }

    if (!formData.expiresAt) {
      newErrors.expiresAt = 'Please set an expiration date'
    } else {
      const expiryDate = new Date(formData.expiresAt)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (expiryDate < today) {
        newErrors.expiresAt = 'Expiration date must be in the future'
      }
    }

    if (formData.maxUses && parseInt(formData.maxUses) < 1) {
      newErrors.maxUses = 'Max uses must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    const maxUses = formData.maxUses ? parseInt(formData.maxUses) : null

    const { error } = await generateInviteLink(
      formData.cohortId,
      new Date(formData.expiresAt).toISOString(),
      maxUses
    )

    if (!error) {
      navigate('/admin/invite-links')
    }
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    navigate('/admin/invite-links')
  }

  if (loadingCohorts) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/admin/invite-links')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Invite Links
          </button>
          <h1 className="text-3xl font-bold text-dark">Generate Invite Link</h1>
          <p className="text-gray-600 mt-2">
            Create a unique invitation link for students to join a cohort
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cohort Selection */}
            <div>
              <label htmlFor="cohortId" className="block text-sm font-semibold text-dark mb-2">
                Select Cohort <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="cohortId"
                  value={formData.cohortId}
                  onChange={(e) => setFormData({ ...formData, cohortId: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.cohortId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Choose a cohort...</option>
                  {cohorts
                    .filter(c => c.status !== 'completed')
                    .map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name} ({cohort.program_type})
                      </option>
                    ))}
                </select>
              </div>
              {errors.cohortId && (
                <p className="mt-1 text-sm text-red-600">{errors.cohortId}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Students will be enrolled in this cohort when they register
              </p>
            </div>

            {/* Expiration Date */}
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-semibold text-dark mb-2">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="expiresAt"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.expiresAt ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.expiresAt && (
                <p className="mt-1 text-sm text-red-600">{errors.expiresAt}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Link will become invalid after this date (Default: 7 days from now)
              </p>
            </div>

            {/* Max Uses (Optional) */}
            <div>
              <label htmlFor="maxUses" className="block text-sm font-semibold text-dark mb-2">
                Max Uses (Optional)
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="maxUses"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.maxUses ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Unlimited"
                  min="1"
                  disabled={isSubmitting}
                />
              </div>
              {errors.maxUses && (
                <p className="mt-1 text-sm text-red-600">{errors.maxUses}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for unlimited uses. Set a number to limit how many students can use this link.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">How invite links work:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>A unique secure token will be generated</li>
                    <li>Share the link via email or other channels</li>
                    <li>Students click the link to access the registration page</li>
                    <li>Upon registration, they're automatically enrolled in the selected cohort</li>
                    <li>Links can be single-use or multi-use based on your settings</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Generating...' : 'Generate Invite Link'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-dark mb-3">💡 Quick Tips:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Set shorter expiration dates for one-time events or workshops</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Use max uses to control cohort size and prevent over-enrollment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>You can generate multiple links for the same cohort with different settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Delete unused or expired links to keep your list organized</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

export default GenerateInviteLink

