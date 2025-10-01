import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import CohortForm from '../../components/CohortForm'
import { useCohort, useCohorts } from '../../hooks/useCohorts'
import { ArrowLeft } from 'lucide-react'
import { Cohort } from '../../types'

const EditCohort = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cohort, loading } = useCohort(id || '')
  const { updateCohort } = useCohorts()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Cohort, 'id' | 'created_at' | 'updated_at'>) => {
    if (!id) return
    
    setIsSubmitting(true)
    const { error } = await updateCohort(id, data)
    
    if (!error) {
      navigate(`/admin/cohorts/${id}`)
    }
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    navigate(`/admin/cohorts/${id}`)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!cohort) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-dark mb-4">Cohort not found</h2>
          <button
            onClick={() => navigate('/admin/cohorts')}
            className="text-primary hover:underline"
          >
            Return to cohorts
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate(`/admin/cohorts/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Cohort Details
          </button>
          <h1 className="text-3xl font-bold text-dark">Edit Cohort</h1>
          <p className="text-gray-600 mt-2">
            Update the details for {cohort.name}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <CohortForm
            initialData={cohort}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Save Changes"
            isLoading={isSubmitting}
          />
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Important:</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>Changing dates may affect student schedules and assignments</li>
            <li>Changing the status to "Completed" will archive this cohort</li>
            <li>Enrolled students will be notified of significant changes</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

export default EditCohort

