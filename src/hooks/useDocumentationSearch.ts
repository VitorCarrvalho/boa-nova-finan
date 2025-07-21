import { useState, useMemo } from "react";
import { DocumentationSection } from "./useDocumentationData";

export const useDocumentationSearch = (sections: DocumentationSection[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;

    return sections.filter(section => 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sections, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredSections,
  };
};