export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'content_manager';
  name: string;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  isActive: boolean;
}

export interface TypingTest {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  word_count: number;
  estimated_read_time: number;
  category: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  keywords?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  test_count: number;
  created_at?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
  last_login?: string;
  total_tests: number;
  best_wpm: number;
  average_accuracy: number;
  is_banned: boolean;
}

export interface AnalyticsPoint {
  date: string;
  value: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTests: number;
  totalViews: number;
  avgWpm: number;
  testsToday: number;
}

export interface AIGenerationLog {
  id: string;
  title: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
  tokens_used?: number;
  source_url?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  user: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export type SidebarPage = 
  | 'overview'
  | 'analytics'
  | 'users'
  | 'tests'
  | 'categories'
  | 'ai-generator'
  | 'seo'
  | 'notifications'
  | 'logs'
  | 'security'
  | 'settings';
