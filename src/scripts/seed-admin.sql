-- Seed an admin user
-- Note: The password hash below is for password: "Admin@123456"
-- Generated with bcryptjs (cost factor: 12)
-- Hash: $2a$12$oy5Iym2dhXeG2sKMBI1fEOIKwYCS2GbEPKjZqMy7cqWXz8TB3IcZO

INSERT INTO users (email, password_hash, role, is_active) 
VALUES ('admin@gmail.com', '$2a$12$oy5Iym2dhXeG2sKMBI1fEOIKwYCS2GbEPKjZqMy7cqWXz8TB3IcZO', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Seed sample services
INSERT INTO services (title, description, sort_order, is_active) VALUES
('SEO Optimization', 'Improve your website visibility with our proven SEO strategies and techniques.', 1, true),
('Content Marketing', 'Create engaging content that drives traffic and builds your brand authority.', 2, true),
('Social Media Marketing', 'Grow your audience and engage your community across all social platforms.', 3, true),
('Paid Advertising', 'Maximize ROI with targeted paid campaigns across Google, Facebook, and more.', 4, true),
('Email Marketing', 'Build lasting relationships through personalized email campaigns.', 5, true),
('Web Development', 'Build fast, secure, and responsive websites that convert visitors into customers.', 6, true)
ON CONFLICT DO NOTHING;

-- Seed sample case studies
INSERT INTO case_studies (title, short_description, slug, sort_order, is_active) VALUES
('E-commerce Platform Redesign', 'Increased conversion rate by 45% through UX improvements and optimization.', 'ecommerce-redesign', 1, true),
('SaaS Product Launch', 'Successfully launched product with $2M ARR in first year through targeted marketing.', 'saas-launch', 2, true),
('B2B Lead Generation', 'Generated 500+ qualified leads per month for a B2B software company.', 'b2b-leads', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Seed sample working processes
INSERT INTO working_processes (step_no, title, description, sort_order, is_active) VALUES
(1, 'Discovery & Analysis', 'We start by understanding your business goals, target audience, and current performance metrics.', 1, true),
(2, 'Strategy Development', 'Our team develops a comprehensive strategy tailored to your specific needs and goals.', 2, true),
(3, 'Implementation', 'We execute the strategy with precision, managing campaigns and content creation.', 3, true),
(4, 'Monitoring & Optimization', 'Continuous monitoring and optimization ensures we achieve the best possible results.', 4, true),
(5, 'Reporting & Analysis', 'Regular reports and detailed analysis help you understand the impact of our work.', 5, true)
ON CONFLICT DO NOTHING;

-- Seed sample team members
INSERT INTO team_members (name, role, sort_order, is_active) VALUES
('Sarah Johnson', 'CEO & Founder', 1, true),
('Mike Chen', 'Head of Strategy', 2, true),
('Emily Rodriguez', 'Creative Director', 3, true),
('David Park', 'Senior Developer', 4, true),
('Jessica Lee', 'Content Manager', 5, true)
ON CONFLICT DO NOTHING;

-- Seed sample testimonials
INSERT INTO testimonials (name, role_company, message, rating, sort_order, is_active) VALUES
('John Smith', 'CEO at TechCorp', 'Working with this team transformed our digital presence. Highly recommended!', 5, 1, true),
('Maria Garcia', 'Marketing Director at StartupXYZ', 'Their strategies increased our leads by 300%. Exceptional results!', 5, 2, true),
('Robert Johnson', 'Founder at Digital Solutions', 'Professional, creative, and results-driven. Best investment we made.', 5, 3, true)
ON CONFLICT DO NOTHING;
