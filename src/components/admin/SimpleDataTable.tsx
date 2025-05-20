import React, { ReactNode } from "react";

export interface ColumnProps {
  label: string;
  property: string;
  sortable?: boolean;
  width?: string;
  children?: (item: any) => ReactNode;
}

export const Column: React.FC<ColumnProps> = () => null; // Just a marker component, doesn't render

interface SimpleDataTableProps {
  items: any[];
  children: ReactNode;
  id?: string;
  className?: string;
  striped?: boolean;
  fixedLayout?: boolean;
  noRowHover?: boolean;
  emptyCellContent?: string;
}

export const SimpleDataTable: React.FC<SimpleDataTableProps> = ({
  items,
  children,
  id,
  className = "",
  striped = false,
  fixedLayout = false,
  noRowHover = false,
  emptyCellContent = "-",
}) => {
  // Extract column definitions from children
  const columns = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child) && child.type === Column)
    .map((child) => {
      const columnProps = (child as React.ReactElement<ColumnProps>).props;
      return {
        label: columnProps.label,
        property: columnProps.property,
        sortable: columnProps.sortable,
        width: columnProps.width,
        render: columnProps.children,
      };
    });

  // Prepare table classes
  const tableClasses = [
    "slds-table",
    fixedLayout ? "slds-table_fixed-layout" : "",
    striped ? "slds-table_striped" : "",
    noRowHover ? "" : "slds-table_cell-buffer",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="slds-table_header-fixed_container"
      style={{ overflow: "auto" }}
    >
      <div className="slds-scrollable_x">
        <table id={id} className={tableClasses} role="grid">
          <thead>
            <tr className="slds-line-height_reset">
              {columns.map((column, index) => (
                <th
                  key={`${column.property}-${index}`}
                  className={`slds-text-title_caps ${column.sortable ? "slds-is-sortable" : ""}`}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                >
                  <div className="slds-truncate" title={column.label}>
                    {column.label}
                    {column.sortable && (
                      <span className="slds-icon_container slds-icon-utility-arrowdown">
                        <svg
                          className="slds-icon slds-icon--x-small slds-icon-text-default slds-is-sortable__icon"
                          aria-hidden="true"
                        >
                          <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="slds-text-align_center">
                  No items to display
                </td>
              </tr>
            ) : (
              items.map((item, rowIndex) => (
                <tr key={rowIndex} className="slds-hint-parent">
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      data-label={column.label}
                    >
                      {column.render
                        ? column.render(item)
                        : item[column.property] != null
                          ? item[column.property]
                          : emptyCellContent}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleDataTable;
