import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Heart, Search, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePedidosOracao } from '@/hooks/usePedidosOracao';

const PedidosOracao = () => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const { pedidos, isLoading, markAsRead, toggleFollow, deletePedido } = usePedidosOracao();

  const filtered = pedidos?.filter((p) => {
    if (tab === 'nao_lidos' && p.is_read) return false;
    if (tab === 'acompanhados' && !p.is_followed) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (p.nome?.toLowerCase().includes(term)) ||
      p.texto.toLowerCase().includes(term)
    );
  });

  const unreadCount = pedidos?.filter((p) => !p.is_read).length ?? 0;
  const followedCount = pedidos?.filter((p) => p.is_followed).length ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Pedidos de Oração</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} não lido{unreadCount !== 1 ? 's' : ''}</Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg">
                {filtered?.length ?? 0} pedido{(filtered?.length ?? 0) !== 1 ? 's' : ''}
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou texto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="nao_lidos">
                  Não lidos {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="acompanhados">
                  Acompanhados {followedCount > 0 && `(${followedCount})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filtered && filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead className="w-40">Nome</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead className="w-44">Data</TableHead>
                      <TableHead className="w-32 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((pedido) => (
                      <TableRow
                        key={pedido.id}
                        className={!pedido.is_read ? 'bg-primary/5' : ''}
                      >
                        <TableCell>
                          {pedido.is_read ? (
                            <Badge variant="secondary" className="text-xs">Visto</Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">Novo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {pedido.nome || <span className="text-muted-foreground italic">Anônimo</span>}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="line-clamp-3 text-sm text-muted-foreground">{pedido.texto}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(pedido.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title={pedido.is_read ? 'Marcar como não lido' : 'Marcar como visto'}
                              onClick={() => markAsRead.mutate({ id: pedido.id, isRead: !pedido.is_read })}
                            >
                              {pedido.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={pedido.is_followed ? 'Remover acompanhamento' : 'Acompanhar'}
                              onClick={() => toggleFollow.mutate({ id: pedido.id, isFollowed: !pedido.is_followed })}
                            >
                              <Star className={`h-4 w-4 ${pedido.is_followed ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Remover pedido">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover pedido de oração?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O pedido será removido permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deletePedido.mutate(pedido.id)}
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum pedido de oração encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PedidosOracao;
