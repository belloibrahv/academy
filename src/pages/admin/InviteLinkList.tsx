import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/Layout/AdminLayout'
import { useInviteLinks } from '../../hooks/useInviteLinks'
import { 
  Plus, 
  Search, 
  Link2, 
  Calendar, 
  Copy, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const InviteLinkList = () => {
  const { inviteLinks, loading, deleteInviteLink } = useInviteLinks()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all')
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null)

  const getInviteStatus = (link: typeof inviteLinks[0]): 'active' | 'used' | 'expired' => {
    if (link.used) return 'used'
    if (isPast(new Date(link.expires_at))) return 'expired'
    return 'active'
  }

  const filteredLinks = inviteLinks.filter((link) => {
    const status = getInviteStatus(link)
    const matchesSearch = link.cohorts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.token.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyToClipboard = async (token: string) => {
    const inviteUrl = `${import.meta.env.VITE_APP_URL}/register?token=${token}`
    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleDelete = async (id: string) => {
    await deleteInviteLink(id)
    setDeleteModalId(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Active
        </span>
      case 'used':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3" />
          Used
        </span>
      case 'expired':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          Expired
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

  const activeCount = inviteLinks.filter(l => getInviteStatus(l) === 'active').length
  const usedCount = inviteLinks.filter(l => getInviteStatus(l) === 'used').length
  const expiredCount = inviteLinks.filter(l => getInviteStatus(l) === 'expired').length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dark">Invite Links</h1>
            <p className="text-gray-600 mt-2">Generate and manage student invitation links</p>
          </div>
          <Link
            to="/admin/invite-links/generate"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Generate Link
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-dark mt-1">{inviteLinks.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Link2 className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm text-gray-600">Used</p>
                <p className="text-2xl font-bold text-dark mt-1">{usedCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-dark mt-1">{expiredCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
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
                placeholder="Search by cohort name or token..."
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
                onClick={() => setStatusFilter('used')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'used'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Used
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === 'expired'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {/* Invite Links Table */}
        {filteredLinks.length > 0 ? (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cohort
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLinks.map((link) => {
                    const status = getInviteStatus(link)
                    return (
                      <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-dark">{link.cohorts?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500 font-mono">{link.token.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(link.expires_at), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(link.created_at), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {link.used ? (
                            <span className="text-blue-600 font-medium">
                              {format(new Date(link.used_at || ''), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not used</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => copyToClipboard(link.token)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModalId(link.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invite links found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Generate your first invite link to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/admin/invite-links/generate"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                Generate Link
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-dark mb-2">Delete Invite Link?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this invite link? This action cannot be undone.
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

export default InviteLinkList

