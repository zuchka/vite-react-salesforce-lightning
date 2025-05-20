import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmt1Z3dzdHJsd3RjeGNreWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MjIxNzQsImV4cCI6MjA2MzI5ODE3NH0.wRoBAjiiagSUJBFRzXvSdejUHwMRgTChrSyMV_Toq_o";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types for our data models
export interface Video {
  id: string;
  title: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  duration?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
  category_id?: string;
  user_id?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface Comment {
  id: string;
  content: string;
  user_id?: string;
  video_id?: string;
  created_at?: string;
  [key: string]: any;
}

// Generic fetch function with pagination
export async function fetchData<T>(
  table: string,
  page: number = 1,
  pageSize: number = 25,
  orderBy: string = "created_at",
  ascending: boolean = false,
  filters: Record<string, any> = {},
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(table)
    .select("*", { count: "exact" })
    .order(orderBy, { ascending })
    .range(from, to);

  // Apply any filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query = query.eq(key, value);
    }
  });

  const { data, error, count } = await query;

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return { data: [], error, count: 0, hasMore: false };
  }

  return {
    data: data as T[],
    error: null,
    count: count || 0,
    hasMore: count ? count > to + 1 : false,
  };
}

// Specific functions for each data type
export async function fetchVideos(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Video>(
    "videos",
    page,
    pageSize,
    "created_at",
    false,
    filters,
  );
}

export async function fetchUsers(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<User>("users", page, pageSize, "created_at", false, filters);
}

export async function fetchCategories(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Category>(
    "categories",
    page,
    pageSize,
    "name",
    true,
    filters,
  );
}

export async function fetchComments(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Comment>(
    "comments",
    page,
    pageSize,
    "created_at",
    false,
    filters,
  );
}

// Fetch tables from the database schema
export async function fetchTableNames() {
  try {
    const { data, error } = await supabase.rpc("get_tables");

    if (error) {
      // If the RPC function doesn't exist, try an alternative approach
      const { data: tables, error: tablesError } = await supabase
        .from("pg_catalog.pg_tables")
        .select("tablename")
        .eq("schemaname", "public");

      if (tablesError) {
        console.error("Error fetching tables:", tablesError);
        return { tables: [], error: tablesError };
      }

      return { tables: tables?.map((t) => t.tablename) || [], error: null };
    }

    return { tables: data || [], error: null };
  } catch (err) {
    console.error("Error in fetchTableNames:", err);
    return { tables: [], error: err };
  }
}

// Get details about a specific table
export async function getTableInfo(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(`information_schema.columns`)
      .select("column_name, data_type")
      .eq("table_schema", "public")
      .eq("table_name", tableName);

    if (error) {
      console.error(`Error fetching columns for ${tableName}:`, error);
      return { columns: [], error };
    }

    return { columns: data || [], error: null };
  } catch (err) {
    console.error(`Error in getTableInfo for ${tableName}:`, err);
    return { columns: [], error: err };
  }
}

// Get summary statistics
export async function fetchStats() {
  try {
    // Fetch count of videos
    const { count: videoCount, error: videoError } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true });

    // Fetch count of users
    const { count: userCount, error: userError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Fetch count of comments
    const { count: commentCount, error: commentError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true });

    // Fetch most viewed videos
    const { data: topVideos, error: topVideosError } = await supabase
      .from("videos")
      .select("*")
      .order("views", { ascending: false })
      .limit(5);

    if (videoError || userError || commentError || topVideosError) {
      console.error(
        "Error fetching stats:",
        videoError || userError || commentError || topVideosError,
      );
    }

    return {
      counts: {
        videos: videoCount || 0,
        users: userCount || 0,
        comments: commentCount || 0,
      },
      topVideos: topVideos || [],
      error: videoError || userError || commentError || topVideosError,
    };
  } catch (err) {
    console.error("Error in fetchStats:", err);
    return {
      counts: { videos: 0, users: 0, comments: 0 },
      topVideos: [],
      error: err,
    };
  }
}
