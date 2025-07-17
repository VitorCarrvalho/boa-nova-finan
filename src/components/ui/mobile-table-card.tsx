import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface MobileTableCardField {
  label: string;
  value: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface MobileTableCardAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MobileTableCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fields: MobileTableCardField[];
  actions?: MobileTableCardAction[];
  status?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onClick?: () => void;
  className?: string;
}

const MobileTableCard: React.FC<MobileTableCardProps> = ({
  title,
  subtitle,
  fields,
  actions = [],
  status,
  onClick,
  className = ''
}) => {
  return (
    <Card 
      className={`w-full transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              {status && (
                <Badge variant={status.variant} className="shrink-0">
                  {status.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {onClick && (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Fields Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {fields.map((field, index) => (
            <div key={index} className="flex justify-between items-center py-1">
              <span className="text-xs text-muted-foreground font-medium">
                {field.label}
              </span>
              <div className={`text-xs font-medium text-right ${field.className || ''}`}>
                {field.value}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                disabled={action.disabled}
                className="flex items-center gap-1 text-xs"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { MobileTableCard };
export type { MobileTableCardField, MobileTableCardAction, MobileTableCardProps };