import { useEffect, useState } from "react";
import { getPageSections } from "../api/pageSectionsApi";
import { getLocations } from "../api/locationsApi";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import LocationCard from "../components/whoweare/LocationCard";
import ServicesAccordion from "../components/whatwedo/ServicesAccordion";
import "../styles/WhoWeAre.css";
import "../styles/WhatWeDo.css";

// Temporary MVP placeholder stats — original RevArt labels/numbers, not
// backed by a database entity yet. Replace with real figures (and move to
// a database-driven model if this needs to become editable) in a later pass.
const STATS = [
  { value: "10+", label: "Years Combined Experience" },
  { value: "100%", label: "Vehicles Personally Inspected" },
  { value: "2", label: "Locations Nationwide" },
  { value: "1:1", label: "Direct Client Communication" },
];

function findSection(sections, key) {
  return sections.find((section) => section.sectionKey === key);
}

export default function WhatWeDo() {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getPageSections("WhatWeDo");
        setSections(data || []);
      } catch (error) {
        console.error("Failed to load What We Do page sections:", error);
      } finally {
        setLoadingSections(false);
      }
    }

    loadSections();
  }, []);

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await getLocations();
        setLocations(data || []);
      } catch (error) {
        console.error("Failed to load locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    }

    loadLocations();
  }, []);

  const approachSection = findSection(sections, "approach");
  const commitmentSection = findSection(sections, "commitment");

  const serviceItems = sections
    .filter((section) => section.sectionKey?.startsWith("service-"))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <Header />
      <PageHero
        pageKey="whatwedo"
        title="WHAT WE DO"
        fallbackImage="/images/garage_hero.jpg"
      />

      <main className="whoweare-page">
        {!loadingSections && (approachSection || serviceItems.length > 0) && (
          <section className="wwd-split-section">
            {approachSection && (
              <div className="wwd-split-copy">
                <h2>{approachSection.heading}</h2>
                <p>{approachSection.body}</p>
              </div>
            )}

            <ServicesAccordion items={serviceItems} />
          </section>
        )}

        <section className="stat-section">
          <div className="stat-section-eyebrow">By The Numbers</div>
          <div className="stat-row">
            {STATS.map((stat) => (
              <div className="stat-item" key={stat.label}>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {!loadingSections && commitmentSection && (
          <section className="brand-story-section">
            <h2>{commitmentSection.heading}</h2>
            <p>{commitmentSection.body}</p>
          </section>
        )}

        <section className="whoweare-section">
          <div className="section-heading">
            <h2>Our Locations</h2>
          </div>

          {loadingLocations ? (
            <p className="inventory-loading">Loading locations...</p>
          ) : locations.length === 0 ? (
            <p className="inventory-loading">
              Location information coming soon.
            </p>
          ) : (
            <div className="person-card-grid wwd-locations-grid">
              {locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </section>

        <InquirySection
          heading="LET'S CONNECT"
          description="Fill out the form, or reach out directly. We look forward to hearing from you."
          sourcePage="WhatWeDo"
        />

        <Footer />
      </main>
    </>
  );
}
