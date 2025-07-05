
import React from 'react';

interface ReconciliationSummaryProps {
  totalIncome: number;
}

const ReconciliationSummary: React.FC<ReconciliationSummaryProps> = ({ totalIncome }) => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>Valor a Enviar (15%):</strong> R$ {(totalIncome * 0.15).toFixed(2)}
      </p>
    </div>
  );
};

export default ReconciliationSummary;
