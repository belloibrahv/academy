import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import StudentDashboard from './pages/student/Dashboard'
import StudentList from './pages/admin/StudentList'
import CohortList from './pages/admin/CohortList'
import CreateCohort from './pages/admin/CreateCohort'
import EditCohort from './pages/admin/EditCohort'
import CohortDetail from './pages/admin/CohortDetail'
import InviteLinkList from './pages/admin/InviteLinkList'
import GenerateInviteLink from './pages/admin/GenerateInviteLink'
import AssignmentList from './pages/admin/AssignmentList'
import CreateAssignment from './pages/admin/CreateAssignment'
import EditAssignment from './pages/admin/EditAssignment'
import AssignmentDetail from './pages/admin/AssignmentDetail'
import StudentAssignments from './pages/student/Assignments'
import SubmitAssignment from './pages/student/SubmitAssignment'
import StudentProgress from './pages/student/Progress'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cohorts"
              element={
                <ProtectedRoute role="admin">
                  <CohortList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cohorts/create"
              element={
                <ProtectedRoute role="admin">
                  <CreateCohort />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cohorts/:id"
              element={
                <ProtectedRoute role="admin">
                  <CohortDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cohorts/:id/edit"
              element={
                <ProtectedRoute role="admin">
                  <EditCohort />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute role="admin">
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invite-links"
              element={
                <ProtectedRoute role="admin">
                  <InviteLinkList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invite-links/generate"
              element={
                <ProtectedRoute role="admin">
                  <GenerateInviteLink />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments"
              element={
                <ProtectedRoute role="admin">
                  <AssignmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments/create"
              element={
                <ProtectedRoute role="admin">
                  <CreateAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments/:id"
              element={
                <ProtectedRoute role="admin">
                  <AssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/assignments/:id/edit"
              element={
                <ProtectedRoute role="admin">
                  <EditAssignment />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute role="student">
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments/:id"
              element={
                <ProtectedRoute role="student">
                  <SubmitAssignment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/progress"
              element={
                <ProtectedRoute role="student">
                  <StudentProgress />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
