import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useNavigate, useParams, Link } from 'react-router-dom'
import AdminLayout from '../../../components/Layout/AdminLayout'
import { Profile } from '../../../types.ts'
import { ArrowLeft, Mail, Calendar, Info } from 'lucide-react'

const StudentDetail = () => {
  const [student, setStudent] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, user:users(email)')
          .eq('id', id)
          .single()

        if (error || !data) {
          throw error || new Error('Student not found')
        }
        
        setStudent(data as Profile)
      } catch (error) {
        console.error('Error fetching student details:', error)
        navigate('/admin/students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id, navigate])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
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

  if (!student) {
    return (
      <AdminLayout>
        <p className="text-center text-gray-500">Student not found.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div>
        <Link to="/admin/students" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft size={18} />
          Back to Students
        </Link>
        
        <div className="bg-white rounded-xl shadow-card p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-24 w-24 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
              {student.full_name.charAt(0)}
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-dark">{student.full_name}</h1>
              <p className="text-gray-600 mt-1">Student Profile</p>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-dark">{student.user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium text-dark">{new Date(student.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Info size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Registration Status</p>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(student.registration_status)}`}>
                    {student.registration_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for future content like enrolled courses */}
        <div className="bg-white rounded-xl shadow-card p-6 mt-6">
          <h2 className="text-xl font-bold text-dark">Enrolled Courses</h2>
          <p className="text-center text-gray-500 py-8">No courses enrolled yet.</p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StudentDetail
