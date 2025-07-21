import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { DocumentationSection } from "@/hooks/useDocumentationData";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentationContentProps {
  section: DocumentationSection | null;
  isLoading: boolean;
}

export const DocumentationContent = ({ section, isLoading }: DocumentationContentProps) => {
  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">Selecione uma seção</h3>
          <p>Escolha uma seção na barra lateral para visualizar a documentação.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-6 max-w-4xl">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Atualizado em {format(new Date(section.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
              {section.module_key && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">Módulo: {section.module_key}</span>
                </div>
              )}
            </div>
          </div>
          
          <MarkdownRenderer content={section.content} />
        </div>
      </ScrollArea>
    </div>
  );
};