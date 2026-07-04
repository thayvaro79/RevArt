import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getVehicleBySlug } from "../api/vehiclesApi";
import Header from "../components/layout/Header";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import "../styles/VehicleDetail.css";

export default function VehicleDetail() {
  const { slug } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicle() {
      try {
        const data = await getVehicleBySlug(slug);
        setVehicle(data);
      } catch (error) {
        console.error("Failed to load vehicle detail", error);
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="vehicle-detail-page">
          <section className="vehicle-detail-loading">Loading vehicle...</section>
        </main>
        <Footer />
      </>
    );
  }

  if (!vehicle) {
    return (
      <>
        <Header />
        <main className="vehicle-detail-page">
          <section className="vehicle-detail-loading">Vehicle not found.</section>
        </main>
        <Footer />
      </>
    );
  }

  const getPhoto = (role, category) =>
    vehicle.photos?.find(
      (photo) =>
        (!role || photo.role === role) &&
        (!category || photo.category === category)
    )?.imageUrl;

  const heroImage =
    getPhoto("Hero") || vehicle.imageUrl || "/images/cars/f1.webp";

  const overviewImage = getPhoto("Overview") || heroImage;
  const exteriorCover = getPhoto(null, "Exterior") || heroImage;
  const interiorCover = getPhoto(null, "Interior") || heroImage;
  const engineCover = getPhoto(null, "Engine") || heroImage;

  const galleryPhotos =
    vehicle.photos?.filter((photo) => photo.role === "Gallery").slice(0, 5) ||
    [];

const exteriorPhotos =
  vehicle.photos?.filter((photo) => photo.category === "Exterior") || [];

const exteriorImage1 =
  exteriorPhotos[0]?.imageUrl || exteriorCover;

const exteriorImage2 =
  exteriorPhotos[1]?.imageUrl ||
  exteriorPhotos[0]?.imageUrl ||
  exteriorCover;

const exteriorBandImage =
  exteriorPhotos[2]?.imageUrl ||
  exteriorPhotos[0]?.imageUrl ||
  exteriorCover;

  const highlights = vehicle.overviewText
    ? vehicle.overviewText.split("\n").filter(Boolean)
    : [
        "Collector-quality specification selected for RevArt Garage.",
        "Low-mileage example with premium factory options.",
        "Presented with luxury performance ownership in mind.",
        "Available for private viewing by appointment.",
        "Contact RevArt for full details and availability.",
      ];

  return (
    <>
      <Header />

      <main className="vehicle-detail-page">
        <section className="vehicle-detail-hero">
          <img src={heroImage} alt={vehicle.title} />

          <div className="vehicle-detail-breadcrumb">
            <a href="/garage">Go Back</a>
            <span>›</span>
            <a href="/garage">The Garage</a>
            <span>›</span>
            <strong>{vehicle.title}</strong>
          </div>

          <div className="vehicle-detail-hero-card">
            <span>{vehicle.status}</span>
            <h1>{vehicle.title}</h1>
            <p>{vehicle.heroTagline || vehicle.description}</p>
          </div>

          <a
            className="vehicle-scroll-cue"
            href="#overview"
            aria-label="Scroll to overview"
          />
        </section>

        <section id="overview" className="vehicle-overview-section">
          <div className="vehicle-overview-image-block">
            <img src={overviewImage} alt={vehicle.title} />

            <div className="vehicle-thumb-row">
              {[overviewImage, ...galleryPhotos.map((p) => p.imageUrl)]
                .slice(0, 5)
                .map((image, index) => (
                  <div className="vehicle-thumb" key={`${image}-${index}`}>
                    <img src={image} alt={`${vehicle.title} thumbnail`} />
                  </div>
                ))}
            </div>
          </div>

          <aside className="vehicle-overview-panel">
            <h2>Overview</h2>

            <p className="vehicle-vin">
              VIN #{vehicle.vin || "Available Upon Request"}
            </p>

            <div className="vehicle-overview-specs">
              <div>
                <span>Transmission</span>
                <strong>{vehicle.transmission || "Automatic"}</strong>
              </div>

              <div>
                <span>Mileage</span>
                <strong>{vehicle.mileage?.toLocaleString() || "—"} mi</strong>
              </div>

              <div>
                <span>Color</span>
                <strong>{vehicle.exteriorColor || "—"}</strong>
              </div>
            </div>

            <ul className="vehicle-highlights">
              {highlights.slice(0, 5).map((item, index) => (
                <li key={index}>{item.replace(/^[-•]\s*/, "")}</li>
              ))}
            </ul>

            <div className="vehicle-price-row">
              <span>Asking Price:</span>
              <strong>
                {vehicle.price
                  ? `$${vehicle.price.toLocaleString()}`
                  : "Contact for Price"}
              </strong>
            </div>

            <div className="vehicle-action-row">
              <a href="tel:+13175550123">Call</a>
              <a href="mailto:contact@revartgarage.com">Email</a>
            </div>

            <a href="#interested" className="vehicle-offer-btn">
              Inquire
            </a>
          </aside>
        </section>

        <nav className="vehicle-section-nav">
          <span>Go To</span>
          <a href="#history">The History</a>
          <a href="#the-car">The Car</a>
          <a href="#market">The Market</a>
          <a href="#documentation">Documentation</a>
          <a href={`/garage/${vehicle.slug}/photos`}>View All Photos</a>
        </nav>

        <section
          id="history"
          className="vehicle-text-section"
          data-year={vehicle.year}
        >
          <div className="vehicle-text-inner">
            <h2>The History</h2>
            <p>
              {vehicle.historyText ||
                "This section will present the history, ownership background, service story, and provenance details entered by the dealership through the admin system."}
            </p>
          </div>
        </section>

    <section className="vehicle-photo-cards">
  <div className="vehicle-photo-card">
    <img src={exteriorCover} alt="Exterior photos" />

    <a
      href={`/garage/${vehicle.slug}/photos?category=Exterior`}
      className="vehicle-photo-btn"
    >
      Exterior Photos <span>|</span> Click To View
    </a>

    <a
      href={`/garage/${vehicle.slug}/photos?category=Exterior`}
      className="vehicle-photo-plus"
    >
      +
    </a>
  </div>

  <div className="vehicle-photo-card">
    <img src={interiorCover} alt="Interior photos" />

    <a
      href={`/garage/${vehicle.slug}/photos?category=Interior`}
      className="vehicle-photo-btn"
    >
      Interior Photos <span>|</span> Click To View
    </a>

    <a
      href={`/garage/${vehicle.slug}/photos?category=Interior`}
      className="vehicle-photo-plus"
    >
      +
    </a>
  </div>
</section>

<section id="the-car" className="vehicle-split-section">

  <div className="vehicle-split-copy">

    <h2>The Car</h2>

    <p>
      {vehicle.theCarText ||
        "This section will describe the driving experience, options, mechanical condition and the unique qualities that make this vehicle special."}
    </p>

  </div>

  <img
    className="vehicle-car-image"
    src={exteriorCover}
    alt={vehicle.title}
  />

</section>

<section className="vehicle-full-image">
    <img
        src={exteriorImage1}
        alt={`${vehicle.title} Exterior`}
    />
</section>

<div className="vehicle-image-divider" />

<section className="vehicle-full-image">
    <img
        src={exteriorImage2}
        alt={`${vehicle.title} Exterior`}
    />
</section>

        <section id="market" className="vehicle-text-section">
          <h2>The Market</h2>
          <p>
            {vehicle.marketNotes ||
              "Market data integration will be added here later. This section is prepared for Classic.com or other collector-car valuation data."}
          </p>
        </section>

   <section className="vehicle-photo-cards">
  <div className="vehicle-photo-card">
    <img src={engineCover} alt="Engine photos" />

    <a
      href={`/garage/${vehicle.slug}/photos?category=Engine`}
      className="vehicle-photo-btn"
    >
      Engine Photos <span>|</span> Click To View
    </a>

    <a
      href={`/garage/${vehicle.slug}/photos?category=Engine`}
      className="vehicle-photo-plus"
    >
      +
    </a>
  </div>

  <div className="vehicle-photo-card">
    <img src={getPhoto(null, "Trunk") || interiorCover} alt="Trunk photos" />

    <a
      href={`/garage/${vehicle.slug}/photos?category=Trunk`}
      className="vehicle-photo-btn"
    >
      Trunk Photos <span>|</span> Click To View
    </a>

    <a
      href={`/garage/${vehicle.slug}/photos?category=Trunk`}
      className="vehicle-photo-plus"
    >
      +
    </a>
  </div>
</section>
        <section id="documentation" className="vehicle-documentation-section">
          <div>
            <h2>Vehicle History & Condition Report</h2>
            <p>
              Compiled here is everything you need in order to make an informed
              decision, and to make this transaction as transparent as possible.
            </p>
            <p>
              Please follow these links to view close-up detail photos, service
              records, documents, and vehicle history information.
            </p>
          </div>

          <div className="vehicle-document-buttons">
            
            <a href={`/garage/${vehicle.slug}/photos`}>Detailed Photos</a>
            <a href="#documentation">CarFax</a>
            <a href="#documentation">Service Records</a>
            <a href="#documentation">Condition Report</a>
          </div>
        </section>

     <section className="vehicle-full-image">
  <img
    src={exteriorBandImage}
    alt={`${vehicle.title} Exterior`}
  />
</section>

        <section id="interested">
          <InquirySection />
        </section>
      </main>

      <Footer />
    </>
  );
}