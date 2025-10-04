export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          currency: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'employee' | 'manager' | 'admin'
          company_id: string
          manager_id: string | null
          is_manager_approver: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: 'employee' | 'manager' | 'admin'
          company_id: string
          manager_id?: string | null
          is_manager_approver?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'employee' | 'manager' | 'admin'
          company_id?: string
          manager_id?: string | null
          is_manager_approver?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          employee_id: string
          amount: number
          currency: string
          category: string
          description: string
          expense_date: string
          receipt_url: string | null
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          amount: number
          currency: string
          category: string
          description: string
          expense_date: string
          receipt_url?: string | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          amount?: number
          currency?: string
          category?: string
          description?: string
          expense_date?: string
          receipt_url?: string | null
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      approval_workflows: {
        Row: {
          id: string
          company_id: string
          name: string
          approvers: string[]
          approval_sequence: number[]
          conditional_rules: {
            type: 'percentage' | 'specific_approver' | 'hybrid'
            percentage?: number
            specific_approver_id?: string
            conditions?: any
          } | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          approvers: string[]
          approval_sequence: number[]
          conditional_rules?: {
            type: 'percentage' | 'specific_approver' | 'hybrid'
            percentage?: number
            specific_approver_id?: string
            conditions?: any
          } | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          approvers?: string[]
          approval_sequence?: number[]
          conditional_rules?: {
            type: 'percentage' | 'specific_approver' | 'hybrid'
            percentage?: number
            specific_approver_id?: string
            conditions?: any
          } | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      expense_approvals: {
        Row: {
          id: string
          expense_id: string
          approver_id: string
          status: 'pending' | 'approved' | 'rejected'
          comments: string | null
          approved_at: string | null
          sequence_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          approver_id: string
          status?: 'pending' | 'approved' | 'rejected'
          comments?: string | null
          approved_at?: string | null
          sequence_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          approver_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          comments?: string | null
          approved_at?: string | null
          sequence_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Company = Database['public']['Tables']['companies']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ApprovalWorkflow = Database['public']['Tables']['approval_workflows']['Row']
export type ExpenseApproval = Database['public']['Tables']['expense_approvals']['Row']
