import { forwardRef } from "react";
import { Link } from "react-router-dom";

const VehicleCard = forwardRef(function VehicleCard({ vehicle }, ref) {
  const imageUrl = vehicle.imageUrl || "/images/placeholders/vehicle-placeholder.webp";

  const normalizedStatus = String(vehicle.status || "")
    .toLowerCase()
    .replace(/\s+/g, "");

  const isComingSoon = normalizedStatus === "comingsoon";
  const isAvailable = normalizedStatus === "available";

  return (
      <article
      ref={ref}
      className={`vehicle-card ${isComingSoon ? "vehicle-card-disabled" : ""} ${
      !vehicle.imageUrl ? "vehicle-card-no-image" : ""
      }`}
  style={vehicle.imageUrl ? { backgroundImage: `url(${vehicle.imageUrl})` } : undefined}
>
      <div className="vehicle-card-overlay">
        {isAvailable && <p className="vehicle-available-label">Available Now</p>}

        <div className="vehicle-card-bottom">
          <div className="vehicle-card-copy">
            {vehicle.isFeatured && <p className="vehicle-label">Featured</p>}
            <h2>{vehicle.title}</h2>
            <p>{vehicle.manufacturerName}</p>
          </div>

          {isComingSoon ? (
            <div className="vehicle-coming-soon">
              <span className="vehicle-lock">🔒</span>
              <span>COMING SOON</span>
            </div>
          ) : (
            <Link className="vehicle-plus" to={`/garage/${vehicle.slug}`}>
              +
            </Link>
          )}
        </div>
      </div>
    </article>
  );
});

export default VehicleCard;