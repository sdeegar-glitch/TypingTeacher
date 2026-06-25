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
  id: number;
  action: string;
  entity: string | null;
  actor_email: string | null;
  ip: string | null;
  status: 'success' | 'warning' | 'error';
  meta?: Record<string, unknown> | null;
  created_at: string;
}

export interface AppSettings {
  siteName: string;
  tagline: string;
  siteUrl: string;
  supportEmail: string;
  maintenanceMode: boolean;
  twitterUrl: string;
  githubUrl: string;
  mistakeHandling: 'strict' | 'lenient';
}

export interface SeoTest {
  id: string;
  title: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  views: number;
  is_published: boolean;
  created_at: string;
  score: number;
}

export interface AdminAnalytics {
  summary: { totalSessions: number; avgDurationSec: number; avgAccuracy: number; newUsers30d: number };
  dailySessionsChart: AnalyticsPoint[];
  dailyWpmChart: AnalyticsPoint[];
  sessionsByMode: { name: string; value: number }[];
  accuracyDistribution: { name: string; value: number }[];
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
