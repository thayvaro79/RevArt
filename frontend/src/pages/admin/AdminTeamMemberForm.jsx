import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createTeamMember,
  getTeamMemberByIdAdmin,
  updateTeamMember,
} from "../../api/teamMembersApi";
import ImageUploadField from "../../components/admin/ImageUploadField";

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
  title: "",
  bio: "",
  photoUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminTeamMemberForm() {
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

    async function loadMember() {
      setLoading(true);
      try {
        const data = await getTeamMemberByIdAdmin(id);
        if (!active) return;

        setForm({
          name: data.name || "",
          slug: data.slug || "",
          title: data.title || "",
          bio: data.bio || "",
          photoUrl: data.photoUrl || "",
          sortOrder: data.sortOrder ?? 0,
          isActive: Boolean(data.isActive),
        });
        setSlugTouched(true);
        setError(null);
      } catch (err) {
        console.error("Failed to load team member:", err);
        setError("Couldn't load this team member.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMember();

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
      title: form.title || null,
      bio: form.bio || null,
      photoUrl: form.photoUrl || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        await updateTeamMember(id, payload);
      } else {
        await createTeamMember(payload);
      }
      navigate("/admin/team-members");
    } catch (err) {
      console.error("Failed to save team member:", err);
      const message =
        err.response?.status === 400 && typeof err.response?.data === "string"
          ? err.response.data
          : "Couldn't save this team member. Check the fields and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-team-member-form">
      <div className="admin-page-heading">
        <h1>{isEdit ? "Edit Team Member" : "Add Team Member"}</h1>
        <p>Manage team member profiles shown on the Who We Are page.</p>
      </div>

      {loading ? (
        <p className="admin-empty-state">Loading team member…</p>
      ) : (
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <ImageUploadField
            imageUrl={form.photoUrl}
            folder="team-members"
            label="Photo"
            onUploaded={(url) => updateField("photoUrl", url)}
          />

          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">
              <span>Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Jordan Rivera"
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
                placeholder="jordan-rivera"
              />
            </label>

            <label className="admin-field admin-field--wide">
              <span>Title / Role</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Master Technician"
              />
            </label>

            <label className="admin-field">
              <span>Sort Order</span>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  updateField("sortOrder", event.target.value)
                }
              />
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

            <label className="admin-field admin-field--wide">
              <span>Biography</span>
              <textarea
                rows={6}
                value={form.bio}
                onChange={(event) => updateField("bio", event.target.value)}
              />
            </label>
          </div>

          {error && <p className="admin-error-banner">{error}</p>}

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => navigate("/admin/team-members")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Saving…"
                : isEdit
                ? "Save Changes"
                : "Create Team Member"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
