import { useEffect, useRef, useState } from "react";
import { getVehicles } from "../api/vehiclesApi";
import VehicleCard from "../components/vehicles/VehicleCard";
import Header from "../components/layout/Header";
import GarageHero from "../components/layout/GarageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getVehicleType(vehicle) {
  return (
    vehicle.vehicleTypeName ||
    vehicle.vehicleType ||
    vehicle.type ||
    vehicle.typeName
  );
}

export default function Garage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await getVehicles();
        setVehicles(data || []);
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, []);

  const availableCars = vehicles.filter((vehicle) => {
    const status = normalize(vehicle.status);
    const type = normalize(getVehicleType(vehicle));

    return status === "available" && type !== "motorcycle";
  });

  const comingSoonCars = vehicles.filter((vehicle) => {
    const status = normalize(vehicle.status);
    const type = normalize(getVehicleType(vehicle));

    return status === "comingsoon" && type !== "motorcycle";
  });

  const motorcycles = vehicles.filter((vehicle) => {
    const status = normalize(vehicle.status);
    const type = normalize(getVehicleType(vehicle));

    return type === "motorcycle" && status === "available";
  });

  return (
    <>
      <Header />
      <GarageHero />

      <main className="garage-page" id="inventory">
        {loading ? (
          <p className="inventory-loading">Loading inventory...</p>
        ) : (
          <>
            <InventorySection eyebrow="AVAILABLE NOW" vehicles={availableCars} />
            <InventorySection eyebrow="COMING SOON" vehicles={comingSoonCars} />
            <InventorySection eyebrow="MOTORCYCLES" vehicles={motorcycles} />
          </>
        )}

        <InquirySection />
        <Footer />
      </main>
    </>
  );
}

function InventorySection({ eyebrow, title, description, vehicles }) {
  const [page, setPage] = useState(1);
  const gridRef = useRef(null);

  const pageSize = 6;
  const totalPages = Math.ceil((vehicles?.length || 0) / pageSize);

  const pagedVehicles = vehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);

    setTimeout(() => {
      gridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  return (
    <section className="inventory-section">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        {title && <h2>{title}</h2>}
        {description && <p className="section-description">{description}</p>}
      </div>

      <div ref={gridRef} className="vehicle-grid">
        {pagedVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={page === pageNumber ? "active" : ""}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}