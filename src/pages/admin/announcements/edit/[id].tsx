import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/router'
import AdminLayout from '../../../../components/Layout/AdminLayout'
import { Announcement } from '../../../../types'

const EditAnnouncement = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (id) {
      fetchAnnouncement()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchAnnouncement = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single()
    if (error) {
      console.error('Error fetching announcement:', error)
      router.push('/admin/announcements')
    } else {
      setAnnouncement(data)
      setTitle(data.title)
      setContent(data.content)
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!title || !content) {
      alert('Please fill in all fields.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('announcements').update({ title, content }).eq('id', id)
    if (error) {
      console.error('Error updating announcement:', error)
      alert('Failed to update announcement.')
    } else {
      router.push('/admin/announcements')
    }
    setLoading(false)
  }

  if (loading || !announcement) {
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
      <h1 className="text-3xl font-bold text-dark mb-6">Edit Announcement</h1>
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => router.push('/admin/announcements')}
            className="text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default EditAnnouncement
