import { Link } from "react-router-dom";

const PLACEHOLDER_IMAGE = "/images/placeholders/vehicle-placeholder.webp";

export default function LocationContactRow({ location }) {
  const photos = [...(location.photos || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const visiblePhotos = photos.slice(0, 2);

  const addressLines = [
    location.addressLine1,
    location.addressLine2,
    [location.city, location.state, location.postalCode]
      .filter(Boolean)
      .join(", "),
    location.country,
  ].filter(Boolean);

  return (
    <div className="location-contact-row">
      <div
        className={`location-contact-photos ${
          visiblePhotos.length <= 1 ? "single" : ""
        }`}
      >
        {visiblePhotos.length > 0 ? (
          visiblePhotos.map((photo) => (
            <div className="location-contact-photo" key={photo.id}>
              <img src={photo.imageUrl} alt={location.name} />
            </div>
          ))
        ) : (
          <div className="location-contact-photo">
            <img src={PLACEHOLDER_IMAGE} alt={location.name} />
          </div>
        )}
      </div>

      <div className="location-contact-details">
        <h3>{location.name}</h3>

        {addressLines.length > 0 && (
          <div className="location-contact-address">
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <div className="location-contact-actions">
          {location.phone && (
            <a href={`tel:${location.phone}`}>{location.phone}</a>
          )}
          {location.email && (
            <a href={`mailto:${location.email}`}>{location.email}</a>
          )}
        </div>

        <Link
          className="location-contact-link"
          to={`/locations/${location.slug}`}
        >
          View Location →
        </Link>
      </div>
    </div>
  );
}
