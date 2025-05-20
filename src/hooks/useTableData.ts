import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { PaginatedResponse, DbError } from "../types/database";

interface UseTableDataProps {
  tableName: string;
  pageSize?: number;
  initialPage?: number;
  orderBy?: { column: string; ascending: boolean };
  filterColumn?: string;
  filterValue?: string;
}

export function useTableData<T>({
  tableName,
  pageSize = 25,
  initialPage = 1,
  orderBy = { column: "created_at", ascending: false },
  filterColumn,
  filterValue,
}: UseTableDataProps): {
  data: T[];
  count: number;
  loading: boolean;
  error: DbError | null;
  page: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refreshData: () => Promise<void>;
} {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<DbError | null>(null);
  const [page, setPage] = useState<number>(initialPage);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Start with the base query
      let query = supabase.from(tableName).select("*", { count: "exact" });

      // Apply filtering if provided
      if (filterColumn && filterValue) {
        query = query.ilike(filterColumn, `%${filterValue}%`);
      }

      // Apply ordering
      query = query.order(orderBy.column, { ascending: orderBy.ascending });

      // Apply pagination
      query = query.range(from, to);

      // Execute the query
      const {
        data: result,
        error: queryError,
        count: totalCount,
      } = await query;

      if (queryError) {
        throw {
          message: queryError.message,
          details: queryError.details,
          hint: queryError.hint,
          code: queryError.code,
        };
      }

      setData(result as T[]);
      setCount(totalCount || 0);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err as DbError);
    } finally {
      setLoading(false);
    }
  }, [tableName, page, pageSize, orderBy, filterColumn, filterValue]);

  // Initial data fetch and whenever dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigation functions
  const nextPage = useCallback(() => {
    const maxPage = Math.ceil(count / pageSize);
    if (page < maxPage) {
      setPage(page + 1);
    }
  }, [page, count, pageSize]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  // Refresh function to manually trigger data refresh
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    count,
    loading,
    error,
    page,
    setPage,
    nextPage,
    prevPage,
    refreshData,
  };
}
