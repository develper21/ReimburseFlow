'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/hooks/useCurrency'
import { supabase } from '@/lib/supabase'
import { expenseSchema, type ExpenseInput } from '@/lib/validations'
import { 
  Upload, 
  X, 
  DollarSign, 
  Calendar, 
  FileText, 
  Tag,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const categories = [
  'Travel',
  'Food & Dining',
  'Office Supplies',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Training & Education',
  'Communication',
  'Other'
]

export default function NewExpensePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [conversionRate, setConversionRate] = useState<number | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  
  const { profile } = useAuth()
  const { 
    getAvailableCurrencies, 
    convert, 
    format, 
    exchangeRates,
    loading: currencyLoading 
  } = useCurrency()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: 'USD',
    },
  })

  const watchedAmount = watch('amount')
  const watchedCurrency = watch('currency')
  const availableCurrencies = getAvailableCurrencies()

  // Convert amount to company currency when amount or currency changes
  useEffect(() => {
    const convertAmount = async () => {
      if (!watchedAmount || !watchedCurrency || !profile?.company_id) return

      setIsConverting(true)
      try {
        // Get company currency (assuming it's stored in profile or we can fetch it)
        // For now, we'll use USD as default company currency
        const companyCurrency = 'USD' // This should come from company data
        
        if (watchedCurrency === companyCurrency) {
          setConvertedAmount(watchedAmount)
          setConversionRate(1)
        } else {
          const conversion = await convert(watchedAmount, watchedCurrency, companyCurrency)
          setConvertedAmount(conversion.convertedAmount)
          setConversionRate(conversion.rate)
        }
      } catch (error) {
        console.error('Error converting currency:', error)
        setConvertedAmount(null)
        setConversionRate(null)
      } finally {
        setIsConverting(false)
      }
    }

    convertAmount()
  }, [watchedAmount, watchedCurrency, profile?.company_id, convert])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0])
      }
    },
  })

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `receipts/${profile?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const onSubmit = async (data: ExpenseInput) => {
    if (!profile) return

    setIsSubmitting(true)
    try {
      let receiptUrl = null

      // Upload file if provided
      if (uploadedFile) {
        setUploadProgress(50)
        receiptUrl = await uploadFile(uploadedFile)
        setUploadProgress(100)
      }

      // Create expense
      const { error } = await supabase
        .from('expenses')
        .insert({
          employee_id: profile.id,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          description: data.description,
          expense_date: data.expenseDate,
          receipt_url: receiptUrl,
          status: 'draft',
        })

      if (error) throw error

      toast.success('Expense created successfully!')
      router.push('/expenses')
    } catch (error: any) {
      console.error('Error creating expense:', error)
      toast.error(error.message || 'Failed to create expense')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/expenses"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Expenses
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">New Expense</h1>
          <p className="text-gray-600">Submit a new expense claim</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency *
                  </label>
                  <div className="mt-1 relative">
                    <select
                      {...register('currency')}
                      disabled={currencyLoading}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {availableCurrencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                    {currencyLoading && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  {errors.currency && (
                    <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                  )}
                </div>
              </div>

              {/* Currency Conversion Display */}
              {watchedAmount && watchedCurrency && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Currency Conversion</h4>
                      <p className="text-sm text-blue-700">
                        {format(watchedAmount, watchedCurrency)} → {isConverting ? (
                          <span className="inline-flex items-center">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Converting...
                          </span>
                        ) : convertedAmount ? (
                          format(convertedAmount, 'USD')
                        ) : (
                          'Unable to convert'
                        )}
                      </p>
                      {conversionRate && conversionRate !== 1 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Exchange rate: 1 {watchedCurrency} = {conversionRate.toFixed(4)} USD
                        </p>
                      )}
                    </div>
                    {exchangeRates && (
                      <div className="text-xs text-blue-600">
                        <p>Last updated: {new Date(exchangeRates.date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register('category')}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe your expense..."
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Expense Date */}
              <div>
                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700">
                  Expense Date *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('expenseDate')}
                    type="date"
                    className="appearance-none rounded-md relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                {errors.expenseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expenseDate.message}</p>
                )}
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt (Optional)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">{uploadedFile.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setUploadedFile(null)
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">
                        {isDragActive
                          ? 'Drop the file here...'
                          : 'Drag & drop a receipt here, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/expenses"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
