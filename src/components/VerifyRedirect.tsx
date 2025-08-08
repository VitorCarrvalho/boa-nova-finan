import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Capturar o fragment completo da URL atual
    const fragment = window.location.hash;
    
    console.log('🔄 Redirecionando de /verify para /reset-password');
    console.log('🔍 Fragment capturado:', fragment);
    
    // Redirecionar para /reset-password mantendo o fragment
    navigate(`/reset-password${fragment}`, { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
};

export default VerifyRedirect;