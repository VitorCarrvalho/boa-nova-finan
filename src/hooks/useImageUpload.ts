import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadEventBanner = async (file: File, eventId?: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload para o bucket event-banners
      const { data, error } = await supabase.storage
        .from('event-banners')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload da imagem:', error);
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('event-banners')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteEventBanner = async (url: string): Promise<void> => {
    try {
      // Extrair o path da URL
      const path = url.split('/storage/v1/object/public/event-banners/')[1];
      if (!path) return;

      const { error } = await supabase.storage
        .from('event-banners')
        .remove([path]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  };

  return {
    uploadEventBanner,
    deleteEventBanner,
    isUploading
  };
};