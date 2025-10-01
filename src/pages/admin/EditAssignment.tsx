import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import AssignmentForm from '../../components/AssignmentForm'
import { useAssignment, useAssignments } from '../../hooks/useAssignments'
import { ArrowLeft } from 'lucide-react'
import { Assignment } from '../../types'

const EditAssignment = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { assignment, loading } = useAssignment(id || '')
  const { updateAssignment } = useAssignments()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!id) return
    
    setIsSubmitting(true)
    const { error } = await updateAssignment(id, data)
    
    if (!error) {
      navigate(`/admin/assignments/${id}`)
    }
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    navigate(`/admin/assignments/${id}`)
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

  if (!assignment) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-dark mb-4">Assignment not found</h2>
          <button
            onClick={() => navigate('/admin/assignments')}
            className="text-primary hover:underline"
          >
            Return to assignments
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
            onClick={() => navigate(`/admin/assignments/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Assignment Details
          </button>
          <h1 className="text-3xl font-bold text-dark">Edit Assignment</h1>
          <p className="text-gray-600 mt-2">
            Update the details for {assignment.title}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <AssignmentForm
            initialData={assignment}
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
            <li>Changing the cohort will affect which students see this assignment</li>
            <li>Changing the due date may require notifying students</li>
            <li>Existing submissions will remain attached to this assignment</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}

export default EditAssignment

