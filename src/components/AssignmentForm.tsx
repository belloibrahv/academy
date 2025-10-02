import { useState, FormEvent, useEffect } from 'react'
import { Assignment } from '../types'
import { FileText, Calendar, Award, Users } from 'lucide-react'
import { useCohorts } from '../hooks/useCohorts'

interface AssignmentFormProps {
  initialData?: Partial<Assignment>
  onSubmit: (data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
}

const AssignmentForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Create Assignment',
  isLoading = false
}: AssignmentFormProps) => {
  const { cohorts, loading: loadingCohorts } = useCohorts()
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    cohort_id: initialData?.cohort_id || '',
    due_date: initialData?.due_date ? initialData.due_date.split('T')[0] : '',
    max_points: (initialData as Assignment)?.max_points || 100,
    file_url: (initialData as Assignment)?.file_url || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      const data = initialData as Assignment
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        cohort_id: initialData.cohort_id || '',
        due_date: initialData.due_date ? initialData.due_date.split('T')[0] : '',
        max_points: data.max_points || 100,
        file_url: data.file_url || '',
      })
    }
  }, [initialData])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.cohort_id) {
      newErrors.cohort_id = 'Please select a cohort'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required'
    }

    if (formData.max_points < 1) {
      newErrors.max_points = 'Max points must be at least 1'
    }

    if (formData.file_url && !isValidUrl(formData.file_url)) {
      newErrors.file_url = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const assignmentData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      cohort_id: formData.cohort_id,
      due_date: new Date(formData.due_date).toISOString(),
      max_points: formData.max_points,
      file_url: formData.file_url.trim() || null,
    } as Omit<Assignment, 'id' | 'created_at' | 'updated_at'>

    console.log('Assignment form data being submitted:', assignmentData)
    await onSubmit(assignmentData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-dark mb-2">
          Assignment Title <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Build a Portfolio Website"
            disabled={isLoading}
          />
        </div>
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Cohort Selection */}
      <div>
        <label htmlFor="cohort_id" className="block text-sm font-semibold text-dark mb-2">
          Cohort <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            id="cohort_id"
            value={formData.cohort_id}
            onChange={(e) => setFormData({ ...formData, cohort_id: e.target.value })}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.cohort_id ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || loadingCohorts}
          >
            <option value="">Select a cohort...</option>
            {cohorts
              .filter(c => c.status !== 'completed')
              .map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name} ({cohort.program_type})
                </option>
              ))}
          </select>
        </div>
        {errors.cohort_id && (
          <p className="mt-1 text-sm text-red-600">{errors.cohort_id}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          All students in this cohort will be assigned this task
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-dark mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Provide detailed instructions for this assignment..."
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Due Date and Max Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Due Date */}
        <div>
          <label htmlFor="due_date" className="block text-sm font-semibold text-dark mb-2">
            Due Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.due_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
          )}
        </div>

        {/* Max Points */}
        <div>
          <label htmlFor="max_points" className="block text-sm font-semibold text-dark mb-2">
            Max Points <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="max_points"
              value={formData.max_points}
              onChange={(e) => setFormData({ ...formData, max_points: parseInt(e.target.value) || 0 })}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.max_points ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              disabled={isLoading}
            />
          </div>
          {errors.max_points && (
            <p className="mt-1 text-sm text-red-600">{errors.max_points}</p>
          )}
        </div>
      </div>

      {/* File URL (Optional) */}
      <div>
        <label htmlFor="file_url" className="block text-sm font-semibold text-dark mb-2">
          Attachment URL (Optional)
        </label>
        <input
          type="url"
          id="file_url"
          value={formData.file_url}
          onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.file_url ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://example.com/assignment-file.pdf"
          disabled={isLoading}
        />
        {errors.file_url && (
          <p className="mt-1 text-sm text-red-600">{errors.file_url}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Link to assignment materials (Google Drive, Dropbox, etc.)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AssignmentForm

