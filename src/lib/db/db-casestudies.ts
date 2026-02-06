import type {
  CaseStudy,
} from '../../types/types';
import { createClient } from '../supabase/server';

export const caseStudies = {
  async getAll() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getAllAdmin() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('sort_order', { ascending: true });
    return { data, error };
  },

  async getById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(caseStudy: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .insert([caseStudy])
      .select()
      .single();
    return { data, error };
  },

  async update(id: string, caseStudy: Partial<CaseStudy>) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('case_studies')
      .update(caseStudy)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('case_studies').delete().eq('id', id);
    return { error };
  },
};