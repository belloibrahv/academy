import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { Profile, Activity } from '../../../types';
import { formatDistanceToNow } from 'date-fns';
import { User, Mail, Calendar } from 'lucide-react';

const StudentProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      try {
        // Fetch student profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setStudent(profileData);

        // Fetch student activity
        const { data: activityData, error: activityError } = await supabase
          .from('activity')
          .select('*')
          .eq('metadata->>student_id', id)
          .order('created_at', { ascending: false });

        if (activityError) throw activityError;
        setActivity(activityData || []);

      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Student not found</h1>
          <p className="text-gray-600">The requested student could not be found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Student Profile Header */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary text-white rounded-full p-4">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark">{student.full_name}</h1>
              <p className="text-gray-600">Student</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-gray-500" />
              <span>{student.email || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <span>Joined {formatDistanceToNow(new Date(student.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {/* Student Activity Feed */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-xl font-bold text-dark mb-4">Recent Activity</h2>
          {activity.length > 0 ? (
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start space-x-4">
                  <div className="bg-gray-200 p-2 rounded-full">
                    {/* You can add icons here based on activity type */}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{item.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity to display for this student.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentProfilePage;
