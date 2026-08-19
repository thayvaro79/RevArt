import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUser, getUser, updateUser } from "../../api/usersApi";
import { getTeamMembersAdmin } from "../../api/teamMembersApi";
import { useAuth } from "../../context/AuthContext";

const EMPTY_FORM = {
  email: "",
  password: "",
  displayName: "",
  role: "Editor",
  isActive: true,
  teamMemberMode: "None",
  teamMemberId: "",
  newTeamMember: {
    name: "",
    title: "",
    bio: "",
    photoUrl: "",
    sortOrder: 0,
  },
};

export default function AdminUserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(id);
  const isSelf = isEdit && currentUser?.id === Number(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadTeamMembers() {
      try {
        const data = await getTeamMembersAdmin();
        if (active) setTeamMembers(data || []);
      } catch (err) {
        console.error("Failed to load team members:", err);
      }
    }

    loadTeamMembers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    let active = true;

    async function loadUser() {
      setLoading(true);
      try {
        const data = await getUser(id);
        if (!active) return;

        setForm({
          email: data.email || "",
          password: "",
          displayName: data.displayName || "",
          role: data.roles?.[0] || "Editor",
          isActive: Boolean(data.isActive),
          teamMemberMode: data.teamMemberId ? "Link" : "None",
          teamMemberId: data.teamMemberId ? String(data.teamMemberId) : "",
          newTeamMember: EMPTY_FORM.newTeamMember,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to load user:", err);
        setError("Couldn't load this user.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateNewTeamMemberField(field, value) {
    setForm((current) => ({
      ...current,
      newTeamMember: { ...current.newTeamMember, [field]: value },
    }));
  }

  function buildTeamMemberPayload() {
    return {
      teamMemberMode: form.teamMemberMode,
      teamMemberId: form.teamMemberMode === "Link" && form.teamMemberId ? Number(form.teamMemberId) : null,
      newTeamMember:
        form.teamMemberMode === "Create"
          ? {
              name: form.newTeamMember.name,
              title: form.newTeamMember.title || null,
              bio: form.newTeamMember.bio || null,
              photoUrl: form.newTeamMember.photoUrl || null,
              sortOrder: Number(form.newTeamMember.sortOrder) || 0,
            }
          : null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isEdit && (!form.email.trim() || !form.password.trim())) {
      setError("Email and an initial password are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        await updateUser(id, {
          displayName: form.displayName || null,
          roles: [form.role],
          isActive: form.isActive,
          ...buildTeamMemberPayload(),
        });
      } else {
        await createUser({
          email: form.email.trim(),
          password: form.password,
          displayName: form.displayName || null,
          roles: [form.role],
          isActive: form.isActive,
          ...buildTeamMemberPayload(),
        });
      }
      navigate("/admin/users");
    } catch (err) {
      console.error("Failed to save user:", err);
      const message =
        err.response?.status === 400 && typeof err.response?.data === "string"
          ? err.response.data
          : "Couldn't save this user. Check the fields and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-user-form">
        <p className="admin-empty-state">Loading user…</p>
      </div>
    );
  }

  return (
    <div className="admin-user-form">
      <div className="admin-page-heading">
        <h1>{isEdit ? "Edit User" : "Create User"}</h1>
        <p>
          {isEdit
            ? "Update role, active state, and team member linkage."
            : "Give a teammate access to the Admin dashboard."}
        </p>
      </div>

      <form className="admin-form-card" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Email</span>
            {isEdit ? (
              <input value={form.email} disabled readOnly />
            ) : (
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="teammate@revartgarage.com"
              />
            )}
          </label>

          {!isEdit && (
            <label className="admin-field">
              <span>Initial Password</span>
              <input
                type="text"
                required
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Temporary password"
              />
            </label>
          )}

          <label className="admin-field">
            <span>Display Name</span>
            <input
              value={form.displayName}
              onChange={(event) => updateField("displayName", event.target.value)}
            />
          </label>

          <label className="admin-field">
            <span>Role</span>
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              disabled={isSelf && form.role === "Admin"}
            >
              <option value="Admin">Admin — full access, manages users</option>
              <option value="Editor">Editor — manages vehicles, content, photos</option>
            </select>
            {isSelf && form.role === "Admin" && (
              <span className="admin-field-hint admin-field-hint--inline">
                You can't change your own Admin role here.
              </span>
            )}
          </label>

          <label className="admin-field admin-field--checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              disabled={isSelf}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            <span>Active{isSelf ? " (you can't deactivate your own account)" : ""}</span>
          </label>

          <label className="admin-field admin-field--wide">
            <span>Team Member Profile</span>
            <select
              value={form.teamMemberMode}
              onChange={(event) => updateField("teamMemberMode", event.target.value)}
            >
              <option value="None">No public team member profile</option>
              <option value="Link">Link an existing team member</option>
              <option value="Create">Create a new team member profile</option>
            </select>
          </label>

          {form.teamMemberMode === "Link" && (
            <label className="admin-field admin-field--wide">
              <span>Team Member</span>
              <select
                value={form.teamMemberId}
                onChange={(event) => updateField("teamMemberId", event.target.value)}
              >
                <option value="">Select a team member…</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {form.teamMemberMode === "Create" && (
            <>
              <label className="admin-field admin-field--wide">
                <span>Name</span>
                <input
                  required
                  value={form.newTeamMember.name}
                  onChange={(event) => updateNewTeamMemberField("name", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Title</span>
                <input
                  value={form.newTeamMember.title}
                  onChange={(event) => updateNewTeamMemberField("title", event.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Sort Order</span>
                <input
                  type="number"
                  value={form.newTeamMember.sortOrder}
                  onChange={(event) => updateNewTeamMemberField("sortOrder", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--wide">
                <span>Photo URL</span>
                <input
                  value={form.newTeamMember.photoUrl}
                  onChange={(event) => updateNewTeamMemberField("photoUrl", event.target.value)}
                />
              </label>
              <label className="admin-field admin-field--wide">
                <span>Bio</span>
                <textarea
                  rows={3}
                  value={form.newTeamMember.bio}
                  onChange={(event) => updateNewTeamMemberField("bio", event.target.value)}
                />
              </label>
            </>
          )}
        </div>

        {error && <p className="admin-error-banner">{error}</p>}

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-secondary-btn"
            onClick={() => navigate("/admin/users")}
          >
            Cancel
          </button>
          <button type="submit" className="admin-primary-btn" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
