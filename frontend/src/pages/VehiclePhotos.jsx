import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getVehicleBySlug } from "../api/vehiclesApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../styles/VehiclePhotos.css";

export default function VehiclePhotos() {
  const { slug } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ["Exterior", "Interior", "Engine", "Trunk", "Detailed"];

  useEffect(() => {
    async function loadVehicle() {
      try {
        const data = await getVehicleBySlug(slug);
        setVehicle(data);
      } catch (error) {
        console.error("Failed to load vehicle photos", error);
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const fallbackPhotos = useMemo(() => {
    if (!vehicle) return [];

    const baseImages = [
      vehicle.imageUrl,
      "/images/cars/f1.webp",
      "/images/cars/f2.webp",
      "/images/cars/f3.webp",
      "/images/cars/f4.webp",
      "/images/cars/f5.webp",
      "/images/cars/f6.webp",
      "/images/cars/f7.webp",
      "/images/cars/f8.webp",
      "/images/cars/f9.webp",
    ].filter(Boolean);

    return baseImages.map((imageUrl, index) => ({
      id: String(index),
      imageUrl,
      category: index < 5 ? "Exterior" : "Interior",
      altText: vehicle.title,
    }));
  }, [vehicle]);

  function scrollToCategory(category) {
    const section = document.getElementById(
      `photos-${category.toLowerCase()}`
    );

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="vehicle-photos-page">
          <section className="vehicle-photos-loading">Loading photos...</section>
        </main>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Header />
        <main className="vehicle-photos-page">
          <section className="vehicle-photos-loading">Vehicle not found.</section>
        </main>
        <Footer />
      </>
    );
  }

  const allPhotos =
    vehicle.photos && vehicle.photos.length > 0
      ? vehicle.photos
      : fallbackPhotos;

  return (
    <>
      <Header />

      <main className="vehicle-photos-page">
        <section className="vehicle-photos-toolbar">
          <a className="vehicle-photos-back" href={`/garage/${vehicle.slug}`}>
            ‹
          </a>

          <div className="vehicle-photos-title">
            <a href={`/garage/${vehicle.slug}`}>Go Back</a>
            <span>|</span>
            <strong>{vehicle.title}</strong>
          </div>

          <div className="vehicle-photos-sort">
            <span>Sort By</span>
            <span className="vehicle-photos-divider">|</span>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => scrollToCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {categories.map((category) => {
          const categoryPhotos = allPhotos.filter(
            (photo) =>
              String(photo.category || "").toLowerCase() ===
              category.toLowerCase()
          );

          if (categoryPhotos.length === 0) return null;

          return (
            <section
              id={`photos-${category.toLowerCase()}`}
              className="vehicle-photos-category"
              key={category}
            >
              <h2>{category}</h2>

              <div className="vehicle-photos-grid">
                {categoryPhotos.map((photo, index) => (
                  <a
                    key={photo.id || index}
                    className="vehicle-photo-tile"
                    href={`/garage/${vehicle.slug}/photos/${photo.id || index}`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.altText || `${vehicle.title} photo`}
                    />
                  </a>
                ))}
              </div>
            </section>
          );
        })}

        <section className="vehicle-photos-sticky-footer">
          <div>
            <h2>{vehicle.title}</h2>
            <p>
              Asking Price:{" "}
              {vehicle.price ? `$${vehicle.price.toLocaleString()}` : "Contact"}
            </p>
          </div>

          <div className="vehicle-photos-footer-actions">
            <a href={`/garage/${vehicle.slug}`}>Go Back</a>
            <a href={`/garage/${vehicle.slug}#interested`}>Inquire</a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}