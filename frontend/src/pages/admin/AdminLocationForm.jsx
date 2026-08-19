import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createLocation,
  getLocationByIdAdmin,
  updateLocation,
} from "../../api/locationsApi";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY_FORM = {
  name: "",
  slug: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  email: "",
  isPrimary: false,
  isActive: true,
};

export default function AdminLocationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;

    let active = true;

    async function loadLocation() {
      setLoading(true);
      try {
        const data = await getLocationByIdAdmin(id);
        if (!active) return;

        setForm({
          name: data.name || "",
          slug: data.slug || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "",
          phone: data.phone || "",
          email: data.email || "",
          isPrimary: Boolean(data.isPrimary),
          isActive: Boolean(data.isActive),
        });
        setSlugTouched(true);
        setError(null);
      } catch (err) {
        console.error("Failed to load location:", err);
        setError("Couldn't load this location.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLocation();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "name" && !slugTouched) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      tenantId: 1,
      name: form.name,
      slug: form.slug || slugify(form.name),
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
      phone: form.phone || null,
      email: form.email || null,
      isPrimary: form.isPrimary,
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        await updateLocation(id, payload);
      } else {
        await createLocation(payload);
      }
      navigate("/admin/locations");
    } catch (err) {
      console.error("Failed to save location:", err);
      const message =
        err.response?.status === 400 && typeof err.response?.data === "string"
          ? err.response.data
          : "Couldn't save this location. Check the fields and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-location-form">
      <div className="admin-page-heading">
        <h1>{isEdit ? "Edit Location" : "Add Location"}</h1>
        <p>Manage location details shown on the public site.</p>
      </div>

      {loading ? (
        <p className="admin-empty-state">Loading location…</p>
      ) : (
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">
              <span>Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="RevArt Garage — Downtown"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span>Slug</span>
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  updateField("slug", slugify(event.target.value));
                }}
                placeholder="downtown"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span>Address Line 1</span>
              <input
                value={form.addressLine1}
                onChange={(event) =>
                  updateField("addressLine1", event.target.value)
                }
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span>Address Line 2</span>
              <input
                value={form.addressLine2}
                onChange={(event) =>
                  updateField("addressLine2", event.target.value)
                }
              />
            </label>

            <label className="admin-field">
              <span>City</span>
              <input
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>State</span>
              <input
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Postal Code</span>
              <input
                value={form.postalCode}
                onChange={(event) =>
                  updateField("postalCode", event.target.value)
                }
              />
            </label>

            <label className="admin-field">
              <span>Country</span>
              <input
                value={form.country}
                onChange={(event) =>
                  updateField("country", event.target.value)
                }
              />
            </label>

            <label className="admin-field">
              <span>Phone</span>
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>

            <label className="admin-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
            </label>

            <label className="admin-field admin-field--checkbox">
              <input
                type="checkbox"
                checked={form.isPrimary}
                onChange={(event) =>
                  updateField("isPrimary", event.target.checked)
                }
              />
              <span>Primary location</span>
            </label>

            <label className="admin-field admin-field--checkbox">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
              />
              <span>Active (visible on the public site)</span>
            </label>
          </div>

          {error && <p className="admin-error-banner">{error}</p>}

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => navigate("/admin/locations")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-primary-btn"
              disabled={submitting}
            >
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Location"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
