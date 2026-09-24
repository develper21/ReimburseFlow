import { useState, useEffect } from 'react'
import { Upload, Loader2, FileText, X, Sparkles, Check, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCreateExpense, useUploadReceipt } from '../../hooks/useExpenses'
import { useApprovalRules } from '../../hooks/useApprovals'
import { parseReceipt } from '../../lib/ocr'
import { SUPPORTED_CURRENCIES, formatCurrency } from '../../lib/currency'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../lib/constants'

export default function ExpenseForm({ onSuccess, onCancel }) {
  const { profile, company } = useAuth()
  const createExpense = useCreateExpense()
  const uploadReceipt = useUploadReceipt()
  const { data: approvalRules } = useApprovalRules(company?._id || company?.id)

  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrSuccess, setOcrSuccess] = useState(false)
  const [error, setError] = useState('')

  const baseCurr = company?.baseCurrency || company?.base_currency || 'USD'

  const [formData, setFormData] = useState({
    description: '',
    category: EXPENSE_CATEGORIES[0] || 'Travel & Lodging',
    dateOfExpense: new Date().toISOString().split('T')[0],
    amount: '',
    currency: baseCurr,
    paidBy: PAYMENT_METHODS[0] || 'Personal Card',
    approvalRuleId: '',
    merchant: '',
    department: profile?.department || 'Engineering'
  })

  useEffect(() => {
    if (approvalRules && approvalRules.length > 0 && !formData.approvalRuleId) {
      const defaultRule = approvalRules.find((r) => r.isDefault) || approvalRules[0]
      setFormData((prev) => ({ ...prev, approvalRuleId: defaultRule._id || defaultRule.id }))
    }
  }, [approvalRules])

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setOcrSuccess(false)

    // Generate local preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result)
    }
    reader.readAsDataURL(selectedFile)

    // Execute OCR extraction
    setOcrProcessing(true)
    try {
      const parsed = await parseReceipt(selectedFile)
      if (parsed && (parsed.amount || parsed.merchant || parsed.date)) {
        setOcrSuccess(true)
        setFormData((prev) => ({
          ...prev,
          amount: parsed.amount ? String(parsed.amount) : prev.amount,
          dateOfExpense: parsed.date || prev.dateOfExpense,
          description: parsed.merchant ? `Receipt from ${parsed.merchant}` : prev.description,
          merchant: parsed.merchant || prev.merchant
        }))
      }
    } catch (err) {
      console.warn('OCR note:', err.message)
    } finally {
      setOcrProcessing(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFilePreview(null)
    setOcrSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.description || !formData.amount) {
      setError('Please provide a description and amount')
      return
    }

    try {
      let receiptPath = filePreview || null

      // Upload file to Express API if present
      if (file) {
        try {
          const uploadedUrl = await uploadReceipt.mutateAsync({ file })
          receiptPath = uploadedUrl
        } catch (uploadErr) {
          console.warn('Backend file upload fallback to base64 preview:', uploadErr.message)
          receiptPath = filePreview
        }
      }

      await createExpense.mutateAsync({
        description: formData.description,
        category: formData.category,
        dateOfExpense: formData.dateOfExpense,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        baseCurrency: baseCurr,
        paidBy: formData.paidBy,
        receiptPath,
        receiptName: file ? file.name : null,
        approvalRuleId: formData.approvalRuleId || null,
        merchant: formData.merchant,
        department: formData.department
      })

      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Submit expense error:', err)
      setError(err.message || 'Failed to submit expense. Please check your connection.')
    }
  }

  const isLoading = createExpense.isPending || uploadReceipt.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Appwrite Receipt Dropzone */}
      <div>
        <label className="block text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider mb-2">
          Receipt / Proof of Payment (Auto-OCR Scanner)
        </label>

        {!file ? (
          <div className="relative border-2 border-dashed border-white/10 hover:border-[#fd366e]/50 rounded-2xl p-6 text-center transition-all bg-white/[0.02] hover:bg-white/[0.04] group cursor-pointer">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="receipt-file-input"
            />
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-xl bg-white/[0.05] border border-white/10 group-hover:border-[#fd366e]/40 flex items-center justify-center text-zinc-400 group-hover:text-[#fd366e] transition-colors mb-3">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-white">
                Drag receipt here, or <span className="text-[#fd366e] underline">browse files</span>
              </p>
              <p className="text-xs text-zinc-500 mt-1 font-mono">
                JPEG, PNG, WebP, PDF • Intelligent OCR Auto-Extraction
              </p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl border border-white/10 bg-[#131316] p-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {filePreview && file.type?.startsWith('image/') ? (
              <img
                src={filePreview}
                alt="Receipt"
                className="h-28 w-28 object-cover rounded-xl border border-white/10 shrink-0"
              />
            ) : (
              <div className="h-28 w-28 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                <FileText className="h-8 w-8 text-zinc-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{file.name}</p>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
              </p>

              {ocrProcessing && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#fd366e] font-mono">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>OCR Scanning receipt in background...</span>
                </div>
              )}

              {ocrSuccess && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                  <Check className="h-3.5 w-3.5" />
                  <span>Auto-extracted amount and merchant details!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expense Details Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Expense Description *
          </label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Flight to Developer Summit NYC"
            className="aw-input w-full px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="aw-input w-full pl-10 pr-4 py-2.5 text-sm font-mono font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="aw-input w-full px-3 py-2.5 text-sm bg-[#131316] font-mono"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[#131316]">
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="aw-input w-full px-3 py-2.5 text-sm bg-[#131316]"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#131316]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Date of Expense
            </label>
            <input
              type="date"
              required
              value={formData.dateOfExpense}
              onChange={(e) => setFormData({ ...formData, dateOfExpense: e.target.value })}
              className="aw-input w-full px-4 py-2.5 text-sm font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Payment Method
            </label>
            <select
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              className="aw-input w-full px-3 py-2.5 text-sm bg-[#131316]"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm} className="bg-[#131316]">
                  {pm}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Merchant / Vendor Name
            </label>
            <input
              type="text"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              placeholder="e.g. Uber, Delta, AWS"
              className="aw-input w-full px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        {approvalRules && approvalRules.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Approval Policy Workflow
            </label>
            <select
              value={formData.approvalRuleId}
              onChange={(e) => setFormData({ ...formData, approvalRuleId: e.target.value })}
              className="aw-input w-full px-3 py-2.5 text-sm bg-[#131316]"
            >
              {approvalRules.map((rule) => (
                <option key={rule._id || rule.id} value={rule._id || rule.id} className="bg-[#131316]">
                  {rule.name} ({rule.ruleType} - {rule.percentageRequired}% required)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="aw-btn-secondary px-4 py-2.5 text-xs"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="aw-btn-primary px-6 py-2.5 text-xs font-semibold shadow-aw-button"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Expense...</span>
            </div>
          ) : (
            <span>Submit for Approval</span>
          )}
        </button>
      </div>
    </form>
  )
}
