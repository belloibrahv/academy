import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/Layout/AdminLayout'

const NewAnnouncement = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!title || !content) {
      alert('Please fill in all fields.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('announcements').insert([{ title, content }])
    if (error) {
      console.error('Error creating announcement:', error)
      alert('Failed to create announcement.')
    } else {
      router.push('/admin/announcements')
    }
    setLoading(false)
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-dark mb-6">New Announcement</h1>
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
            onClick={handleSave}
            className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default NewAnnouncement
