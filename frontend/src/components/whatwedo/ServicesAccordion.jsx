import { useState } from "react";

export default function ServicesAccordion({ items }) {
  const [openKey, setOpenKey] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="services-accordion">
      {items.map((item) => {
        const isOpen = item.sectionKey === openKey;
        const toggleId = `services-toggle-${item.sectionKey}`;
        const panelId = `services-panel-${item.sectionKey}`;

        return (
          <div
            key={item.sectionKey}
            className={`services-accordion-item ${isOpen ? "open" : ""}`}
          >
            <h3 className="services-accordion-heading">
              <button
                type="button"
                id={toggleId}
                className="services-accordion-toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenKey(isOpen ? null : item.sectionKey)}
              >
                <span>{item.heading}</span>
                <span className="services-accordion-icon" aria-hidden="true">
                  ⌄
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={toggleId}
              className="services-accordion-panel"
            >
              <div className="services-accordion-panel-inner">
                <p className="services-accordion-body">{item.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
