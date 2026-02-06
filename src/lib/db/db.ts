import { createAdminClient as createClient } from '../supabase/admin-server';

export interface User {
  id: string;
  email: string | null;
  role: 'user' | 'admin' | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}


export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  admin_email: string;
  action: 'create' | 'update' | 'delete' | 'reorder' | 'login';
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const users = {
  async getAll() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as User[] | null, error };
  },

  async getById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as User | null, error };
  },

  async getByEmail(email: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data: data as User | null, error };
  },

  async create(email: string, passwordHash: string, role: 'user' | 'admin' = 'user') {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
      }])
      .select()
      .single();
    return { data: data as User | null, error };
  },

  async update(id: string, updates: Partial<User>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as User | null, error };
  },

  async delete(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    return { error };
  },
};

export const auditLogs = {
  async getAll(limit: number = 100, offset: number = 0) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    return { data: data as AuditLog[] | null, error };
  },

  async getCount() {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });
    return { count, error };
  },

  async getByAction(action: string, limit: number = 50) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: data as AuditLog[] | null, error };
  },

  async getByResourceType(resourceType: string, limit: number = 50) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: data as AuditLog[] | null, error };
  },

  async create(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([log])
      .select()
      .single();
    return { data: data as AuditLog | null, error };
  },
};