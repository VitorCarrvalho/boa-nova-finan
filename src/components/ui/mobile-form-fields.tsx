import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const MobileField: React.FC<MobileFieldProps> = ({
  label,
  error,
  required = false,
  className = '',
  children
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn('space-y-2', className)}>
      <Label className={cn(
        'text-sm font-medium',
        isMobile && 'text-base',
        error && 'text-destructive'
      )}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const isMobile = useIsMobile();
  
  return (
    <MobileField label={label} error={error} required={required}>
      <Input
        {...props}
        className={cn(
          isMobile && 'h-12 text-base',
          error && 'border-destructive',
          className
        )}
      />
    </MobileField>
  );
};

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const MobileTextarea: React.FC<MobileTextareaProps> = ({
  label,
  error,
  required = false,
  className = '',
  ...props
}) => {
  const isMobile = useIsMobile();
  
  return (
    <MobileField label={label} error={error} required={required}>
      <Textarea
        {...props}
        className={cn(
          isMobile && 'min-h-[120px] text-base',
          error && 'border-destructive',
          className
        )}
      />
    </MobileField>
  );
};

interface MobileSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const MobileSelect: React.FC<MobileSelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Selecione...',
  error,
  required = false,
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  return (
    <MobileField label={label} error={error} required={required} className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          className={cn(
            isMobile && 'h-12 text-base',
            error && 'border-destructive'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50 bg-background">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </MobileField>
  );
};

interface MobileDatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const MobileDatePicker: React.FC<MobileDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Selecione uma data',
  error,
  required = false,
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  return (
    <MobileField label={label} error={error} required={required} className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              isMobile && 'h-12 text-base',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </MobileField>
  );
};

export {
  MobileField,
  MobileInput,
  MobileTextarea,
  MobileSelect,
  MobileDatePicker
};