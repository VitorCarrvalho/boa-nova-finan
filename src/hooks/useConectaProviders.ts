import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConectaFilters {
  category?: string;
  city?: string;
  state?: string;
  congregation?: string;
  experience?: string;
  sortBy?: string;
}

interface UseConectaProvidersParams {
  search?: string;
  filters?: ConectaFilters;
  page?: number;
  limit?: number;
}

interface ServiceProvider {
  id: string;
  slug: string;
  name: string;
  description: string;
  experience_years: number;
  category_id: string;
  category?: {
    name: string;
  };
  instagram?: string;
  linkedin?: string;
  website?: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  congregation_id?: string;
  congregation_name?: string;
  congregation?: {
    name: string;
  };
  photo_url: string;
  created_at: string;
  rating_average?: number;
  rating_count?: number;
}

interface ConectaProvidersResponse {
  data: ServiceProvider[];
  count: number;
  hasMore: boolean;
}

export const useConectaProviders = ({
  search = '',
  filters = {},
  page = 1,
  limit = 15
}: UseConectaProvidersParams) => {
  return useQuery({
    queryKey: ['conecta-providers', search, filters, page, limit],
    queryFn: async (): Promise<ConectaProvidersResponse> => {
      let query = supabase
        .from('service_providers')
        .select(`
          *,
          category:service_categories(name),
          congregation:congregations(name)
        `)
        .eq('status', 'approved');

      // Apply search
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }
      
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      
      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }
      
      if (filters.congregation) {
        query = query.eq('congregation_id', filters.congregation);
      }
      
      if (filters.experience) {
        const [min, max] = filters.experience.split('-').map(Number);
        if (max) {
          query = query.gte('experience_years', min).lte('experience_years', max);
        } else {
          query = query.gte('experience_years', min);
        }
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'best_rated':
          // For now, order by creation date since ratings not implemented yet
          query = query.order('created_at', { ascending: false });
          break;
        default:
          // Relevance - order by creation date for now
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) === limit
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConectaCategories = () => {
  return useQuery({
    queryKey: ['conecta-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useConectaCongregations = () => {
  return useQuery({
    queryKey: ['conecta-congregations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('congregations')
        .select('id, name, city, state')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};