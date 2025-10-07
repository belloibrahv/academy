import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import StudentLayout from '../../components/Layout/StudentLayout';
import toast from 'react-hot-toast';

const Submissions = () => {
  const { profile } = useAuth();
  const [assignmentId, setAssignmentId] = useState('');
  const [submissionContent, setSubmissionContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !assignmentId || !submissionContent) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error: submissionError } = await supabase.from('submissions').insert({
        student_id: profile.id,
        assignment_id: assignmentId,
        content: submissionContent,
        status: 'pending',
      });

      if (submissionError) throw submissionError;

      const { error: activityError } = await supabase.from('activity').insert({
        type: 'new_submission',
        message: `${profile.full_name} submitted an assignment.`,
        metadata: {
          student_id: profile.id,
          assignment_id: assignmentId,
        },
      });

      if (activityError) {
        console.error('Error creating activity:', activityError);
      }

      toast.success('Assignment submitted successfully!');
      setAssignmentId('');
      setSubmissionContent('');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark">Submit Assignment</h1>
          <p className="text-gray-600 mt-2">Submit your assignment for review.</p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-6">
          <form onSubmit={handleSubmission}>
            <div className="space-y-4">
              <div>
                <label htmlFor="assignmentId" className="block text-sm font-medium text-gray-700">
                  Assignment ID
                </label>
                <input
                  type="text"
                  id="assignmentId"
                  value={assignmentId}
                  onChange={(e) => setAssignmentId(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="submissionContent" className="block text-sm font-medium text-gray-700">
                  Submission Content
                </label>
                <textarea
                  id="submissionContent"
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {loading ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Submissions;
