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
  user?: User;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface Activity {
  id: number;
  type: 'new_student' | 'new_submission';
  message: string;
  created_at: string;
  metadata?: Record<string, any>;
}


// Joined Types for queries
export interface StudentWithProfile extends User {
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
  recentActivity: Activity[]
}

export interface StudentDashboardStats {}
