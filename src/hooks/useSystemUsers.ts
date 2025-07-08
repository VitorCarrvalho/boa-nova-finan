
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Member = Database['public']['Tables']['members']['Row'];

export interface SystemUserWithMember {
  id: string;
  name: string;
  email: string | null;
  role: Database['public']['Enums']['user_role'];
  member: Member;
}

export const useSystemUsers = () => {
  return useQuery({
    queryKey: ['systemUsers'],
    queryFn: async () => {
      console.log('Fetching all system users');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Profiles fetched:', profiles);
      return profiles;
    },
  });
};

export const useSystemUsersWithMemberRoles = (memberRoles: Database['public']['Enums']['member_role'][]) => {
  return useQuery({
    queryKey: ['systemUsersWithMemberRoles', memberRoles],
    queryFn: async () => {
      console.log('Fetching system users with member roles:', memberRoles);
      
      // First, get all profiles (system users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles);

      // Get all members with the specified roles
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .in('role', memberRoles)
        .eq('is_active', true);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        throw membersError;
      }

      console.log('Members fetched:', members);

      // Match profiles with members by email
      const systemUsersWithMembers: SystemUserWithMember[] = [];
      
      profiles.forEach(profile => {
        const matchingMember = members.find(member => 
          member.email && profile.email && member.email.toLowerCase() === profile.email.toLowerCase()
        );
        
        if (matchingMember) {
          systemUsersWithMembers.push({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            member: matchingMember
          });
        }
      });

      console.log('System users with member roles:', systemUsersWithMembers);
      return systemUsersWithMembers;
    },
  });
};

export const useSystemPastors = () => {
  return useSystemUsersWithMemberRoles(['pastor']);
};

export const useSystemFinanceUsers = () => {
  return useSystemUsersWithMemberRoles(['pastor']); // Finance members are also marked as pastors in the members table
};
