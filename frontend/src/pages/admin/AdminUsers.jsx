import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, setUserActive } from "../../api/usersApi";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon } from "../../components/admin/icons";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadUsers();

    async function loadUsers() {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Couldn't load users.");
      } finally {
        setLoading(false);
      }
    }
  }, []);

  async function handleToggleActive(target) {
    setSavingId(target.id);
    const nextActive = !target.isActive;

    setUsers((current) =>
      current.map((u) => (u.id === target.id ? { ...u, isActive: nextActive } : u))
    );

    try {
      await setUserActive(target.id, nextActive);
    } catch (err) {
      console.error("Failed to update user status:", err);
      setUsers((current) =>
        current.map((u) => (u.id === target.id ? { ...u, isActive: target.isActive } : u))
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-users">
      <div className="admin-page-heading admin-page-heading--row">
        <div>
          <h1>Users</h1>
          <p>{users.length} admin accounts</p>
        </div>
        <Link to="/admin/users/new" className="admin-primary-btn">
          <PlusIcon />
          Create User
        </Link>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      {loading ? (
        <p className="admin-empty-state">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="admin-empty-state">No users yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Roles</th>
                <th>Team Member</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((target) => (
                <tr key={target.id}>
                  <td>
                    <p className="admin-table-title">{target.email}</p>
                    {target.displayName && (
                      <p className="admin-table-sub">{target.displayName}</p>
                    )}
                  </td>
                  <td>{target.roles.join(", ") || "—"}</td>
                  <td>{target.teamMemberName || "—"}</td>
                  <td>
                    <span
                      className={`admin-status-pill admin-status-${
                        target.isActive ? "available" : "inactive"
                      }`}
                    >
                      {target.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        to={`/admin/users/${target.id}/edit`}
                        className="admin-table-link"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-table-link"
                        disabled={savingId === target.id || target.id === currentUser?.id}
                        onClick={() => handleToggleActive(target)}
                      >
                        {target.isActive ? "Deactivate" : "Activate"}
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
