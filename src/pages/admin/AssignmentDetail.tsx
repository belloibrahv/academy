import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import { useAssignment, useAssignments } from '../../hooks/useAssignments'
import { supabase } from '../../lib/supabase'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  Award,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { format, isPast, isFuture } from 'date-fns'
import toast from 'react-hot-toast'

interface SubmissionWithProfile {
  id: string
  student_id: string
  assignment_id: string
  submission_text: string | null
  file_url: string | null
  score: number | null
  feedback: string | null
  submitted_at: string
  graded_at: string | null
  profiles?: {
    full_name: string
    user_id: string
  }
}

const AssignmentDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { assignment, loading } = useAssignment(id || '')
  const { deleteAssignment } = useAssignments()
  const [submissions, setSubmissions] = useState<SubmissionWithProfile[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchSubmissions()
    }
  }, [id])

  const fetchSubmissions = async () => {
    if (!id) return
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(*)')
        .eq('assignment_id', id)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setSubmissions(data as SubmissionWithProfile[] || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Failed to load submissions')
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    
    const { error } = await deleteAssignment(id)
    if (!error) {
      navigate('/admin/assignments')
    }
    setShowDeleteModal(false)
  }

  const getAssignmentStatus = () => {
    if (!assignment) return 'unknown'
    
    const due = new Date(assignment.due_date)
    const now = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(now.getDate() + 3)

    if (isPast(due)) return 'overdue'
    if (isFuture(due) && due > threeDaysFromNow) return 'upcoming'
    return 'active'
  }

  const getStatusBadge = () => {
    const status = getAssignmentStatus()
    
    switch (status) {
      case 'upcoming':
        return <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
          <Clock className="h-4 w-4" />
          Upcoming
        </span>
      case 'active':
        return <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4" />
          Active
        </span>
      case 'overdue':
        return <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="h-4 w-4" />
          Overdue
        </span>
      default:
        return null
    }
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

  const gradedCount = submissions.filter(s => s.score !== null).length
  const avgScore = gradedCount > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / gradedCount)
    : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/assignments')}
              className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Assignments
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-dark">{assignment.title}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-gray-600">{assignment.cohorts?.name || 'Unknown Cohort'}</p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/admin/assignments/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-dark rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submissions</p>
                <p className="text-2xl font-bold text-dark mt-1">{submissions.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-2xl font-bold text-dark mt-1">{gradedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-dark mt-1">{avgScore}/{assignment.max_points}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Max Points</p>
                <p className="text-2xl font-bold text-dark mt-1">{assignment.max_points}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Assignment Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Due Date</p>
              <p className="text-dark font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(assignment.due_date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            {assignment.description && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-dark whitespace-pre-wrap">{assignment.description}</p>
              </div>
            )}
            {assignment.file_url && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Attachment</p>
                <a
                  href={assignment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Submissions ({submissions.length})</h2>
          
          {loadingSubmissions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      {submission.profiles?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-dark">{submission.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {submission.score !== null ? (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="font-bold text-green-600">{submission.score}/{assignment.max_points}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-yellow-600 font-medium">Pending Grade</span>
                    )}
                    {submission.file_url && (
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="View submission"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-dark mb-2">Delete Assignment?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{assignment.title}"? This will also delete all {submissions.length} submission(s). This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-dark font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AssignmentDetail

