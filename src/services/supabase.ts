import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmt1Z3dzdHJsd3RjeGNreWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MjIxNzQsImV4cCI6MjA2MzI5ODE3NH0.wRoBAjiiagSUJBFRzXvSdejUHwMRgTChrSyMV_Toq_o";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types for our data models
export type Video = {
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
};

export type User = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  [key: string]: any;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
};

export type Comment = {
  id: string;
  content: string;
  user_id?: string;
  video_id?: string;
  created_at?: string;
  [key: string]: any;
};

// Cache for table existence
const tableExistsCache: Record<string, boolean> = {};

// Check if a table exists in the database
export async function checkTableExists(tableName: string): Promise<boolean> {
  // Return from cache if available
  if (tableExistsCache[tableName] !== undefined) {
    return tableExistsCache[tableName];
  }

  try {
    // Try to get the table schema
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName);

    if (error) {
      console.error(`Error checking if table exists: ${tableName}`, error);
      return false;
    }

    const exists = Array.isArray(data) && data.length > 0;
    // Cache the result
    tableExistsCache[tableName] = exists;
    return exists;
  } catch (err) {
    console.error(`Error in checkTableExists for ${tableName}:`, err);
    return false;
  }
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
  try {
    // First check if the table exists
    const tableExists = await checkTableExists(table);
    if (!tableExists) {
      console.error(`Table does not exist: ${table}`);
      return {
        data: [],
        error: new Error(`Table does not exist: ${table}`),
        count: 0,
        hasMore: false,
        tableExists: false,
      };
    }

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
      return {
        data: [],
        error,
        count: 0,
        hasMore: false,
        tableExists: true,
      };
    }

    return {
      data: data as T[],
      error: null,
      count: count || 0,
      hasMore: count ? count > to + 1 : false,
      tableExists: true,
    };
  } catch (err) {
    console.error(`Error in fetchData for ${table}:`, err);
    return {
      data: [],
      error: err instanceof Error ? err : new Error(String(err)),
      count: 0,
      hasMore: false,
      tableExists: false,
    };
  }
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
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (error) {
      console.error("Error fetching tables:", error);
      return { tables: [], error };
    }

    // Extract table names from the result
    const tables = data ? data.map((row) => row.table_name) : [];
    return { tables, error: null };
  } catch (err) {
    console.error("Error in fetchTableNames:", err);
    return { tables: [], error: err };
  }
}

// Get details about a specific table
export async function getTableInfo(tableName: string) {
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
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
    // First check which tables exist
    const videosExists = await checkTableExists("videos");
    const usersExists = await checkTableExists("users");
    const commentsExists = await checkTableExists("comments");

    let videoCount = 0;
    let userCount = 0;
    let commentCount = 0;
    let topVideos: Video[] = [];
    let errors: any[] = [];

    // Only query tables that exist
    if (videosExists) {
      const { count, error } = await supabase
        .from("videos")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching video count:", error);
        errors.push(error);
      } else {
        videoCount = count || 0;
      }

      // Only try to fetch top videos if the videos table exists
      const { data, error: topVideosError } = await supabase
        .from("videos")
        .select("*")
        .order("views", { ascending: false })
        .limit(5);

      if (topVideosError) {
        console.error("Error fetching top videos:", topVideosError);
        errors.push(topVideosError);
      } else {
        topVideos = data || [];
      }
    }

    if (usersExists) {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching user count:", error);
        errors.push(error);
      } else {
        userCount = count || 0;
      }
    }

    if (commentsExists) {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching comment count:", error);
        errors.push(error);
      } else {
        commentCount = count || 0;
      }
    }

    return {
      counts: {
        videos: videoCount,
        users: userCount,
        comments: commentCount,
      },
      topVideos,
      error: errors.length > 0 ? errors[0] : null,
      tablesExist: {
        videos: videosExists,
        users: usersExists,
        comments: commentsExists,
      },
    };
  } catch (err) {
    console.error("Error in fetchStats:", err);
    return {
      counts: { videos: 0, users: 0, comments: 0 },
      topVideos: [],
      error: err,
      tablesExist: {
        videos: false,
        users: false,
        comments: false,
      },
    };
  }
}
