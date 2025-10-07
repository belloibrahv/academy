import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import AdminLayout from '../../../components/Layout/AdminLayout'
import { Course } from '../../../types.ts'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (error) {
        console.error('Error fetching courses:', error)
      } else {
        setCourses(data)
      }
      setLoading(false)
    }

    fetchCourses()
  }, [])

  const deleteCourse = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete course.')
      } else {
        setCourses(courses.filter((course) => course.id !== id))
      }
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark">Manage Courses</h1>
        <Link to="/admin/courses/new" className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
          New Course
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-card p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="border-b text-gray-500 uppercase text-sm">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 hidden md:table-cell">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b last:border-none">
                    <td className="py-4 px-4 font-medium text-dark">{course.title}</td>
                    <td className="py-4 px-4 text-gray-600 hidden md:table-cell">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 flex justify-end items-center gap-2">
                      <Link to={`/admin/courses/edit/${course.id}`} className="p-2 text-primary hover:bg-gray-100 rounded-full transition-colors">
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="p-2 text-danger hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No courses created yet.</p>
        )}
      </div>
    </AdminLayout>
  )
}

export default Courses
