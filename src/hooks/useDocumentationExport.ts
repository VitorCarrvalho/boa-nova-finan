
import { useCallback } from "react";
import { useDocumentationData } from "./useDocumentationData";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export const useDocumentationExport = () => {
  const { data: sections = [] } = useDocumentationData();

  const exportToPDF = useCallback(async () => {
    if (sections.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma seção de documentação encontrada para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 10;
      let currentY = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Documentação Completa do Sistema", pageWidth / 2, currentY, { align: "center" });
      
      currentY += 15;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("pt-BR");
      pdf.text(`Gerado em: ${currentDate}`, pageWidth / 2, currentY, { align: "center" });
      
      currentY += 20;

      // Index
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Índice", margin, currentY);
      currentY += 15;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      
      sections.forEach((section, index) => {
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(`${index + 1}. ${section.title}`, margin + 5, currentY);
        currentY += 8;
      });

      // Content
      sections.forEach((section, index) => {
        pdf.addPage();
        currentY = margin;

        // Section title
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${index + 1}. ${section.title}`, margin, currentY);
        currentY += 15;

        // Module info
        if (section.module_key) {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "italic");
          pdf.text(`Módulo: ${section.module_key}`, margin, currentY);
          currentY += 10;
        }

        // Content
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        
        // Simple text processing for content
        const content = section.content
          .replace(/#{1,6}\s*/g, '') // Remove markdown headers
          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
          .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
          .replace(/`(.*?)`/g, '$1'); // Remove code markdown

        const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, margin, currentY);
          currentY += 6;
        });
      });

      // Footer with page numbers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      pdf.save("documentacao-sistema.pdf");
      
      toast({
        title: "Sucesso",
        description: "Documentação exportada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao exportar a documentação.",
        variant: "destructive",
      });
    }
  }, [sections]);

  return { exportToPDF };
};
