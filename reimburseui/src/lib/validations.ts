import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  country: z.string().min(2, 'Please select a country'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(3, 'Currency is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  expenseDate: z.string().min(1, 'Expense date is required'),
  receipt: z.any().optional(),
})

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['employee', 'manager', 'admin']),
  managerId: z.string().optional(),
  isManagerApprover: z.boolean().default(false),
})

export const approvalWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  approvers: z.array(z.string()).min(1, 'At least one approver is required'),
  approvalSequence: z.array(z.number()).min(1, 'Approval sequence is required'),
  conditionalRules: z.object({
    type: z.enum(['percentage', 'specific_approver', 'hybrid']),
    percentage: z.number().min(0).max(100).optional(),
    specificApproverId: z.string().optional(),
    conditions: z.any().optional(),
  }).optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type UserInput = z.infer<typeof userSchema>
export type ApprovalWorkflowInput = z.infer<typeof approvalWorkflowSchema>
