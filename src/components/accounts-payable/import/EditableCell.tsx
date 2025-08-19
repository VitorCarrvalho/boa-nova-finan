import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: any;
  onChange: (value: any) => void;
  type: 'text' | 'currency' | 'date' | 'select' | 'number';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  hasError?: boolean;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onChange,
  type,
  options,
  placeholder,
  className,
  isEditing,
  onStartEdit,
  onStopEdit,
  hasError
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(internalValue);
    onStopEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInternalValue(value); // Reset to original value
      onStopEdit();
    }
  };

  if (!isEditing) {
    const getDisplayValue = () => {
      if (type === 'currency' && typeof value === 'number') {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      }
      if (type === 'date' && value) {
        return new Date(value).toLocaleDateString('pt-BR');
      }
      if (type === 'select' && options && value) {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
      }
      return value || placeholder || '-';
    };

    return (
      <div
        className={cn(
          "cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[2rem] flex items-center",
          hasError && "bg-red-50 border-red-200",
          className
        )}
        onClick={onStartEdit}
        title="Clique para editar"
      >
        {getDisplayValue()}
      </div>
    );
  }

  const renderInput = () => {
    switch (type) {
      case 'currency':
        return (
          <CurrencyInput
            value={internalValue}
            onChange={setInternalValue}
            onBlur={handleSave}
            autoFocus
            className="h-8"
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-8"
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value ? Number(e.target.value) : '')}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            className="h-8"
            min="0"
          />
        );
      
      case 'select':
        return (
          <Select 
            value={internalValue} 
            onValueChange={(newValue) => {
              setInternalValue(newValue);
              onChange(newValue);
              onStopEdit();
            }}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            className="h-8"
          />
        );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {renderInput()}
    </div>
  );
};