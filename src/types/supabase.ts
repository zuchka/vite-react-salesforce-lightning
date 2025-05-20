// Generic types for database data
export interface TableColumn {
  column_name: string;
  data_type: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

// Base entity types (will be extended based on actual database schema)
export interface BaseEntity {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface Video extends BaseEntity {
  title?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  duration?: number;
  status?: string;
  [key: string]: any; // Allow for dynamic properties based on actual schema
}

export interface User extends BaseEntity {
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status?: string;
  [key: string]: any; // Allow for dynamic properties based on actual schema
}

// Type for sidebar navigation items
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

// Type for dynamic table schema
export interface TableSchema {
  name: string;
  columns: TableColumn[];
  primaryKey: string;
}
