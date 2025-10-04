'use client'

import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase'
import { 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Database,
  Key,
  Globe
} from 'lucide-react'

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsConfigured(isSupabaseConfigured())
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const envVars = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Your Supabase project URL',
      example: 'https://your-project-id.supabase.co',
      icon: Globe,
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Your Supabase anonymous key',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      icon: Key,
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      description: 'Your Supabase service role key',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      icon: Database,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ExpenseFlow Setup
          </h1>
          <p className="text-lg text-gray-600">
            Configure your Supabase project to get started
          </p>
        </div>

        {/* Status Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            {!mounted ? (
              <div className="h-6 w-6 bg-gray-200 rounded-full mr-2 animate-pulse" />
            ) : isConfigured ? (
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              Configuration Status
            </h2>
          </div>
          <p className="text-gray-600">
            {!mounted ? (
              'Checking configuration...'
            ) : isConfigured ? (
              '✅ Supabase is properly configured! You can now use the application.'
            ) : (
              '⚠️ Supabase configuration is missing. Please set up your environment variables below.'
            )}
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 1: Create a Supabase Project
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              If you haven't already, create a new Supabase project:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">supabase.com</a></li>
              <li>Sign up or log in to your account</li>
              <li>Click "New Project"</li>
              <li>Choose your organization and enter project details</li>
              <li>Wait for the project to be created</li>
            </ol>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 2: Configure Environment Variables
          </h2>
          <p className="text-gray-600 mb-6">
            Create a <code className="bg-gray-100 px-2 py-1 rounded text-sm">.env.local</code> file in your project root with the following variables:
          </p>

          <div className="space-y-6">
            {envVars.map((envVar) => (
              <div key={envVar.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <envVar.icon className="h-5 w-5 text-gray-400 mr-2" />
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {envVar.name}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(envVar.name, envVar.name)}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copied === envVar.name ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{envVar.description}</p>
                <div className="bg-gray-50 p-3 rounded">
                  <code className="text-sm text-gray-800">{envVar.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Setup */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 3: Set Up Database Schema
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Run the database schema in your Supabase project:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Copy and paste the contents of <code className="bg-gray-100 px-2 py-1 rounded text-sm">database/schema.sql</code></li>
              <li>Click "Run" to execute the schema</li>
            </ol>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The schema will create all necessary tables, indexes, and Row Level Security policies for the expense management system.
              </p>
            </div>
          </div>
        </div>

        {/* Storage Setup */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 4: Configure Storage (Optional)
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              The storage bucket for receipts is created automatically by the schema. If you need to configure it manually:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to Storage in your Supabase dashboard</li>
              <li>Create a new bucket named <code className="bg-gray-100 px-2 py-1 rounded text-sm">expense-receipts</code></li>
              <li>Set it to public if you want receipts to be publicly accessible</li>
            </ol>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 5: Restart and Test
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              After configuring your environment variables:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Restart your development server: <code className="bg-gray-100 px-2 py-1 rounded text-sm">npm run dev</code></li>
              <li>Visit <a href="/" className="text-indigo-600 hover:text-indigo-500">the home page</a> to test the setup</li>
              <li>Try signing up for a new account to test the complete flow</li>
            </ol>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Check out the{' '}
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
              Supabase Documentation
            </a>
            {' '}or the{' '}
            <a href="/README.md" className="text-indigo-600 hover:text-indigo-500">
              project README
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
