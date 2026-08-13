import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLocationBySlug } from "../api/locationsApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import PhotoGallery from "../components/whoweare/PhotoGallery";
import "../styles/WhoWeAre.css";

export default function LocationDetail() {
  const { slug } = useParams();

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocation() {
      try {
        const data = await getLocationBySlug(slug);
        setLocation(data);
      } catch (error) {
        console.error("Failed to load location:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLocation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const addressLines = location
    ? [
        location.addressLine1,
        location.addressLine2,
        [location.city, location.state, location.postalCode]
          .filter(Boolean)
          .join(", "),
        location.country,
      ].filter(Boolean)
    : [];

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
        ) : !location ? (
          <p className="inventory-loading">Location not found.</p>
        ) : (
          <>
            <div className="person-detail-header">
              <h1>{location.name}</h1>
            </div>

            <PhotoGallery photos={location.photos} altText={location.name} />

            {(addressLines.length > 0 || location.phone || location.email) && (
              <div className="person-detail-bio">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {location.phone && <p>{location.phone}</p>}
                {location.email && <p>{location.email}</p>}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
