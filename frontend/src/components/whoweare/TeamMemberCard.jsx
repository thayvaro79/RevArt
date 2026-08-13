import { Link } from "react-router-dom";

export default function TeamMemberCard({ member }) {
  const image =
    member.coverImageUrl || "/images/placeholders/vehicle-placeholder.webp";

  return (
    <Link
      className="person-card"
      to={`/team/${member.slug}`}
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="person-card-overlay">
        <div className="person-card-copy">
          <h3 className="person-card-name">{member.name}</h3>
          {member.title && <p className="person-card-title">{member.title}</p>}
        </div>

        <span className="person-card-cta" aria-hidden="true">
          +
        </span>
      </div>
    </Link>
  );
}
