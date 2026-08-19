import { Link } from "react-router-dom";
import { CONTENT_PAGES, CONTENT_PAGE_ORDER } from "../../constants/contentPages";

export default function AdminContent() {
  return (
    <div className="admin-content-page">
      <div className="admin-page-heading">
        <h1>Content</h1>
        <p>Edit hero copy, images, and predefined sections for each page.</p>
      </div>

      <div className="admin-panel">
        <ul className="admin-content-list">
          {CONTENT_PAGE_ORDER.map((slug) => {
            const page = CONTENT_PAGES[slug];

            return (
              <li key={slug} className="admin-content-row">
                <span>{page.label}</span>
                <span className="admin-content-row-actions">
                  <a href={page.publicPath} target="_blank" rel="noreferrer">
                    View live ↗
                  </a>
                  <Link
                    to={`/admin/content/${slug}`}
                    className="admin-content-edit-link"
                  >
                    Edit →
                  </Link>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
