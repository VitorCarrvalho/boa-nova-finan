import { useState } from 'react';

interface N8nPayload {
  tipo_disparo: string;
  tipo_mensagem: string;
  mensagem: string;
  id_video?: string;
  destinatarios: string[];
  recorrencia?: string;
  horario_agendado?: string;
  criado_por: string;
  criado_em: string;
}

export const useN8nIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToN8n = async (payload: N8nPayload): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://webhook.dev.vitorcarvalho.tech/webhook-test/notificacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta do n8n:', result);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao enviar para n8n';
      setError(errorMessage);
      console.error('Erro ao enviar para n8n:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendToN8n,
    loading,
    error,
  };
};