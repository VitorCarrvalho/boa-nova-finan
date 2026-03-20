import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Find orphan profiles (no tenant_id, not super admin)
    const { data: orphanProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .is('tenant_id', null)

    if (profilesError) throw new Error('Failed to fetch profiles: ' + profilesError.message)

    const { data: superAdmins } = await supabaseAdmin
      .from('super_admins')
      .select('user_id')

    const superAdminIds = new Set((superAdmins || []).map((sa: any) => sa.user_id))
    const orphans = (orphanProfiles || []).filter((p: any) => !superAdminIds.has(p.id))
    console.log(`Found ${orphans.length} orphan users to delete`)

    const deleted: string[] = []
    const errors: string[] = []

    for (const orphan of orphans) {
      // Clean up related records first
      await supabaseAdmin.from('approval_audit_logs').delete().eq('user_id', orphan.id)
      await supabaseAdmin.from('approval_audit_logs').delete().eq('changed_by', orphan.id)
      await supabaseAdmin.from('user_profile_assignments').delete().eq('user_id', orphan.id)
      await supabaseAdmin.from('audit_logs').delete().eq('user_id', orphan.id)
      
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(orphan.id)
      if (deleteError) {
        console.error(`Failed to delete ${orphan.email}: ${deleteError.message}`)
        errors.push(`${orphan.email}: ${deleteError.message}`)
      } else {
        console.log(`Deleted orphan user: ${orphan.email} (${orphan.id})`)
        deleted.push(orphan.email || orphan.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, deleted, errors, totalFound: orphans.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
