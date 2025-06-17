
import React from 'react';
import { useMinistries, useDeleteMinistry } from '@/hooks/useMinistryData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import MinistryForm from './MinistryForm';

const MinistryTable = () => {
  const { data: ministries, isLoading } = useMinistries();
  const deleteMinistry = useDeleteMinistry();
  const [editingMinistry, setEditingMinistry] = useState<any>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ministério?')) {
      deleteMinistry.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ministries?.map((ministry) => (
              <TableRow key={ministry.id}>
                <TableCell className="font-medium">{ministry.name}</TableCell>
                <TableCell>{ministry.description || '-'}</TableCell>
                <TableCell>{ministry.leader?.name || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMinistry(ministry)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ministry.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ministries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Nenhum ministério encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MinistryForm
        open={!!editingMinistry}
        onOpenChange={(open) => !open && setEditingMinistry(null)}
        ministry={editingMinistry}
      />
    </>
  );
};

export default MinistryTable;
