import { useState } from 'react'
import { Plus, ListFilter, ArrowLeft } from 'lucide-react'
import ExpenseForm from '../components/Employee/ExpenseForm'
import ExpenseList from '../components/Employee/ExpenseList'

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-display">My Reimbursements</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#fd366e]/10 border border-[#fd366e]/30 text-[#fd366e]">
              Personal Claims
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Submit claims, upload receipts for automated OCR scanning, and track managerial approvals.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={
            showForm
              ? 'aw-btn-secondary px-4 py-2.5 text-xs font-semibold'
              : 'aw-btn-primary px-4 py-2.5 text-xs font-semibold shadow-aw-button'
          }
        >
          {showForm ? (
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Expenses</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Log New Expense</span>
            </div>
          )}
        </button>
      </div>

      {/* Main Body */}
      {showForm ? (
        <div className="aw-card p-6 sm:p-8 animate-fadeIn">
          <div className="mb-6 border-b border-white/[0.08] pb-4">
            <h2 className="text-lg font-bold text-white font-display">Create Expense Claim</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fill in expense items. Attach a receipt for instant OCR merchant and amount autofill.
            </p>
          </div>
          <ExpenseForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <ExpenseList />
      )}
    </div>
  )
}
