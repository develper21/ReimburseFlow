import PendingApprovals from '../components/Manager/PendingApprovals'

export default function ApprovalsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600">Review and approve expense submissions</p>
      </div>

      <PendingApprovals />
    </div>
  )
}
