import { useEffect, useState } from "react";
import { getVehicles } from "../api/vehiclesApi";
import { getPageSections } from "../api/pageSectionsApi";
import VehicleCard from "../components/vehicles/VehicleCard";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import "../styles/Sold.css";

const DEFAULT_OPEN_SECTION_KEY = "accordion-looking-to-buy";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

export default function Sold() {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await getVehicles();
        setVehicles(data || []);
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        setLoadingVehicles(false);
      }
    }

    loadVehicles();
  }, []);

  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getPageSections("Sold");
        setSections(data || []);
      } catch (error) {
        console.error("Failed to load Sold page sections:", error);
      } finally {
        setLoadingSections(false);
      }
    }

    loadSections();
  }, []);

  const soldVehicles = vehicles.filter(
    (vehicle) => normalize(vehicle.status) === "sold"
  );

  const missionSection = sections.find(
    (section) => section.sectionKey === "mission"
  );

  const accordionItems = sections
    .filter((section) => section.sectionKey?.startsWith("accordion-"))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <Header />
      <PageHero
        pageKey="sold"
        title="SOLD"
        fallbackImage="/images/garage_hero.jpg"
      />

      <main className="garage-page" id="inventory">
        {!loadingSections && (missionSection || accordionItems.length > 0) && (
          <SoldMissionSection
            mission={missionSection}
            accordionItems={accordionItems}
          />
        )}

        <section className="inventory-section">
          <div className="section-heading">
            <p className="eyebrow">SOLD</p>
            <h2>Recently Sold</h2>
          </div>

          {loadingVehicles ? (
            <p className="inventory-loading">Loading inventory...</p>
          ) : soldVehicles.length === 0 ? (
            <p className="inventory-loading">No sold vehicles to show yet.</p>
          ) : (
            <div className="vehicle-grid">
              {soldVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </section>

        <InquirySection />
        <Footer />
      </main>
    </>
  );
}

function SoldMissionSection({ mission, accordionItems }) {
  const initialOpenKey =
    accordionItems.find((item) => item.sectionKey === DEFAULT_OPEN_SECTION_KEY)
      ?.sectionKey || accordionItems[0]?.sectionKey;

  const [openKey, setOpenKey] = useState(initialOpenKey);

  return (
    <section className="sold-mission-section">
      {mission && (
        <div className="sold-mission-copy">
          <h2>{mission.heading}</h2>
          <p>{mission.body}</p>
        </div>
      )}

      {accordionItems.length > 0 && (
        <div className="sold-accordion">
          {accordionItems.map((item) => {
            const isOpen = item.sectionKey === openKey;

            return (
              <div
                key={item.sectionKey}
                className={`sold-accordion-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="sold-accordion-toggle"
                  onClick={() => setOpenKey(isOpen ? null : item.sectionKey)}
                  aria-expanded={isOpen}
                >
                  <span>{item.heading}</span>
                  <span className="sold-accordion-icon">⌄</span>
                </button>

                {isOpen && <p className="sold-accordion-body">{item.body}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
