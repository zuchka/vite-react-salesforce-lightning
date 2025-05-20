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
  PillContainer,
} from "@salesforce/design-system-react";
import { supabase } from "../../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import Pagination from "./Pagination";

interface Film {
  film_id: number;
  title: string;
  description: string;
  release_year: number;
  rental_duration: number;
  rental_rate: number;
  length: number;
  replacement_cost: number;
  rating: string;
  special_features: string[];
  category?: string;
}

const FilmsList: React.FC = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchCategories();
    fetchFilms();
  }, [currentPage, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("category")
        .select("name")
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      if (data) {
        setCategories(data.map((cat) => cat.name));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchFilms = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("film_list")
        .select("fid, title, description, category, price, length, rating")
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1,
        );

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching films:", error);
        return;
      }

      // Count total for pagination
      let countQuery = supabase
        .from("film_list")
        .select("fid", { count: "exact", head: true });

      if (selectedCategory) {
        countQuery = countQuery.eq("category", selectedCategory);
      }

      if (searchTerm) {
        countQuery = countQuery.ilike("title", `%${searchTerm}%`);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching count:", countError);
        return;
      }

      const transformedData =
        data?.map((film) => ({
          film_id: film.fid,
          title: film.title,
          description: film.description,
          category: film.category,
          rental_rate: film.price,
          length: film.length,
          rating: film.rating,
          special_features: [],
        })) || [];

      setFilms(transformedData);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchFilms();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const columns: DataTableColumn[] = [
    {
      label: "Title",
      property: "title",
      sortable: true,
    },
    {
      label: "Description",
      property: "description",
      sortable: false,
      cell: (item: Film) => (
        <DataTableCell>
          <div className="slds-line-clamp_small">{item.description}</div>
        </DataTableCell>
      ),
    },
    {
      label: "Category",
      property: "category",
      sortable: true,
    },
    {
      label: "Length",
      property: "length",
      sortable: true,
      cell: (item: Film) => <DataTableCell>{item.length} min</DataTableCell>,
    },
    {
      label: "Price",
      property: "rental_rate",
      sortable: true,
      cell: (item: Film) => <DataTableCell>${item.rental_rate}</DataTableCell>,
    },
    {
      label: "Rating",
      property: "rating",
      sortable: true,
      cell: (item: Film) => (
        <DataTableCell>
          <Pill
            labels={{
              label: item.rating,
              removeTitle: "Remove",
            }}
            icon={<Icon category="standard" name="product_required" />}
          />
        </DataTableCell>
      ),
    },
  ];

  return (
    <Card
      heading="Films Inventory"
      icon={<Icon category="standard" name="video" />}
      className="admin-box slds-m-around_small"
      headerActions={
        <div className="slds-grid slds-grid_vertical-align-center">
          <div className="slds-m-right_small">
            <Input
              id="film-search"
              placeholder="Search films..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              iconCategory="utility"
              iconName="search"
              iconPosition="left"
            />
          </div>
          <Button label="Search" onClick={handleSearch} variant="brand" />
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
        <div className="slds-p-vertical_x-small">
          <PillContainer>
            <Button
              key="all"
              variant={selectedCategory === null ? "brand" : "neutral"}
              className="slds-m-right_xx-small"
              label="All Categories"
              onClick={() => handleCategorySelect(null)}
            />
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "brand" : "neutral"}
                className="slds-m-right_xx-small"
                label={category}
                onClick={() => handleCategorySelect(category)}
              />
            ))}
          </PillContainer>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <DataTable
            items={films}
            columns={columns}
            noRowHover={false}
            striped
            fixedLayout
            id="films-datatable"
            className="slds-max-medium-table_stacked-horizontal"
            selectRows="none"
            emptyCellContent="—"
          />
        )}
      </div>
    </Card>
  );
};

export default FilmsList;
