import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import QuickAddSheet from "../components/admin/QuickAddSheet";
import { useAuth } from "../context/AuthContext";
import {
  DashboardIcon,
  VehiclesIcon,
  InquiriesIcon,
  ContentIcon,
  LocationsIcon,
  TeamMembersIcon,
  UsersIcon,
  SettingsIcon,
  PlusIcon,
  MoreIcon,
  CloseIcon,
  LogoutIcon,
} from "../components/admin/icons";
import "../styles/Admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/admin/vehicles", label: "Vehicles", icon: VehiclesIcon },
  { to: "/admin/inquiries", label: "Inquiries", icon: InquiriesIcon },
  { to: "/admin/content", label: "Content", icon: ContentIcon },
  { to: "/admin/locations", label: "Locations", icon: LocationsIcon },
  { to: "/admin/team-members", label: "Team Members", icon: TeamMembersIcon },
  { to: "/admin/users", label: "Users", icon: UsersIcon, role: "Admin" },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { user, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS.filter((item) => !item.role || hasRole(item.role));

  const mobilePrimary = navItems.slice(0, 2);
  const mobileSecondary = navItems.slice(2, 3);
  const mobileMore = navItems.slice(3);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-sidebar-logo">
          REVART
          <span>ADMIN</span>
        </Link>

        <button
          type="button"
          className="admin-quick-add-btn"
          onClick={() => setQuickAddOpen(true)}
        >
          <PlusIcon />
          Add Vehicle
        </button>

        <nav className="admin-sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-sidebar-link${isActive ? " admin-sidebar-link-active" : ""}`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-account">
          {user && <p className="admin-sidebar-account-email">{user.email}</p>}
          <button
            type="button"
            className="admin-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogoutIcon />
            Log out
          </button>
        </div>

        <Link to="/" className="admin-sidebar-exit">
          ‹ Back to site
        </Link>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Link to="/admin" className="admin-topbar-logo">
            REVART <span>ADMIN</span>
          </Link>
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-topbar-logout-btn"
              onClick={handleLogout}
            >
              <LogoutIcon />
              Log out
            </button>
            <Link to="/" className="admin-topbar-exit">
              Exit
            </Link>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <nav className="admin-bottom-nav">
        {mobilePrimary.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `admin-bottom-link${isActive ? " admin-bottom-link-active" : ""}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className="admin-bottom-add-btn"
          onClick={() => setQuickAddOpen(true)}
          aria-label="Add vehicle"
        >
          <PlusIcon />
        </button>

        {mobileSecondary.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `admin-bottom-link${isActive ? " admin-bottom-link-active" : ""}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className={`admin-bottom-link admin-bottom-more-btn${
            moreOpen ? " admin-bottom-link-active" : ""
          }`}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <MoreIcon />
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="admin-more-overlay" onClick={() => setMoreOpen(false)}>
          <div
            className="admin-more-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="quick-add-sheet-header">
              <p className="quick-add-sheet-title">More</p>
              <button
                type="button"
                className="quick-add-sheet-close"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            {mobileMore.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="admin-more-link"
                onClick={() => setMoreOpen(false)}
              >
                <Icon />
                {label}
              </Link>
            ))}
            <button
              type="button"
              className="admin-more-link"
              onClick={() => {
                setMoreOpen(false);
                handleLogout();
              }}
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        </div>
      )}

      {quickAddOpen && (
        <QuickAddSheet onClose={() => setQuickAddOpen(false)} />
      )}
    </div>
  );
}
