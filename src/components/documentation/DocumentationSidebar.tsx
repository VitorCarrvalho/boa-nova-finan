import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DocumentationSection } from "@/hooks/useDocumentationData";
import { cn } from "@/lib/utils";

interface DocumentationSidebarProps {
  sections: DocumentationSection[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
}

export const DocumentationSidebar = ({ 
  sections, 
  selectedSectionId, 
  onSectionSelect 
}: DocumentationSidebarProps) => {
  const rootSections = sections.filter(section => !section.parent_section_id);
  
  return (
    <div className="w-80 border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Documentação</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="p-4 space-y-2">
          {rootSections.map((section) => (
            <Button
              key={section.id}
              variant={selectedSectionId === section.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left h-auto py-3",
                selectedSectionId === section.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => onSectionSelect(section.id)}
            >
              <div>
                <div className="font-medium">{section.title}</div>
                {section.module_key && (
                  <div className="text-xs opacity-70 capitalize">
                    Módulo: {section.module_key}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};