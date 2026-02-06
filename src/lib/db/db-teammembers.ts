import type {
  TeamMember,
} from '../../types/types';
import { createClient } from '../supabase/server';

export const teamMembers = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getAllAdmin() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .insert([member])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, member: Partial<TeamMember>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('team_members')
      .update(member)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    return { error };
  },
};