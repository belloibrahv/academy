import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const NewAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleSave = async () => {
    if (!title || !content) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const { data: announcement, error } = await (supabase as any)
      .from('announcements')
      .insert([{ title, content }])
      .select();

    if (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement.');
    } else {
      // Add activity log
      if (announcement && profile) {
        const { error: activityError } = await supabase.from('activity').insert({
          type: 'new_announcement',
          message: `New announcement: ${title}`,
          metadata: {
            announcement_id: announcement[0].id,
            author_id: profile.id,
          },
        });

        if (activityError) {
          console.error('Error creating activity:', activityError);
        }
      }

      navigate('/admin/announcements');
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-dark mb-6">New Announcement</h1>
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => navigate('/admin/announcements')}
            className="text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewAnnouncement;
