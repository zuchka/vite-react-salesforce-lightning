import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://synkugwstrlwtcxckylk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bmt1Z3dzdHJsd3RjeGNreWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MjIxNzQsImV4cCI6MjA2MzI5ODE3NH0.wRoBAjiiagSUJBFRzXvSdejUHwMRgTChrSyMV_Toq_o";

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types for our data models based on DVD rental schema
export type Film = {
  film_id: number;
  title: string;
  description?: string;
  release_year?: number;
  language_id?: number;
  original_language_id?: number;
  rental_duration?: number;
  rental_rate?: number;
  length?: number;
  replacement_cost?: number;
  rating?: string;
  last_update?: string;
  special_features?: string[];
  fulltext?: string;
  [key: string]: any;
};

export type Actor = {
  actor_id: number;
  first_name: string;
  last_name: string;
  last_update?: string;
  [key: string]: any;
};

export type Customer = {
  customer_id: number;
  store_id?: number;
  first_name: string;
  last_name: string;
  email?: string;
  address_id?: number;
  activebool?: boolean;
  create_date?: string;
  last_update?: string;
  active?: number;
  [key: string]: any;
};

export type Category = {
  category_id: number;
  name: string;
  last_update?: string;
  [key: string]: any;
};

export type Rental = {
  rental_id: number;
  rental_date: string;
  inventory_id: number;
  customer_id: number;
  return_date?: string;
  staff_id: number;
  last_update: string;
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
  orderBy: string = "last_update",
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
export async function fetchFilms(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Film>("film", page, pageSize, "title", true, filters);
}

export async function fetchActors(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Actor>("actor", page, pageSize, "last_name", true, filters);
}

export async function fetchCustomers(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Customer>(
    "customer",
    page,
    pageSize,
    "last_name",
    true,
    filters,
  );
}

export async function fetchCategories(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Category>("category", page, pageSize, "name", true, filters);
}

export async function fetchRentals(
  page: number = 1,
  pageSize: number = 25,
  filters: Record<string, any> = {},
) {
  return fetchData<Rental>(
    "rental",
    page,
    pageSize,
    "rental_date",
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
    // Check which tables exist
    const filmExists = await checkTableExists("film");
    const actorExists = await checkTableExists("actor");
    const customerExists = await checkTableExists("customer");
    const rentalExists = await checkTableExists("rental");
    const categoryExists = await checkTableExists("category");

    let filmCount = 0;
    let actorCount = 0;
    let customerCount = 0;
    let rentalCount = 0;
    let categoryCount = 0;
    let topFilms: Film[] = [];
    let errors: any[] = [];

    // Only query tables that exist
    if (filmExists) {
      const { count, error } = await supabase
        .from("film")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching film count:", error);
        errors.push(error);
      } else {
        filmCount = count || 0;
      }

      // Only try to fetch top films if the film table exists
      const { data, error: topFilmsError } = await supabase
        .from("film")
        .select("*")
        .order("rental_rate", { ascending: false })
        .limit(5);

      if (topFilmsError) {
        console.error("Error fetching top films:", topFilmsError);
        errors.push(topFilmsError);
      } else {
        topFilms = data || [];
      }
    }

    if (actorExists) {
      const { count, error } = await supabase
        .from("actor")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching actor count:", error);
        errors.push(error);
      } else {
        actorCount = count || 0;
      }
    }

    if (customerExists) {
      const { count, error } = await supabase
        .from("customer")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching customer count:", error);
        errors.push(error);
      } else {
        customerCount = count || 0;
      }
    }

    if (rentalExists) {
      const { count, error } = await supabase
        .from("rental")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching rental count:", error);
        errors.push(error);
      } else {
        rentalCount = count || 0;
      }
    }

    if (categoryExists) {
      const { count, error } = await supabase
        .from("category")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching category count:", error);
        errors.push(error);
      } else {
        categoryCount = count || 0;
      }
    }

    return {
      counts: {
        films: filmCount,
        actors: actorCount,
        customers: customerCount,
        rentals: rentalCount,
        categories: categoryCount,
      },
      topFilms,
      error: errors.length > 0 ? errors[0] : null,
      tablesExist: {
        film: filmExists,
        actor: actorExists,
        customer: customerExists,
        rental: rentalExists,
        category: categoryExists,
      },
    };
  } catch (err) {
    console.error("Error in fetchStats:", err);
    return {
      counts: { films: 0, actors: 0, customers: 0, rentals: 0, categories: 0 },
      topFilms: [],
      error: err,
      tablesExist: {
        film: false,
        actor: false,
        customer: false,
        rental: false,
        category: false,
      },
    };
  }
}

// Get recent rentals
export async function fetchRecentRentals(limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from("rental")
      .select(
        `
        rental_id,
        rental_date,
        return_date,
        customer:customer_id(first_name, last_name),
        inventory:inventory_id(film:film_id(title))
      `,
      )
      .order("rental_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent rentals:", error);
      return { rentals: [], error };
    }

    return { rentals: data || [], error: null };
  } catch (err) {
    console.error("Error in fetchRecentRentals:", err);
    return { rentals: [], error: err };
  }
}

// Get film categories with counts
export async function fetchFilmCategoryCounts() {
  try {
    const { data, error } = await supabase
      .from("film_category")
      .select(
        `
        category:category_id(name),
        count:film_id(count)
      `,
      )
      .limit(10);

    if (error) {
      console.error("Error fetching film categories:", error);
      return { categories: [], error };
    }

    return { categories: data || [], error: null };
  } catch (err) {
    console.error("Error in fetchFilmCategoryCounts:", err);
    return { categories: [], error: err };
  }
}
