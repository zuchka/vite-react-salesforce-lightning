import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  DataTableColumn,
  DataTableCell,
  Icon,
  Input,
  PageHeader,
  Spinner,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

interface Payment {
  payment_id: number;
  customer_id: number;
  staff_id: number;
  rental_id: number;
  amount: number;
  payment_date: string;
  customer?: {
    first_name: string;
    last_name: string;
  };
  staff?: {
    first_name: string;
    last_name: string;
  };
  rental?: {
    inventory?: {
      film?: {
        title: string;
      };
    };
  };
}

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchPayments();
  }, [page, searchTerm]);

  async function fetchPayments() {
    setLoading(true);
    try {
      // Count total payments for pagination
      const countQuery = supabase
        .from("payment")
        .select("*", { count: "exact", head: true });

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch payments with pagination
      let query = supabase
        .from("payment")
        .select(
          `
          *,
          customer:customer_id(
            first_name,
            last_name
          ),
          staff:staff_id(
            first_name,
            last_name
          ),
          rental:rental_id(
            inventory:inventory_id(
              film:film_id(
                title
              )
            )
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("payment_date", { ascending: false });

      if (searchTerm && !isNaN(parseFloat(searchTerm))) {
        query = query.eq("amount", parseFloat(searchTerm));
      } else if (searchTerm) {
        // Not ideal, but this is a workaround since we can't easily search in joined tables
        // In a real app, you'd setup more robust search functionality
        query = query.or(`payment_id.eq.${searchTerm}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

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
      property: "payment_id",
      width: "80px",
    },
    {
      label: "Customer",
      property: "customer",
      width: "20%",
      cell: (item) => (
        <DataTableCell>
          {item.customer
            ? `${item.customer.first_name} ${item.customer.last_name}`
            : "Unknown"}
        </DataTableCell>
      ),
    },
    {
      label: "Film",
      property: "rental",
      width: "25%",
      cell: (item) => (
        <DataTableCell>
          {item.rental?.inventory?.film?.title || "N/A"}
        </DataTableCell>
      ),
    },
    {
      label: "Staff",
      property: "staff",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {item.staff
            ? `${item.staff.first_name} ${item.staff.last_name}`
            : "Unknown"}
        </DataTableCell>
      ),
    },
    {
      label: "Amount",
      property: "amount",
      width: "10%",
      cell: (item) => (
        <DataTableCell>
          <span className="slds-text-color_success">
            ${item.amount.toFixed(2)}
          </span>
        </DataTableCell>
      ),
    },
    {
      label: "Payment Date",
      property: "payment_date",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {new Date(item.payment_date).toLocaleString()}
        </DataTableCell>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Payments"
        info={`${totalCount} payments`}
        icon={<Icon category="standard" name="currency" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label="Search Payments"
                id="payment-search"
                placeholder="Search by amount"
                onChange={handleSearch}
                value={searchTerm}
                iconLeft={
                  <Icon
                    assistiveText={{
                      icon: "Search",
                    }}
                    name="search"
                    size="x-small"
                    category="utility"
                  />
                }
              />
            </div>
          </div>

          {loading ? (
            <div className="slds-p-around_medium slds-align_absolute-center">
              <Spinner
                size="medium"
                variant="brand"
                assistiveText={{ label: "Loading payments" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={payments}
                columns={columns}
                id="payments-datatable"
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

export default PaymentsList;
