import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  DataTable,
  DataTableColumn,
  Icon,
  Input,
  PageHeader,
  Spinner,
} from "@salesforce/design-system-react";
import supabase from "../../lib/supabase";

interface Actor {
  actor_id: number;
  first_name: string;
  last_name: string;
  last_update: string;
  film_count: number;
}

const ActorsList: React.FC = () => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchActors();
  }, [page, searchTerm]);

  async function fetchActors() {
    setLoading(true);
    try {
      // Count total actors for pagination
      const countQuery = supabase
        .from("actor")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`,
        );
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch actors with pagination
      let query = supabase
        .from("actor")
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order("last_name", { ascending: true });

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Count films for each actor
      const actorsWithFilmCount = await Promise.all(
        (data || []).map(async (actor) => {
          const { count: filmCount } = await supabase
            .from("film_actor")
            .select("*", { count: "exact", head: true })
            .eq("actor_id", actor.actor_id);

          return {
            ...actor,
            film_count: filmCount || 0,
          };
        }),
      );

      setActors(actorsWithFilmCount);
    } catch (error) {
      console.error("Error fetching actors:", error);
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
      property: "actor_id",
      width: "100px",
    },
    {
      label: "First Name",
      property: "first_name",
      width: "30%",
    },
    {
      label: "Last Name",
      property: "last_name",
      width: "30%",
    },
    {
      label: "Films",
      property: "film_count",
      width: "20%",
    },
    {
      label: "Last Update",
      property: "last_update",
      width: "20%",
      cell: (item) => (
        <span>{new Date(item.last_update).toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Actors Directory"
        info={`${totalCount} actors`}
        icon={<Icon category="standard" name="user" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label="Search Actors"
                id="actor-search"
                placeholder="Search by name"
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
                assistiveText={{ label: "Loading actors" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={actors}
                columns={columns}
                id="actors-datatable"
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

export default ActorsList;
