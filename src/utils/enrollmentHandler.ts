import { supabase } from '../lib/supabase';

export interface PendingInvite {
  token: string;
  cohort_id: string;
  email: string;
}

export const handlePendingEnrollment = async (userId: string): Promise<void> => {
  try {
    const pendingInviteStr = localStorage.getItem('pending_invite');
    if (!pendingInviteStr) return;

    const pendingInvite: PendingInvite = JSON.parse(pendingInviteStr);

    // Enroll student in cohort
    const enrollmentData = {
      student_id: userId,
      cohort_id: pendingInvite.cohort_id,
      enrollment_date: new Date().toISOString(),
      completion_status: 0,
    };

    const { error: enrollError } = await supabase.from('student_cohorts').insert(enrollmentData as any);

    if (enrollError) {
      console.error('Enrollment error:', enrollError);
      return;
    }

    // Add activity log
    const { data: studentProfile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
    const { data: cohort } = await supabase.from('cohorts').select('name').eq('id', pendingInvite.cohort_id).single();

    if (studentProfile && cohort) {
      const { error: activityError } = await supabase.from('activity').insert({
        type: 'new_enrollment',
        message: `${studentProfile.full_name} enrolled in ${cohort.name}`,
        metadata: {
          student_id: userId,
          cohort_id: pendingInvite.cohort_id,
        },
      });

      if (activityError) {
        console.error('Error creating activity:', activityError);
      }
    }

    // Mark invite as used
    const { error: updateError } = await (supabase as any)
      .from('invite_links')
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq('token', pendingInvite.token);

    if (updateError) {
      console.error('Invite update error:', updateError);
    }

    // Clear pending invite
    localStorage.removeItem('pending_invite');

    console.log('Student enrolled successfully after email confirmation');
  } catch (error) {
    console.error('Error handling pending enrollment:', error);
  }
};
