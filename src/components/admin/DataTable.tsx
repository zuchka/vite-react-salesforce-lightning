import React from "react";
import {
  Button,
  DataTable as SLDSDataTable,
  DataTableColumn,
  DataTableCell,
  Icon,
  Spinner,
} from "@salesforce/design-system-react";
import { PaginatedResponse } from "../../types/supabase";

interface DataTableProps {
  title: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    truncate?: boolean;
    type?: "text" | "number" | "date" | "boolean" | "image" | "url";
  }>;
  isLoading: boolean;
  pagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  emptyStateMessage?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  title,
  data,
  columns,
  isLoading,
  pagination,
  onPageChange,
  emptyStateMessage = "No data available",
}) => {
  const { currentPage, totalPages, totalCount, pageSize } = pagination;

  // Calculate start and end record numbers
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalCount);

  // Custom cell renderer based on column type
  const cellRenderer = (item: any, column: any) => {
    const value = item[column.key];

    if (value === null || value === undefined) {
      return <DataTableCell>-</DataTableCell>;
    }

    switch (column.type) {
      case "date":
        return (
          <DataTableCell title={value}>
            {new Date(value).toLocaleDateString()}
          </DataTableCell>
        );
      case "boolean":
        return (
          <DataTableCell>
            <Icon
              category="utility"
              name={value ? "check" : "close"}
              size="x-small"
              color={value ? "#04844b" : "#c23934"}
            />
          </DataTableCell>
        );
      case "image":
        return (
          <DataTableCell>
            {value ? (
              <img
                src={value}
                alt="Thumbnail"
                style={{
                  height: "40px",
                  width: "40px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <Icon category="utility" name="image" size="small" />
            )}
          </DataTableCell>
        );
      case "url":
        return (
          <DataTableCell>
            {value ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#b18cff" }}
              >
                {value.length > 30 ? `${value.substring(0, 30)}...` : value}
              </a>
            ) : (
              "-"
            )}
          </DataTableCell>
        );
      default:
        return (
          <DataTableCell title={String(value)}>
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </DataTableCell>
        );
    }
  };

  return (
    <div className="admin-box slds-p-around_medium slds-m-bottom_medium">
      <div className="slds-grid slds-grid_vertical-align-center slds-m-bottom_medium">
        <div className="slds-col">
          <h2 className="slds-text-heading_medium">{title}</h2>
        </div>
        <div className="slds-col_bump-left slds-text-align_right">
          {!isLoading && (
            <span className="slds-text-color_weak">
              {totalCount > 0
                ? `Showing ${startRecord} to ${endRecord} of ${totalCount} records`
                : "No records"}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="slds-align_absolute-center slds-p-around_medium">
          <Spinner
            variant="brand"
            size="medium"
            assistiveText={{ label: "Loading" }}
          />
        </div>
      ) : (
        <>
          <SLDSDataTable
            items={data}
            id={`data-table-${title.toLowerCase().replace(/\s+/g, "-")}`}
            noRowHover={false}
            className="slds-max-medium-table_stacked-horizontal"
            emptyCellContent="-"
          >
            {columns.map((column) => (
              <DataTableColumn
                key={column.key}
                label={column.label}
                property={column.key}
                width={column.width || null}
                truncate={column.truncate}
                sortable={column.sortable}
              >
                {(item) => cellRenderer(item, column)}
              </DataTableColumn>
            ))}
          </SLDSDataTable>

          {totalCount === 0 && (
            <div className="slds-text-align_center slds-p-around_medium">
              <Icon
                category="utility"
                name="info"
                size="small"
                className="slds-m-right_x-small"
              />
              <span className="slds-text-color_weak">{emptyStateMessage}</span>
            </div>
          )}

          {totalPages > 1 && (
            <div className="slds-grid slds-grid_align-center slds-p-around_medium">
              <Button
                variant="neutral"
                iconCategory="utility"
                iconName="left"
                iconPosition="left"
                label="Previous"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="slds-m-horizontal_xx-small"
              />

              <div className="slds-grid slds-grid_vertical-align-center slds-p-horizontal_medium">
                <span className="slds-text-color_weak">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                variant="neutral"
                iconCategory="utility"
                iconName="right"
                iconPosition="right"
                label="Next"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="slds-m-horizontal_xx-small"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable;
