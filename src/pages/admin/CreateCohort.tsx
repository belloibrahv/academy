import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import CohortForm from '../../components/CohortForm'
import { useCohorts } from '../../hooks/useCohorts'
import { ArrowLeft } from 'lucide-react'
import { Cohort } from '../../types'

const CreateCohort = () => {
  const navigate = useNavigate()
  const { createCohort } = useCohorts()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Cohort, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true)
    const { error } = await createCohort(data)
    
    if (!error) {
      navigate('/admin/cohorts')
    }
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    navigate('/admin/cohorts')
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/admin/cohorts')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cohorts
          </button>
          <h1 className="text-3xl font-bold text-dark">Create New Cohort</h1>
          <p className="text-gray-600 mt-2">
            Add a new training program or batch to your academy
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <CohortForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Cohort"
            isLoading={isSubmitting}
          />
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for creating cohorts:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use descriptive names that include the program and time period (e.g., "Web Dev 2025-Q1")</li>
            <li>Set realistic start and end dates based on your curriculum</li>
            <li>Choose 3 months for bootcamps or 6 months for comprehensive programs</li>
            <li>Write clear descriptions to help students understand what they'll learn</li>
            <li>Start with "Upcoming" status, then change to "Active" when the program begins</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

export default CreateCohort

