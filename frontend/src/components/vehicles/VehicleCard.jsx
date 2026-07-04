import { Link } from "react-router-dom";

export default function VehicleCard({ vehicle }) {
  const imageUrl = vehicle.imageUrl || "/images/cars/f1.webp";

  const normalizedStatus = String(vehicle.status || "")
    .toLowerCase()
    .replace(/\s+/g, "");

  const isComingSoon = normalizedStatus === "comingsoon";

  return (
    <article
      className={`vehicle-card ${isComingSoon ? "vehicle-card-disabled" : ""}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="vehicle-card-overlay">
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
    </article>
  );
}