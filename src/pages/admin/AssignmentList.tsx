import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import { useAssignments } from '../../hooks/useAssignments'
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar,
  Clock,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { format, isPast, isFuture } from 'date-fns'

const AssignmentList = () => {
  const { assignments, loading, deleteAssignment } = useAssignments()
  const [searchTerm, setSearchTerm] = useState('')
  const [cohortFilter, setCohortFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'overdue'>('all')
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null)

  const getAssignmentStatus = (dueDate: string): 'upcoming' | 'active' | 'overdue' => {
    const due = new Date(dueDate)
    const now = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(now.getDate() + 3)

    if (isPast(due)) return 'overdue'
    if (isFuture(due) && due > threeDaysFromNow) return 'upcoming'
    return 'active'
  }

  const uniqueCohorts = Array.from(
    new Set(assignments.map(a => a.cohorts?.name).filter(Boolean))
  ) as string[]

  const filteredAssignments = assignments.filter((assignment) => {
    const status = getAssignmentStatus(assignment.due_date)
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCohort = cohortFilter === 'all' || assignment.cohorts?.name === cohortFilter
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    return matchesSearch && matchesCohort && matchesStatus
  })

  const handleDelete = async (id: string) => {
    await deleteAssignment(id)
    setDeleteModalId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3" />
          Upcoming
        </span>
      case 'active':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      case 'overdue':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
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

  const upcomingCount = assignments.filter(a => getAssignmentStatus(a.due_date) === 'upcoming').length
  const activeCount = assignments.filter(a => getAssignmentStatus(a.due_date) === 'active').length
  const overdueCount = assignments.filter(a => getAssignmentStatus(a.due_date) === 'overdue').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark">Assignments</h1>
            <p className="text-gray-600 mt-2">Create and manage assignments for your cohorts</p>
          </div>
          <Link
            to="/admin/assignments/create"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Assignment
          </Link>
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
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-dark mt-1">{upcomingCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-dark mt-1">{activeCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-dark mt-1">{overdueCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Cohort Filter */}
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Cohorts</option>
              {uniqueCohorts.map((cohort) => (
                <option key={cohort} value={cohort}>
                  {cohort}
                </option>
              ))}
            </select>

            {/* Status Filter */}
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
                onClick={() => setStatusFilter('upcoming')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'upcoming'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'overdue'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment.due_date)
              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    {getStatusBadge(status)}
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/assignments/${assignment.id}/edit`}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteModalId(assignment.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Link to={`/admin/assignments/${assignment.id}`}>
                    <h3 className="text-lg font-bold text-dark mb-2 hover:text-primary transition-colors">
                      {assignment.title}
                    </h3>
                  </Link>

                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {assignment.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{assignment.cohorts?.name || 'Unknown Cohort'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Max Points: {assignment.max_points}</span>
                    </div>
                  </div>

                  {assignment.file_url && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <a
                        href={assignment.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || cohortFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first assignment to get started'}
            </p>
            {!searchTerm && cohortFilter === 'all' && statusFilter === 'all' && (
              <Link
                to="/admin/assignments/create"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Assignment
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-dark mb-2">Delete Assignment?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this assignment? This will also delete all associated submissions. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteModalId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModalId(null)}
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

export default AssignmentList
