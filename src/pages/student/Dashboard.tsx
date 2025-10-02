import { useEffect, useState } from 'react'
import StudentLayout from '../../components/Layout/StudentLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, FileCheck, Clock, TrendingUp } from 'lucide-react'
import { StudentDashboardStats, StudentCohortWithDetails } from '../../types'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentDashboardStats>({
    enrolledCohorts: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageScore: 0,
    progressPercentage: 0,
  })
  const [cohorts, setCohorts] = useState<StudentCohortWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchCohorts()
    }
  }, [user])

  const fetchStats = async (): Promise<void> => {
    if (!user) return

    try {
      console.log('Fetching stats for user:', user.id)
      // Fetch enrolled cohorts
      const { data: enrolledCohortsData } = await supabase
        .from('student_cohorts')
        .select('id')
        .eq('student_id', user.id)
      const enrolledCohorts = enrolledCohortsData?.length || 0

      // Fetch completed assignments
      const { data: completedAssignmentsData } = await supabase
        .from('submissions')
        .select('id')
        .eq('student_id', user.id)
        .eq('status', 'graded')
      const completedAssignments = completedAssignmentsData?.length || 0

      // Fetch assignments for student's cohorts
      const { data: studentCohorts } = await supabase
        .from('student_cohorts')
        .select('cohort_id')
        .eq('student_id', user.id)

      const cohortIds = studentCohorts?.map(sc => (sc as { cohort_id: string }).cohort_id) || []

      if (cohortIds.length > 0) {
        const { data: totalAssignmentsData } = await supabase
          .from('assignments')
          .select('id')
          .in('cohort_id', cohortIds)
        const totalAssignments = totalAssignmentsData?.length || 0

        const pendingAssignments = (totalAssignments || 0) - (completedAssignments || 0)

        // Calculate average score
        const { data: submissions } = await supabase
          .from('submissions')
          .select('score')
          .eq('student_id', user.id)
          .eq('status', 'graded')
          .not('score', 'is', null)

        const avgScore = submissions && submissions.length > 0
          ? submissions.reduce((acc, curr) => {
              const score = (curr as { score: number }).score
              return acc + (score || 0)
            }, 0) / submissions.length
          : 0

        // Get progress percentage from cohort
        const { data: cohortData } = await supabase
          .from('student_cohorts')
          .select('completion_status')
          .eq('student_id', user.id)
          .single()

        const completionStatus = cohortData ? (cohortData as { completion_status: number }).completion_status : 0

        setStats({
          enrolledCohorts: enrolledCohorts || 0,
          completedAssignments: completedAssignments || 0,
          pendingAssignments: pendingAssignments > 0 ? pendingAssignments : 0,
          averageScore: Math.round(avgScore),
          progressPercentage: completionStatus || 0,
        })
      } else {
        setStats({
          enrolledCohorts: enrolledCohorts || 0,
          completedAssignments: 0,
          pendingAssignments: 0,
          averageScore: 0,
          progressPercentage: 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCohorts = async (): Promise<void> => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('student_cohorts')
        .select('*, cohorts(*)')
        .eq('student_id', user.id)

      if (error) throw error
      setCohorts(data as StudentCohortWithDetails[] || [])
    } catch (error) {
      console.error('Error fetching cohorts:', error)
    }
  }

  const statCards = [
    {
      title: 'Enrolled Cohorts',
      value: stats.enrolledCohorts,
      subtitle: 'Active programs',
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: 'Completed',
      value: stats.completedAssignments,
      subtitle: 'Assignments done',
      icon: FileCheck,
      color: 'bg-success',
    },
    {
      title: 'Pending',
      value: stats.pendingAssignments,
      subtitle: 'To be completed',
      icon: Clock,
      color: 'bg-warning',
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      subtitle: 'Overall performance',
      icon: TrendingUp,
      color: 'bg-primary',
    },
  ]

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your learning progress and assignments</p>
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

        {/* My Cohorts */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">My Programs</h2>
          {cohorts.length > 0 ? (
            <div className="space-y-4">
              {cohorts.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark">{sc.cohorts?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{sc.cohorts?.program_type}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Started: {new Date(sc.enrollment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{sc.completion_status}%</p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sc.completion_status}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              You are not enrolled in any programs yet
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/student/assignments"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
            >
              <h3 className="font-semibold text-dark">View Assignments</h3>
              <p className="text-sm text-gray-600 mt-1">See all your tasks and deadlines</p>
            </a>
            <a
              href="/student/progress"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
            >
              <h3 className="font-semibold text-dark">Track Progress</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor your learning journey</p>
            </a>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}

export default Dashboard

