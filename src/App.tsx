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
import Courses from './pages/admin/courses'
import NewCourse from './pages/admin/courses/new'
import EditCourse from './pages/admin/courses/edit/[id]'
import StudentDetail from './pages/admin/students/[id]'

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
              path="/admin/students"
              element={
                <ProtectedRoute role="admin">
                  <StudentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/:id"
              element={
                <ProtectedRoute role="admin">
                  <StudentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute role="admin">
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/new"
              element={
                <ProtectedRoute role="admin">
                  <NewCourse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/edit/:id"
              element={
                <ProtectedRoute role="admin">
                  <EditCourse />
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
