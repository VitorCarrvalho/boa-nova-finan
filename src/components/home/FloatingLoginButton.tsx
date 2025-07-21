import React from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FloatingLoginButton = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <Button
      onClick={handleLogin}
      size="lg"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-14 w-14 p-0"
    >
      <LogIn className="w-5 h-5" />
    </Button>
  );
};

export default FloatingLoginButton;