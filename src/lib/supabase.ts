import { createClient } from "@supabase/supabase-js";

// Supabase connection details provided in the requirements
const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey = "tvc5qpguyh5fum7ATB";

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to get all available tables
export const getTables = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("pg_catalog.pg_tables")
      .select("tablename")
      .eq("schemaname", "public");

    if (error) throw error;

    return data.map((table) => table.tablename);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

// Generic data fetcher with pagination
export const fetchData = async (
  tableName: string,
  page: number = 1,
  pageSize: number = 25,
  orderColumn: string = "id",
  orderDirection: "asc" | "desc" = "desc",
) => {
  try {
    // Calculate the range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // First get the total count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Then get the data for the page
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order(orderColumn, { ascending: orderDirection === "asc" })
      .range(from, to);

    if (error) throw error;

    return {
      data,
      totalCount: count || 0,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (error) {
    console.error(`Error fetching data from ${tableName}:`, error);
    return {
      data: [],
      totalCount: 0,
      currentPage: page,
      pageSize,
      totalPages: 0,
    };
  }
};

// Get table columns
export const getTableColumns = async (tableName: string) => {
  try {
    const { data, error } = await supabase.rpc("get_table_columns", {
      table_name: tableName,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    // Fallback method if the RPC function doesn't exist
    try {
      const { data } = await supabase.from(tableName).select("*").limit(1);
      if (data && data.length > 0) {
        return Object.keys(data[0]).map((column) => ({
          column_name: column,
          data_type: typeof data[0][column],
        }));
      }
      return [];
    } catch (fallbackError) {
      console.error(`Error getting columns for ${tableName}:`, fallbackError);
      return [];
    }
  }
};
