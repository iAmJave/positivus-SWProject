export interface Service {
  id: string;
  title: string;
  description: string;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  short_description: string;
  cover_image_url: string | null;
  link_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkingProcess {
  id: string;
  step_no: number;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
  socials_json: Record<string, string> | null;
  overview: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role_company: string;
  message: string;
  avatar_url: string | null;
  rating: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  type: string;
  status: 'new' | 'read' | 'archived';
  created_at: string;
  updated_at: string;
}
