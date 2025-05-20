import React, { useEffect, useState } from "react";
import {
  DataTable,
  DataTableColumn,
  DataTableCell,
  Card,
  Icon,
  Input,
  ButtonGroup,
  Button,
  Pill,
  Dropdown,
} from "@salesforce/design-system-react";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";

interface Rental {
  rental_id: number;
  rental_date: string;
  inventory_id: number;
  customer_id: number;
  return_date: string | null;
  staff_id: number;
  last_update: string;
  customer_name?: string;
  film_title?: string;
  rental_status?: string;
}

const RentalsList: React.FC = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string | null>(null);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchRentals();
  }, [currentPage, filter]);

  const fetchRentals = async () => {
    setIsLoading(true);
    try {
      // Build the query to get rental data with customer and film information
      const rentalQuery = `
        rental.rental_id,
        rental.rental_date,
        rental.inventory_id,
        rental.customer_id,
        rental.return_date,
        rental.staff_id,
        customer_list.name as customer_name,
        film.title as film_title
      `;

      let query = supabase
        .from("rental")
        .select(rentalQuery)
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order("rental_date", { ascending: false })
        .join("customer_list", {
          foreignTable: "customer_list",
          col1: "customer_id",
          col2: "id",
        })
        .join("inventory", {
          foreignTable: "inventory",
          col1: "inventory_id",
          col2: "inventory_id",
        })
        .join("film", {
          foreignTable: "film",
          col1: "inventory.film_id",
          col2: "film_id",
        });

      if (filter === "returned") {
        query = query.not("return_date", "is", null);
      } else if (filter === "outstanding") {
        query = query.is("return_date", null);
      }

      if (searchTerm) {
        query = query.filter("customer_list.name", "ilike", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching rentals:", error);
        return;
      }

      // Count for pagination
      let countQuery = supabase
        .from("rental")
        .select("rental_id", { count: "exact", head: true });

      if (filter === "returned") {
        countQuery = countQuery.not("return_date", "is", null);
      } else if (filter === "outstanding") {
        countQuery = countQuery.is("return_date", null);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching count:", countError);
        return;
      }

      // Process the data to include rental status
      const processedData = data?.map((rental) => {
        return {
          ...rental,
          rental_status: rental.return_date ? "Returned" : "Outstanding",
        };
      });

      setRentals(processedData || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRentals();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: DataTableColumn[] = [
    {
      label: "Rental ID",
      property: "rental_id",
      sortable: true,
    },
    {
      label: "Customer",
      property: "customer_name",
      sortable: true,
    },
    {
      label: "Film",
      property: "film_title",
      sortable: true,
    },
    {
      label: "Rental Date",
      property: "rental_date",
      sortable: true,
      cell: (item: Rental) => (
        <DataTableCell>{formatDate(item.rental_date)}</DataTableCell>
      ),
    },
    {
      label: "Return Date",
      property: "return_date",
      sortable: true,
      cell: (item: Rental) => (
        <DataTableCell>{formatDate(item.return_date)}</DataTableCell>
      ),
    },
    {
      label: "Status",
      property: "rental_status",
      sortable: true,
      cell: (item: Rental) => (
        <DataTableCell>
          <Pill
            labels={{
              label: item.rental_status || "Unknown",
              removeTitle: "Remove",
            }}
            icon={
              <Icon
                category="standard"
                name={
                  item.rental_status === "Returned"
                    ? "checkout"
                    : "connected_apps"
                }
                size="small"
              />
            }
            variant={item.rental_status === "Returned" ? "success" : "warning"}
          />
        </DataTableCell>
      ),
    },
  ];

  const filterOptions = [
    { id: "all", label: "All Rentals" },
    { id: "returned", label: "Returned" },
    { id: "outstanding", label: "Outstanding" },
  ];

  return (
    <Card
      heading="Rentals"
      icon={<Icon category="standard" name="product_transfer" />}
      className="admin-box slds-m-around_small"
      headerActions={
        <div className="slds-grid slds-grid_vertical-align-center">
          <div className="slds-m-right_small">
            <Dropdown
              align="right"
              options={filterOptions}
              onSelect={(option) => {
                setFilter(option.id === "all" ? null : option.id);
                setCurrentPage(1);
              }}
              value={filter || "all"}
              buttonVariant="neutral"
              iconCategory="utility"
              iconName="filter"
              label="Filter"
            />
          </div>
          <div className="slds-grid slds-grid_vertical-align-center">
            <Input
              id="rental-search"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              iconCategory="utility"
              iconName="search"
              iconPosition="left"
            />
            <Button
              label="Search"
              onClick={handleSearch}
              variant="brand"
              className="slds-m-left_small"
            />
          </div>
        </div>
      }
      footer={
        totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        )
      }
    >
      <div className="slds-p-horizontal_small">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            items={rentals}
            columns={columns}
            noRowHover={false}
            striped
            fixedLayout
            id="rentals-datatable"
            className="slds-max-medium-table_stacked-horizontal"
            selectRows="none"
            emptyCellContent="—"
          />
        )}
      </div>
    </Card>
  );
};

export default RentalsList;
