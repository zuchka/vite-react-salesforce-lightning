import React, { useEffect, useState } from "react";
import {
  Card,
  Icon,
  DataTable,
  DataTableColumn,
  DataTableCell,
} from "@salesforce/design-system-react";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";

interface SalesByCategory {
  category: string;
  total_sales: number;
  percentage?: number;
}

const SalesByCategoryList: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesByCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSalesByCategory();
  }, []);

  const fetchSalesByCategory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales_by_film_category")
        .select("*")
        .order("total_sales", { ascending: false });

      if (error) {
        console.error("Error fetching sales by category:", error);
        return;
      }

      // Calculate total sales
      const totalSales =
        data?.reduce((sum, item) => sum + Number(item.total_sales), 0) || 0;

      // Calculate percentage for each category
      const processedData = data?.map((item) => ({
        ...item,
        percentage: (Number(item.total_sales) / totalSales) * 100,
      }));

      setSalesData(processedData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: DataTableColumn[] = [
    {
      label: "Category",
      property: "category",
      sortable: true,
    },
    {
      label: "Total Sales",
      property: "total_sales",
      sortable: true,
      cell: (item: SalesByCategory) => (
        <DataTableCell>${Number(item.total_sales).toFixed(2)}</DataTableCell>
      ),
    },
    {
      label: "Percentage",
      property: "percentage",
      sortable: true,
      cell: (item: SalesByCategory) => (
        <DataTableCell>
          <div className="slds-grid slds-grid_vertical-align-center">
            <div className="slds-m-right_small">
              {item.percentage?.toFixed(2)}%
            </div>
            <div className="slds-grid" style={{ width: "100px" }}>
              <div
                className="slds-progress-bar"
                style={{
                  width: "100%",
                  backgroundColor: "#23243a",
                  height: "10px",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="slds-progress-bar__value"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: "#a259ff",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          </div>
        </DataTableCell>
      ),
    },
  ];

  return (
    <Card
      heading="Sales by Category"
      icon={<Icon category="standard" name="report" />}
      className="admin-box slds-m-around_small"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="slds-p-horizontal_small">
          <DataTable
            items={salesData}
            columns={columns}
            noRowHover={false}
            striped
            fixedLayout
            id="sales-by-category-datatable"
            className="slds-max-medium-table_stacked-horizontal"
            selectRows="none"
            emptyCellContent="—"
          />
        </div>
      )}
    </Card>
  );
};

export default SalesByCategoryList;
