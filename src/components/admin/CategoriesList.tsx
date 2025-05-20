import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  DataTableColumn,
  DataTableCell,
  Icon,
  PageHeader,
  Spinner,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

interface Category {
  category_id: number;
  name: string;
  last_update: string;
  film_count: number;
}

const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchCategories();
  }, [page]);

  async function fetchCategories() {
    setLoading(true);
    try {
      // Count total categories for pagination
      const { count } = await supabase
        .from("category")
        .select("*", { count: "exact", head: true });

      setTotalCount(count || 0);

      // Fetch categories with pagination
      const { data, error } = await supabase
        .from("category")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("name");

      if (error) throw error;

      // Get film count for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count: filmCount } = await supabase
            .from("film_category")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.category_id);

          return {
            ...category,
            film_count: filmCount || 0,
          };
        }),
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePreviousPage = () => {
    setPage(Math.max(0, page - 1));
  };

  const handleNextPage = () => {
    if ((page + 1) * pageSize < totalCount) {
      setPage(page + 1);
    }
  };

  const columns: DataTableColumn[] = [
    {
      label: "ID",
      property: "category_id",
      width: "80px",
    },
    {
      label: "Name",
      property: "name",
      width: "30%",
    },
    {
      label: "Film Count",
      property: "film_count",
      width: "20%",
      cell: (item) => <DataTableCell>{item.film_count} films</DataTableCell>,
    },
    {
      label: "Last Update",
      property: "last_update",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          {new Date(item.last_update).toLocaleString()}
        </DataTableCell>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Film Categories"
        info={`${totalCount} categories`}
        icon={<Icon category="standard" name="folder" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          {loading ? (
            <div className="slds-p-around_medium slds-align_absolute-center">
              <Spinner
                size="medium"
                variant="brand"
                assistiveText={{ label: "Loading categories" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={categories}
                columns={columns}
                id="categories-datatable"
                bordered
                striped
                noRowHover
              />

              <div className="slds-grid slds-grid_align-center slds-m-top_medium">
                <Button
                  label="Previous"
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                  iconCategory="utility"
                  iconName="chevronleft"
                  iconPosition="left"
                  className="slds-m-right_small"
                />
                <span className="slds-align-middle slds-p-vertical_x-small">
                  Page {page + 1} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  label="Next"
                  onClick={handleNextPage}
                  disabled={(page + 1) * pageSize >= totalCount}
                  iconCategory="utility"
                  iconName="chevronright"
                  iconPosition="right"
                  className="slds-m-left_small"
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CategoriesList;
