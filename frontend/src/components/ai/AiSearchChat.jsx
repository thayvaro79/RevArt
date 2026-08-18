import { useState } from "react";
import { searchVehicles } from "../../api/aiSearchApi";
import VehicleCard from "../vehicles/VehicleCard";
import "../../styles/AiSearchChat.css";

export default function AiSearchChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const vehicles = await searchVehicles(trimmedQuery);

      setResults(vehicles || []);
    } catch (err) {
      console.error("AI vehicle search failed:", err);
      setError("Unable to search inventory right now.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        className="ai-search-launcher"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI vehicle search"
      >
        <svg
          className="ai-search-launcher-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
        <span className="ai-search-launcher-label">AI Search</span>
      </button>
    );
  }

  return (
    <section className="ai-search-panel" aria-label="RevArt AI vehicle search">
      <div className="ai-search-handle" aria-hidden="true" />

      <header className="ai-search-header">
        <div className="ai-search-heading">
          <svg
            className="ai-search-heading-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          </svg>
          <div>
            <h2>RevArt AI</h2>
            <p className="ai-search-subtitle">Find your next vehicle</p>
          </div>
        </div>

        <button
          type="button"
          className="ai-search-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close AI search"
        >
          ×
        </button>
      </header>

      <div className="ai-search-content">
        <p className="ai-search-intro">
          Tell me what you're looking for &mdash; make, model, budget, or vibe.
        </p>

        {loading && (
          <div className="ai-search-status ai-search-loading" role="status" aria-live="polite">
            <span className="ai-search-spinner" aria-hidden="true" />
            Searching inventory...
          </div>
        )}

        {error && (
          <div className="ai-search-status ai-search-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <div className="ai-search-status ai-search-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            No matching vehicles found.
          </div>
        )}

        {results.length > 0 && (
          <div className="ai-search-results" aria-label="Search results">
            {results.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
              />
            ))}
          </div>
        )}
      </div>

      <form className="ai-search-form" onSubmit={handleSubmit}>
        <div className="ai-search-input-wrap">
          <svg
            className="ai-search-form-icon"
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
            className="ai-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Show me Ferraris"
            aria-label="Search inventory with AI"
          />
        </div>

        <button type="submit" className="ai-search-submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
    </section>
  );
}
