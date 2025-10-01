import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import StudentLayout from '../../components/Layout/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { useAssignment } from '../../hooks/useAssignments'
import { useSubmission, useSubmissions } from '../../hooks/useSubmissions'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Award,
  Send,
  CheckCircle,
  Download
} from 'lucide-react'
import { format } from 'date-fns'

const SubmitAssignment = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { assignment, loading: loadingAssignment } = useAssignment(id || '')
  const { submission, loading: loadingSubmission } = useSubmission(id || '', profile?.user_id || '')
  const { createSubmission } = useSubmissions()
  
  const [submissionText, setSubmissionText] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (submission) {
      setSubmissionText(submission.submission_text || '')
      setFileUrl(submission.file_url || '')
    }
  }, [submission])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!submissionText.trim() && !fileUrl.trim()) {
      newErrors.general = 'Please provide either submission text or a file URL'
    }

    if (fileUrl.trim() && !isValidUrl(fileUrl)) {
      newErrors.fileUrl = 'Please enter a valid URL'
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

    if (!validateForm() || !profile?.user_id || !id) return

    setIsSubmitting(true)

    const { error } = await createSubmission({
      assignment_id: id,
      student_id: profile.user_id,
      submission_text: submissionText.trim() || undefined,
      file_url: fileUrl.trim() || undefined,
    })

    if (!error) {
      navigate('/student/assignments')
    }

    setIsSubmitting(false)
  }

  if (loadingAssignment || loadingSubmission) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  if (!assignment) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-dark mb-4">Assignment not found</h2>
          <button
            onClick={() => navigate('/student/assignments')}
            className="text-primary hover:underline"
          >
            Return to assignments
          </button>
        </div>
      </StudentLayout>
    )
  }

  const hasSubmitted = !!submission
  const isGraded = submission?.status === 'graded'

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/student/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Assignments
          </button>
          <h1 className="text-3xl font-bold text-dark">{assignment.title}</h1>
          <p className="text-gray-600 mt-2">
            {assignment.cohorts?.name || 'Unknown Cohort'}
          </p>
        </div>

        {/* Assignment Details */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Assignment Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Max Points: {assignment.max_points}</span>
              </div>
            </div>
            {assignment.description && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Instructions:</p>
                <p className="text-dark whitespace-pre-wrap">{assignment.description}</p>
              </div>
            )}
            {assignment.file_url && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Attachment:</p>
                <a
                  href={assignment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  View Assignment Materials
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Graded Submission Display */}
        {isGraded && submission && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-900">Assignment Graded</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-green-700 mb-1">Your Score:</p>
                <p className="text-3xl font-bold text-green-900">
                  {submission.score}/{assignment.max_points}
                </p>
              </div>
              {submission.feedback && (
                <div>
                  <p className="text-sm text-green-700 mb-1">Instructor Feedback:</p>
                  <p className="text-green-900 whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-green-700 mb-1">Graded On:</p>
                <p className="text-green-900">
                  {format(new Date(submission.graded_at || ''), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Status */}
        {hasSubmitted && !isGraded && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Submission Received</h3>
            </div>
            <p className="text-sm text-blue-700">
              Your work has been submitted and is awaiting grading.
            </p>
            {submission && (
              <p className="text-sm text-blue-700 mt-1">
                Submitted on {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        )}

        {/* Submission Form */}
        {!hasSubmitted && (
          <div className="bg-white rounded-xl shadow-card p-8">
            <h2 className="text-xl font-bold text-dark mb-6">Submit Your Work</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Submission Text */}
              <div>
                <label htmlFor="submissionText" className="block text-sm font-semibold text-dark mb-2">
                  Your Answer
                </label>
                <textarea
                  id="submissionText"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Write your submission here..."
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {submissionText.length}/5000 characters
                </p>
              </div>

              {/* File URL */}
              <div>
                <label htmlFor="fileUrl" className="block text-sm font-semibold text-dark mb-2">
                  File URL (Optional)
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="fileUrl"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.fileUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://drive.google.com/file/..."
                    disabled={isSubmitting}
                  />
                </div>
                {errors.fileUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.fileUrl}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Link to your work on Google Drive, Dropbox, GitHub, etc.
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </form>
          </div>
        )}

        {/* View Submitted Work */}
        {hasSubmitted && submission && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-xl font-bold text-dark mb-4">Your Submission</h2>
            <div className="space-y-4">
              {submission.submission_text && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                  <p className="text-dark whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {submission.submission_text}
                  </p>
                </div>
              )}
              {submission.file_url && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Submitted File:</p>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    View Submitted File
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default SubmitAssignment

