
import React from 'react';
import Layout from '@/components/layout/Layout';
import EventTable from '@/components/events/EventTable';

const Events = () => {
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
