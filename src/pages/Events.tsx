
import React from 'react';
import Layout from '@/components/layout/Layout';
import EventTable from '@/components/events/EventTable';
import { usePermissions } from '@/hooks/usePermissions';

const Events = () => {
  const { canViewModule } = usePermissions();
  const canView = canViewModule('eventos');

  if (!canView) {
    return (
      <Layout>
        <div className="text-center p-8">
          <p className="text-gray-500">Você não tem permissão para acessar este módulo.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie os eventos, cultos e atividades da igreja
          </p>
        </div>

        <EventTable />
      </div>
    </Layout>
  );
};

export default Events;
