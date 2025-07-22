
import { useState } from "react";
import { useDocumentationData } from "@/hooks/useDocumentationData";
import { useDocumentationSearch } from "@/hooks/useDocumentationSearch";
import { DocumentationSidebar } from "@/components/documentation/DocumentationSidebar";
import { DocumentationContent } from "@/components/documentation/DocumentationContent";
import { DocumentationSearch } from "@/components/documentation/DocumentationSearch";
import { DocumentationActions } from "@/components/documentation/DocumentationActions";
import { useDocumentationSection } from "@/hooks/useDocumentationData";

export default function Documentation() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const { data: sections = [], isLoading: sectionsLoading } = useDocumentationData();
  const { data: selectedSection, isLoading: sectionLoading } = useDocumentationSection(selectedSectionId || undefined);
  const { searchTerm, setSearchTerm, filteredSections } = useDocumentationSearch(sections);

  // Auto-select first section on initial load
  if (sections.length > 0 && !selectedSectionId) {
    setSelectedSectionId(sections[0].id);
  }

  const displaySections = searchTerm ? filteredSections : sections;

  return (
    <div className="flex h-screen bg-background">
      <DocumentationSidebar
        sections={displaySections}
        selectedSectionId={selectedSectionId}
        onSectionSelect={setSelectedSectionId}
      />
      
      <div className="flex-1 flex flex-col">
        <DocumentationActions />
        
        <div className="p-4 border-b">
          <DocumentationSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        
        <DocumentationContent
          section={selectedSection || null}
          isLoading={sectionsLoading || sectionLoading}
        />
      </div>
    </div>
  );
}
