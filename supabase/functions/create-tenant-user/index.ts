import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateTenantUserRequest {
  tenantId: string
  name: string
  email: string
  password: string
  role: 'owner' | 'admin' | 'manager'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the caller is a super admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !caller) {
      console.error('Auth error:', authError)
      throw new Error('Invalid authorization token')
    }

    // Check if caller is a super admin
    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('id')
      .eq('user_id', caller.id)
      .single()

    if (superAdminError || !superAdmin) {
      console.error('Super admin check failed:', superAdminError)
      throw new Error('Only super admins can create tenant users')
    }

    // Parse request body
    const { tenantId, name, email, password, role }: CreateTenantUserRequest = await req.json()

    if (!tenantId || !name || !email || !password || !role) {
      throw new Error('Missing required fields: tenantId, name, email, password, role')
    }

    // Validate role
    if (!['owner', 'admin', 'manager'].includes(role)) {
      throw new Error('Invalid role. Must be owner, admin, or manager')
    }

    // Verify tenant exists
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('id, name')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant lookup failed:', tenantError)
      throw new Error('Tenant not found')
    }

    console.log(`Creating user for tenant: ${tenant.name} (${tenantId})`)

    // Create user in Supabase Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        tenant_id: tenantId,
      }
    })

    if (createError) {
      console.error('User creation failed:', createError)
      throw new Error(createError.message)
    }

    const newUser = authData.user
    console.log(`Auth user created: ${newUser.id}`)

    // Update the profile with tenant_id and active status
    // The handle_new_user trigger already created the profile, we just need to update it
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        name,
        email,
        tenant_id: tenantId,
        approval_status: 'ativo',
        role: 'admin',
      })
      .eq('id', newUser.id)

    if (profileError) {
      console.error('Profile update failed:', profileError)
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.id)
      throw new Error('Failed to update user profile')
    }

    console.log('Profile updated successfully')

    // Create tenant_admin record
    const { error: adminError } = await supabaseAdmin
      .from('tenant_admins')
      .insert({
        user_id: newUser.id,
        tenant_id: tenantId,
        role,
        invited_by: caller.id,
      })

    if (adminError) {
      console.error('Tenant admin creation failed:', adminError)
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.id)
      throw new Error('Failed to create tenant admin record')
    }

    console.log(`Tenant admin created with role: ${role}`)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name,
          role,
        },
        message: 'User created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-tenant-user:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
