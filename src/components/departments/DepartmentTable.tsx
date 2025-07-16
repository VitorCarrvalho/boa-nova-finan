
import React from 'react';
import { useDepartments, useDeleteDepartment } from '@/hooks/useDepartmentData';
import { usePermissions } from '@/hooks/usePermissions';
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
import DepartmentForm from './DepartmentForm';

const DepartmentTable = () => {
  const { data: departments, isLoading } = useDepartments();
  const deleteDepartment = useDeleteDepartment();
  const { canEditModule, canDeleteModule } = usePermissions();
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  
  const canEdit = canEditModule('departamentos');
  const canDelete = canDeleteModule('departamentos');

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este departamento?')) {
      deleteDepartment.mutate(id);
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
              <TableHead>Líder</TableHead>
              {(canEdit || canDelete) && <TableHead className="w-32">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments?.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{department.leader?.name || '-'}</TableCell>
                {(canEdit || canDelete) && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDepartment(department)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(department.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {departments?.length === 0 && (
              <TableRow>
                <TableCell colSpan={(canEdit || canDelete) ? 3 : 2} className="text-center py-8 text-gray-500">
                  Nenhum departamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DepartmentForm
        open={!!editingDepartment}
        onOpenChange={(open) => !open && setEditingDepartment(null)}
        department={editingDepartment}
      />
    </>
  );
};

export default DepartmentTable;
