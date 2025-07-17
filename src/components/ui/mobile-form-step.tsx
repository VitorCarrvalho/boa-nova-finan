import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFormStepProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  isValid?: boolean;
  children: React.ReactNode;
}

const MobileFormStep: React.FC<MobileFormStepProps> = ({
  title,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onFinish,
  isValid = true,
  children
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <div className="space-y-6">{children}</div>;
  }

  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <Card className="min-h-[calc(100vh-8rem)]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentStep}/{totalSteps}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-4 mb-6">
          {children}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-3 sticky bottom-4 bg-background p-4 border-t -mx-6 -mb-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {isLastStep ? (
            <Button
              onClick={onFinish}
              disabled={!isValid}
              className="flex-1"
            >
              Finalizar
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!isValid}
              className="flex-1"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { MobileFormStep };