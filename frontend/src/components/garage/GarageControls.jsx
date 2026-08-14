import { useMemo, useState } from "react";

function matchesQuery(vehicle, query) {
  const haystack = [vehicle.title, vehicle.manufacturerName, vehicle.model, vehicle.year]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function GarageControls({
  vehicles,
  availableCount,
  comingSoonCount,
  motorcycleCount,
  onSelectVehicle,
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return vehicles.filter((vehicle) => matchesQuery(vehicle, normalized)).slice(0, 8);
  }, [query, vehicles]);

  const showDropdown = isFocused && query.trim().length > 0;

  function handleSelect(vehicle) {
    setQuery("");
    setIsFocused(false);
    onSelectVehicle(vehicle);
  }

  return (
    <div className="garage-controls">
      <div className="garage-controls-counts">
        <span className="garage-count">
          <strong>{availableCount}</strong> Available Now
        </span>
        <span className="garage-count">
          <strong>{comingSoonCount}</strong> Coming Soon
        </span>
        <span className="garage-count">
          <strong>{motorcycleCount}</strong> Motorcycles
        </span>
      </div>

      <div className="garage-search">
        <svg
          className="garage-search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="garage-search-input"
          placeholder="Search inventory..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          aria-label="Search inventory"
        />

        {showDropdown && (
          <div className="garage-search-dropdown">
            {matches.length === 0 ? (
              <p className="garage-search-empty">No matches found.</p>
            ) : (
              matches.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  className="garage-search-result"
                  onMouseDown={() => handleSelect(vehicle)}
                >
                  <span className="garage-search-result-title">{vehicle.title}</span>
                  <span className="garage-search-result-meta">
                    {[vehicle.year, vehicle.manufacturerName, vehicle.model]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
