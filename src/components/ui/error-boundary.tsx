import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center space-y-4 p-8 bg-red-50 rounded-lg border border-red-200 max-w-md">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Ops! Algo deu errado
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          {error && (
            <details className="text-xs text-red-500 mb-4">
              <summary className="cursor-pointer">Detalhes do erro</summary>
              <pre className="mt-2 text-left overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        <Button 
          onClick={resetError}
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
};

export default ErrorBoundary;