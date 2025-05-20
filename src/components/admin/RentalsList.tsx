import React, { useEffect, useState } from "react";
import {
  Card,
  Icon,
  Input,
  Button,
  Pill,
} from "@salesforce/design-system-react";
import { SimpleDataTable, Column } from "./SimpleDataTable";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";
import SimpleDropdown from "./SimpleDropdown";

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
      // First get basic rental data with return date filtering if needed
      let rentalQuery = supabase
        .from("rental")
        .select(
          `
          rental_id,
          rental_date,
          inventory_id,
          customer_id,
          return_date,
          staff_id,
          last_update
        `,
        )
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
        .order("rental_date", { ascending: false });

      if (filter === "returned") {
        rentalQuery = rentalQuery.not("return_date", "is", null);
      } else if (filter === "outstanding") {
        rentalQuery = rentalQuery.is("return_date", null);
      }

      const { data: rentalData, error: rentalError } = await rentalQuery;

      if (rentalError) {
        console.error("Error fetching rentals:", rentalError.message);
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
        console.error("Error fetching count:", countError.message);
        return;
      }

      // If we have rental data, fetch the related customer and film information
      if (rentalData && rentalData.length > 0) {
        // Get customer names
        const customerIds = rentalData.map((rental) => rental.customer_id);
        const { data: customerData, error: customerError } = await supabase
          .from("customer")
          .select("customer_id, first_name, last_name")
          .in("customer_id", customerIds);

        if (customerError) {
          console.error("Error fetching customer data:", customerError.message);
        }

        // Get film titles
        const inventoryIds = rentalData.map((rental) => rental.inventory_id);
        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select("inventory_id, film_id")
          .in("inventory_id", inventoryIds);

        if (inventoryError) {
          console.error(
            "Error fetching inventory data:",
            inventoryError.message,
          );
        }

        if (inventoryData && inventoryData.length > 0) {
          const filmIds = inventoryData.map((inv) => inv.film_id);
          const { data: filmData, error: filmError } = await supabase
            .from("film")
            .select("film_id, title")
            .in("film_id", filmIds);

          if (filmError) {
            console.error("Error fetching film data:", filmError.message);
          }

          // Now we can combine all this data
          const enrichedRentals = rentalData.map((rental) => {
            // Find matching customer
            const customer = customerData?.find(
              (c) => c.customer_id === rental.customer_id,
            );
            // Find matching inventory and film
            const inventory = inventoryData?.find(
              (i) => i.inventory_id === rental.inventory_id,
            );
            const film = inventory
              ? filmData?.find((f) => f.film_id === inventory.film_id)
              : null;

            return {
              ...rental,
              customer_name: customer
                ? `${customer.first_name} ${customer.last_name}`
                : "Unknown Customer",
              film_title: film?.title || "Unknown Film",
              rental_status: rental.return_date ? "Returned" : "Outstanding",
            };
          });

          setRentals(enrichedRentals);
        } else {
          // If no inventory data, just show basic rental info
          setRentals(
            rentalData.map((rental) => ({
              ...rental,
              customer_name: "Unknown Customer",
              film_title: "Unknown Film",
              rental_status: rental.return_date ? "Returned" : "Outstanding",
            })),
          );
        }
      } else {
        setRentals([]);
      }

      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      // Search by customer name
      supabase
        .from("customer")
        .select("customer_id, first_name, last_name")
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .then(({ data: customerData, error }) => {
          if (error) {
            console.error("Error searching customers:", error.message);
            setIsLoading(false);
            return;
          }

          if (customerData && customerData.length > 0) {
            const customerIds = customerData.map((c) => c.customer_id);

            // Get rentals for these customers
            let rentalQuery = supabase
              .from("rental")
              .select("*")
              .in("customer_id", customerIds)
              .range(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage - 1,
              )
              .order("rental_date", { ascending: false });

            if (filter === "returned") {
              rentalQuery = rentalQuery.not("return_date", "is", null);
            } else if (filter === "outstanding") {
              rentalQuery = rentalQuery.is("return_date", null);
            }

            rentalQuery.then(({ data, error: rentalError }) => {
              if (rentalError) {
                console.error(
                  "Error fetching filtered rentals:",
                  rentalError.message,
                );
                setIsLoading(false);
                return;
              }

              // Now count for pagination
              let countQuery = supabase
                .from("rental")
                .select("rental_id", { count: "exact", head: true })
                .in("customer_id", customerIds);

              if (filter === "returned") {
                countQuery = countQuery.not("return_date", "is", null);
              } else if (filter === "outstanding") {
                countQuery = countQuery.is("return_date", null);
              }

              countQuery.then(({ count, error: countError }) => {
                if (countError) {
                  console.error(
                    "Error fetching count for search:",
                    countError.message,
                  );
                }

                // Re-use the same enrichment logic to get customer names and film titles
                fetchEnrichedRentals(data || []).then((enrichedData) => {
                  setRentals(enrichedData);
                  setTotalPages(Math.ceil((count || 0) / itemsPerPage));
                  setIsLoading(false);
                });
              });
            });
          } else {
            // No matching customers
            setRentals([]);
            setTotalPages(1);
            setIsLoading(false);
          }
        });
    } else {
      // If search term is empty, just do regular fetch
      setCurrentPage(1);
      fetchRentals();
    }
  };

  // Helper function to fetch additional data for rentals
  const fetchEnrichedRentals = async (rentalData: Rental[]) => {
    if (!rentalData.length) return [];

    try {
      // Get customer names
      const customerIds = rentalData.map((rental) => rental.customer_id);
      const { data: customerData } = await supabase
        .from("customer")
        .select("customer_id, first_name, last_name")
        .in("customer_id", customerIds);

      // Get film titles
      const inventoryIds = rentalData.map((rental) => rental.inventory_id);
      const { data: inventoryData } = await supabase
        .from("inventory")
        .select("inventory_id, film_id")
        .in("inventory_id", inventoryIds);

      let filmData = [];
      if (inventoryData && inventoryData.length > 0) {
        const filmIds = inventoryData.map((inv) => inv.film_id);
        const { data: films } = await supabase
          .from("film")
          .select("film_id, title")
          .in("film_id", filmIds);

        filmData = films || [];
      }

      // Combine all data
      return rentalData.map((rental) => {
        const customer = customerData?.find(
          (c) => c.customer_id === rental.customer_id,
        );
        const inventory = inventoryData?.find(
          (i) => i.inventory_id === rental.inventory_id,
        );
        const film = inventory
          ? filmData?.find((f: any) => f.film_id === inventory.film_id)
          : null;

        return {
          ...rental,
          customer_name: customer
            ? `${customer.first_name} ${customer.last_name}`
            : "Unknown Customer",
          film_title: film?.title || "Unknown Film",
          rental_status: rental.return_date ? "Returned" : "Outstanding",
        };
      });
    } catch (error) {
      console.error("Error enriching rentals:", error);
      return rentalData;
    }
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
            <SimpleDropdown
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
              iconLeft={<Icon category="utility" name="search" />}
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
          <SimpleDataTable
            items={rentals}
            striped
            fixedLayout
            id="rentals-datatable"
            className="slds-max-medium-table_stacked-horizontal"
            emptyCellContent="—"
          >
            <Column label="Rental ID" property="rental_id" sortable />
            <Column label="Customer" property="customer_name" sortable />
            <Column label="Film" property="film_title" sortable />
            <Column label="Rental Date" property="rental_date" sortable>
              {(item: Rental) => <div>{formatDate(item.rental_date)}</div>}
            </Column>
            <Column label="Return Date" property="return_date" sortable>
              {(item: Rental) => <div>{formatDate(item.return_date)}</div>}
            </Column>
            <Column label="Status" property="rental_status" sortable>
              {(item: Rental) => (
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
                  variant={
                    item.rental_status === "Returned" ? "success" : "warning"
                  }
                />
              )}
            </Column>
          </SimpleDataTable>
        )}
      </div>
    </Card>
  );
};

export default RentalsList;
