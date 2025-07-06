
import React from 'react';
import { useReconciliationForm } from './hooks/useReconciliationForm';
import AccessValidation from './AccessValidation';
import ReconciliationFormFields from './ReconciliationFormFields';

interface ReconciliationFormProps {
  reconciliation?: any;
  onClose: () => void;
}

const ReconciliationForm: React.FC<ReconciliationFormProps> = ({ reconciliation, onClose }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    onSubmit,
    totalIncome,
    availableCongregations,
    defaultCongregationId,
    isLoading,
    isPastor,
    isAdmin,
    isEditing,
    congregationAccess
  } = useReconciliationForm({ reconciliation, onClose });

  // Validation to ensure pastor has access to congregations
  if (isPastor && (!congregationAccess?.hasAccess || availableCongregations.length === 0)) {
    return (
      <AccessValidation 
        hasAccess={congregationAccess?.hasAccess || false} 
        availableCongregations={availableCongregations} 
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ReconciliationFormFields
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        totalIncome={totalIncome}
        availableCongregations={availableCongregations}
        defaultCongregationId={defaultCongregationId}
        isPastor={isPastor}
        isAdmin={isAdmin}
        isLoading={isLoading}
        isEditing={isEditing}
        onClose={onClose}
      />
    </form>
  );
};

export default ReconciliationForm;
