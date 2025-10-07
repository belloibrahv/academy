import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { Submission } from '../../../types';
import { format } from 'date-fns';

const AssignmentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select(
            `
            *,
            student:profiles!student_id (*)
          `
          )
          .eq('id', id)
          .single();

        if (error) throw error;
        setSubmission(data);
      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
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

  if (!submission) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Submission not found</h1>
          <p className="text-gray-600">The requested submission could not be found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h1 className="text-2xl font-bold text-dark">Assignment Submission</h1>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <strong>Student:</strong> {submission.student?.full_name}
            </p>
            <p>
              <strong>Submitted At:</strong> {format(new Date(submission.created_at), 'PPPppp')}
            </p>
            <p>
              <strong>Status:</strong> <span className="capitalize">{submission.status}</span>
            </p>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-dark">Submission Content</h2>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">{submission.content}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignmentViewPage;
