import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { parseBrazilianCurrency, formatCurrencyInput } from '@/utils/currencyUtils';

interface CurrencyInputProps {
  value?: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value = 0,
  onChange,
  placeholder = "0,00",
  className,
  disabled,
  id,
  name,
  onBlur,
  autoFocus
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatCurrencyInput(value.toString()));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers, dots, and commas
    const sanitized = inputValue.replace(/[^0-9.,]/g, '');
    
    setDisplayValue(sanitized);
    
    // Parse and notify parent component
    const numericValue = parseBrazilianCurrency(sanitized);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Format the value on blur for better UX
    if (displayValue) {
      const formatted = formatCurrencyInput(displayValue);
      setDisplayValue(formatted);
    }
    onBlur?.();
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        R$
      </span>
      <Input
        id={id}
        name={name}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </div>
  );
};