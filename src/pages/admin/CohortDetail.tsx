import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import { useCohort, useCohorts } from '../../hooks/useCohorts'
import { supabase } from '../../lib/supabase'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  TrendingUp,
  FileText,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { StudentCohortWithDetails } from '../../types'
import toast from 'react-hot-toast'

const CohortDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { cohort, loading } = useCohort(id || '')
  const { deleteCohort } = useCohorts()
  const [enrolledStudents, setEnrolledStudents] = useState<StudentCohortWithDetails[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchEnrolledStudents()
    }
  }, [id])

  const fetchEnrolledStudents = async () => {
    if (!id) return
    
    try {
      const { data, error } = await supabase
        .from('student_cohorts')
        .select('*, profiles(*)')
        .eq('cohort_id', id)

      if (error) throw error
      setEnrolledStudents(data as StudentCohortWithDetails[] || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load enrolled students')
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    
    const { error } = await deleteCohort(id)
    if (!error) {
      navigate('/admin/cohorts')
    }
    setShowDeleteModal(false)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const avgCompletion = enrolledStudents.length > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.completion_status, 0) / enrolledStudents.length)
    : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/cohorts')}
              className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Cohorts
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-dark">{cohort.name}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(cohort.status)}`}>
                {cohort.status}
              </span>
            </div>
            <p className="text-gray-600">{cohort.program_type}</p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/admin/cohorts/${id}/edit`}
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
                <p className="text-sm text-gray-600">Enrolled Students</p>
                <p className="text-2xl font-bold text-dark mt-1">{enrolledStudents.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold text-dark mt-1">{avgCompletion}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-dark mt-1">{cohort.duration_months}m</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-dark mt-1">0</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Cohort Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Start Date</p>
              <p className="text-dark font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(cohort.start_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">End Date</p>
              <p className="text-dark font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(cohort.end_date), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-dark">{cohort.description}</p>
            </div>
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Enrolled Students ({enrolledStudents.length})</h2>
          
          {loadingStudents ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : enrolledStudents.length > 0 ? (
            <div className="space-y-3">
              {enrolledStudents.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      {enrollment.profiles?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-dark">{enrollment.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">
                        Enrolled {format(new Date(enrollment.enrollment_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="font-bold text-primary">{enrollment.completion_status}%</p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.completion_status}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No students enrolled yet</p>
              <Link
                to="/admin/students/invite"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Invite students to this cohort
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-dark mb-2">Delete Cohort?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{cohort.name}"? This action cannot be undone.
              {enrolledStudents.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: {enrolledStudents.length} student(s) are enrolled in this cohort.
                </span>
              )}
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

export default CohortDetail
