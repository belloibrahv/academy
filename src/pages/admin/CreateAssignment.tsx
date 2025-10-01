import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import AssignmentForm from '../../components/AssignmentForm'
import { useAssignments } from '../../hooks/useAssignments'
import { ArrowLeft, Info } from 'lucide-react'
import { Assignment } from '../../types'

const CreateAssignment = () => {
  const navigate = useNavigate()
  const { createAssignment } = useAssignments()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true)
    const { error } = await createAssignment(data)
    
    if (!error) {
      navigate('/admin/assignments')
    }
    setIsSubmitting(false)
  }

  const handleCancel = () => {
    navigate('/admin/assignments')
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/admin/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Assignments
          </button>
          <h1 className="text-3xl font-bold text-dark">Create Assignment</h1>
          <p className="text-gray-600 mt-2">
            Create a new assignment for students in a specific cohort
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-card p-8">
          <AssignmentForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Assignment"
            isLoading={isSubmitting}
          />
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Assignment Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Write clear, specific titles that describe the task</li>
                <li>Provide detailed instructions in the description</li>
                <li>Set realistic due dates giving students enough time</li>
                <li>Use consistent point values across similar assignments</li>
                <li>Attach reference materials via the file URL field</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default CreateAssignment
