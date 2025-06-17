
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfiles } from '@/hooks/useEventData';
import { EventFormData } from '../schemas/eventSchema';

interface OrganizerFieldProps {
  control: Control<EventFormData>;
}

const OrganizerField = ({ control }: OrganizerFieldProps) => {
  const { data: profiles } = useProfiles();

  return (
    <FormField
      control={control}
      name="organizer_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Organizador</FormLabel>
          <Select 
            value={field.value || "none"} 
            onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o organizador" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {profiles?.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OrganizerField;
