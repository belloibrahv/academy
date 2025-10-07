import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../../components/Layout/AdminLayout'
import toast from 'react-hot-toast'
import { Course } from '../../../types'

const NewCourse = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { error } = await (supabase as any)
        .from('courses')
        .insert([{ title, description }] as Omit<Course, 'id' | 'created_at'>[])

      if (error) throw error

      toast.success('Course created successfully!')
      navigate('/admin/courses')
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('Failed to create course')
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default NewCourse
