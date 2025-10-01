import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import { useCohorts } from '../../hooks/useCohorts'
import { Plus, Search, Users, Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const CohortList = () => {
  const { cohorts, loading } = useCohorts()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all')

  const filteredCohorts = cohorts.filter((cohort) => {
    const matchesSearch = cohort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cohort.program_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || cohort.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const getProgramTypeColor = (type: string): string => {
    switch (type) {
      case 'Web Development':
        return 'bg-purple-100 text-purple-800'
      case 'Mobile Development':
        return 'bg-blue-100 text-blue-800'
      case 'Data Science':
        return 'bg-orange-100 text-orange-800'
      case 'UI/UX Design':
        return 'bg-pink-100 text-pink-800'
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark">Cohorts</h1>
            <p className="text-gray-600 mt-2">Manage your training programs and batches</p>
          </div>
          <Link
            to="/admin/cohorts/create"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Cohort
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cohorts</p>
                <p className="text-2xl font-bold text-dark mt-1">{cohorts.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-dark mt-1">
                  {cohorts.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-dark mt-1">
                  {cohorts.filter(c => c.status === 'upcoming').length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-dark mt-1">
                  {cohorts.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search cohorts by name or program type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

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
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Cohorts Grid */}
        {filteredCohorts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCohorts.map((cohort) => (
              <Link
                key={cohort.id}
                to={`/admin/cohorts/${cohort.id}`}
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(cohort.status)}`}>
                    {cohort.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProgramTypeColor(cohort.program_type)}`}>
                    {cohort.program_type}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-dark mb-2">{cohort.name}</h3>
                
                {cohort.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cohort.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(cohort.start_date), 'MMM d, yyyy')} - {format(new Date(cohort.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{cohort.duration_months} months</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No cohorts found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first cohort'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/admin/cohorts/create"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Cohort
              </Link>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default CohortList

