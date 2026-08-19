import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLocationsAdmin, setLocationActive } from "../../api/locationsApi";
import { PlusIcon } from "../../components/admin/icons";

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadLocations();

    async function loadLocations() {
      setLoading(true);
      try {
        const data = await getLocationsAdmin();
        setLocations(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load locations:", err);
        setError("Couldn't load locations.");
      } finally {
        setLoading(false);
      }
    }
  }, []);

  async function handleToggleActive(location) {
    setSavingId(location.id);
    const nextActive = !location.isActive;

    setLocations((current) =>
      current.map((l) =>
        l.id === location.id ? { ...l, isActive: nextActive } : l
      )
    );

    try {
      await setLocationActive(location.id, nextActive);
    } catch (err) {
      console.error("Failed to update location status:", err);
      setLocations((current) =>
        current.map((l) =>
          l.id === location.id ? { ...l, isActive: location.isActive } : l
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-locations">
      <div className="admin-page-heading admin-page-heading--row">
        <div>
          <h1>Locations</h1>
          <p>{locations.length} total locations</p>
        </div>
        <Link to="/admin/locations/new" className="admin-primary-btn">
          <PlusIcon />
          Add Location
        </Link>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      {loading ? (
        <p className="admin-empty-state">Loading locations…</p>
      ) : locations.length === 0 ? (
        <p className="admin-empty-state">No locations yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City / State</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Primary</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>
                    <p className="admin-table-title">{location.name}</p>
                  </td>
                  <td>
                    {[location.city, location.state]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td>{location.phone || "—"}</td>
                  <td>{location.email || "—"}</td>
                  <td>{location.isPrimary ? "Yes" : "—"}</td>
                  <td>
                    <span
                      className={`admin-status-pill admin-status-${
                        location.isActive ? "available" : "inactive"
                      }`}
                    >
                      {location.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        to={`/admin/locations/${location.id}/edit`}
                        className="admin-table-link"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-table-link"
                        disabled={savingId === location.id}
                        onClick={() => handleToggleActive(location)}
                      >
                        {location.isActive ? "Deactivate" : "Activate"}
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
