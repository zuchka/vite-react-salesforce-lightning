import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Card,
  Icon,
  Spinner,
  Combobox,
  IconSettings,
} from "@salesforce/design-system-react";
import DataTable from "./DataTable";
import { fetchData, getTables, getTableColumns } from "../../lib/supabase";
import type { TableColumn } from "../../types/supabase";

interface TableViewerProps {
  initialTable?: string;
}

const TableViewer: React.FC<TableViewerProps> = ({ initialTable }) => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>(
    initialTable || "",
  );
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
  });

  // Load tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      setIsLoadingTables(true);
      try {
        const tablesList = await getTables();
        setTables(tablesList);

        // Select the initial table or the first table if none is provided
        if (!initialTable && tablesList.length > 0) {
          setSelectedTable(tablesList[0]);
        }
      } catch (error) {
        console.error("Error loading tables:", error);
      } finally {
        setIsLoadingTables(false);
      }
    };

    loadTables();
  }, [initialTable]);

  // Load table columns and data when the selected table changes
  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable, 1);
    }
  }, [selectedTable]);

  // Load table data with the selected table and page
  const loadTableData = async (tableName: string, page: number) => {
    setIsLoadingData(true);
    try {
      // Get table columns
      const columns = await getTableColumns(tableName);
      setTableColumns(columns);

      // Get data with pagination
      const result = await fetchData(tableName, page);
      setData(result.data);
      setPagination({
        currentPage: result.currentPage,
        pageSize: result.pageSize,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      });
    } catch (error) {
      console.error(`Error loading data for ${tableName}:`, error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    loadTableData(selectedTable, newPage);
  };

  // Handle table selection change
  const handleTableChange = (selection: {
    selection: { id: string; label: string }[];
  }) => {
    if (selection.selection.length > 0) {
      setSelectedTable(selection.selection[0].id);
    }
  };

  // Prepare table options for combobox
  const tableOptions = useMemo(() => {
    return tables.map((table) => ({
      id: table,
      label: table.charAt(0).toUpperCase() + table.slice(1),
    }));
  }, [tables]);

  // Prepare columns for DataTable
  const dataTableColumns = useMemo(() => {
    return tableColumns.map((column) => {
      const dataType = column.data_type.toLowerCase();

      let type: "text" | "number" | "date" | "boolean" | "image" | "url" =
        "text";

      // Determine column type based on data type and name
      if (
        dataType.includes("int") ||
        dataType.includes("float") ||
        dataType.includes("numeric")
      ) {
        type = "number";
      } else if (dataType.includes("timestamp") || dataType.includes("date")) {
        type = "date";
      } else if (dataType === "boolean") {
        type = "boolean";
      } else if (
        column.column_name.includes("image") ||
        column.column_name.includes("thumbnail") ||
        column.column_name.includes("avatar")
      ) {
        type = "image";
      } else if (
        column.column_name.includes("url") ||
        column.column_name.includes("link")
      ) {
        type = "url";
      }

      return {
        key: column.column_name,
        label: column.column_name
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        sortable: true,
        truncate: type === "text" || type === "url",
        type,
      };
    });
  }, [tableColumns]);

  if (isLoadingTables) {
    return (
      <div className="slds-align_absolute-center slds-p-around_large">
        <Spinner
          variant="brand"
          size="large"
          assistiveText={{ label: "Loading tables" }}
        />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <Card
        className="admin-box slds-m-bottom_medium"
        bodyClassName="slds-p-horizontal_small"
      >
        <div className="slds-align_absolute-center slds-p-around_medium slds-text-color_weak">
          <Icon
            category="utility"
            name="info"
            size="small"
            className="slds-m-right_x-small"
          />
          <span>No tables found in the database.</span>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="slds-grid slds-grid_vertical-align-center slds-m-bottom_medium">
        <div className="slds-col slds-size_1-of-2">
          <h1 className="slds-text-heading_large">Table Explorer</h1>
        </div>
        <div className="slds-col slds-size_1-of-2 slds-text-align_right">
          <div style={{ width: "250px", display: "inline-block" }}>
            <IconSettings iconPath="/assets/icons">
              <Combobox
                labels={{ label: "Select Table" }}
                options={tableOptions}
                selection={
                  selectedTable
                    ? [{ id: selectedTable, label: selectedTable }]
                    : []
                }
                events={{
                  onSelect: handleTableChange,
                }}
                variant="inline-listbox"
                classNameContainer="admin-combobox"
              />
            </IconSettings>
          </div>
        </div>
      </div>

      <DataTable
        title={`${selectedTable.charAt(0).toUpperCase() + selectedTable.slice(1)} Table`}
        data={data}
        columns={dataTableColumns}
        isLoading={isLoadingData}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyStateMessage={`No records found in the ${selectedTable} table.`}
      />
    </div>
  );
};

export default TableViewer;
