import type {
  ContactSubmission,
} from '../../types/types';
import { createClient } from '../supabase/server';

export const contactSubmissions = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getByStatus(status: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(submission: Omit<ContactSubmission, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([submission])
      .select()
      .single();
    return { data, error };
  },

  async updateStatus(id: string, status: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);
    return { error };
  },
};
