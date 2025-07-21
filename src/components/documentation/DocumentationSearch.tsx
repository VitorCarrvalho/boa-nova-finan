import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocumentationSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DocumentationSearch = ({ searchTerm, onSearchChange }: DocumentationSearchProps) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Buscar na documentação..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};