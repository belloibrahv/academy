import { useEffect, useState } from 'react'
import AdminLayout from '../../components/Layout/AdminLayout'
import { supabase } from '../../lib/supabase'
import { Users, GraduationCap, FileText, Clock } from 'lucide-react'
import { AdminDashboardStats } from '../../types'

const Dashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalCohorts: 0,
    activeCohorts: 0,
    pendingSubmissions: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async (): Promise<void> => {
    try {
      // Fetch total students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      // Fetch active students
      const { count: activeStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('registration_status', 'active')

      // Fetch total cohorts
      const { count: totalCohorts } = await supabase
        .from('cohorts')
        .select('*', { count: 'exact', head: true })

      // Fetch active cohorts
      const { count: activeCohorts } = await supabase
        .from('cohorts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Fetch pending submissions
      const { count: pendingSubmissions } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Calculate completion rate
      const { data: completedData } = await supabase
        .from('student_cohorts')
        .select('completion_status')
      
      const avgCompletion = completedData && completedData.length > 0
        ? completedData.reduce((acc, curr) => {
            const status = (curr as { completion_status: number }).completion_status
            return acc + (status || 0)
          }, 0) / completedData.length
        : 0

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalCohorts: totalCohorts || 0,
        activeCohorts: activeCohorts || 0,
        pendingSubmissions: pendingSubmissions || 0,
        completionRate: Math.round(avgCompletion),
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Cohorts',
      value: stats.activeCohorts,
      subtitle: `${stats.totalCohorts} total`,
      icon: GraduationCap,
      color: 'bg-green-500',
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingSubmissions,
      subtitle: 'Awaiting review',
      icon: Clock,
      color: 'bg-warning',
    },
    {
      title: 'Avg. Completion',
      value: `${stats.completionRate}%`,
      subtitle: 'Across all cohorts',
      icon: FileText,
      color: 'bg-primary',
    },
  ]

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your academy.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-dark mt-2">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/students"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
            >
              <h3 className="font-semibold text-dark">Manage Students</h3>
              <p className="text-sm text-gray-600 mt-1">View and invite students to cohorts</p>
            </a>
            <a
              href="/admin/assignments/create"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
            >
              <h3 className="font-semibold text-dark">Create Assignment</h3>
              <p className="text-sm text-gray-600 mt-1">Add new tasks for your students</p>
            </a>
            <a
              href="/admin/assignments"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
            >
              <h3 className="font-semibold text-dark">Review Submissions</h3>
              <p className="text-sm text-gray-600 mt-1">Grade pending student work</p>
            </a>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-8">No recent activity to display</p>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard

