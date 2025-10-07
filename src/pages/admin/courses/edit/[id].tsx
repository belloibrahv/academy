import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../../components/Layout/AdminLayout'
import { Course } from '../../../../types.ts'

const EditCourse = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return
      const { data, error } = await (supabase as any).from('courses').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching course:', error)
        navigate('/admin/courses')
      } else {
        const courseData = data as Course
        setTitle(courseData.title)
        setDescription(courseData.description)
      }
      setLoading(false)
    }

    fetchCourse()
  }, [id, navigate])

  const handleUpdate = async () => {
    if (!title) {
      alert('Please fill in at least the title.')
      return
    }
    if(!id) return;

    setLoading(true)
    const { error } = await (supabase as any).from('courses').update({ title, description }).eq('id', id)
    if (error) {
      console.error('Error updating course:', error)
      alert('Failed to update course.')
    } else {
      navigate('/admin/courses')
    }
    setLoading(false)
  }

  if (loading) {
    return <AdminLayout><p>Loading...</p></AdminLayout>
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-dark mb-6">Edit Course</h1>
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => navigate('/admin/courses')}
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

export default EditCourse
