import { useState, useEffect } from 'react'
import { Upload, Loader, FileText, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCreateExpense, useUploadReceipt } from '../../hooks/useExpenses'
import { useApprovalRules } from '../../hooks/useApprovals'
import { parseReceipt } from '../../lib/ocr'
import { CURRENCIES } from '../../lib/currency'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants'

export default function ExpenseForm({ onSuccess }) {
  const { profile, company } = useAuth()
  const createExpense = useCreateExpense()
  const uploadReceipt = useUploadReceipt()
  const { data: approvalRules } = useApprovalRules(company?.id)

  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrData, setOcrData] = useState(null)

  const [formData, setFormData] = useState({
    description: '',
    category: 'Other',
    dateOfExpense: new Date().toISOString().split('T')[0],
    amount: '',
    currency: company?.base_currency || 'USD',
    paidBy: 'Personal Card',
    approvalRuleId: ''
  })

  useEffect(() => {
    if (approvalRules && approvalRules.length > 0 && !formData.approvalRuleId) {
      setFormData(prev => ({ ...prev, approvalRuleId: approvalRules[0].id }))
    }
  }, [approvalRules])

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result)
    }
    reader.readAsDataURL(selectedFile)

    // Process OCR
    setOcrProcessing(true)
    try {
      const parsed = await parseReceipt(selectedFile)
      setOcrData(parsed)

      // Auto-fill form if OCR found data
      setFormData(prev => ({
        ...prev,
        amount: parsed.amount || prev.amount,
        dateOfExpense: parsed.date || prev.dateOfExpense,
        description: parsed.merchant || prev.description
      }))
    } catch (error) {
      console.error('OCR error:', error)
    } finally {
      setOcrProcessing(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFilePreview(null)
    setOcrData(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validate required fields
      if (!formData.description || !formData.amount) {
        alert('Please fill in all required fields')
        return
      }

      // Upload receipt first
      let receiptPath = null
      if (file) {
        try {
          const uploadResult = await uploadReceipt.mutateAsync({
            file,
            userId: profile.id
          })
          receiptPath = uploadResult
        } catch (uploadError) {
          console.error('Receipt upload error:', uploadError)
          alert('Failed to upload receipt. Please try again.')
          return
        }
      }

      // Create expense
      await createExpense.mutateAsync({
        companyId: company.id,
        userId: profile.id,
        description: formData.description,
        category: formData.category,
        dateOfExpense: formData.dateOfExpense,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        baseCurrency: company.base_currency,
        paidBy: formData.paidBy,
        receiptPath,
        approvalRuleId: formData.approvalRuleId || null
      })

      // Reset form
      setFormData({
        description: '',
        category: 'Other',
        dateOfExpense: new Date().toISOString().split('T')[0],
        amount: '',
        currency: company.base_currency,
        paidBy: 'Personal Card',
        approvalRuleId: approvalRules?.[0]?.id || ''
      })
      setFile(null)
      setFilePreview(null)
      setOcrData(null)

      alert('Expense created successfully!')
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error creating expense:', error)
      const errorMessage = error.message || 'Failed to create expense. Please try again.'
      alert(`Error: ${errorMessage}`)
    }
  }

  const isLoading = createExpense.isPending || uploadReceipt.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Receipt Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receipt
        </label>
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="receipt-upload"
            />
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload receipt
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, PDF up to 10MB
              </p>
            </label>
          </div>
        ) : (
          <div className="relative border border-gray-300 rounded-lg p-4">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
            >
              <X className="h-4 w-4" />
            </button>

            {filePreview && file.type.startsWith('image/') ? (
              <img
                src={filePreview}
                alt="Receipt preview"
                className="max-h-48 mx-auto rounded"
              />
            ) : (
              <div className="flex items-center justify-center py-8">
                <FileText className="h-12 w-12 text-gray-400" />
                <span className="ml-2 text-sm text-gray-600">{file.name}</span>
              </div>
            )}

            {ocrProcessing && (
              <div className="mt-2 flex items-center justify-center text-sm text-primary-600">
                <Loader className="animate-spin h-4 w-4 mr-2" />
                Processing receipt...
              </div>
            )}

            {ocrData && !ocrProcessing && (
              <div className="mt-2 text-xs text-green-600 text-center">
                ✓ Receipt processed - fields auto-filled
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Team lunch at restaurant"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Expense *
        </label>
        <input
          type="date"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={formData.dateOfExpense}
          onChange={(e) => setFormData({ ...formData, dateOfExpense: e.target.value })}
        />
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          >
            {CURRENCIES.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Paid By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Paid By *
        </label>
        <select
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={formData.paidBy}
          onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
        >
          {PAYMENT_METHODS.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {/* Approval Rule */}
      {approvalRules && approvalRules.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approval Rule *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.approvalRuleId}
            onChange={(e) => setFormData({ ...formData, approvalRuleId: e.target.value })}
          >
            {approvalRules.map(rule => (
              <option key={rule.id} value={rule.id}>
                {rule.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !formData.approvalRuleId}
        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Submitting...
          </>
        ) : (
          'Submit Expense'
        )}
      </button>

      {!approvalRules || approvalRules.length === 0 && (
        <p className="text-sm text-amber-600 text-center">
          No approval rules configured. Please contact your admin.
        </p>
      )}
    </form>
  )
}
