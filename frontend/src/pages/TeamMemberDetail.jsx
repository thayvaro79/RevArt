import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getTeamMemberBySlug } from "../api/teamMembersApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PhotoGallery from "../components/whoweare/PhotoGallery";
import "../styles/WhoWeAre.css";

export default function TeamMemberDetail() {
  const { slug } = useParams();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      try {
        const data = await getTeamMemberBySlug(slug);
        setMember(data);
      } catch (error) {
        console.error("Failed to load team member:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMember();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  return (
    <>
      <Header />

      <main className="person-detail-page">
        <div className="person-detail-toolbar">
          <Link className="person-detail-back" to="/whoweare">
            ‹ Back to Who We Are
          </Link>
        </div>

        {loading ? (
          <p className="inventory-loading">Loading...</p>
        ) : !member ? (
          <p className="inventory-loading">Team member not found.</p>
        ) : (
          <>
            <div className="person-detail-header">
              <h1>{member.name}</h1>
              {member.title && (
                <p className="person-detail-role">{member.title}</p>
              )}
            </div>

            <PhotoGallery photos={member.photos} altText={member.name} />

            {member.bio && (
              <div className="person-detail-bio">
                <p>{member.bio}</p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
