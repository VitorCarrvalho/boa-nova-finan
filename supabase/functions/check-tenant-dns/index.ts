import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { tenant_id, subdomain } = await req.json();

    if (!subdomain) {
      return new Response(JSON.stringify({ error: "subdomain required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const domain = `${subdomain}.igrejamoove.com.br`;
    let dnsStatus = "offline";

    try {
      // Try DNS resolution using Deno's built-in DNS resolver
      const records = await Deno.resolveDns(domain, "A");
      if (records && records.length > 0) {
        // Check if it points to Lovable's IP
        const pointsToLovable = records.includes("185.158.133.1");
        dnsStatus = pointsToLovable ? "active" : "partial";
      }
    } catch (dnsError) {
      // Try CNAME as fallback
      try {
        const cnameRecords = await Deno.resolveDns(domain, "CNAME");
        if (cnameRecords && cnameRecords.length > 0) {
          const pointsToLovable = cnameRecords.some((r: string) =>
            r.includes("lovable.app")
          );
          dnsStatus = pointsToLovable ? "active" : "partial";
        }
      } catch {
        dnsStatus = "offline";
      }
    }

    // Update tenant dns_status
    if (tenant_id) {
      await supabase
        .from("tenants")
        .update({
          dns_status: dnsStatus,
          dns_checked_at: new Date().toISOString(),
        })
        .eq("id", tenant_id);
    }

    return new Response(
      JSON.stringify({ status: dnsStatus, domain }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
