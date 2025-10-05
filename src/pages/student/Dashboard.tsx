import StudentLayout from '../../components/Layout/StudentLayout'
import { useAuth } from '../../contexts/AuthContext'

const Dashboard = () => {
  const { profile } = useAuth()

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {profile?.full_name || 'student'}!</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Welcome to your dashboard!</h2>
          <p className="text-gray-500 text-center py-8">
            All your learning materials and resources will be displayed here soon.
          </p>
        </div>
      </div>
    </StudentLayout>
  )
}

export default Dashboard
