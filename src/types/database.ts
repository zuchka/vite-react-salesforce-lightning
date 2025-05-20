// This file contains TypeScript interfaces for our database tables

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
  created_at: string;
  updated_at: string;
  category_id: string;
  status: "published" | "draft" | "archived";
  user_id: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  role: "admin" | "creator" | "viewer";
  created_at: string;
  last_sign_in: string;
  subscription_tier: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: "active" | "canceled" | "past_due";
  start_date: string;
  end_date: string;
  payment_method: string;
  amount: number;
  currency: string;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
}

export interface ViewEvent {
  id: string;
  video_id: string;
  user_id: string;
  watched_at: string;
  watch_duration: number;
  completed: boolean;
  device_type: string;
}

// Table names enum to avoid string literals
export enum Tables {
  VIDEOS = "videos",
  USERS = "users",
  CATEGORIES = "categories",
  SUBSCRIPTIONS = "subscriptions",
  COMMENTS = "comments",
  VIEW_EVENTS = "view_events",
}

// Generic pagination response
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  error: string | null;
}

// Generic statistics
export interface Statistics {
  totalUsers: number;
  activeSubscriptions: number;
  totalVideos: number;
  totalViews: number;
  recentSignups: number;
  totalRevenue: number;
  averageWatchTime: number;
}

// Error type
export type DbError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};
