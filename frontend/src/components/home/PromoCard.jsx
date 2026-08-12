import { Link } from "react-router-dom";

export default function PromoCard({
  title,
  imageUrl,
  fallbackImage,
  to,
  href,
  icon = "plus",
}) {
  const image = imageUrl || fallbackImage;
  const style = image ? { backgroundImage: `url(${image})` } : undefined;

  const overlay = (
    <div className="promo-card-overlay">
      <h2 className="promo-card-title">{title}</h2>
      <span className="promo-card-cta" aria-hidden="true">
        {icon === "instagram" ? "📷" : "+"}
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        className="promo-card"
        href={href}
        target="_blank"
        rel="noreferrer"
        style={style}
      >
        {overlay}
      </a>
    );
  }

  return (
    <Link className="promo-card" to={to} style={style}>
      {overlay}
    </Link>
  );
}
