import { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Users, UserPlus, FileCheck, UserCheck, Megaphone } from 'lucide-react';
import { AdminDashboardStats, Activity } from '../../types.ts';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const activityIcons = {
  new_student: UserPlus,
  new_submission: FileCheck,
  new_enrollment: UserCheck,
  new_announcement: Megaphone,
};

const Dashboard = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      // Fetch total students count
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Fetch active students count
      const { count: activeStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .eq('registration_status', 'active');

      // Fetch recent activity
      const { data: recentActivityData } = await supabase
        .from('activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      const recentActivity = recentActivityData || [];

      setStats({
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        recentActivity: recentActivity,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      color: 'bg-blue-500',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const renderActivityMessage = (activity: Activity) => {
    if (activity.type === 'new_submission' && activity.metadata?.assignment_id) {
      return (
        <Link to={`/admin/assignments/${activity.metadata.assignment_id}`} className="hover:underline">
          {activity.message}
        </Link>
      );
    }
    if (activity.metadata?.student_id) {
      return (
        <Link to={`/admin/students/${activity.metadata.student_id}`} className="hover:underline">
          {activity.message}
        </Link>
      );
    }
    return activity.message;
  };

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
            const Icon = card.icon;
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
            );
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
              <p className="text-sm text-gray-600 mt-1">View and manage students</p>
            </a>
            <a
              href="/admin/announcements"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-all"
            >
              <h3 className="font-semibold text-dark">Manage Announcements</h3>
              <p className="text-sm text-gray-600 mt-1">Create and share updates with students</p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Recent Activity</h2>
          {stats.recentActivity.length > 0 ? (
            <ul className="space-y-4">
              {stats.recentActivity.map((activity: Activity) => {
                const Icon = activityIcons[activity.type] || Users;
                return (
                  <li key={activity.id} className="flex items-start space-x-4">
                    <div className='bg-gray-200 p-2 rounded-full'>
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">{renderActivityMessage(activity)}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity to display</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
