import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { getVehicles } from "../api/vehiclesApi";
import VehicleCard from "../components/vehicles/VehicleCard";
import GarageControls from "../components/garage/GarageControls";
import Header from "../components/layout/Header";
import PageHero from "../components/layout/PageHero";
import InquirySection from "../components/layout/InquirySection";
import Footer from "../components/layout/Footer";
import "../styles/Garage.css";

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

  const availableRef = useRef(null);
  const comingSoonRef = useRef(null);
  const motorcyclesRef = useRef(null);
  const featuredCardRef = useRef(null);

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

  const availableCarsAll = vehicles.filter((vehicle) => {
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

  const featuredVehicle =
    availableCarsAll.find((vehicle) => vehicle.isFeatured) ||
    comingSoonCars.find((vehicle) => vehicle.isFeatured) ||
    motorcycles.find((vehicle) => vehicle.isFeatured) ||
    null;

  const availableCars = featuredVehicle
    ? availableCarsAll.filter((vehicle) => vehicle.id !== featuredVehicle.id)
    : availableCarsAll;

  function handleSelectVehicle(vehicle) {
    if (featuredVehicle && vehicle.id === featuredVehicle.id) {
      const el = featuredCardRef.current;

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("vehicle-card-highlight");
        setTimeout(() => el.classList.remove("vehicle-card-highlight"), 1600);
      }

      return;
    }

    const status = normalize(vehicle.status);
    const type = normalize(getVehicleType(vehicle));

    let targetRef = availableRef;

    if (type === "motorcycle" && status === "available") {
      targetRef = motorcyclesRef;
    } else if (status === "comingsoon") {
      targetRef = comingSoonRef;
    }

    targetRef.current?.focusVehicle(vehicle.id);
  }

  return (
    <>
      <Header />
      <PageHero
        pageKey="garage"
        title="THE GARAGE"
        fallbackImage="/images/garage_hero.jpg"
        className="garage-page-hero"
      />

      <main className="garage-page" id="inventory">
        {loading ? (
          <p className="inventory-loading">Loading inventory...</p>
        ) : (
          <>
            <GarageControls
              vehicles={[...availableCarsAll, ...comingSoonCars, ...motorcycles]}
              availableCount={availableCarsAll.length}
              comingSoonCount={comingSoonCars.length}
              motorcycleCount={motorcycles.length}
              onSelectVehicle={handleSelectVehicle}
            />

            {featuredVehicle && (
              <section className="featured-vehicle-section">
                <div className="vehicle-grid vehicle-grid--garage vehicle-grid--featured">
                  <VehicleCard vehicle={featuredVehicle} ref={featuredCardRef} />
                </div>
              </section>
            )}

            <InventorySection
              ref={availableRef}
              eyebrow="AVAILABLE NOW"
              vehicles={availableCars}
            />
            <InventorySection
              ref={comingSoonRef}
              eyebrow="COMING SOON"
              vehicles={comingSoonCars}
            />
            <InventorySection
              ref={motorcyclesRef}
              eyebrow="MOTORCYCLES"
              vehicles={motorcycles}
            />
          </>
        )}

        <InquirySection />
        <Footer />
      </main>
    </>
  );
}

const InventorySection = forwardRef(function InventorySection(
  { eyebrow, title, description, vehicles },
  ref
) {
  const [page, setPage] = useState(1);
  const [pendingFocusId, setPendingFocusId] = useState(null);
  const gridRef = useRef(null);
  const cardRefs = useRef({});

  const pageSize = 6;
  const totalPages = Math.ceil((vehicles?.length || 0) / pageSize);

  const pagedVehicles = vehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useImperativeHandle(ref, () => ({
    focusVehicle(vehicleId) {
      const index = vehicles.findIndex((vehicle) => vehicle.id === vehicleId);

      if (index === -1) return false;

      const targetPage = Math.floor(index / pageSize) + 1;

      setPage(targetPage);
      setPendingFocusId(vehicleId);

      return true;
    },
  }));

  useEffect(() => {
    if (pendingFocusId == null) return;

    const el = cardRefs.current[pendingFocusId];

    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("vehicle-card-highlight");

    const timeout = setTimeout(() => {
      el.classList.remove("vehicle-card-highlight");
    }, 1600);

    setPendingFocusId(null);

    return () => clearTimeout(timeout);
  }, [page, pendingFocusId]);

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

      <div ref={gridRef} className="vehicle-grid vehicle-grid--garage">
        {pagedVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            ref={(el) => {
              cardRefs.current[vehicle.id] = el;
            }}
          />
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
});
