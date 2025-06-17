
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents, useDeleteEvent } from '@/hooks/useEventData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Search, Plus, Calendar, MapPin, Users } from 'lucide-react';
import EventForm from './EventForm';
import type { Database } from '@/integrations/supabase/types';

type ChurchEvent = Database['public']['Tables']['church_events']['Row'] & { 
  organizer?: { name: string } 
};

const EventTable = () => {
  const { data: events, isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();
  const { userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.slice(0, 5);
  };

  const getEventTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'culto': 'Culto',
      'conferencia': 'Conferência',
      'reuniao': 'Reunião',
      'evento_especial': 'Evento Especial'
    };
    return types[type] || type;
  };

  const getEventTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'culto': 'bg-blue-100 text-blue-800',
      'conferencia': 'bg-purple-100 text-purple-800',
      'reuniao': 'bg-green-100 text-green-800',
      'evento_especial': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredEvents = events?.filter(event => {
    const matchesSearch = !searchTerm || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || event.type === typeFilter;

    return matchesSearch && matchesType;
  }) || [];

  const handleEdit = (event: ChurchEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEvent.mutateAsync(id);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  const canManageEvents = userRole && ['superadmin', 'admin', 'pastor'].includes(userRole);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Eventos da Igreja
              </CardTitle>
              <CardDescription>
                Gerencie os eventos, cultos e atividades da igreja
              </CardDescription>
            </div>
            {canManageEvents && (
              <Button onClick={handleNewEvent} className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="culto">Culto</SelectItem>
                <SelectItem value="conferencia">Conferência</SelectItem>
                <SelectItem value="reuniao">Reunião</SelectItem>
                <SelectItem value="evento_especial">Evento Especial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || typeFilter !== 'all' 
                ? 'Nenhum evento encontrado com os filtros aplicados.'
                : 'Nenhum evento cadastrado ainda.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Organizador</TableHead>
                    <TableHead>Participantes</TableHead>
                    {canManageEvents && <TableHead className="text-right">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {event.description.slice(0, 100)}
                              {event.description.length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEventTypeBadgeColor(event.type)}>
                          {getEventTypeLabel(event.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        {event.time && (
                          <div className="text-sm text-gray-500 mt-1">
                            {formatTime(event.time)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {event.organizer?.name || (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {event.current_attendees || 0}
                          {event.max_attendees && ` / ${event.max_attendees}`}
                        </div>
                      </TableCell>
                      {canManageEvents && (
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o evento "{event.title}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(event.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EventForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default EventTable;
