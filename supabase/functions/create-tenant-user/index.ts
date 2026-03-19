import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface CreateTenantUserRequest {
  tenantId: string
  name: string
  email: string
  password: string
  role: 'owner' | 'admin' | 'manager'
}

const defaultProfiles = [
  {
    name: 'Admin',
    description: 'Acesso total à organização',
    permissions: {
      dashboard: { view: true, export: true },
      membros: { view: true, insert: true, edit: true, delete: true, export: true },
      congregacoes: { view: true, insert: true, edit: true, delete: true, export: true },
      departamentos: { view: true, insert: true, edit: true, delete: true, export: true },
      ministerios: { view: true, insert: true, edit: true, delete: true, export: true },
      eventos: { view: true, insert: true, edit: true, delete: true, export: true },
      financeiro: { view: true, insert: true, edit: true, delete: true, export: true },
      conciliacoes: { view: true, insert: true, edit: true, delete: true, approve: true, export: true },
      fornecedores: { view: true, insert: true, edit: true, delete: true, export: true },
      'contas-pagar': { view: true, insert: true, edit: true, delete: true, approve: true, export: true },
      relatorios: { view: true, export: true },
      notificacoes: { view: true, insert: true, edit: true, delete: true, send: true },
      'gestao-acessos': { view: true, insert: true, edit: true, delete: true, approve: true },
      documentacao: { view: true, insert: true, edit: true, delete: true, export: true },
      configuracoes: { view: true, edit: true },
    },
  },
  {
    name: 'Pastor',
    description: 'Gestão da congregação com acesso financeiro',
    permissions: {
      dashboard: { view: true, export: true },
      membros: { view: true, insert: true, edit: true, delete: false, export: true },
      congregacoes: { view: true, insert: false, edit: false, delete: false, export: true },
      departamentos: { view: true, insert: true, edit: true, delete: false, export: true },
      ministerios: { view: true, insert: true, edit: true, delete: false, export: true },
      eventos: { view: true, insert: true, edit: true, delete: false, export: true },
      financeiro: { view: true, insert: true, edit: true, delete: false, export: true },
      conciliacoes: { view: true, insert: true, edit: true, delete: false, approve: false, export: true },
      fornecedores: { view: true, insert: true, edit: true, delete: false, export: true },
      'contas-pagar': { view: true, insert: true, edit: true, delete: false, approve: false, export: true },
      relatorios: { view: true, export: true },
      notificacoes: { view: true, insert: false, edit: false, delete: false, send: false },
      'gestao-acessos': { view: false, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: false, edit: false, delete: false, export: true },
      configuracoes: { view: false, edit: false },
    },
  },
  {
    name: 'Gerente Financeiro',
    description: 'Gestão financeira completa com aprovações',
    permissions: {
      dashboard: { view: true, export: true },
      membros: { view: true, insert: false, edit: false, delete: false, export: false },
      congregacoes: { view: true, insert: false, edit: false, delete: false, export: false },
      departamentos: { view: true, insert: false, edit: false, delete: false, export: false },
      ministerios: { view: true, insert: false, edit: false, delete: false, export: false },
      eventos: { view: true, insert: false, edit: false, delete: false, export: false },
      financeiro: { view: true, insert: true, edit: true, delete: false, export: true },
      conciliacoes: { view: true, insert: true, edit: true, delete: false, approve: true, export: true },
      fornecedores: { view: true, insert: true, edit: true, delete: false, export: true },
      'contas-pagar': { view: true, insert: true, edit: true, delete: false, approve: true, export: true },
      relatorios: { view: true, export: true },
      notificacoes: { view: false, insert: false, edit: false, delete: false, send: false },
      'gestao-acessos': { view: false, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: false, edit: false, delete: false, export: true },
      configuracoes: { view: false, edit: false },
    },
  },
  {
    name: 'Membro',
    description: 'Acesso básico de visualização',
    permissions: {
      dashboard: { view: true, export: false },
      membros: { view: false, insert: false, edit: false, delete: false, export: false },
      congregacoes: { view: false, insert: false, edit: false, delete: false, export: false },
      departamentos: { view: false, insert: false, edit: false, delete: false, export: false },
      ministerios: { view: false, insert: false, edit: false, delete: false, export: false },
      eventos: { view: true, insert: false, edit: false, delete: false, export: false },
      financeiro: { view: false, insert: false, edit: false, delete: false, export: false },
      conciliacoes: { view: false, insert: false, edit: false, delete: false, approve: false, export: false },
      fornecedores: { view: false, insert: false, edit: false, delete: false, export: false },
      'contas-pagar': { view: false, insert: false, edit: false, delete: false, approve: false, export: false },
      relatorios: { view: false, export: false },
      notificacoes: { view: false, insert: false, edit: false, delete: false, send: false },
      'gestao-acessos': { view: false, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: false, edit: false, delete: false, export: false },
      configuracoes: { view: false, edit: false },
    },
  },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { data: superAdmin, error: superAdminError } = await supabaseAdmin
      .from('super_admins')
      .select('id')
      .eq('user_id', caller.id)
      .single()

    if (superAdminError || !superAdmin) {
      console.error('Super admin check failed:', superAdminError)
      throw new Error('Only super admins can create tenant users')
    }

    const { tenantId, name, email, password, role }: CreateTenantUserRequest = await req.json()

    if (!tenantId || !name || !email || !password || !role) {
      throw new Error('Missing required fields: tenantId, name, email, password, role')
    }

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

    // Step 1: Auto-detect if tenant has access profiles, create if not
    let adminProfileId: string | null = null
    let profilesCreated = 0

    const { data: existingProfiles, error: profilesCheckError } = await supabaseAdmin
      .from('access_profiles')
      .select('id, name')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    if (profilesCheckError) {
      console.error('Error checking existing profiles:', profilesCheckError)
    }

    // Find existing Admin profile
    const existingAdmin = existingProfiles?.find(p => p.name === 'Admin')
    
    if (existingAdmin) {
      adminProfileId = existingAdmin.id
      console.log(`Found existing Admin profile: ${adminProfileId}`)
    } else {
      // No Admin profile exists - create all default profiles for this tenant
      console.log('No access profiles found for tenant, creating defaults...')
      
      for (const profile of defaultProfiles) {
        // Check if this specific profile already exists
        const alreadyExists = existingProfiles?.find(p => p.name === profile.name)
        if (alreadyExists) {
          if (profile.name === 'Admin') adminProfileId = alreadyExists.id
          continue
        }

        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('access_profiles')
          .insert({
            name: profile.name,
            description: profile.description,
            permissions: profile.permissions,
            tenant_id: tenantId,
            is_active: true,
          })
          .select('id, name')
          .single()

        if (profileError) {
          console.error(`Error creating profile ${profile.name}:`, profileError)
        } else {
          console.log(`Profile created: ${profileData.name} (${profileData.id})`)
          profilesCreated++
          if (profile.name === 'Admin') {
            adminProfileId = profileData.id
          }
        }
      }
    }

    // Step 2: Ensure tenant has modules config with all modules enabled
    const { data: existingModules } = await supabaseAdmin
      .from('tenant_settings')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('category', 'modules')
      .maybeSingle()

    if (!existingModules) {
      console.log('No modules config found, creating with all modules enabled...')
      const allModulesEnabled: Record<string, boolean> = {
        dashboard: true,
        membros: true,
        congregacoes: true,
        departamentos: true,
        ministerios: true,
        eventos: true,
        financeiro: true,
        conciliacoes: true,
        fornecedores: true,
        'contas-pagar': true,
        relatorios: true,
        notificacoes: true,
        'gestao-acessos': true,
        documentacao: true,
        configuracoes: true,
        conecta: true,
      }

      const { error: modulesError } = await supabaseAdmin
        .from('tenant_settings')
        .insert({
          tenant_id: tenantId,
          category: 'modules',
          settings: allModulesEnabled,
        })

      if (modulesError) {
        console.error('Error creating modules config:', modulesError)
      } else {
        console.log('Modules config created with all modules enabled')
      }
    }

    // Step 3: Create user in Supabase Auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
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

    // Step 4: Update the profile with tenant_id, active status, and admin profile
    const profileUpdate: Record<string, unknown> = {
      name,
      email,
      tenant_id: tenantId,
      approval_status: 'ativo',
      role: 'admin',
    }

    if (adminProfileId) {
      profileUpdate.profile_id = adminProfileId
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', newUser.id)

    if (profileError) {
      console.error('Profile update failed:', profileError)
      await supabaseAdmin.auth.admin.deleteUser(newUser.id)
      throw new Error('Failed to update user profile')
    }

    console.log('Profile updated successfully')

    // Step 5: Create tenant_admin record
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
      await supabaseAdmin.auth.admin.deleteUser(newUser.id)
      throw new Error('Failed to create tenant admin record')
    }

    // Step 6: Create profile assignment if we have an admin profile
    if (adminProfileId) {
      const { error: assignError } = await supabaseAdmin
        .from('user_profile_assignments')
        .insert({
          user_id: newUser.id,
          profile_id: adminProfileId,
          assigned_by: caller.id,
          is_active: true,
        })

      if (assignError) {
        console.error('Profile assignment failed (non-critical):', assignError)
      } else {
        console.log('Admin profile assigned to user')
      }
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
        profilesCreated,
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