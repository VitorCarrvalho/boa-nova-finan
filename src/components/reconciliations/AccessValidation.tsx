
import React from 'react';

interface AccessValidationProps {
  hasAccess: boolean;
  availableCongregations: Array<{ id: string; name: string }>;
}

const AccessValidation: React.FC<AccessValidationProps> = ({ hasAccess, availableCongregations }) => {
  if (!hasAccess || availableCongregations.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Você não possui acesso a nenhuma congregação para enviar conciliações. 
          Entre em contato com o administrador.
        </p>
      </div>
    );
  }

  return null;
};

export default AccessValidation;
