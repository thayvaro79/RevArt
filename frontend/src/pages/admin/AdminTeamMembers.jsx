import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getTeamMembersAdmin,
  setTeamMemberActive,
} from "../../api/teamMembersApi";
import { PlusIcon } from "../../components/admin/icons";

export default function AdminTeamMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadMembers();

    async function loadMembers() {
      setLoading(true);
      try {
        const data = await getTeamMembersAdmin();
        setMembers(data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to load team members:", err);
        setError("Couldn't load team members.");
      } finally {
        setLoading(false);
      }
    }
  }, []);

  async function handleToggleActive(member) {
    setSavingId(member.id);
    const nextActive = !member.isActive;

    setMembers((current) =>
      current.map((m) =>
        m.id === member.id ? { ...m, isActive: nextActive } : m
      )
    );

    try {
      await setTeamMemberActive(member.id, nextActive);
    } catch (err) {
      console.error("Failed to update team member status:", err);
      setMembers((current) =>
        current.map((m) =>
          m.id === member.id ? { ...m, isActive: member.isActive } : m
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-team-members">
      <div className="admin-page-heading admin-page-heading--row">
        <div>
          <h1>Team Members</h1>
          <p>{members.length} total team members</p>
        </div>
        <Link to="/admin/team-members/new" className="admin-primary-btn">
          <PlusIcon />
          Add Team Member
        </Link>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      {loading ? (
        <p className="admin-empty-state">Loading team members…</p>
      ) : members.length === 0 ? (
        <p className="admin-empty-state">No team members yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Title</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="admin-recent-thumb admin-table-thumb">
                      {member.photoUrl && <img src={member.photoUrl} alt="" />}
                    </div>
                  </td>
                  <td>
                    <p className="admin-table-title">{member.name}</p>
                  </td>
                  <td>{member.title || "—"}</td>
                  <td>{member.sortOrder}</td>
                  <td>
                    <span
                      className={`admin-status-pill admin-status-${
                        member.isActive ? "available" : "inactive"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <Link
                        to={`/admin/team-members/${member.id}/edit`}
                        className="admin-table-link"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-table-link"
                        disabled={savingId === member.id}
                        onClick={() => handleToggleActive(member)}
                      >
                        {member.isActive ? "Deactivate" : "Activate"}
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
