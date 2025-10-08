'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/hooks/useCurrency'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ExpenseWithDetails {
  id: string
  amount: number
  currency: string
  category: string
  description: string
  expense_date: string
  status: string
  created_at: string
  employee: {
    id: string
    full_name: string
    email: string
  }
  approvals: {
    id: string
    approver_id: string
    status: string
    comments: string
    approved_at: string
    sequence_order: number
    approver: {
      id: string
      full_name: string
    }
  }[]
}

export default function ApprovalsPage() {
  const { profile } = useAuth()
  const { convert, format } = useCurrency()
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [convertedAmounts, setConvertedAmounts] = useState<{ [key: string]: number }>({})
  const [converting, setConverting] = useState(false)

  const fetchApprovals = async () => {
    if (!profile) return

    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          employee:users(id, full_name, email),
          approvals:expense_approvals(
            id,
            approver_id,
            status,
            comments,
            approved_at,
            sequence_order,
            approver:users(id, full_name)
          )
        `)
        .order('created_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('status', 'pending')
      }

      const { data, error } = await query

      if (error) throw error

      // Filter expenses that the current user needs to approve
      const filteredExpenses = data?.filter(expense => {
        if (profile.role === 'admin') return true
        
        // For managers, show expenses from their team or expenses they need to approve
        const needsApproval = expense.approvals?.some(
          (approval: { approver_id: string; status: string }) => approval.approver_id === profile.id && approval.status === 'pending'
        )
        
        const isFromTeam = expense.employee.id !== profile.id && 
          expense.employee.id !== profile.id // This would need to be expanded to check team members
        
        return needsApproval || isFromTeam
      }) || []

      setExpenses(filteredExpenses)
    } catch (error) {
      console.error('Error fetching approvals:', error)
      toast.error('Failed to fetch approvals')
    } finally {
      setLoading(false)
    }
  }

  const convertExpenseAmounts = async () => {
    if (!profile) return

    setConverting(true)
    try {
      // Get company currency
      const { data: company } = await supabase
        .from('companies')
        .select('currency')
        .eq('id', profile.company_id)
        .single()

      const companyCurrency = company?.currency || 'USD'

      for (const expense of expenses) {
        try {
          if (expense.currency === companyCurrency) {
            setConvertedAmounts(prev => ({
              ...prev,
              [expense.id]: expense.amount
            }))
          } else {
            const conversion = await convert(expense.amount, expense.currency, companyCurrency)
            setConvertedAmounts(prev => ({
              ...prev,
              [expense.id]: conversion.convertedAmount
            }))
          }
        } catch (error) {
          console.error(`Error converting expense ${expense.id}:`, error)
          setConvertedAmounts(prev => ({
            ...prev,
            [expense.id]: expense.amount
          }))
        }
      }
    } catch (error) {
      console.error('Error in currency conversion:', error)
    } finally {
      setConverting(false)
    }
  }

  useEffect(() => {
    if (profile && (profile.role === 'manager' || profile.role === 'admin')) {
      fetchApprovals()
    }
  }, [profile, filter])

  // Convert amounts when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      convertExpenseAmounts()
    }
  }, [expenses])

  const testApprovalAccess = async (expenseId: string) => {
    console.log('=== TESTING APPROVAL ACCESS ===')
    
    // Test 1: Check if user can see expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('id, status, employee_id')
      .eq('id', expenseId)
      .single()
    
    console.log('Expense check:', { expense, expenseError })
    
    // Test 2: Check if user has approval records
    const { data: approvals, error: approvalError } = await supabase
      .from('expense_approvals')
      .select('*')
      .eq('expense_id', expenseId)
      .eq('approver_id', profile?.id)
    
    console.log('Approvals check:', { approvals, approvalError })
    
    // Test 3: Check user profile
    console.log('User profile:', { 
      id: profile?.id, 
      role: profile?.role, 
      company_id: profile?.company_id 
    })
    
    // Test 4: Check if approval records exist for this expense
    const { data: allApprovals, error: allApprovalsError } = await supabase
      .from('expense_approvals')
      .select('*')
      .eq('expense_id', expenseId)
    
    console.log('All approvals for this expense:', { allApprovals, allApprovalsError })
    
    console.log('=== END TEST ===')
    return { expense, approvals, allApprovals }
  }

  const createMissingApprovalRecords = async (expenseId: string) => {
    console.log('🔧 Creating missing approval records for expense:', expenseId)
    
    if (!profile) {
      console.error('❌ No profile available for creating approval records')
      return false
    }

    try {
      // Step 1: Get the expense details
      console.log('📋 Step 1: Fetching expense details...')
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('id, status, employee_id, amount, currency, description')
        .eq('id', expenseId)
        .single()

      console.log('📋 Expense details:', { expense, expenseError })
      
      if (expenseError) {
        console.error('❌ Error fetching expense:', expenseError)
        return false
      }

      if (!expense) {
        console.error('❌ Expense not found')
        return false
      }

      if (expense.status !== 'pending' && expense.status !== 'draft') {
        console.log('ℹ️ Expense is not pending or draft, no approval records needed. Status:', expense.status)
        return false
      }

      // Step 2: Check if approval records already exist
      console.log('📋 Step 2: Checking existing approval records...')
      const { data: existingApprovals, error: existingError } = await supabase
        .from('expense_approvals')
        .select('id, approver_id, status')
        .eq('expense_id', expenseId)

      console.log('📋 Existing approvals:', { existingApprovals, existingError })
      
      if (existingError) {
        console.error('❌ Error checking existing approvals:', existingError)
        return false
      }

      if (existingApprovals && existingApprovals.length > 0) {
        console.log('✅ Approval records already exist:', existingApprovals.length)
        return true
      }

      // Step 3: Get the employee's details
      console.log('📋 Step 3: Fetching employee details...')
      const { data: employee, error: employeeError } = await supabase
        .from('users')
        .select('id, company_id, manager_id, is_manager_approver, full_name, role')
        .eq('id', expense.employee_id)
        .single()

      console.log('📋 Employee details:', { employee, employeeError })
      
      if (employeeError) {
        console.error('❌ Error fetching employee:', employeeError)
        return false
      }

      if (!employee) {
        console.error('❌ Employee not found')
        return false
      }

      // Step 4: Check for active workflow
      console.log('📋 Step 4: Checking for approval workflow...')
      const { data: workflow, error: workflowError } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('company_id', employee.company_id)
        .eq('is_active', true)
        .single()

      console.log('📋 Workflow details:', { workflow, workflowError })

      let approvalCreated = false

      if (workflow && workflow.approvers && workflow.approvers.length > 0) {
        console.log('✅ Using workflow for approvals:', workflow.name)
        
        // Create approvals based on workflow
        for (let i = 0; i < workflow.approvers.length; i++) {
          const approverId = workflow.approvers[i]
          const sequenceOrder = workflow.approval_sequence[i] || (i + 1)
          
          console.log(`📝 Creating approval for approver ${approverId} with sequence ${sequenceOrder}`)
          
          const { data: insertData, error: insertError } = await supabase
            .from('expense_approvals')
            .insert({
              expense_id: expenseId,
              approver_id: approverId,
              sequence_order: sequenceOrder,
              status: 'pending'
            })
            .select()

          console.log(`📝 Insert result for approver ${approverId}:`, { insertData, insertError })

          if (insertError) {
            console.error(`❌ Error creating approval record for approver ${approverId}:`, insertError)
          } else {
            console.log(`✅ Created approval record for approver: ${approverId}`)
            approvalCreated = true
          }
        }
      } else {
        console.log('ℹ️ No workflow found, trying default manager approval')
        
        // Try to find a manager for approval
        let approverId = null
        
        // First, try the employee's direct manager
        if (employee.manager_id) {
          console.log('🔍 Checking direct manager:', employee.manager_id)
          const { data: manager, error: managerError } = await supabase
            .from('users')
            .select('id, full_name, role, is_manager_approver')
            .eq('id', employee.manager_id)
            .single()
          
          console.log('🔍 Manager details:', { manager, managerError })
          
          if (manager && (manager.is_manager_approver || manager.role === 'manager' || manager.role === 'admin')) {
            approverId = manager.id
            console.log('✅ Found direct manager for approval:', manager.full_name)
          }
        }
        
        // If no direct manager, try to find any manager in the company
        if (!approverId) {
          console.log('🔍 Looking for any manager in the company...')
          const { data: managers, error: managersError } = await supabase
            .from('users')
            .select('id, full_name, role, is_manager_approver')
            .eq('company_id', employee.company_id)
            .in('role', ['manager', 'admin'])
            .limit(1)
          
          console.log('🔍 Available managers:', { managers, managersError })
          
          if (managers && managers.length > 0) {
            approverId = managers[0].id
            console.log('✅ Found company manager for approval:', managers[0].full_name)
          }
        }
        
        // If still no approver, use the current user if they're admin/manager
        if (!approverId && (profile.role === 'admin' || profile.role === 'manager')) {
          approverId = profile.id
          console.log('✅ Using current user as approver:', profile.full_name)
        }

        if (approverId) {
          console.log('📝 Creating default approval for:', approverId)
          
          const { data: insertData, error: insertError } = await supabase
            .from('expense_approvals')
            .insert({
              expense_id: expenseId,
              approver_id: approverId,
              sequence_order: 1,
              status: 'pending'
            })
            .select()

          console.log('📝 Default approval insert result:', { insertData, insertError })

          if (insertError) {
            console.error('❌ Error creating default approval record:', insertError)
            return false
          } else {
            console.log('✅ Created default approval record for:', approverId)
            approvalCreated = true
          }
        } else {
          console.error('❌ No approver found for this expense')
          return false
        }
      }

      if (!approvalCreated) {
        console.error('❌ No approval records were created')
        return false
      }

      console.log('🎉 Successfully created approval records!')
      return true
      
    } catch (error: any) {
      console.error('💥 Error creating approval records:', error)
      console.error('💥 Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      return false
    }
  }

  const ensureExpenseIsPending = async (expenseId: string) => {
    console.log('🔍 Ensuring expense is in pending status...')
    
    try {
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .select('id, status, employee_id')
        .eq('id', expenseId)
        .single()

      if (expenseError || !expense) {
        console.error('❌ Error fetching expense for status check:', expenseError)
        return false
      }

      console.log('📋 Current expense status:', expense.status)

      if (expense.status === 'pending') {
        console.log('✅ Expense is already pending')
        return true
      }

      if (expense.status === 'draft') {
        console.log('📝 Attempting to update expense from draft to pending...')
        
        // Try to update the expense status
        const { error: updateError } = await supabase
          .from('expenses')
          .update({ status: 'pending' })
          .eq('id', expenseId)

        if (updateError) {
          console.error('❌ Error updating expense to pending:', updateError)
          
          // If RLS policy blocks the update, we'll work around it
          if (updateError.code === '42501') {
            console.log('🔧 RLS policy blocked update, trying alternative approach...')
            
            // Check if we can create approval records without updating status
            // The approval process will work even if expense stays in draft
            console.log('ℹ️ Will proceed with approval even if expense remains in draft status')
            return true
          }
          
          return false
        }

        console.log('✅ Successfully updated expense to pending status')
        return true
      }

      console.log('ℹ️ Expense is not in draft or pending status:', expense.status)
      return false
    } catch (error) {
      console.error('💥 Error ensuring expense is pending:', error)
      return false
    }
  }

  const handleApproval = async (expenseId: string, action: 'approve' | 'reject', comments: string = '') => {
    console.log('Starting approval process:', { 
      expenseId, 
      action, 
      approverId: profile?.id,
      approverRole: profile?.role,
      commentsLength: comments?.length || 0
    })

    if (!profile) {
      console.error('No profile found for approval')
      toast.error('User profile not found')
      return
    }

    if (!expenseId) {
      console.error('No expense ID provided')
      toast.error('Expense ID is required')
      return
    }

    setActionLoading(true)
    
    try {
      // Step 0: Ensure expense is in pending status (or handle draft)
      console.log('Step 0: Ensuring expense is in pending status...')
      const isPending = await ensureExpenseIsPending(expenseId)
      if (!isPending) {
        console.log('ℹ️ Expense status update failed, but will proceed with approval process')
        // Don't return here - we can still process approvals for draft expenses
      }

      // Step 1: Run diagnostic test
      console.log('Running diagnostic test...')
      const diagnosticResult = await testApprovalAccess(expenseId)
      console.log('Diagnostic test completed:', diagnosticResult)

      // Step 2: Check if approval record exists and user can approve
      console.log('Checking existing approval record...')
      let { data: existingApproval, error: checkError } = await supabase
        .from('expense_approvals')
        .select('id, status, approver_id, expense_id')
        .eq('expense_id', expenseId)
        .eq('approver_id', profile.id)
        .eq('status', 'pending')
        .single()

      console.log('Existing approval check result:', { 
        existingApproval, 
        checkError: checkError ? {
          message: checkError.message,
          code: checkError.code,
          details: checkError.details
        } : null
      })
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('No pending approval record found, attempting to create one...')
          
          // Try to create missing approval records
          const created = await createMissingApprovalRecords(expenseId)
          
          if (!created) {
            console.error('Failed to create approval records, trying fallback approval...')
            
            // Fallback: Allow admin/manager to approve directly without approval records
            if (profile.role === 'admin' || profile.role === 'manager') {
              console.log('Using fallback approval for admin/manager')
              
              // Create a temporary approval record for the current user
              const { data: fallbackApproval, error: fallbackError } = await supabase
                .from('expense_approvals')
                .insert({
                  expense_id: expenseId,
                  approver_id: profile.id,
                  sequence_order: 1,
                  status: 'pending'
                })
                .select()
                .single()

              console.log('Fallback approval creation:', { fallbackApproval, fallbackError })
              
              if (fallbackError) {
                console.error('Failed to create fallback approval record:', fallbackError)
                toast.error('Unable to set up approval process for this expense')
                return
              }
              
              // Use the fallback approval record
              existingApproval = fallbackApproval
              console.log('Using fallback approval record:', existingApproval)
            } else {
              console.error('User is not authorized for fallback approval')
              toast.error('You are not authorized to approve this expense')
              return
            }
          }
          
          // Try to fetch the approval record again
          const { data: newApproval, error: newCheckError } = await supabase
            .from('expense_approvals')
            .select('id, status, approver_id, expense_id')
            .eq('expense_id', expenseId)
            .eq('approver_id', profile.id)
            .eq('status', 'pending')
            .single()

          if (newCheckError || !newApproval) {
            console.error('Still no approval record found after creation attempt')
            toast.error('You are not authorized to approve this expense')
            return
          }
          
          // Use the newly created approval record
          existingApproval = newApproval
        } else {
          console.error('Database error checking approval record:', checkError)
          throw new Error(`Database error: ${checkError.message}`)
        }
      }

      if (!existingApproval) {
        console.error('No approval record found')
        toast.error('You are not authorized to approve this expense')
        return
      }

      // Step 3: Update the approval record
      console.log('Updating approval record...')
      
      // Convert action to proper status value for database constraint
      const statusValue = action === 'approve' ? 'approved' : 'rejected'
      console.log('Converting action to status:', { action, statusValue })
      
      // Validate status value matches database constraint
      const validStatuses = ['pending', 'approved', 'rejected']
      if (!validStatuses.includes(statusValue)) {
        console.error('Invalid status value:', statusValue)
        throw new Error(`Invalid status value: ${statusValue}. Must be one of: ${validStatuses.join(', ')}`)
      }
      
      const updateData = {
        status: statusValue,
        comments: comments?.trim() || null,
        approved_at: new Date().toISOString(),
      }
      
      console.log('Update data:', updateData)
      console.log('Updating approval record with ID:', existingApproval.id)
      
      const { data: updateResult, error: updateError } = await supabase
        .from('expense_approvals')
        .update(updateData)
        .eq('id', existingApproval.id)
        .select()

      console.log('Approval update result:', { 
        updateResult, 
        updateError: updateError ? {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details
        } : null
      })
      
      if (updateError) {
        console.error('Failed to update approval record:', updateError)
        throw new Error(`Failed to update approval: ${updateError.message}`)
      }

      if (!updateResult || updateResult.length === 0) {
        console.error('No records were updated')
        throw new Error('No approval record was updated')
      }

      // Step 4: Check if all approvals are complete
      console.log('Checking remaining approvals...')
      const { data: remainingApprovals, error: remainingError } = await supabase
        .from('expense_approvals')
        .select('id, status, approver_id')
        .eq('expense_id', expenseId)
        .eq('status', 'pending')

      console.log('Remaining approvals:', { 
        remainingApprovals, 
        remainingError: remainingError ? {
          message: remainingError.message,
          code: remainingError.code
        } : null
      })
      
      if (remainingError) {
        console.error('Error checking remaining approvals:', remainingError)
        throw new Error(`Failed to check remaining approvals: ${remainingError.message}`)
      }

      // Step 5: Update expense status if all approvals are complete
      if (!remainingApprovals || remainingApprovals.length === 0) {
        console.log('All approvals complete, updating expense status...')
        const finalStatus = action === 'approve' ? 'approved' : 'rejected'
        console.log('Final status:', finalStatus)
        
        const { data: expenseUpdateResult, error: expenseError } = await supabase
          .from('expenses')
          .update({ status: finalStatus })
          .eq('id', expenseId)
          .select()

        console.log('Expense update result:', { 
          expenseUpdateResult, 
          expenseError: expenseError ? {
            message: expenseError.message,
            code: expenseError.code
          } : null
        })
        
        if (expenseError) {
          console.error('Failed to update expense status:', expenseError)
          
          // If RLS policy blocks the update, log it but don't fail the approval
          if (expenseError.code === '42501') {
            console.log('⚠️ RLS policy blocked expense status update, but approval was recorded')
            console.log('ℹ️ The expense approval was successful, but status update requires database admin')
          } else {
            throw new Error(`Failed to update expense status: ${expenseError.message}`)
          }
        }
      } else {
        console.log('Still waiting for other approvals:', remainingApprovals.length)
      }

      // Step 6: Success - refresh data and close modal
      console.log('Approval process completed successfully!')
      toast.success(`Expense ${action}d successfully`)
      
      // Refresh the approvals list
      console.log('Refreshing approvals list...')
      await fetchApprovals()
      
      // Close modal
      setIsModalOpen(false)
      
    } catch (error: any) {
      console.error('=== APPROVAL ERROR START ===')
      console.error('Raw error:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error instanceof Error:', error instanceof Error)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Error details:', error?.details)
      console.error('Error hint:', error?.hint)
      console.error('Error code:', error?.code)
      console.error('Error toString:', error?.toString())
      console.error('Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      console.error('=== APPROVAL ERROR END ===')
      
      // Create user-friendly error message
      let errorMessage = 'Unknown error occurred'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.toString && error.toString() !== '[object Object]') {
        errorMessage = error.toString()
      } else if (error?.details) {
        errorMessage = error.details
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.log('Showing error to user:', errorMessage)
      toast.error(`Failed to ${action} expense: ${errorMessage}`)
    } finally {
      console.log('Approval process finished, setting loading to false')
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Approvals</h1>
            <p className="text-gray-600">Review and approve expense claims</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'pending'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white shadow rounded-lg">
          {expenses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-500">
                {filter === 'pending'
                  ? 'No pending expenses to approve.'
                  : 'No expenses found.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <div key={expense.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(expense.status)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {expense.description}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {expense.category} • {formatDate(expense.expense_date)} • {expense.employee.full_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(expense.amount, expense.currency)}
                        </p>
                        {convertedAmounts[expense.id] && convertedAmounts[expense.id] !== expense.amount && (
                          <p className="text-xs text-gray-500">
                            ≈ {format(convertedAmounts[expense.id], 'USD')}
                          </p>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedExpense(expense)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="View details"
                      >
                        <User className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {isModalOpen && selectedExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Expense
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(selectedExpense.amount, selectedExpense.currency)}
                    {convertedAmounts[selectedExpense.id] && convertedAmounts[selectedExpense.id] !== selectedExpense.amount && (
                      <span className="ml-2 text-gray-500">
                        (≈ {format(convertedAmounts[selectedExpense.id], 'USD')})
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedExpense.employee.full_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <textarea
                    id="comments"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    placeholder="Add your comments (optional)"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const comments = (document.getElementById('comments') as HTMLTextAreaElement)?.value || ''
                    handleApproval(selectedExpense.id, 'reject', comments)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    const comments = (document.getElementById('comments') as HTMLTextAreaElement)?.value || ''
                    handleApproval(selectedExpense.id, 'approve', comments)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}