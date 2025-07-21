import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  module_key: string | null;
  section_order: number;
  parent_section_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDocumentationData = () => {
  return useQuery({
    queryKey: ["documentation-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentation_sections" as any)
        .select("*")
        .eq("is_active", true)
        .order("section_order", { ascending: true });

      if (error) throw error;
      return data as unknown as DocumentationSection[];
    },
  });
};

export const useDocumentationSection = (sectionId: string | undefined) => {
  return useQuery({
    queryKey: ["documentation-section", sectionId],
    queryFn: async () => {
      if (!sectionId) return null;
      
      const { data, error } = await supabase
        .from("documentation_sections" as any)
        .select("*")
        .eq("id", sectionId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as unknown as DocumentationSection;
    },
    enabled: !!sectionId,
  });
};