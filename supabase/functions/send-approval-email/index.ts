import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  userEmail: string;
  userName: string;
  profileName: string;
  congregationName?: string;
  loginUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, profileName, congregationName, loginUrl }: ApprovalEmailRequest = await req.json();

    console.log("Sending approval email to:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "Sistema Congregacional <onboarding@resend.dev>",
      to: [userEmail],
      subject: "✅ Sua conta foi aprovada!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Parabéns, ${userName}!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sua conta foi aprovada com sucesso</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Detalhes da sua aprovação:</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${userEmail}</p>
              <p style="margin: 5px 0;"><strong>👤 Perfil atribuído:</strong> ${profileName}</p>
              ${congregationName ? `<p style="margin: 5px 0;"><strong>⛪ Congregação:</strong> ${congregationName}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                🚀 Acessar o Sistema
              </a>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">ℹ️ Próximos passos:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Clique no botão acima para acessar o sistema</li>
                <li>Use o email e senha que você cadastrou durante o registro</li>
                <li>Explore as funcionalidades disponíveis para seu perfil</li>
                <li>Em caso de dúvidas, entre em contato com a administração</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
              Este é um email automático do Sistema de Gestão Congregacional.<br>
              Se você não solicitou esta aprovação, entre em contato conosco.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);