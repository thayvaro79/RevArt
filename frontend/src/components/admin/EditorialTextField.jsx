import { useState } from "react";
import { generateVehicleEditorial } from "../../api/vehiclesApi";

export default function EditorialTextField({
  label,
  intent,
  value,
  onChange,
  vehicleContext,
  placeholder,
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (value.trim() && !window.confirm(`Replace the current ${label} text with an AI-generated draft?`)) {
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const result = await generateVehicleEditorial({
        intent,
        ...vehicleContext,
      });
      onChange(result.draft || "");
    } catch (err) {
      console.error(`Failed to generate ${label} draft:`, err);
      setError("Couldn't generate a draft. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <label className="admin-field admin-field--wide admin-field--editorial">
      <span>{label}</span>
      <textarea
        rows={8}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="admin-editorial-actions">
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={handleGenerate}
          disabled={generating || !vehicleContext.model}
        >
          {generating ? "Generating…" : `Generate ${label} with AI`}
        </button>
        {error && <span className="admin-editorial-error">{error}</span>}
      </div>
    </label>
  );
}
