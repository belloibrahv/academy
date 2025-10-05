import { useEffect, useState } from 'react'
import StudentLayout from '../../components/Layout/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Announcement } from '../../types'

const Dashboard = () => {
  const { profile } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
      console.error('Error fetching announcements:', error)
    } else {
      setAnnouncements(data || [])
    }
    setLoading(false)
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {profile?.full_name || 'student'}!</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Latest Announcements</h2>
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements to display right now.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-dark">{ann.title}</h3>
                    <p className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{ann.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">My Courses</h2>
          <p className="text-gray-500 text-center py-8">
            Your enrolled courses will be displayed here soon.
          </p>
        </div>
      </div>
    </StudentLayout>
  )
}

export default Dashboard
