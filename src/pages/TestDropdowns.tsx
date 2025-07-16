import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTestSuppliers } from '@/hooks/useTestSuppliers';
import { useTestPastors } from '@/hooks/useTestPastors';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TestDropdowns = () => {
  // Test pastors with simplified hook
  const { data: pastors, isLoading: pastorsLoading, error: pastorsError } = useTestPastors();
  
  // Test suppliers
  const { data: suppliers, isLoading: suppliersLoading, error: suppliersError } = useTestSuppliers();
  
  // Test congregations
  const { data: congregations, isLoading: congregationsLoading, error: congregationsError } = useQuery({
    queryKey: ['test-congregations'],
    queryFn: async () => {
      console.log('🔍 Testing congregations query...');
      const { data, error } = await supabase
        .from('congregations')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching congregations:', error);
        throw error;
      }
      
      console.log('✅ Congregations fetched successfully:', data);
      return data;
    },
  });

  const renderDropdownTest = (
    title: string,
    data: any[] | undefined,
    loading: boolean,
    error: any,
    valueKey: string = 'id',
    labelKey: string = 'name'
  ) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {loading && "Carregando..."}
          {error && <span className="text-red-500">Erro: {error.message}</span>}
          {!loading && !error && data && `${data.length} item(s) encontrado(s)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Selecione ${title.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {data?.map((item) => (
              <SelectItem key={item[valueKey]} value={item[valueKey]}>
                {item[labelKey]} {item.email && `(${item.email})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong>
          <pre className="mt-2 text-xs">
            {JSON.stringify(data?.slice(0, 3), null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teste de Dropdowns</h1>
          <p className="text-gray-600 mt-2">
            Página para testar todos os dropdowns do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderDropdownTest(
            "Pastores",
            pastors,
            pastorsLoading,
            pastorsError,
            'id',
            'name'
          )}
          
          {renderDropdownTest(
            "Fornecedores",
            suppliers,
            suppliersLoading,
            suppliersError,
            'id',
            'name'
          )}
          
          {renderDropdownTest(
            "Congregações",
            congregations,
            congregationsLoading,
            congregationsError,
            'id',
            'name'
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestDropdowns;