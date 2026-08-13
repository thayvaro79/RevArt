import { useEffect, useState } from "react";
import { getPageSections } from "../api/pageSectionsApi";
import { getTeamMembers } from "../api/teamMembersApi";
import { getLocations } from "../api/locationsApi";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import TeamMemberCard from "../components/whoweare/TeamMemberCard";
import LocationCard from "../components/whoweare/LocationCard";
import "../styles/WhoWeAre.css";

function findSection(sections, key) {
  return sections.find((section) => section.sectionKey === key);
}

export default function WhoWeAre() {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    async function loadSections() {
      try {
        const data = await getPageSections("WhoWeAre");
        setSections(data || []);
      } catch (error) {
        console.error("Failed to load Who We Are page sections:", error);
      } finally {
        setLoadingSections(false);
      }
    }

    loadSections();
  }, []);

  useEffect(() => {
    async function loadTeamMembers() {
      try {
        const data = await getTeamMembers();
        setTeamMembers(data || []);
      } catch (error) {
        console.error("Failed to load team members:", error);
      } finally {
        setLoadingTeam(false);
      }
    }

    loadTeamMembers();
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

  const brandStory = findSection(sections, "brand-story");

  return (
    <>
      <Header />
      <PageHero
        pageKey="whoweare"
        title="WHO WE ARE"
        fallbackImage="/images/garage_hero.jpg"
      />

      <main className="whoweare-page">
        {!loadingSections && brandStory && (
          <section className="brand-story-section">
            <h2>{brandStory.heading}</h2>
            <p>{brandStory.body}</p>
          </section>
        )}

        <section className="whoweare-section">
          <div className="section-heading">
            <h2>Meet The Team</h2>
          </div>

          {loadingTeam ? (
            <p className="inventory-loading">Loading team...</p>
          ) : teamMembers.length === 0 ? (
            <p className="inventory-loading">Team information coming soon.</p>
          ) : (
            <div className="person-card-grid">
              {teamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </section>

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
          heading="LET'S CONNECT"
          description="Fill out the form, or reach out directly. We look forward to hearing from you."
          sourcePage="WhoWeAre"
        />

        <Footer />
      </main>
    </>
  );
}
