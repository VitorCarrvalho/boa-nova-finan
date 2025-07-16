import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuppliers } from '@/hooks/useSupplierData';
import { useMembers } from '@/hooks/useMemberData';
import { useSystemPastors } from '@/hooks/useSystemUsers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TestDropdowns = () => {
  // Test all dropdown data sources
  const { data: suppliers, isLoading: suppliersLoading, error: suppliersError } = useSuppliers();
  const { data: members, isLoading: membersLoading, error: membersError } = useMembers();
  const { data: pastors, isLoading: pastorsLoading, error: pastorsError } = useSystemPastors();
  
  // Test congregations
  const { data: congregations, isLoading: congregationsLoading, error: congregationsError } = useQuery({
    queryKey: ['congregations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('congregations')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Test ministries
  const { data: ministries, isLoading: ministriesLoading, error: ministriesError } = useQuery({
    queryKey: ['ministries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministries')
        .select('id, name')
        .order('name');

      if (error) throw error;
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
            "Membros",
            members,
            membersLoading,
            membersError,
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
          
          {renderDropdownTest(
            "Ministérios",
            ministries,
            ministriesLoading,
            ministriesError,
            'id',
            'name'
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestDropdowns;