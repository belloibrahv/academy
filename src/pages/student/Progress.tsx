import StudentLayout from '../../components/Layout/StudentLayout'

const Progress = () => {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-dark">My Progress</h1>
          <p className="text-gray-600 mt-2">Track your learning milestones</p>
        </div>

        <div className="bg-white rounded-xl shadow-card p-8 text-center">
          <p className="text-gray-500">Progress tracking coming soon...</p>
        </div>
      </div>
    </StudentLayout>
  )
}

export default Progress

