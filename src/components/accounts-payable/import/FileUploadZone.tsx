import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileUpload, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const acceptedFormats = [
    '.csv',
    '.xlsx',
    '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  };

  const isValidFile = (file: File) => {
    const isValidExtension = acceptedFormats.some(format => 
      file.name.toLowerCase().endsWith(format.toLowerCase()) || file.type === format
    );
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
    
    if (!isValidExtension) {
      alert('Formato de arquivo não suportado. Use apenas CSV, XLS ou XLSX.');
      return false;
    }
    
    if (!isValidSize) {
      alert('Arquivo muito grande. O limite é de 10MB.');
      return false;
    }
    
    return true;
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
        
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">
                Clique para selecionar ou arraste o arquivo aqui
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Formatos aceitos: CSV, XLS, XLSX (máximo 10MB)
              </p>
            </div>
            <Button variant="outline" disabled={isProcessing}>
              Selecionar Arquivo
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button onClick={handleUpload} disabled={isProcessing}>
                {isProcessing ? 'Processando...' : 'Processar Arquivo'}
              </Button>
              <Button variant="outline" onClick={clearFile} disabled={isProcessing}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Dicas:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Use o template CSV para garantir o formato correto</li>
          <li>Dados obrigatórios: Descrição, Categoria, Valor, Data de Vencimento, Forma de Pagamento, Favorecido, Congregação</li>
          <li>Para recorrência, preencha as colunas relacionadas conforme instruções do template</li>
        </ul>
      </div>
    </div>
  );
};