import React, { useEffect, useState } from "react";
import {
  Card,
  DataTable,
  DataTableColumn,
  Button,
  ButtonGroup,
  Icon,
  Spinner,
  Tabs,
  TabsPanel,
  Input,
} from "@salesforce/design-system-react";
import {
  fetchTableNames,
  getTableInfo,
  fetchData,
  KNOWN_TABLES,
} from "../../services/supabase";

interface Column {
  column_name: string;
  data_type: string;
}

const DatabaseExplorer: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<Column[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [sqlQuery, setSqlQuery] = useState("");
  const [activeTabId, setActiveTabId] = useState("data-view");
  const pageSize = 25;

  const loadTables = async () => {
    try {
      setLoading(true);
      // Use our predefined list to avoid permissions issues
      setTables(KNOWN_TABLES);

      // If tables were found, select the first one
      if (KNOWN_TABLES.length > 0) {
        setSelectedTable(KNOWN_TABLES[0]);
      }
    } catch (err) {
      console.error("Error loading database tables:", err);
      setError("Failed to load database schema. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadTableInfo = async (tableName: string) => {
    try {
      setLoading(true);
      const { columns, error } = await getTableInfo(tableName);

      if (error) {
        throw new Error(`Failed to fetch columns for table ${tableName}`);
      }

      setTableColumns(columns);
      loadTableData(tableName, 1);
    } catch (err) {
      console.error(`Error loading table info for ${tableName}:`, err);
      setError(
        `Failed to load table structure for ${tableName}. Please try again later.`,
      );
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string, currentPage: number) => {
    try {
      setLoading(true);
      const { data, error, count, hasMore, tableExists } = await fetchData(
        tableName,
        currentPage,
        pageSize,
      );

      if (!tableExists) {
        throw new Error(`Table does not exist or no access: ${tableName}`);
      }

      if (error) {
        throw new Error(`Failed to fetch data from table ${tableName}`);
      }

      setTableData(data);
      setTotalCount(count);
      setHasMore(hasMore);
      setPage(currentPage);
    } catch (err) {
      console.error(`Error loading data from ${tableName}:`, err);
      setError(
        `Failed to load data from ${tableName}. Please try again later.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableInfo(selectedTable);
    }
  }, [selectedTable]);

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(1);
  };

  const handlePrevious = () => {
    if (page > 1 && selectedTable) {
      loadTableData(selectedTable, page - 1);
    }
  };

  const handleNext = () => {
    if (hasMore && selectedTable) {
      loadTableData(selectedTable, page + 1);
    }
  };

  const handleSqlExecute = () => {
    // In a real implementation, this would execute the SQL query
    // For now, we'll just show an alert
    alert(`SQL query execution would go here: ${sqlQuery}`);
  };

  const getColumnsForTable = () => {
    if (!tableColumns.length) return [];

    // Create columns dynamically based on the table structure
    return tableColumns.map((column) => ({
      label: column.column_name,
      property: column.column_name,
      truncate: true,
    }));
  };

  if (error) {
    return (
      <div className="slds-p-around_large admin-box">
        <div
          className="slds-notify slds-notify_alert slds-theme_alert-texture slds-theme_error"
          role="alert"
        >
          <Icon
            category="utility"
            name="error"
            className="slds-m-right_small"
          />
          <h2>{error}</h2>
        </div>
        <div className="slds-m-top_medium">
          <Button
            label="Retry"
            variant="brand"
            onClick={() => {
              setError(null);
              loadTables();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">
        Database Explorer
      </h1>

      <div className="slds-grid slds-gutters">
        {/* Table List Sidebar */}
        <div className="slds-col slds-size_1-of-4">
          <Card className="admin-box">
            <div className="slds-p-around_medium">
              <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                Tables
              </h2>

              {loading && tables.length === 0 ? (
                <div className="slds-is-relative" style={{ height: "100px" }}>
                  <Spinner
                    assistiveText={{ label: "Loading tables" }}
                    size="small"
                    variant="brand"
                  />
                </div>
              ) : (
                <ul className="slds-has-dividers_bottom-space">
                  {tables.map((table) => (
                    <li key={table} className="slds-item">
                      <a
                        href="#"
                        className={`slds-p-around_xx-small slds-grow slds-grid ${selectedTable === table ? "slds-text-color_success" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleTableSelect(table);
                        }}
                        style={{
                          color:
                            selectedTable === table ? "#b18cff" : "#f4f4f6",
                          display: "block",
                          textDecoration: "none",
                          padding: "8px",
                          borderRadius: "4px",
                          backgroundColor:
                            selectedTable === table ? "#23243a" : "transparent",
                        }}
                      >
                        <Icon
                          category="standard"
                          name="table"
                          size="small"
                          className="slds-m-right_small"
                        />
                        {table}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Table Data View */}
        <div className="slds-col slds-size_3-of-4">
          <Card className="admin-box">
            <div className="slds-p-around_medium">
              <Tabs
                id="database-explorer-tabs"
                className="slds-tabs_card"
                onSelect={(tabId: string) => setActiveTabId(tabId)}
              >
                <TabsPanel label="Data View" id="data-view">
                  <div className="slds-p-around_medium">
                    {selectedTable ? (
                      <>
                        <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                          {selectedTable} {loading ? " (Loading...)" : ""}
                        </h2>

                        {loading ? (
                          <div
                            className="slds-is-relative"
                            style={{ height: "200px" }}
                          >
                            <Spinner
                              assistiveText={{ label: "Loading data" }}
                              size="large"
                              variant="brand"
                            />
                          </div>
                        ) : (
                          <>
                            {tableData.length > 0 ? (
                              <>
                                <DataTable
                                  items={tableData}
                                  columns={getColumnsForTable()}
                                  id="table-data"
                                  noRowHover={false}
                                  className="slds-table_striped"
                                  fixedLayout
                                />

                                <div className="slds-grid slds-grid_align-spread slds-m-top_medium">
                                  <div>
                                    <p className="slds-text-color_weak">
                                      Showing{" "}
                                      {tableData.length > 0
                                        ? (page - 1) * pageSize + 1
                                        : 0}{" "}
                                      to{" "}
                                      {(page - 1) * pageSize + tableData.length}{" "}
                                      of {totalCount} records
                                    </p>
                                  </div>
                                  <div>
                                    <ButtonGroup>
                                      <Button
                                        label="Previous"
                                        onClick={handlePrevious}
                                        disabled={page <= 1}
                                        iconCategory="utility"
                                        iconName="chevronleft"
                                        iconPosition="left"
                                      />
                                      <Button
                                        label="Next"
                                        onClick={handleNext}
                                        disabled={!hasMore}
                                        iconCategory="utility"
                                        iconName="chevronright"
                                        iconPosition="right"
                                      />
                                    </ButtonGroup>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="slds-text-align_center slds-p-around_medium slds-text-color_weak">
                                No data available or no access to this table.
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="slds-text-align_center slds-p-around_xx-large slds-text-color_weak">
                        <Icon
                          category="utility"
                          name="table"
                          size="large"
                          className="slds-m-bottom_small"
                        />
                        <h2 className="slds-text-heading_medium">
                          Select a table from the list
                        </h2>
                      </div>
                    )}
                  </div>
                </TabsPanel>
                <TabsPanel label="SQL Query" id="sql-query">
                  <div className="slds-p-around_medium">
                    <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                      Custom SQL Query
                    </h2>

                    <div className="slds-box slds-theme_info slds-m-bottom_medium">
                      <div className="slds-media">
                        <div className="slds-media__figure">
                          <Icon category="utility" name="info" size="small" />
                        </div>
                        <div className="slds-media__body">
                          <p>
                            Note: SQL query execution may be limited due to
                            database permissions. This is a read-only
                            environment for safety purposes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-bottom_large">
                      <label
                        className="slds-form-element__label"
                        htmlFor="sql-query-input"
                      >
                        Enter SQL Query
                      </label>
                      <div className="slds-form-element__control">
                        <textarea
                          id="sql-query-input"
                          className="slds-textarea"
                          placeholder="SELECT * FROM film LIMIT 25;"
                          rows={5}
                          value={sqlQuery}
                          onChange={(e) => setSqlQuery(e.target.value)}
                          style={{
                            backgroundColor: "#23243a",
                            color: "#f4f4f6",
                            border: "1px solid #3a3b4d",
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      label="Execute Query"
                      variant="brand"
                      onClick={handleSqlExecute}
                      disabled={!sqlQuery.trim()}
                    />

                    <div className="slds-m-top_large">
                      <p className="slds-text-color_weak">
                        Note: For security reasons, SQL query execution is
                        limited to read-only operations. Write operations should
                        be performed through the proper API endpoints.
                      </p>
                    </div>
                  </div>
                </TabsPanel>
                <TabsPanel label="Table Structure" id="table-structure">
                  <div className="slds-p-around_medium">
                    {selectedTable ? (
                      <>
                        <h2 className="slds-text-heading_medium slds-m-bottom_medium">
                          {selectedTable} Structure{" "}
                          {loading ? " (Loading...)" : ""}
                        </h2>

                        {loading ? (
                          <div
                            className="slds-is-relative"
                            style={{ height: "200px" }}
                          >
                            <Spinner
                              assistiveText={{
                                label: "Loading table structure",
                              }}
                              size="large"
                              variant="brand"
                            />
                          </div>
                        ) : (
                          <>
                            {tableColumns.length > 0 ? (
                              <table className="slds-table slds-table_cell-buffer slds-table_bordered">
                                <thead>
                                  <tr className="slds-line-height_reset">
                                    <th scope="col">
                                      <div
                                        className="slds-truncate"
                                        title="Column Name"
                                      >
                                        Column Name
                                      </div>
                                    </th>
                                    <th scope="col">
                                      <div
                                        className="slds-truncate"
                                        title="Data Type"
                                      >
                                        Data Type
                                      </div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableColumns.map((column) => (
                                    <tr key={column.column_name}>
                                      <td>
                                        <div
                                          className="slds-truncate"
                                          title={column.column_name}
                                        >
                                          {column.column_name}
                                        </div>
                                      </td>
                                      <td>
                                        <div
                                          className="slds-truncate"
                                          title={column.data_type}
                                        >
                                          {column.data_type}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="slds-text-align_center slds-p-around_medium slds-text-color_weak">
                                No columns found or no access to this table's
                                structure.
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <div className="slds-text-align_center slds-p-around_xx-large slds-text-color_weak">
                        <Icon
                          category="utility"
                          name="table"
                          size="large"
                          className="slds-m-bottom_small"
                        />
                        <h2 className="slds-text-heading_medium">
                          Select a table to view its structure
                        </h2>
                      </div>
                    )}
                  </div>
                </TabsPanel>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DatabaseExplorer;
