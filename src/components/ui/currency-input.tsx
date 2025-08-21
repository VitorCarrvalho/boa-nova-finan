import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import { Input } from './input';
import { cn } from '@/lib/utils';

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
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        R$
      </span>
      <NumericFormat
        customInput={Input}
        id={id}
        name={name}
        value={value || ''}
        onValueChange={(values) => {
          const { floatValue } = values;
          onChange(floatValue || 0);
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        disabled={disabled}
        autoFocus={autoFocus}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        allowNegative={false}
        allowLeadingZeros={false}
      />
    </div>
  );
};