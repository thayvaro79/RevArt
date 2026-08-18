import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import QuickAddSheet from "../components/admin/QuickAddSheet";
import {
  DashboardIcon,
  VehiclesIcon,
  InquiriesIcon,
  ContentIcon,
  SettingsIcon,
  PlusIcon,
  MoreIcon,
  CloseIcon,
} from "../components/admin/icons";
import "../styles/Admin.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/admin/vehicles", label: "Vehicles", icon: VehiclesIcon },
  { to: "/admin/inquiries", label: "Inquiries", icon: InquiriesIcon },
  { to: "/admin/content", label: "Content", icon: ContentIcon },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_PRIMARY = [NAV_ITEMS[0], NAV_ITEMS[1]];
const MOBILE_SECONDARY = [NAV_ITEMS[2]];
const MOBILE_MORE = [NAV_ITEMS[3], NAV_ITEMS[4]];

export default function AdminLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

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
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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

        <Link to="/" className="admin-sidebar-exit">
          ‹ Back to site
        </Link>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <Link to="/admin" className="admin-topbar-logo">
            REVART <span>ADMIN</span>
          </Link>
          <Link to="/" className="admin-topbar-exit">
            Exit
          </Link>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <nav className="admin-bottom-nav">
        {MOBILE_PRIMARY.map(({ to, label, icon: Icon, end }) => (
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

        {MOBILE_SECONDARY.map(({ to, label, icon: Icon }) => (
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
            {MOBILE_MORE.map(({ to, label, icon: Icon }) => (
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
          </div>
        </div>
      )}

      {quickAddOpen && (
        <QuickAddSheet onClose={() => setQuickAddOpen(false)} />
      )}
    </div>
  );
}
