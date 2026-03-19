import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface OnboardRequest {
  churchName: string
  slug: string
  city: string
  state: string
  adminName: string
  adminEmail: string
  adminPassword: string
  planType: 'free' | 'basic' | 'pro'
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

const defaultModules = {
  dashboard: true, membros: true, congregacoes: true, departamentos: true,
  ministerios: true, eventos: true, financeiro: true, conciliacoes: true,
  fornecedores: true, 'contas-pagar': true, relatorios: true, notificacoes: true,
  'gestao-acessos': true, documentacao: true, configuracoes: true, conecta: true,
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

    const body: OnboardRequest = await req.json()
    const { churchName, slug, city, state, adminName, adminEmail, adminPassword, planType } = body

    // Validate inputs
    if (!churchName || !slug || !city || !state || !adminName || !adminEmail || !adminPassword) {
      throw new Error('Todos os campos são obrigatórios')
    }

    if (adminPassword.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error('O slug deve conter apenas letras minúsculas, números e hífens')
    }

    // Check slug uniqueness
    const { data: existingTenant } = await supabaseAdmin
      .from('tenants')
      .select('id')
      .or(`slug.eq.${slug},subdomain.eq.${slug}`)
      .single()

    if (existingTenant) {
      throw new Error('Este identificador já está em uso. Escolha outro nome.')
    }

    // Check email uniqueness
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUsers?.users?.some(u => u.email === adminEmail)
    if (emailExists) {
      throw new Error('Este email já está cadastrado no sistema.')
    }

    console.log(`[onboard] Creating tenant: ${churchName} (${slug})`)

    // 1. Create tenant
    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 14)

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: churchName,
        slug,
        subdomain: slug,
        plan_type: planType || 'free',
        subscription_status: 'trial',
        trial_ends_at: trialEnds.toISOString(),
        is_active: true,
      })
      .select('id')
      .single()

    if (tenantError) {
      console.error('[onboard] Tenant creation failed:', tenantError)
      throw new Error('Erro ao criar organização: ' + tenantError.message)
    }

    const tenantId = tenant.id
    console.log(`[onboard] Tenant created: ${tenantId}`)

    // 2. Create tenant_settings (branding, home, modules)
    await supabaseAdmin.from('tenant_settings').insert([
      {
        tenant_id: tenantId,
        category: 'branding',
        settings: {
          primaryColor: '217 91% 45%',
          secondaryColor: '35 92% 50%',
          accentColor: '35 92% 50%',
          logoUrl: null,
          faviconUrl: null,
          fontFamily: 'Inter, sans-serif',
          churchName,
          tagline: null,
        },
      },
      {
        tenant_id: tenantId,
        category: 'home',
        settings: {
          widgets: { pastores: true, eventos: true, calendario: true, versiculo: true, mapa: true, instagram: true, oracao: true, conecta: true },
          widgetOrder: ['pastores', 'eventos', 'calendario', 'versiculo', 'mapa', 'instagram', 'oracao', 'conecta'],
          customBanners: [],
        },
      },
      {
        tenant_id: tenantId,
        category: 'modules',
        settings: defaultModules,
      },
    ])

    // 3. Create access profiles
    let adminProfileId: string | null = null
    for (const profile of defaultProfiles) {
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

      if (!profileError && profileData && profile.name === 'Admin') {
        adminProfileId = profileData.id
      }
    }

    // 4. Create auth user
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName, tenant_id: tenantId },
    })

    if (createUserError) {
      // Rollback: delete tenant
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      console.error('[onboard] User creation failed:', createUserError)
      throw new Error('Erro ao criar usuário: ' + createUserError.message)
    }

    const userId = authData.user.id
    console.log(`[onboard] User created: ${userId}`)

    // 5. Update profile
    const profileUpdate: Record<string, unknown> = {
      name: adminName,
      email: adminEmail,
      tenant_id: tenantId,
      approval_status: 'ativo',
      role: 'admin',
    }
    if (adminProfileId) profileUpdate.profile_id = adminProfileId

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId)

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      await supabaseAdmin.from('tenants').delete().eq('id', tenantId)
      throw new Error('Erro ao configurar perfil')
    }

    // 6. Create tenant_admins record
    await supabaseAdmin.from('tenant_admins').insert({
      user_id: userId,
      tenant_id: tenantId,
      role: 'owner',
    })

    // 7. Create profile assignment
    if (adminProfileId) {
      await supabaseAdmin.from('user_profile_assignments').insert({
        user_id: userId,
        profile_id: adminProfileId,
        assigned_by: userId,
        is_active: true,
      })
    }

    console.log(`[onboard] Onboarding complete for ${churchName}`)

    return new Response(
      JSON.stringify({
        success: true,
        tenant: { id: tenantId, name: churchName, slug },
        message: 'Organização criada com sucesso!',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('[onboard] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Erro inesperado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
