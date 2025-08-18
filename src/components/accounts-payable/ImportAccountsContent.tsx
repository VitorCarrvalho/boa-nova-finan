import React, { useState } from 'react';
import { FileUploadZone } from './import/FileUploadZone';
import { ImportPreviewTable } from './import/ImportPreviewTable';
import { ImportSummary } from './import/ImportSummary';
import { ImportValidationMessages } from './import/ImportValidationMessages';
import { Button } from '@/components/ui/button';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCSVImport } from '@/hooks/useCSVImport';
import { useAccountsImport } from '@/hooks/useAccountsImport';
import { generateCSVTemplate } from '@/utils/templateGenerator';
import { Progress } from '@/components/ui/progress';

export interface ImportedAccount {
  id: string;
  description: string;
  category_id: string;
  category_name?: string;
  amount: number;
  due_date: string;
  payment_method: string;
  payee_name: string;
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  congregation_id: string;
  congregation_name?: string;
  observations?: string;
  invoice_number?: string;
  is_recurring: boolean;
  recurrence_frequency?: string;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  next_occurrence_date?: string;
  is_future_scheduled: boolean;
  future_scheduled_date?: string;
  urgency_level: 'normal' | 'urgent';
  urgency_description?: string;
  // Campos de validação
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
}

const ImportAccountsContent = () => {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const {
    parsedData,
    validatedData,
    validationSummary,
    parseFile,
    isProcessing,
    error: parseError
  } = useCSVImport();
  
  const {
    importAccounts,
    isImporting,
    progress,
    results,
    error: importError
  } = useAccountsImport();

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    const success = await parseFile(uploadedFile);
    if (success) {
      setStep('preview');
    }
  };

  const handleDownloadTemplate = () => {
    generateCSVTemplate();
  };

  const handleStartImport = async () => {
    if (!validatedData || validatedData.length === 0) return;
    
    setStep('importing');
    const success = await importAccounts(validatedData.filter(item => item.isValid && !item.isDuplicate));
    
    if (success) {
      setStep('results');
    }
  };

  const handleStartOver = () => {
    setStep('upload');
    setFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-primary' : ['preview', 'importing', 'results'].includes(step) ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary text-primary-foreground' : ['preview', 'importing', 'results'].includes(step) ? 'bg-green-600 text-white' : 'bg-muted'}`}>
            1
          </div>
          <span>Upload</span>
        </div>
        <div className={`flex items-center space-x-2 ${step === 'preview' ? 'text-primary' : step === 'importing' || step === 'results' ? 'text-green-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-primary text-primary-foreground' : step === 'importing' || step === 'results' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
            2
          </div>
          <span>Revisão</span>
        </div>
        <div className={`flex items-center space-x-2 ${step === 'importing' ? 'text-primary' : step === 'results' ? 'text-green-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'importing' ? 'bg-primary text-primary-foreground' : step === 'results' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
            3
          </div>
          <span>Importação</span>
        </div>
        <div className={`flex items-center space-x-2 ${step === 'results' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'results' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            4
          </div>
          <span>Resultados</span>
        </div>
      </div>

      {/* Step Content */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Selecione o arquivo para importação</h3>
            <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </Button>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Use o template CSV para garantir que os dados estejam no formato correto. 
              Formatos aceitos: .csv, .xlsx, .xls
            </AlertDescription>
          </Alert>

          <FileUploadZone 
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
          />
          
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {step === 'preview' && validatedData && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Revisão dos Dados</h3>
            <div className="flex space-x-2">
              <Button onClick={handleStartOver} variant="outline">
                Escolher Outro Arquivo
              </Button>
              <Button 
                onClick={handleStartImport}
                disabled={validationSummary.valid === 0}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar {validationSummary.valid} Contas
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{validationSummary.valid}</div>
              <div className="text-sm text-green-600">Válidas</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-700">{validationSummary.invalid}</div>
              <div className="text-sm text-red-600">Com Erro</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-700">{validationSummary.duplicates}</div>
              <div className="text-sm text-yellow-600">Duplicadas</div>
            </div>
          </div>

          <ImportPreviewTable data={validatedData} />
          
          {(validationSummary.invalid > 0 || validationSummary.duplicates > 0) && (
            <ImportValidationMessages data={validatedData} />
          )}
        </div>
      )}

      {step === 'importing' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Importando Contas...</h3>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {progress}% concluído - Aguarde enquanto processamos os dados...
          </p>
          
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {step === 'results' && results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Importação Concluída</h3>
            <Button onClick={handleStartOver}>
              Nova Importação
            </Button>
          </div>

          <ImportSummary results={results} />
        </div>
      )}
    </div>
  );
};

export default ImportAccountsContent;