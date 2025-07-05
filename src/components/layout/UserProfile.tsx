
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = React.useState<{ name: string; photo_url: string | null } | null>(null);

  React.useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, photo_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const uploadProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para enviar.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
        throw new Error('Apenas arquivos JPG e PNG são permitidos.');
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter menos de 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/profile.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      // Update local state
      setProfileData(prev => prev ? { ...prev, photo_url: publicUrl } : null);

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user || !profileData) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <Avatar className="h-10 w-10 cursor-pointer">
          <AvatarImage 
            src={profileData.photo_url || undefined} 
            alt={profileData.name}
          />
          <AvatarFallback className="bg-red-100 text-red-600">
            {getInitials(profileData.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="h-4 w-4 text-white" />
        </div>
        
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={uploadProfilePicture}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Enviar nova foto"
        />
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 capitalize">
          {userRole}
        </span>
      </div>
    </div>
  );
};

export default UserProfile;
