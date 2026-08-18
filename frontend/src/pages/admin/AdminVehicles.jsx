import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getVehicles,
  deleteVehicle,
  updateVehicleStatus,
} from "../../api/vehiclesApi";
import { VEHICLE_STATUS_OPTIONS } from "../../constants/vehicleStatus";
import { VehiclesIcon, PlusIcon } from "../../components/admin/icons";

function normalize(value) {
  return String(value || "").toLowerCase();
}

function formatPrice(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [savingId, setSavingId] = useState(null);

  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setError("Couldn't load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (statusFilter && normalize(vehicle.status) !== normalize(statusFilter)) {
        return false;
      }

      if (!search.trim()) return true;

      const haystack = normalize(
        `${vehicle.title} ${vehicle.manufacturerName} ${vehicle.model} ${vehicle.year}`
      );

      return haystack.includes(normalize(search));
    });
  }, [vehicles, search, statusFilter]);

  async function handleStatusChange(vehicle, statusValue) {
    setSavingId(vehicle.id);
    const previous = vehicle.status;
    const label = VEHICLE_STATUS_OPTIONS.find(
      (o) => o.value === Number(statusValue)
    )?.label;

    setVehicles((current) =>
      current.map((v) =>
        v.id === vehicle.id ? { ...v, status: label } : v
      )
    );

    try {
      await updateVehicleStatus(vehicle.id, Number(statusValue));
    } catch (err) {
      console.error("Failed to update status:", err);
      setVehicles((current) =>
        current.map((v) =>
          v.id === vehicle.id ? { ...v, status: previous } : v
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(vehicle) {
    if (!window.confirm(`Delete "${vehicle.title}"? This cannot be undone.`)) {
      return;
    }

    setVehicles((current) => current.filter((v) => v.id !== vehicle.id));

    try {
      await deleteVehicle(vehicle.id);
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      loadVehicles();
    }
  }

  return (
    <div className="admin-vehicles">
      <div className="admin-page-heading admin-page-heading--row">
        <div>
          <h1>Vehicles</h1>
          <p>{vehicles.length} total listings</p>
        </div>
        <Link to="/admin/vehicles/new" className="admin-primary-btn">
          <PlusIcon />
          Add Vehicle
        </Link>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by title, make, model, year…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="admin-search-input"
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            const value = event.target.value;
            setSearchParams(value ? { status: value } : {});
          }}
          className="admin-status-select"
        >
          <option value="">All statuses</option>
          {VEHICLE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.label.replace(" ", "")}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      {loading ? (
        <p className="admin-empty-state">Loading vehicles…</p>
      ) : filteredVehicles.length === 0 ? (
        <p className="admin-empty-state">No vehicles match.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Vehicle</th>
                <th>Price</th>
                <th>Mileage</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <div className="admin-recent-thumb admin-table-thumb">
                      {vehicle.imageUrl ? (
                        <img src={vehicle.imageUrl} alt="" />
                      ) : (
                        <VehiclesIcon />
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="admin-table-title">
                      {vehicle.year} {vehicle.manufacturerName} {vehicle.model}
                    </p>
                    <p className="admin-table-sub">{vehicle.title}</p>
                  </td>
                  <td>{formatPrice(vehicle.price)}</td>
                  <td>
                    {vehicle.mileage != null
                      ? `${vehicle.mileage.toLocaleString()} mi`
                      : "—"}
                  </td>
                  <td>
                    <select
                      className={`admin-status-pill admin-status-${normalize(
                        vehicle.status
                      )} admin-status-pill-select`}
                      value={
                        VEHICLE_STATUS_OPTIONS.find(
                          (o) => normalize(o.label.replace(" ", "")) === normalize(vehicle.status)
                        )?.value ?? ""
                      }
                      disabled={savingId === vehicle.id}
                      onChange={(event) =>
                        handleStatusChange(vehicle, event.target.value)
                      }
                    >
                      {VEHICLE_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      {vehicle.slug && (
                        <a
                          href={`/garage/${vehicle.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-table-link"
                        >
                          View
                        </a>
                      )}
                      <button
                        type="button"
                        className="admin-table-link admin-table-link-danger"
                        onClick={() => handleDelete(vehicle)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
