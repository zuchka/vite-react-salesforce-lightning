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

interface Film {
  film_id: number;
  title: string;
  description: string;
  release_year: number;
  language_id: number;
  rental_duration: number;
  rental_rate: number;
  length: number;
  replacement_cost: number;
  rating: string;
  special_features: string[] | null;
  language?: {
    name: string;
  };
  categories?: string[];
}

const FilmsList: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  useEffect(() => {
    fetchFilms();
  }, [page, searchTerm]);

  async function fetchFilms() {
    setLoading(true);
    try {
      // Count total films for pagination
      const countQuery = supabase
        .from("film")
        .select("*", { count: "exact", head: true });

      if (searchTerm) {
        countQuery.ilike("title", `%${searchTerm}%`);
      }

      const { count } = await countQuery;
      setTotalCount(count || 0);

      // Fetch films with pagination
      let query = supabase
        .from("film")
        .select(
          `
          film_id,
          title,
          description,
          release_year,
          language_id,
          rental_duration,
          rental_rate,
          length,
          replacement_cost,
          rating,
          special_features,
          language:language_id(name)
        `,
        )
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch categories for each film
      const filmsWithCategories = await Promise.all(
        (data || []).map(async (film) => {
          const { data: filmCategories } = await supabase
            .from("film_category")
            .select(
              `
              category:category_id(name)
            `,
            )
            .eq("film_id", film.film_id);

          return {
            ...film,
            categories: filmCategories?.map((fc) => fc.category.name) || [],
          };
        }),
      );

      setFilms(filmsWithCategories);
    } catch (error) {
      console.error("Error fetching films:", error);
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
      property: "film_id",
      width: "70px",
    },
    {
      label: "Title",
      property: "title",
      width: "25%",
    },
    {
      label: "Description",
      property: "description",
      width: "35%",
      cell: (item) => (
        <DataTableCell title={item.description}>
          {item.description.length > 100
            ? `${item.description.substring(0, 100)}...`
            : item.description}
        </DataTableCell>
      ),
    },
    {
      label: "Release Year",
      property: "release_year",
    },
    {
      label: "Length",
      property: "length",
      cell: (item) => <DataTableCell>{item.length} min</DataTableCell>,
    },
    {
      label: "Rating",
      property: "rating",
    },
    {
      label: "Rental Rate",
      property: "rental_rate",
      cell: (item) => <DataTableCell>${item.rental_rate}</DataTableCell>,
    },
    {
      label: "Categories",
      property: "categories",
      cell: (item) => (
        <DataTableCell>{item.categories?.join(", ")}</DataTableCell>
      ),
    },
  ];

  return (
    <div className="slds-p-around_medium">
      <PageHeader
        title="Films Catalog"
        info={`${totalCount} films`}
        icon={<Icon category="standard" name="video" size="large" />}
      />

      <Card className="admin-box slds-m-top_medium">
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-grid_vertical-align-end slds-m-bottom_medium">
            <div className="slds-col slds-size_1-of-3">
              <Input
                aria-label="Search Films"
                id="film-search"
                placeholder="Search by title"
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
                assistiveText={{ label: "Loading films" }}
              />
            </div>
          ) : (
            <>
              <DataTable
                items={films}
                columns={columns}
                id="films-datatable"
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

export default FilmsList;
