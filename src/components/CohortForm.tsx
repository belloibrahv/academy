import { useState, FormEvent } from 'react'
import { Cohort } from '../types'

interface CohortFormProps {
  initialData?: Partial<Cohort>
  onSubmit: (data: Omit<Cohort, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
}

const CohortForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Create Cohort',
  isLoading = false 
}: CohortFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    program_type: initialData?.program_type || 'Web Development',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    description: initialData?.description || '',
    status: initialData?.status || 'upcoming',
    duration_months: initialData?.duration_months || 3,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Cohort name is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await onSubmit(formData as Omit<Cohort, 'id' | 'created_at' | 'updated_at'>)
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cohort Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
          Cohort Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Web Development Bootcamp 2025-Q1"
          disabled={isLoading}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Program Type */}
      <div>
        <label htmlFor="program_type" className="block text-sm font-medium text-dark mb-2">
          Program Type *
        </label>
        <select
          id="program_type"
          value={formData.program_type}
          onChange={(e) => handleChange('program_type', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={isLoading}
        >
          <option value="Web Development">Web Development</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="Data Science">Data Science</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Start Date */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-dark mb-2">
            Start Date *
          </label>
          <input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              errors.start_date ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-dark mb-2">
            End Date *
          </label>
          <input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              errors.end_date ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
        </div>
      </div>

      {/* Duration and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration */}
        <div>
          <label htmlFor="duration_months" className="block text-sm font-medium text-dark mb-2">
            Duration (months) *
          </label>
          <select
            id="duration_months"
            value={formData.duration_months}
            onChange={(e) => handleChange('duration_months', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={isLoading}
          >
            <option value="3">3 months</option>
            <option value="6">6 months</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-dark mb-2">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={isLoading}
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-dark mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe the cohort, what students will learn, prerequisites, etc."
          disabled={isLoading}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <p className="text-sm text-gray-500 mt-1">
          {formData.description.length} characters
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
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
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default CohortForm

