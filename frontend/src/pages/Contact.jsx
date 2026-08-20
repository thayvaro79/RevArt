import { useEffect, useState } from "react";
import { getPageSections } from "../api/pageSectionsApi";
import { getLocations, getLocationBySlug } from "../api/locationsApi";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import LocationContactRow from "../components/contact/LocationContactRow";
import "../styles/WhoWeAre.css";
import "../styles/Contact.css";

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
    // Fetching full per-location detail (incl. photos) for each of the
    // (currently only 2) locations. Revisit with a batched list endpoint
    // if the number of locations grows materially.
    async function loadLocations() {
      try {
        const summaries = await getLocations();
        const details = await Promise.all(
          (summaries || []).map((summary) => getLocationBySlug(summary.slug))
        );
        setLocations(details);
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
            <div className="contact-locations">
              {locations.map((location) => (
                <LocationContactRow key={location.id} location={location} />
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
