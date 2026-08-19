import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPageSections } from "../../api/pageSectionsApi";
import { CONTENT_PAGES } from "../../constants/contentPages";
import HeroEditorCard from "../../components/admin/HeroEditorCard";
import SectionEditorCard from "../../components/admin/SectionEditorCard";

export default function AdminContentEditor() {
  const { slug } = useParams();
  const config = CONTENT_PAGES[slug];

  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    if (!config) return;

    let active = true;

    async function loadSections() {
      setLoadingSections(true);

      try {
        const data = await getPageSections(config.sectionPageName);
        if (active) setSections(data || []);
      } catch (error) {
        console.error(
          `Failed to load ${config.sectionPageName} sections:`,
          error
        );
      } finally {
        if (active) setLoadingSections(false);
      }
    }

    loadSections();

    return () => {
      active = false;
    };
  }, [config]);

  if (!config) {
    return (
      <div className="admin-content-page">
        <div className="admin-page-heading">
          <h1>Page not found</h1>
          <p>This isn't one of the predefined RevArt content pages.</p>
        </div>
        <Link className="admin-secondary-btn" to="/admin/content">
          ‹ Back to Content
        </Link>
      </div>
    );
  }

  function findSection(key) {
    return sections.find((section) => section.sectionKey === key);
  }

  return (
    <div className="admin-content-page">
      <div className="admin-page-heading admin-page-heading--row">
        <div>
          <Link className="admin-content-editor-back" to="/admin/content">
            ‹ Content
          </Link>
          <h1>{config.label}</h1>
          <p>Edit the hero and predefined sections for this page.</p>
        </div>

        <a
          className="admin-secondary-btn"
          href={config.publicPath}
          target="_blank"
          rel="noreferrer"
        >
          View Live Page ↗
        </a>
      </div>

      <div className="admin-editor-stack">
        <HeroEditorCard heroPageKey={config.heroPageKey} />

        {!loadingSections &&
          config.sections.map((section) => (
            <SectionEditorCard
              key={section.key}
              pageName={config.sectionPageName}
              sectionKey={section.key}
              label={section.label}
              fields={section.fields}
              initialSection={findSection(section.key)}
              folder={`${slug}/${section.key}`}
            />
          ))}

        {!loadingSections && config.cards.length > 0 && (
          <div className="admin-form-card admin-editor-card">
            <h2>Visual Navigation Cards</h2>
            <p className="admin-field-hint">
              Card destinations are fixed by the site — only the title and
              image are editable here.
            </p>

            <div className="admin-card-editor-grid">
              {config.cards.map((card) => (
                <SectionEditorCard
                  key={card.key}
                  pageName={config.sectionPageName}
                  sectionKey={card.key}
                  label={card.label}
                  fields={card.fields}
                  initialSection={findSection(card.key)}
                  folder={`${slug}/${card.key}`}
                  destinationHint={card.destination}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
