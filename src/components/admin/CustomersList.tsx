import React, { useEffect, useState } from "react";
import {
  Card,
  Icon,
  Input,
  Badge,
  Button,
} from "@salesforce/design-system-react";
import { SimpleDataTable, Column } from "./SimpleDataTable";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";

interface Customer {
  id: number;
  name: string;
  address: string;
  "zip code": string;
  phone: string;
  city: string;
  country: string;
  notes: string;
  sid: number;
}

const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Query setup
      let query = supabase
        .from("customer_list")
        .select("*")
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching customers:", error.message);
        return;
      }

      // Count for pagination
      let countQuery = supabase
        .from("customer_list")
        .select("id", { count: "exact", head: true });

      if (searchTerm) {
        countQuery = countQuery.or(
          `name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`,
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching count:", countError.message);
        return;
      }

      setCustomers(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card
      heading="Customers"
      icon={<Icon category="standard" name="user" />}
      className="admin-box slds-m-around_small"
      headerActions={
        <div className="slds-grid slds-grid_vertical-align-center">
          <Input
            id="customer-search"
            placeholder="Search by name, address, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            iconLeft={<Icon category="utility" name="search" />}
          />
          <Button
            className="slds-button slds-button_brand slds-m-left_small"
            onClick={handleSearch}
            label="Search"
          />
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
            items={customers}
            striped
            fixedLayout
            id="customers-datatable"
            className="slds-max-medium-table_stacked-horizontal"
            emptyCellContent="—"
          >
            <Column label="Name" property="name" sortable width="15rem" />
            <Column label="Address" property="address" sortable width="20rem">
              {(item: Customer) => (
                <div>
                  <div>{item.address}</div>
                  <div className="slds-text-body_small">{item["zip code"]}</div>
                </div>
              )}
            </Column>
            <Column label="City" property="city" sortable />
            <Column label="Country" property="country" sortable />
            <Column label="Phone" property="phone" sortable />
            <Column label="Status" property="notes" sortable={false}>
              {(item: Customer) => (
                <div>
                  {item.notes && item.notes.includes("active") ? (
                    <Badge content="Active" color="success" />
                  ) : (
                    <Badge content="Inactive" color="warning" />
                  )}
                </div>
              )}
            </Column>
          </SimpleDataTable>
        )}
      </div>
    </Card>
  );
};

export default CustomersList;
