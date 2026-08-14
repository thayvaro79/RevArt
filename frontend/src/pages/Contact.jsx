import { useEffect, useState } from "react";
import { getPageSections } from "../api/pageSectionsApi";
import { getLocations } from "../api/locationsApi";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import LocationCard from "../components/whoweare/LocationCard";
import "../styles/WhoWeAre.css";

function findSection(sections, key) {
  return sections.find((section) => section.sectionKey === key);
}

export default function Contact() {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getPageSections("Contact");
        setSections(data || []);
      } catch (error) {
        console.error("Failed to load Contact page sections:", error);
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

  const introSection = findSection(sections, "intro");

  return (
    <>
      <Header />
      <PageHero
        pageKey="contact"
        title="CONTACT US"
        fallbackImage="/images/garage_hero.jpg"
      />

      <main className="whoweare-page">
        {!loadingSections && introSection && (
          <section className="brand-story-section">
            <h2>{introSection.heading}</h2>
            <p>{introSection.body}</p>
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
            <div className="person-card-grid">
              {locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </section>

        <InquirySection
          heading="GET IN TOUCH"
          description="Fill out the form, or reach out directly. We look forward to hearing from you."
          sourcePage="Contact"
        />

        <Footer />
      </main>
    </>
  );
}
