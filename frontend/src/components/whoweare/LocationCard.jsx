import { Link } from "react-router-dom";

export default function LocationCard({ location }) {
  const image =
    location.coverImageUrl || "/images/placeholders/vehicle-placeholder.webp";

  const subtitle = [location.city, location.state].filter(Boolean).join(", ");

  return (
    <Link
      className="person-card"
      to={`/locations/${location.slug}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="person-card-overlay">
        <div className="person-card-copy">
          <h3 className="person-card-name">{location.name}</h3>
          {subtitle && <p className="person-card-title">{subtitle}</p>}
        </div>

        <span className="person-card-cta" aria-hidden="true">
          +
        </span>
      </div>
    </Link>
  );
}
