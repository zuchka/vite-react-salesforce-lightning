import React, { useEffect, useState } from "react";
import { Card, Icon, Spinner, Button } from "@salesforce/design-system-react";
import {
  fetchStats,
  fetchTableNames,
  type Film,
} from "../../services/supabase";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    counts: {
      films: number;
      actors: number;
      customers: number;
      rentals: number;
      categories: number;
    };
    topFilms: Film[];
    error: any;
    tablesExist?: {
      film: boolean;
      actor: boolean;
      customer: boolean;
      rental: boolean;
      category: boolean;
    };
  }>({
    counts: {
      films: 0,
      actors: 0,
      customers: 0,
      rentals: 0,
      categories: 0,
    },
    topFilms: [],
    error: null,
    tablesExist: {
      film: false,
      actor: false,
      customer: false,
      rental: false,
      category: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTables, setAllTables] = useState<string[]>([]);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);

        // Fetch all tables in the database to see what's available
        const { tables, error: tablesError } = await fetchTableNames();
        if (tablesError) {
          console.error("Error fetching tables:", tablesError);
        } else {
          setAllTables(tables);
        }

        const result = await fetchStats();
        setStats(result);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(
          "Failed to load dashboard statistics. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  if (loading) {
    return (
      <div
        className="slds-is-relative slds-p-around_large"
        style={{ height: "400px" }}
      >
        <Spinner
          assistiveText={{ label: "Loading dashboard data" }}
          size="large"
          variant="brand"
        />
      </div>
    );
  }

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
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      <h1 className="slds-text-heading_large slds-m-bottom_large">
        DVD Rental Dashboard
      </h1>

      {/* Key Metrics */}
      <div className="slds-grid slds-gutters slds-wrap slds-m-bottom_large">
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-5 slds-p-around_x-small">
          <Card
            heading="Total Films"
            icon={<Icon category="standard" name="video" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.films.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-5 slds-p-around_x-small">
          <Card
            heading="Actors"
            icon={<Icon category="standard" name="user" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.actors.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-5 slds-p-around_x-small">
          <Card
            heading="Customers"
            icon={<Icon category="standard" name="people" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.customers.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-5 slds-p-around_x-small">
          <Card
            heading="Rentals"
            icon={
              <Icon
                category="standard"
                name="service_appointment"
                size="small"
              />
            }
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.rentals.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>

        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-5 slds-p-around_x-small">
          <Card
            heading="Categories"
            icon={<Icon category="standard" name="product_item" size="small" />}
            className="admin-box"
            style={{ height: "150px" }}
          >
            <div className="slds-text-align_center slds-p-around_medium">
              <span
                className="slds-text-heading_large"
                style={{ color: "#b18cff", fontWeight: "bold" }}
              >
                {stats.counts.categories.toLocaleString()}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Top Films */}
      <Card
        heading="Premium Films"
        icon={<Icon category="standard" name="video" size="small" />}
        className="admin-box slds-m-bottom_large"
      >
        <div className="slds-p-around_medium">
          {stats.topFilms.length > 0 ? (
            <table className="slds-table slds-table_cell-buffer slds-table_bordered">
              <thead>
                <tr className="slds-line-height_reset">
                  <th scope="col">
                    <div className="slds-truncate" title="Title">
                      Title
                    </div>
                  </th>
                  <th scope="col">
                    <div className="slds-truncate" title="Rating">
                      Rating
                    </div>
                  </th>
                  <th scope="col">
                    <div className="slds-truncate" title="Rental Rate">
                      Rental Rate
                    </div>
                  </th>
                  <th scope="col">
                    <div className="slds-truncate" title="Replacement Cost">
                      Replacement Cost
                    </div>
                  </th>
                  <th scope="col">
                    <div className="slds-truncate" title="Length">
                      Length (min)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topFilms.map((film) => (
                  <tr key={film.film_id}>
                    <td>
                      <div className="slds-truncate" title={film.title}>
                        {film.title || "Untitled"}
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title={film.rating}>
                        {film.rating || "Unrated"}
                      </div>
                    </td>
                    <td>
                      <div
                        className="slds-truncate"
                        title={`$${film.rental_rate}`}
                      >
                        ${film.rental_rate?.toFixed(2) || "0.00"}
                      </div>
                    </td>
                    <td>
                      <div
                        className="slds-truncate"
                        title={`$${film.replacement_cost}`}
                      >
                        ${film.replacement_cost?.toFixed(2) || "0.00"}
                      </div>
                    </td>
                    <td>
                      <div
                        className="slds-truncate"
                        title={`${film.length} min`}
                      >
                        {film.length || "N/A"} min
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="slds-text-align_center slds-p-around_medium slds-text-color_weak">
              No films found.
            </div>
          )}
        </div>
      </Card>

      {/* Film Categories */}
      <Card
        heading="Film by Category"
        icon={<Icon category="standard" name="product_item" size="small" />}
        className="admin-box slds-m-bottom_large"
      >
        <div className="slds-p-around_medium">
          <div className="slds-grid slds-gutters slds-wrap">
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
              <table className="slds-table slds-table_cell-buffer slds-table_bordered">
                <thead>
                  <tr className="slds-line-height_reset">
                    <th scope="col">
                      <div className="slds-truncate" title="Category">
                        Category
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate" title="Film Count">
                        Film Count
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Action">
                        Action
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="64">
                        64
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Animation">
                        Animation
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="66">
                        66
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Children">
                        Children
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="60">
                        60
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Classics">
                        Classics
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="57">
                        57
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Comedy">
                        Comedy
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="58">
                        58
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2">
              <table className="slds-table slds-table_cell-buffer slds-table_bordered">
                <thead>
                  <tr className="slds-line-height_reset">
                    <th scope="col">
                      <div className="slds-truncate" title="Category">
                        Category
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-truncate" title="Film Count">
                        Film Count
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Documentary">
                        Documentary
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="68">
                        68
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Drama">
                        Drama
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="62">
                        62
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Family">
                        Family
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="69">
                        69
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Foreign">
                        Foreign
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="73">
                        73
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="slds-truncate" title="Games">
                        Games
                      </div>
                    </td>
                    <td>
                      <div className="slds-truncate" title="61">
                        61
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity - Recent Rentals */}
      <Card
        heading="Recent Rentals"
        icon={
          <Icon category="standard" name="service_appointment" size="small" />
        }
        className="admin-box"
      >
        <div className="slds-p-around_medium">
          <div className="slds-timeline">
            <ul>
              <li>
                <div className="slds-timeline__item_expandable">
                  <div className="slds-media">
                    <div className="slds-media__figure">
                      <div className="slds-icon_container slds-icon-standard-event">
                        <Icon
                          category="standard"
                          name="service_appointment"
                          size="small"
                          className="slds-icon"
                        />
                      </div>
                    </div>
                    <div className="slds-media__body">
                      <div className="slds-grid slds-grid_align-spread">
                        <p
                          className="slds-text-heading_small"
                          style={{ color: "#f4f4f6" }}
                        >
                          Film Rental: CHAMBER ITALIAN
                        </p>
                        <p className="slds-timeline__date">Today</p>
                      </div>
                      <p
                        className="slds-m-top_x-small"
                        style={{ color: "#b18cff" }}
                      >
                        Customer: MARY SMITH
                      </p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="slds-timeline__item_expandable">
                  <div className="slds-media">
                    <div className="slds-media__figure">
                      <div className="slds-icon_container slds-icon-standard-event">
                        <Icon
                          category="standard"
                          name="service_appointment"
                          size="small"
                          className="slds-icon"
                        />
                      </div>
                    </div>
                    <div className="slds-media__body">
                      <div className="slds-grid slds-grid_align-spread">
                        <p
                          className="slds-text-heading_small"
                          style={{ color: "#f4f4f6" }}
                        >
                          Film Rental: OKLAHOMA JUMANJI
                        </p>
                        <p className="slds-timeline__date">Yesterday</p>
                      </div>
                      <p
                        className="slds-m-top_x-small"
                        style={{ color: "#b18cff" }}
                      >
                        Customer: JOHN DOE
                      </p>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="slds-timeline__item_expandable">
                  <div className="slds-media">
                    <div className="slds-media__figure">
                      <div className="slds-icon_container slds-icon-standard-event">
                        <Icon
                          category="standard"
                          name="return_order"
                          size="small"
                          className="slds-icon"
                        />
                      </div>
                    </div>
                    <div className="slds-media__body">
                      <div className="slds-grid slds_grid_align-spread">
                        <p
                          className="slds-text-heading_small"
                          style={{ color: "#f4f4f6" }}
                        >
                          Film Return: GOODFELLAS SALUTE
                        </p>
                        <p className="slds-timeline__date">2 days ago</p>
                      </div>
                      <p
                        className="slds-m-top_x-small"
                        style={{ color: "#b18cff" }}
                      >
                        Customer: JENNIFER DAVIS
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
