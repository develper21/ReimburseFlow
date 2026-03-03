import { useState } from 'react'
import { Plus } from 'lucide-react'
import ExpenseForm from '../components/Employee/ExpenseForm'
import ExpenseList from '../components/Employee/ExpenseList'

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Expenses</h1>
          <p className="text-gray-600">Manage and submit your expenses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'View List' : 'New Expense'}
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit New Expense</h2>
          <ExpenseForm onSuccess={() => setShowForm(false)} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <ExpenseList />
        </div>
      )}
    </div>
  )
}
