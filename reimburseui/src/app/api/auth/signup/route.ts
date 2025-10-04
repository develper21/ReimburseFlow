import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, companyName, country } = await request.json()

    // Validate required fields
    if (!email || !password || !fullName || !companyName || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get currency based on country
    let currency = 'USD' // fallback
    try {
      // Simple currency mapping for now
      const currencyMap: Record<string, string> = {
        'United States': 'USD',
        'United Kingdom': 'GBP',
        'European Union': 'EUR',
        'India': 'INR',
        'Canada': 'CAD',
        'Australia': 'AUD',
        'US': 'USD',
        'GB': 'GBP',
        'EU': 'EUR',
        'IN': 'INR',
        'CA': 'CAD',
        'AU': 'AUD',
      }
      currency = currencyMap[country] || 'USD'
    } catch (error) {
      console.warn('Failed to get currency for country, using USD as fallback:', error)
    }

    // Create user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for development
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create company using admin client (bypasses RLS)
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        currency,
      })
      .select()
      .single()

    if (companyError) {
      // Clean up the created user if company creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Failed to create company: ${companyError.message}` },
        { status: 500 }
      )
    }

    // Create admin user using admin client (bypasses RLS)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'admin',
        company_id: company.id,
        is_manager_approver: true,
      })

    if (userError) {
      // Clean up the created user and company if user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      return NextResponse.json(
        { error: `Failed to create user profile: ${userError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })

  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
