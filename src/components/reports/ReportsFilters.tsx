
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, RefreshCw } from 'lucide-react';

const ReportsFilters = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  const paymentMethods = [
    { id: 'cash', label: 'Dinheiro' },
    { id: 'pix', label: 'Pix' },
    { id: 'online_pix', label: 'Pix Online' },
    { id: 'debit', label: 'Débito' },
    { id: 'credit', label: 'Crédito' }
  ];

  const handlePaymentMethodChange = (methodId: string, checked: boolean) => {
    if (checked) {
      setSelectedPaymentMethods([...selectedPaymentMethods, methodId]);
    } else {
      setSelectedPaymentMethods(selectedPaymentMethods.filter(id => id !== methodId));
    }
  };

  const handleApplyFilters = () => {
    // TODO: Implement filter application logic
    console.log('Applying filters:', {
      startDate,
      endDate,
      selectedStatus,
      selectedPaymentMethods
    });
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedStatus('all');
    setSelectedPaymentMethods([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="start-date">Data Inicial</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="end-date">Data Final</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status da Conciliação</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formas de Pagamento</Label>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2">
                <Checkbox
                  id={method.id}
                  checked={selectedPaymentMethods.includes(method.id)}
                  onCheckedChange={(checked) => 
                    handlePaymentMethodChange(method.id, checked as boolean)
                  }
                />
                <Label htmlFor={method.id} className="text-sm">
                  {method.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleApplyFilters} className="bg-red-600 hover:bg-red-700">
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsFilters;
