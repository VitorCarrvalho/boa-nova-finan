
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDocumentationExport } from "@/hooks/useDocumentationExport";
import { useState } from "react";

export const DocumentationActions = () => {
  const navigate = useNavigate();
  const { exportToPDF } = useDocumentationExport();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await exportToPDF();
    setIsExporting(false);
  };

  const handleBackToSystem = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b bg-background">
      <Button
        variant="outline"
        onClick={handleBackToSystem}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Sistema
      </Button>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <FileDown className="h-4 w-4" />
        {isExporting ? "Exportando..." : "Exportar PDF"}
      </Button>
    </div>
  );
};
