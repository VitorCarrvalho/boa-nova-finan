import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ImportedAccount } from '@/components/accounts-payable/ImportAccountsContent';
import { useImportValidation } from './useImportValidation';

export const useCSVImport = () => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validatedData, setValidatedData] = useState<ImportedAccount[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateImportData, validationSummary } = useImportValidation();

  const parseFile = async (file: File): Promise<boolean> => {
    setIsProcessing(true);
    setError(null);

    try {
      let rawData: any[] = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        rawData = await parseCSV(file);
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        rawData = await parseExcel(file);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }

      console.log('Raw parsed data:', rawData);

      if (rawData.length === 0) {
        throw new Error('Arquivo vazio ou sem dados válidos');
      }

      setParsedData(rawData);
      
      // Validate the parsed data
      const validated = await validateImportData(rawData);
      setValidatedData(validated);

      return true;
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        transformHeader: (header) => {
          // Normalize header names to match our expected format
          const headerMap: { [key: string]: string } = {
            'descrição': 'description',
            'descricao': 'description',
            'categoria': 'category_name',
            'valor': 'amount',
            'vencimento': 'due_date',
            'data_vencimento': 'due_date',
            'forma_pagamento': 'payment_method',
            'pagamento': 'payment_method',
            'favorecido': 'payee_name',
            'nome_favorecido': 'payee_name',
            'banco': 'bank_name',
            'agencia': 'bank_agency',
            'agência': 'bank_agency',
            'conta': 'bank_account',
            'congregacao': 'congregation_name',
            'congregação': 'congregation_name',
            'observacoes': 'observations',
            'observações': 'observations',
            'nota_fiscal': 'invoice_number',
            'numero_nota': 'invoice_number',
            'recorrente': 'is_recurring',
            'frequencia': 'recurrence_frequency',
            'frequência': 'recurrence_frequency',
            'dia_semana': 'recurrence_day_of_week',
            'dia_mes': 'recurrence_day_of_month',
            'dia_mês': 'recurrence_day_of_month',
            'proxima_data': 'next_occurrence_date',
            'próxima_data': 'next_occurrence_date',
            'agendado_futuro': 'is_future_scheduled',
            'data_agendamento': 'future_scheduled_date',
            'urgencia': 'urgency_level',
            'urgência': 'urgency_level',
            'motivo_urgencia': 'urgency_description',
            'motivo_urgência': 'urgency_description'
          };
          
          const normalizedHeader = header.toLowerCase().trim();
          return headerMap[normalizedHeader] || normalizedHeader;
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
            reject(new Error('Erro ao processar CSV: ' + results.errors[0].message));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(new Error('Erro ao ler arquivo CSV: ' + error.message));
        }
      });
    });
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            raw: false
          });

          if (jsonData.length < 2) {
            reject(new Error('Planilha deve ter pelo menos uma linha de cabeçalho e uma linha de dados'));
            return;
          }

          // Convert to object format with header mapping
          const headers = (jsonData[0] as string[]).map((header: string) => {
            const headerMap: { [key: string]: string } = {
              'descrição': 'description',
              'descricao': 'description',
              'categoria': 'category_name',
              'valor': 'amount',
              'vencimento': 'due_date',
              'data_vencimento': 'due_date',
              'forma_pagamento': 'payment_method',
              'pagamento': 'payment_method',
              'favorecido': 'payee_name',
              'nome_favorecido': 'payee_name',
              'banco': 'bank_name',
              'agencia': 'bank_agency',
              'agência': 'bank_agency',
              'conta': 'bank_account',
              'congregacao': 'congregation_name',
              'congregação': 'congregation_name',
              'observacoes': 'observations',
              'observações': 'observations',
              'nota_fiscal': 'invoice_number',
              'numero_nota': 'invoice_number',
              'recorrente': 'is_recurring',
              'frequencia': 'recurrence_frequency',
              'frequência': 'recurrence_frequency',
              'dia_semana': 'recurrence_day_of_week',
              'dia_mes': 'recurrence_day_of_month',
              'dia_mês': 'recurrence_day_of_month',
              'proxima_data': 'next_occurrence_date',
              'próxima_data': 'next_occurrence_date',
              'agendado_futuro': 'is_future_scheduled',
              'data_agendamento': 'future_scheduled_date',
              'urgencia': 'urgency_level',
              'urgência': 'urgency_level',
              'motivo_urgencia': 'urgency_description',
              'motivo_urgência': 'urgency_description'
            };
            
            const normalizedHeader = header.toLowerCase().trim();
            return headerMap[normalizedHeader] || normalizedHeader;
          });

          const rows = jsonData.slice(1) as any[][];
          const objectData = rows.map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          }).filter(row => Object.values(row).some(val => val !== ''));

          resolve(objectData);
        } catch (error) {
          reject(new Error('Erro ao processar arquivo Excel: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsBinaryString(file);
    });
  };

  return {
    parsedData,
    validatedData,
    setValidatedData,
    validationSummary,
    parseFile,
    isProcessing,
    error
  };
};