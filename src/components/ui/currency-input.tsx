import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { formatAsUserTypes, parseCalculatorInput } from '@/utils/currencyUtils';

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
  const [internalDigits, setInternalDigits] = useState('');

  useEffect(() => {
    if (value > 0) {
      // Convert back to centavos for internal representation
      const centavos = Math.round(value * 100).toString();
      setInternalDigits(centavos);
    } else {
      setInternalDigits('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Handle paste operations - if user pastes formatted currency, extract digits
    if (inputValue.includes(',') || inputValue.includes('.')) {
      const pastedNumber = parseCalculatorInput(inputValue);
      const centavos = Math.round(pastedNumber * 100).toString();
      setInternalDigits(centavos);
      onChange(pastedNumber);
      return;
    }
    
    // Allow only digits
    const digits = inputValue.replace(/\D/g, '');
    
    // Limit to reasonable amount (10 digits = R$ 99.999.999,99)
    if (digits.length > 10) return;
    
    setInternalDigits(digits);
    
    // Convert to number and notify parent
    const numericValue = parseCalculatorInput(formatAsUserTypes(digits));
    onChange(numericValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace to remove last digit
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = internalDigits.slice(0, -1);
      setInternalDigits(newDigits);
      const numericValue = parseCalculatorInput(formatAsUserTypes(newDigits));
      onChange(numericValue);
      return;
    }
    
    // Allow only digits and navigation keys
    if (!/[\d]/.test(e.key) && !['ArrowLeft', 'ArrowRight', 'Delete', 'Tab', 'Enter', 'Escape'].includes(e.key)) {
      e.preventDefault();
    }
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
        value={formatAsUserTypes(internalDigits)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`pl-10 ${className}`}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    </div>
  );
};