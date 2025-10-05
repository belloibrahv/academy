import { useEffect, useState } from 'react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { supabase } from '../../lib/supabase'
import { Announcement } from '../../types'
import { Trash2, Edit } from 'lucide-react'

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching announcements:', error)
    } else {
      setAnnouncements(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) {
        console.error('Error deleting announcement:', error)
        alert('Failed to delete announcement.')
      } else {
        fetchAnnouncements()
      }
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark">Announcements</h1>
        <a href="/admin/announcements/new" className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
          New Announcement
        </a>
      </div>
      <div className="bg-white rounded-xl shadow-card">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No announcements yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4">Title</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="p-4">{ann.title}</td>
                    <td className="p-4">{new Date(ann.created_at).toLocaleDateString()}</td>
                    <td className="p-4 flex space-x-2">
                      <a href={`/admin/announcements/edit/${ann.id}`} className="text-primary hover:underline">
                        <Edit size={18} />
                      </a>
                      <button onClick={() => handleDelete(ann.id)} className="text-red-500 hover:underline">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Announcements
