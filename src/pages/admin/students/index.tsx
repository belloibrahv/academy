import { useEffect, useState } from 'react'
import AdminLayout from '../../../components/Layout/AdminLayout'
import { supabase } from '../../../lib/supabase'
import { Profile } from '../../../types'

const StudentsPage = () => {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')

      if (error) throw error
      setStudents(data as Profile[])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Manage Students</h1>
        {/* Student list */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{student.full_name}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{student.user?.email}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{student.registration_status}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StudentsPage
