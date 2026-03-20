import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface CreateOrgUserRequest {
  name: string
  email: string
  password: string
  profileId: string
  congregationId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !caller) {
      throw new Error('Invalid authorization token')
    }

    // Get caller's tenant_id and check if org admin
    const { data: callerProfile, error: callerError } = await supabaseAdmin
      .from('profiles')
      .select('tenant_id, profile_id')
      .eq('id', caller.id)
      .eq('approval_status', 'ativo')
      .single()

    if (callerError || !callerProfile?.tenant_id) {
      throw new Error('Caller profile not found or no tenant assigned')
    }

    // Verify caller is org admin
    const { data: callerAccessProfile } = await supabaseAdmin
      .from('access_profiles')
      .select('name')
      .eq('id', callerProfile.profile_id)
      .eq('is_active', true)
      .single()

    // Also check if super admin
    const { data: superAdmin } = await supabaseAdmin
      .from('super_admins')
      .select('id')
      .eq('user_id', caller.id)
      .maybeSingle()

    if (!superAdmin && callerAccessProfile?.name !== 'Admin') {
      throw new Error('Apenas administradores podem criar usuários')
    }

    const tenantId = callerProfile.tenant_id
    const { name, email, password, profileId, congregationId }: CreateOrgUserRequest = await req.json()

    if (!name || !email || !password || !profileId) {
      throw new Error('Campos obrigatórios: nome, email, senha, perfil de acesso')
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    // Verify profileId belongs to caller's tenant
    const { data: targetProfile, error: profileCheckError } = await supabaseAdmin
      .from('access_profiles')
      .select('id, name')
      .eq('id', profileId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single()

    if (profileCheckError || !targetProfile) {
      throw new Error('Perfil de acesso inválido ou não pertence à organização')
    }

    // Verify congregationId belongs to tenant (if provided)
    if (congregationId) {
      const { data: cong, error: congError } = await supabaseAdmin
        .from('congregations')
        .select('id')
        .eq('id', congregationId)
        .eq('tenant_id', tenantId)
        .single()

      if (congError || !cong) {
        throw new Error('Congregação inválida ou não pertence à organização')
      }
    }

    console.log(`Creating org user for tenant: ${tenantId}, profile: ${targetProfile.name}`)

    // Create user in Supabase Auth (handle existing email)
    let newUser: any
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, tenant_id: tenantId },
    })

    if (createError) {
      if (createError.message?.includes('already been registered')) {
        // Find existing user
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw new Error('Falha ao buscar usuários: ' + listError.message)

        const existingUser = listData.users.find((u: any) => u.email === email)
        if (!existingUser) throw new Error('Usuário não encontrado')

        // Check if user already belongs to another tenant
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('tenant_id')
          .eq('id', existingUser.id)
          .single()

        if (existingProfile?.tenant_id && existingProfile.tenant_id !== tenantId) {
          throw new Error('Este email já pertence a um usuário de outra organização')
        }

        newUser = existingUser
        console.log(`Reusing existing auth user: ${newUser.id}`)
      } else {
        throw new Error(createError.message)
      }
    } else {
      newUser = authData.user
    }

    // Map profile name to role enum
    const mappedRole = (() => {
      switch (targetProfile.name) {
        case 'Admin': return 'admin'
        case 'Pastor': return 'pastor'
        default: return 'worker'
      }
    })()

    // Update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        name,
        email,
        tenant_id: tenantId,
        approval_status: 'ativo',
        role: mappedRole,
        profile_id: profileId,
        congregation_id: congregationId || null,
        approved_by: caller.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', newUser.id)

    if (profileError) {
      console.error('Profile update failed:', profileError)
      // Only delete if we just created the user
      if (!createError) {
        await supabaseAdmin.auth.admin.deleteUser(newUser.id)
      }
      throw new Error('Falha ao atualizar perfil do usuário')
    }

    // Create profile assignment
    const { error: assignError } = await supabaseAdmin
      .from('user_profile_assignments')
      .insert({
        user_id: newUser.id,
        profile_id: profileId,
        assigned_by: caller.id,
        is_active: true,
      })

    if (assignError) {
      console.error('Profile assignment failed (non-critical):', assignError)
    }

    console.log(`Org user created: ${newUser.id}, profile: ${targetProfile.name}`)

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: newUser.id, email, name, profile: targetProfile.name },
        message: 'Usuário criado com sucesso',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in create-org-user:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro inesperado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
