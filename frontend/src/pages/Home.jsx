import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPageSections } from "../api/pageSectionsApi";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import PromoCard from "../components/home/PromoCard";
import "../styles/Home.css";

const GARAGE_ROUTE = "/garage";
const WHO_WE_ARE_ROUTE = "/whoweare";
const WHAT_WE_DO_ROUTE = "/whatwedo";
const CONTACT_ROUTE = "/contact";
const INSTAGRAM_URL = "https://www.instagram.com/revartgarage";

const DEFAULT_OPEN_ACCORDION_KEY = "accordion-ready-to-sell";

const DEFAULT_CONTACT_DESCRIPTION =
  "Fill out the form, or reach out directly. We look forward to hearing from you.\n\nsales@revartgarage.com\n(000) 000-0000\nLocation details coming soon";

function findSection(sections, key) {
  return sections.find((section) => section.sectionKey === key);
}

export default function Home() {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getPageSections("Home");
        setSections(data || []);
      } catch (error) {
        console.error("Failed to load Home page sections:", error);
      } finally {
        setLoadingSections(false);
      }
    }

    loadSections();
  }, []);

  const introSection = findSection(sections, "intro");
  const cardGarage = findSection(sections, "card-garage");
  const cardInstagram = findSection(sections, "card-instagram");
  const missionSection = findSection(sections, "mission");
  const cardWhoWeAre = findSection(sections, "card-whoweare");
  const cardContact = findSection(sections, "card-contact");
  const contactInfoSection = findSection(sections, "contact-info");

  const accordionItems = sections
    .filter((section) => section.sectionKey?.startsWith("accordion-"))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <Header />
      <PageHero
        pageKey="home"
        title="REVART"
        fallbackImage="/images/garage_hero.jpg"
        className="home-hero"
      />

      <main className="home-page">
        {!loadingSections && introSection && (
          <HomeIntroSection intro={introSection} />
        )}

        <div className="promo-card-row">
          <PromoCard
            title={cardGarage?.heading || "THE GARAGE"}
            imageUrl={cardGarage?.imageUrl}
            fallbackImage="/images/porsche.jpg"
            to={GARAGE_ROUTE}
          />
          <PromoCard
            title={cardInstagram?.heading || "FOLLOW US"}
            imageUrl={cardInstagram?.imageUrl}
            fallbackImage="/images/bmwm3.jpg"
            href={INSTAGRAM_URL}
            icon="instagram"
          />
        </div>

        {!loadingSections && (missionSection || accordionItems.length > 0) && (
          <HomeMissionSection
            mission={missionSection}
            accordionItems={accordionItems}
          />
        )}

        <div className="promo-card-row">
          <PromoCard
            title={cardWhoWeAre?.heading || "WHO WE ARE"}
            imageUrl={cardWhoWeAre?.imageUrl}
            fallbackImage="/images/Ferrari348.jpg"
            to={WHO_WE_ARE_ROUTE}
          />
          <PromoCard
            title={cardContact?.heading || "CONTACT US"}
            imageUrl={cardContact?.imageUrl}
            fallbackImage="/images/Venturi.jpg"
            to={CONTACT_ROUTE}
          />
        </div>

        <InquirySection
          heading={contactInfoSection?.heading || "LET'S CONNECT"}
          description={contactInfoSection?.body || DEFAULT_CONTACT_DESCRIPTION}
          sourcePage="Home"
        />

        <Footer />
      </main>
    </>
  );
}

function HomeIntroSection({ intro }) {
  return (
    <section className="home-intro-section">
      <div className="home-intro-copy">
        <h2>{intro.heading}</h2>
        <p>{intro.body}</p>
        <Link className="home-cta-button" to={WHO_WE_ARE_ROUTE}>
          Meet The Team
        </Link>
      </div>

      <div className="home-intro-image">
        <img
          src={intro.imageUrl || "/images/prosche1977.jpg"}
          alt={intro.heading || "The RevArt team"}
        />
      </div>
    </section>
  );
}

function HomeMissionSection({ mission, accordionItems }) {
  const initialOpenKey =
    accordionItems.find(
      (item) => item.sectionKey === DEFAULT_OPEN_ACCORDION_KEY
    )?.sectionKey || accordionItems[0]?.sectionKey;

  const [openKey, setOpenKey] = useState(initialOpenKey);

  return (
    <section className="home-mission-section">
      {mission && (
        <div className="home-mission-copy">
          <h2>{mission.heading}</h2>
          <p>{mission.body}</p>
          <Link className="home-cta-button" to={WHAT_WE_DO_ROUTE}>
            What We Do
          </Link>
        </div>
      )}

      {accordionItems.length > 0 && (
        <div className="home-accordion">
          {accordionItems.map((item) => {
            const isOpen = item.sectionKey === openKey;

            return (
              <div
                key={item.sectionKey}
                className={`home-accordion-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="home-accordion-toggle"
                  onClick={() => setOpenKey(isOpen ? null : item.sectionKey)}
                  aria-expanded={isOpen}
                >
                  <span>{item.heading}</span>
                  <span className="home-accordion-icon">⌄</span>
                </button>

                {isOpen && <p className="home-accordion-body">{item.body}</p>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
