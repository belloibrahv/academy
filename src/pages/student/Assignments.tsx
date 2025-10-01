import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StudentLayout from '../../components/Layout/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FileText, 
  Calendar, 
  Award, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Send
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import { Assignment } from '../../types'

interface AssignmentWithSubmission extends Assignment {
  cohorts?: {
    name: string
  }
  hasSubmission?: boolean
  submissionStatus?: string
  score?: number
}

const Assignments = () => {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  useEffect(() => {
    if (profile?.user_id) {
      fetchAssignments()
    }
  }, [profile])

  const fetchAssignments = async () => {
    if (!profile?.user_id) return

    try {
      setLoading(true)

      // Get student's cohorts
      const { data: cohortData, error: cohortError } = await supabase
        .from('student_cohorts')
        .select('cohort_id')
        .eq('student_id', profile.user_id)

      if (cohortError) throw cohortError

      const cohortIds = (cohortData || []).map((c: { cohort_id: string }) => c.cohort_id)

      if (cohortIds.length === 0) {
        setAssignments([])
        setLoading(false)
        return
      }

      // Get assignments for those cohorts
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .select('*, cohorts(name)')
        .in('cohort_id', cohortIds)
        .order('due_date', { ascending: true })

      if (assignmentError) throw assignmentError

      // Get submissions for this student
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select('assignment_id, status, score')
        .eq('student_id', profile.user_id)

      if (submissionError) throw submissionError

      // Merge assignment and submission data
      const mergedData = (assignmentData || []).map((assignment: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submission = (submissionData || []).find((s: any) => s.assignment_id === assignment.id) as any
        return {
          ...assignment,
          hasSubmission: !!submission,
          submissionStatus: submission?.status || 'pending',
          score: submission?.score
        } as AssignmentWithSubmission
      })

      setAssignments(mergedData)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssignments = assignments.filter((assignment) => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'pending') return !assignment.hasSubmission
    if (statusFilter === 'submitted') return assignment.hasSubmission && assignment.submissionStatus === 'pending'
    if (statusFilter === 'graded') return assignment.submissionStatus === 'graded'
    return true
  })

  const getStatusBadge = (assignment: AssignmentWithSubmission) => {
    if (assignment.submissionStatus === 'graded') {
      return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3" />
        Graded
      </span>
    }

    if (assignment.hasSubmission) {
      return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
        <Clock className="h-3 w-3" />
        Submitted
      </span>
    }

    if (isPast(new Date(assignment.due_date))) {
      return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        <AlertCircle className="h-3 w-3" />
        Overdue
      </span>
    }

    return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  const pendingCount = assignments.filter(a => !a.hasSubmission).length
  const submittedCount = assignments.filter(a => a.hasSubmission && a.submissionStatus === 'pending').length
  const gradedCount = assignments.filter(a => a.submissionStatus === 'graded').length

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark">My Assignments</h1>
          <p className="text-gray-600 mt-2">View and submit your assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-dark mt-1">{assignments.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-dark mt-1">{pendingCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-dark mt-1">{submittedCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Send className="h-6 w-6 text-blue-600" />
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
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'submitted'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'graded'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Graded
            </button>
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  {getStatusBadge(assignment)}
                  {assignment.score !== undefined && (
                    <div className="flex items-center gap-1 text-green-600 font-bold">
                      <Award className="h-4 w-4" />
                      {assignment.score}/{assignment.max_points}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-dark mb-2">
                  {assignment.title}
                </h3>

                {assignment.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{assignment.cohorts?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span>Max Points: {assignment.max_points}</span>
                  </div>
                </div>

                <Link
                  to={`/student/assignments/${assignment.id}`}
                  className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  {assignment.hasSubmission ? 'View Submission' : 'Submit Assignment'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no assignments at the moment'}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default Assignments
