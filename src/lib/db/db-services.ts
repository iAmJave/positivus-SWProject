import type {
  Service,
} from '../../types/types';
import { createClient } from '../supabase/server';

export const services = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getAllAdmin() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, service: Partial<Service>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('services').delete().eq('id', id);
    return { error };
  },
};