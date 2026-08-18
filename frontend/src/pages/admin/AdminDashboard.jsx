import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVehicles } from "../../api/vehiclesApi";
import { getInquiries } from "../../api/inquiriesApi";
import { DashboardIcon, VehiclesIcon, InquiriesIcon } from "../../components/admin/icons";

function normalize(value) {
  return String(value || "").toLowerCase();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [vehicleData, inquiryData] = await Promise.all([
          getVehicles(),
          getInquiries(),
        ]);

        if (cancelled) return;

        setVehicles(vehicleData || []);
        setInquiries(inquiryData || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        if (!cancelled) setError("Some dashboard data couldn't be loaded.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const comingSoonCount = vehicles.filter(
    (v) => normalize(v.status) === "comingsoon"
  ).length;
  const draftCount = vehicles.filter(
    (v) => normalize(v.status) === "draft"
  ).length;

  const metrics = [
    { label: "Vehicles", value: vehicles.length, icon: VehiclesIcon, to: "/admin/vehicles" },
    { label: "Inquiries", value: inquiries.length, icon: InquiriesIcon, to: "/admin/inquiries" },
    { label: "Coming Soon", value: comingSoonCount, icon: DashboardIcon, to: "/admin/vehicles?status=ComingSoon" },
    { label: "Drafts", value: draftCount, icon: DashboardIcon, to: "/admin/vehicles?status=Draft" },
  ];

  const recentVehicles = vehicles.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <h1>Dashboard</h1>
        <p>An overview of your inventory and inbound interest.</p>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      <div className="admin-metric-grid">
        {metrics.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="admin-metric-card">
            <span className="admin-metric-icon">
              <Icon />
            </span>
            <span className="admin-metric-value">
              {loading ? "—" : value}
            </span>
            <span className="admin-metric-label">{label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-dashboard-columns">
        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent Vehicles</h2>
            <Link to="/admin/vehicles">View all</Link>
          </div>

          {loading ? (
            <p className="admin-empty-state">Loading…</p>
          ) : recentVehicles.length === 0 ? (
            <p className="admin-empty-state">No vehicles yet.</p>
          ) : (
            <ul className="admin-recent-list">
              {recentVehicles.map((vehicle) => (
                <li key={vehicle.id} className="admin-recent-row">
                  <div className="admin-recent-thumb">
                    {vehicle.imageUrl ? (
                      <img src={vehicle.imageUrl} alt="" />
                    ) : (
                      <VehiclesIcon />
                    )}
                  </div>
                  <div className="admin-recent-main">
                    <p className="admin-recent-title">
                      {vehicle.year} {vehicle.manufacturerName} {vehicle.model}
                    </p>
                    <p className="admin-recent-sub">
                      {formatPrice(vehicle.price)}
                    </p>
                  </div>
                  <span className={`admin-status-pill admin-status-${normalize(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>Recent Inquiries</h2>
            <Link to="/admin/inquiries">View all</Link>
          </div>

          {loading ? (
            <p className="admin-empty-state">Loading…</p>
          ) : recentInquiries.length === 0 ? (
            <p className="admin-empty-state">No inquiries yet.</p>
          ) : (
            <ul className="admin-recent-list">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id} className="admin-recent-row">
                  <div className="admin-recent-main">
                    <p className="admin-recent-title">
                      {inquiry.firstName} {inquiry.lastName}
                    </p>
                    <p className="admin-recent-sub">
                      {inquiry.vehicleTitle || inquiry.sourcePage} ·{" "}
                      {formatDate(inquiry.createdAt)}
                    </p>
                  </div>
                  <span className={`admin-status-pill admin-status-${normalize(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
