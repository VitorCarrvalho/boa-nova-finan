import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useImageUpload } from '@/hooks/useImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface UserProfile {
  name: string;
  photo_url?: string;
}

const HeaderProfile: React.FC = () => {
  const { user, userRole } = useAuth();
  const { uploadEventBanner, isUploading } = useImageUpload();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, photo_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      const imageUrl = await uploadEventBanner(file, `profile-${user?.id}`);
      
      if (imageUrl) {
        const { error } = await supabase
          .from('profiles')
          .update({ photo_url: imageUrl })
          .eq('id', user?.id);

        if (error) throw error;

        setProfile(prev => prev ? { ...prev, photo_url: imageUrl } : null);
        toast({
          title: "Sucesso",
          description: "Foto de perfil atualizada com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePicture(file);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        <div className="hidden md:block">
          <div className="w-20 h-4 bg-muted rounded animate-pulse mb-1" />
          <div className="w-16 h-3 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ThemeToggle />
      <div className="relative group">
        <Avatar className="w-8 h-8 cursor-pointer border-2 border-primary/20">
          <AvatarImage src={profile.photo_url} alt="Foto do perfil" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>
        
        {/* Indicador online */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        
        {/* Overlay para upload */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Camera className="w-3 h-3 text-white" />
        </div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <div className="hidden md:block">
        <p className="text-sm font-medium text-foreground">
          {profile.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {userRole}
        </p>
      </div>
    </div>
  );
};

export default HeaderProfile;