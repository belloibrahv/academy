// Database Types
export interface User {
  id: string
  email: string
  role: 'admin' | 'student'
  created_at: string
  last_login?: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  phone_number?: string
  profile_photo_url?: string
  bio?: string
  linkedin_url?: string
  github_url?: string
  role: 'admin' | 'student'
  registration_status: 'pending' | 'active' | 'completed' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Cohort {
  id: string
  name: string
  program_type: 'Web Development' | 'Mobile Development' | 'Data Science' | 'UI/UX Design' | 'Other'
  start_date: string
  end_date: string
  description?: string
  status: 'active' | 'completed' | 'upcoming'
  duration_months: number
  created_at: string
  updated_at: string
}

export interface StudentCohort {
  id: string
  student_id: string
  cohort_id: string
  enrollment_date: string
  completion_status: number // 0-100
  completed_at?: string
  created_at: string
}

export interface Assignment {
  id: string
  title: string
  description: string | null
  due_date: string
  cohort_id: string
  created_by?: string
  created_at: string
  updated_at: string
  max_points: number
  file_url: string | null
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submission_url?: string
  submission_text?: string
  file_url?: string
  submitted_at: string
  status: 'pending' | 'graded' | 'late'
  score?: number
  feedback?: string
  graded_at?: string
  graded_by?: string
}

export interface InviteLink {
  id: string
  token: string
  cohort_id: string
  expires_at: string
  max_uses?: number
  used: boolean
  used_at?: string
  created_at: string
  updated_at: string
}

export interface ProgressLog {
  id: string
  student_id: string
  cohort_id: string
  milestone: string
  completed: boolean
  completed_at?: string
  created_at: string
}

// Joined Types for queries
export interface AssignmentWithCohort extends Assignment {
  cohorts?: Cohort
}

export interface SubmissionWithDetails extends Submission {
  assignments?: Assignment
  profiles?: Profile
}

export interface StudentWithProfile extends User {
  profiles?: Profile
}

export interface InviteLinkWithCohort extends InviteLink {
  cohorts?: Cohort
}

export interface StudentCohortWithDetails extends StudentCohort {
  cohorts?: Cohort
  profiles?: Profile
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  full_name: string
  email: string
  phone_number?: string
  password: string
  confirmPassword: string
}

export interface CreateAssignmentFormData {
  title: string
  description: string
  due_date: string
  cohort_id: string
  max_score: number
  attachment_urls?: string[]
}

export interface InviteStudentFormData {
  email: string
  cohort_id: string
}

// Auth Context Types
export interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ data: unknown; error: Error | null }>
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ data: unknown; error: Error | null }>
  signOut: () => Promise<void>
}

// Component Props
export interface ProtectedRouteProps {
  children: React.ReactNode
  role?: 'admin' | 'student'
}

export interface LayoutProps {
  children: React.ReactNode
}

// Dashboard Stats
export interface AdminDashboardStats {
  totalStudents: number
  activeStudents: number
  totalCohorts: number
  activeCohorts: number
  pendingSubmissions: number
  completionRate: number
}

export interface StudentDashboardStats {
  enrolledCohorts: number
  completedAssignments: number
  pendingAssignments: number
  averageScore: number
  progressPercentage: number
}

