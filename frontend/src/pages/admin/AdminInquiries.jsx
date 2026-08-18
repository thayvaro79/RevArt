import { useEffect, useMemo, useState } from "react";
import { getInquiries, updateInquiryStatus } from "../../api/inquiriesApi";

const STATUS_OPTIONS = ["New", "Contacted", "FollowUpDue", "Closed"];

function normalize(value) {
  return String(value || "").toLowerCase();
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    async function loadInquiries() {
      try {
        const data = await getInquiries();
        setInquiries(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load inquiries:", err);
        setError("Couldn't load inquiries.");
      } finally {
        setLoading(false);
      }
    }

    loadInquiries();
  }, []);

  const filtered = useMemo(() => {
    if (!statusFilter) return inquiries;
    return inquiries.filter(
      (i) => normalize(i.status) === normalize(statusFilter)
    );
  }, [inquiries, statusFilter]);

  async function handleStatusChange(inquiry, status) {
    setSavingId(inquiry.id);
    const previous = inquiry.status;

    setInquiries((current) =>
      current.map((i) => (i.id === inquiry.id ? { ...i, status } : i))
    );

    try {
      await updateInquiryStatus(inquiry.id, status);
    } catch (err) {
      console.error("Failed to update inquiry status:", err);
      setInquiries((current) =>
        current.map((i) => (i.id === inquiry.id ? { ...i, status: previous } : i))
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-inquiries">
      <div className="admin-page-heading admin-page-heading--row">
        <div>
          <h1>Inquiries</h1>
          <p>{inquiries.length} total inquiries</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="admin-status-select"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      {loading ? (
        <p className="admin-empty-state">Loading inquiries…</p>
      ) : filtered.length === 0 ? (
        <p className="admin-empty-state">No inquiries match.</p>
      ) : (
        <ul className="admin-inquiry-list">
          {filtered.map((inquiry) => (
            <li key={inquiry.id} className="admin-inquiry-card">
              <div className="admin-inquiry-card-main">
                <p className="admin-table-title">
                  {inquiry.firstName} {inquiry.lastName}
                </p>
                <p className="admin-table-sub">
                  {inquiry.email}
                  {inquiry.phone ? ` · ${inquiry.phone}` : ""}
                </p>
                <p className="admin-inquiry-message">{inquiry.message}</p>
                <p className="admin-table-sub">
                  {inquiry.vehicleSlug ? (
                    <a
                      href={`/garage/${inquiry.vehicleSlug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {inquiry.vehicleTitle}
                    </a>
                  ) : (
                    inquiry.sourcePage
                  )}
                  {" · "}
                  {formatDate(inquiry.createdAt)}
                </p>
              </div>

              <select
                className={`admin-status-pill admin-status-${normalize(
                  inquiry.status
                )} admin-status-pill-select`}
                value={inquiry.status}
                disabled={savingId === inquiry.id}
                onChange={(event) =>
                  handleStatusChange(inquiry, event.target.value)
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
