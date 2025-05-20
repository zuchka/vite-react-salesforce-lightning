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
  Tabs,
  TabsPanel,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

interface Country {
  country_id: number;
  country: string;
  last_update: string;
  city_count: number;
}

interface City {
  city_id: number;
  city: string;
  country_id: number;
  last_update: string;
  country?: {
    country: string;
  };
  address_count: number;
}

interface Address {
  address_id: number;
  address: string;
  address2: string | null;
  district: string;
  city_id: number;
  postal_code: string | null;
  phone: string;
  last_update: string;
  city?: {
    city: string;
    country?: {
      country: string;
    };
  };
}

const LocationsList: React.FC = () => {
  const [view, setView] = useState<"countries" | "cities" | "addresses">(
    "countries",
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    if (view === "countries") {
      fetchCountries();
    } else if (view === "cities") {
      fetchCities();
    } else if (view === "addresses") {
      fetchAddresses();
    }
  }, [view, page, searchTerm]);

  async function fetchCountries() {
    setLoading(true);
    try {
      // Count total countries for pagination
      const countQuery = supabase
        .from("country")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery.ilike("country", `%${searchTerm}%`);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch countries with pagination
      let query = supabase
        .from("country")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("country");

      if (searchTerm) {
        query = query.ilike("country", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Count cities in each country
      const countriesWithCityCounts = await Promise.all(
        (data || []).map(async (country) => {
          const { count: cityCount } = await supabase
            .from("city")
            .select("*", { count: "exact", head: true })
            .eq("country_id", country.country_id);

          return {
            ...country,
            city_count: cityCount || 0,
          };
        }),
      );

      setCountries(countriesWithCityCounts);
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCities() {
    setLoading(true);
    try {
      // Count total cities for pagination
      const countQuery = supabase
        .from("city")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery.ilike("city", `%${searchTerm}%`);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch cities with pagination
      let query = supabase
        .from("city")
        .select(
          `
          *,
          country:country_id(
            country
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("city");

      if (searchTerm) {
        query = query.ilike("city", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Count addresses in each city
      const citiesWithAddressCounts = await Promise.all(
        (data || []).map(async (city) => {
          const { count: addressCount } = await supabase
            .from("address")
            .select("*", { count: "exact", head: true })
            .eq("city_id", city.city_id);

          return {
            ...city,
            address_count: addressCount || 0,
          };
        }),
      );

      setCities(citiesWithAddressCounts);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAddresses() {
    setLoading(true);
    try {
      // Count total addresses for pagination
      const countQuery = supabase
        .from("address")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery.or(
          `address.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`,
        );
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch addresses with pagination
      let query = supabase
        .from("address")
        .select(
          `
          *,
          city:city_id(
            city,
            country:country_id(
              country
            )
          )
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("address_id");

      if (searchTerm) {
        query = query.or(
          `address.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
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

  const countryColumns: DataTableColumn[] = [
    {
      label: "ID",
      property: "country_id",
      width: "80px",
    },
    {
      label: "Country",
      property: "country",
      width: "50%",
    },
    {
      label: "Cities",
      property: "city_count",
      width: "20%",
      cell: (item) => <DataTableCell>{item.city_count}</DataTableCell>,
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

  const cityColumns: DataTableColumn[] = [
    {
      label: "ID",
      property: "city_id",
      width: "80px",
    },
    {
      label: "City",
      property: "city",
      width: "35%",
    },
    {
      label: "Country",
      property: "country",
      width: "25%",
      cell: (item) => <DataTableCell>{item.country?.country}</DataTableCell>,
    },
    {
      label: "Addresses",
      property: "address_count",
      width: "15%",
      cell: (item) => <DataTableCell>{item.address_count}</DataTableCell>,
    },
    {
      label: "Last Update",
      property: "last_update",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {new Date(item.last_update).toLocaleString()}
        </DataTableCell>
      ),
    },
  ];

  const addressColumns: DataTableColumn[] = [
    {
      label: "ID",
      property: "address_id",
      width: "80px",
    },
    {
      label: "Address",
      property: "address",
      width: "30%",
      cell: (item) => (
        <DataTableCell>
          <div>
            {item.address}
            {item.address2 && `, ${item.address2}`}
          </div>
          <div>
            {item.district}
            {item.postal_code && `, ${item.postal_code}`}
          </div>
        </DataTableCell>
      ),
    },
    {
      label: "City",
      property: "city",
      width: "15%",
      cell: (item) => <DataTableCell>{item.city?.city}</DataTableCell>,
    },
    {
      label: "Country",
      property: "country",
      width: "15%",
      cell: (item) => (
        <DataTableCell>{item.city?.country?.country}</DataTableCell>
      ),
    },
    {
      label: "Phone",
      property: "phone",
      width: "15%",
    },
    {
      label: "Last Update",
      property: "last_update",
      width: "15%",
      cell: (item) => (
        <DataTableCell>
          {new Date(item.last_update).toLocaleString()}
        </DataTableCell>
      ),
    },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="slds-p-around_medium slds-align_absolute-center">
          <Spinner
            size="medium"
            variant="brand"
            assistiveText={{ label: "Loading data" }}
          />
        </div>
      );
    }

    if (view === "countries" && countries.length > 0) {
      return (
        <DataTable
          items={countries}
          columns={countryColumns}
          id="countries-datatable"
          bordered
          striped
          noRowHover
        />
      );
    } else if (view === "cities" && cities.length > 0) {
      return (
        <DataTable
          items={cities}
          columns={cityColumns}
          id="cities-datatable"
          bordered
          striped
          noRowHover
        />
      );
    } else if (view === "addresses" && addresses.length > 0) {
      return (
        <DataTable
          items={addresses}
          columns={addressColumns}
          id="addresses-datatable"
          bordered
          striped
          noRowHover
        />
      );
    }

    return (
      <div className="slds-p-around_medium slds-align_absolute-center">
        <p>No data available</p>
      </div>
    );
  };

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Locations"
        info="Countries, Cities, and Addresses"
        icon={<Icon category="standard" name="location" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <Tabs
            id="locations-tabs"
            panel={<></>}
            selectedIndex={view === "countries" ? 0 : view === "cities" ? 1 : 2}
            onSelect={(_, { index }) => {
              setPage(0);
              setSearchTerm("");
              if (index === 0) setView("countries");
              else if (index === 1) setView("cities");
              else setView("addresses");
            }}
          >
            <TabsPanel label="Countries" />
            <TabsPanel label="Cities" />
            <TabsPanel label="Addresses" />
          </Tabs>

          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium slds-m-top_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label={`Search ${view}`}
                id="location-search"
                placeholder={`Search ${view}`}
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

          {renderContent()}

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
        </div>
      </Card>
    </div>
  );
};

export default LocationsList;
