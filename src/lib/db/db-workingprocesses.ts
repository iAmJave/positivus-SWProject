import type {
  WorkingProcess,
} from '../../types/types';
import { createClient } from '../supabase/server';

export const workingProcesses = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('working_processes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return { data, error };
  },
  async getAllAdmin() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('working_processes')
      .select('*')
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('working_processes')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(process: Omit<WorkingProcess, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('working_processes')
      .insert([process])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, process: Partial<WorkingProcess>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('working_processes')
      .update(process)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('working_processes')
      .delete()
      .eq('id', id);
    return { error };
  },
};