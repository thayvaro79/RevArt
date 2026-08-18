const CONTENT_AREAS = [
  { label: "Home", path: "/" },
  { label: "The Garage", path: "/garage" },
  { label: "Sold", path: "/sold" },
  { label: "Who We Are", path: "/whoweare" },
  { label: "What We Do", path: "/whatwedo" },
  { label: "Contact", path: "/contact" },
];

export default function AdminContent() {
  return (
    <div className="admin-content-page">
      <div className="admin-page-heading">
        <h1>Content</h1>
        <p>Site pages and where they live. Editing tools for hero copy and page sections are coming soon.</p>
      </div>

      <div className="admin-panel">
        <ul className="admin-content-list">
          {CONTENT_AREAS.map((area) => (
            <li key={area.path} className="admin-content-row">
              <span>{area.label}</span>
              <a href={area.path} target="_blank" rel="noreferrer">
                View page ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
