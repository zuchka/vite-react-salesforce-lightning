import { createClient } from "@supabase/supabase-js";

// Supabase connection details
// Note: Using direct URL instead of just host/port/etc for better compatibility
const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey = "tvc5qpguyh5fum7ATB";

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get all available tables
export const getTables = async (): Promise<string[]> => {
  try {
    // Query information_schema to get table names
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .not("table_name", "like", "pg_%");

    if (error) {
      console.error("Error fetching tables:", error);
      // Fallback to a list of common table names
      return ["videos", "users", "categories", "comments"];
    }

    return data?.map((table) => table.table_name) || [];
  } catch (error) {
    console.error("Error fetching tables:", error);
    // Fallback to a list of common table names
    return ["videos", "users", "categories", "comments"];
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
    const countResponse = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    const count = countResponse.count || 0;

    // Then get the data for the page
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order(orderColumn, { ascending: orderDirection === "asc" })
      .range(from, to);

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error);
      return {
        data: [],
        totalCount: 0,
        currentPage: page,
        pageSize,
        totalPages: 0,
      };
    }

    return {
      data: data || [],
      totalCount: count,
      currentPage: page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
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
    // Try to get column information from information_schema
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", tableName)
      .eq("table_schema", "public");

    if (error) {
      console.error(`Error getting columns for ${tableName}:`, error);

      // Fallback: Try to fetch a row and infer columns
      const { data: sampleRow } = await supabase
        .from(tableName)
        .select("*")
        .limit(1)
        .single();

      if (sampleRow) {
        return Object.keys(sampleRow).map((column) => ({
          column_name: column,
          data_type: typeof sampleRow[column],
        }));
      }

      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);

    // Fallback: Try to fetch a row and infer columns
    try {
      const { data: sampleRow } = await supabase
        .from(tableName)
        .select("*")
        .limit(1)
        .single();

      if (sampleRow) {
        return Object.keys(sampleRow).map((column) => ({
          column_name: column,
          data_type: typeof sampleRow[column],
        }));
      }
    } catch {
      // If all else fails, return common columns
      return [
        { column_name: "id", data_type: "uuid" },
        { column_name: "created_at", data_type: "timestamp" },
        { column_name: "name", data_type: "text" },
      ];
    }

    return [];
  }
};
