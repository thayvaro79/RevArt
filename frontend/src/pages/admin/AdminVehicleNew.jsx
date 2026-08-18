import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VehicleEntryChoices from "../../components/admin/VehicleEntryChoices";
import { createVehicle } from "../../api/vehiclesApi";
import {
  getManufacturers,
  createManufacturer,
} from "../../api/manufacturersApi";
import { getVehicleTypes, createVehicleType } from "../../api/vehicleTypesApi";
import { VEHICLE_STATUS, VEHICLE_STATUS_OPTIONS } from "../../constants/vehicleStatus";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminVehicleNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMode = location.state?.mode;

  const [step, setStep] = useState(() => {
    if (initialMode === "manual") return "form";
    if (initialMode === "enter") return "enter";
    if (initialMode === "scan") return "scan";
    return "choice";
  });
  const [vin, setVin] = useState("");

  function handleChoice(mode) {
    if (mode === "manual") setStep("form");
    else if (mode === "enter") setStep("enter");
    else setStep("scan");
  }

  return (
    <div className="admin-vehicle-new">
      <div className="admin-page-heading">
        <h1>Add Vehicle</h1>
        <p>Start a new listing by scanning a VIN, entering one, or building it manually.</p>
      </div>

      {step === "choice" && <VehicleEntryChoices onSelect={handleChoice} />}

      {step === "scan" && (
        <ScanVinStep
          onCancel={() => setStep("choice")}
          onFallback={() => setStep("enter")}
          onConfirm={(value) => {
            setVin(value);
            setStep("form");
          }}
        />
      )}

      {step === "enter" && (
        <EnterVinStep
          onCancel={() => setStep("choice")}
          onSkip={() => setStep("form")}
          onConfirm={(value) => {
            setVin(value);
            setStep("form");
          }}
        />
      )}

      {step === "form" && (
        <ManualForm
          initialVin={vin}
          onCancel={() => setStep("choice")}
          onCreated={() => navigate("/admin/vehicles")}
        />
      )}
    </div>
  );
}

function ScanVinStep({ onCancel, onFallback, onConfirm }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [vinValue, setVinValue] = useState("");

  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera access isn't supported in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraError(
          "Couldn't access the camera. You can still type the VIN below."
        );
      }
    }

    startCamera();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="admin-form-card admin-scan-step">
      <div className="admin-scan-viewport">
        {cameraError ? (
          <p className="admin-scan-error">{cameraError}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted />
        )}
      </div>

      <p className="admin-field-hint">
        Point the camera at the VIN plate, then type what you see to confirm —
        automatic VIN recognition isn't wired up yet.
      </p>

      <label className="admin-field">
        <span>VIN</span>
        <input
          value={vinValue}
          onChange={(event) => setVinValue(event.target.value.toUpperCase())}
          placeholder="e.g. 1FAFP404X1F123456"
          maxLength={17}
        />
      </label>

      <div className="admin-form-actions">
        <button type="button" className="admin-secondary-btn" onClick={onCancel}>
          Back
        </button>
        <button type="button" className="admin-secondary-btn" onClick={onFallback}>
          Type VIN instead
        </button>
        <button
          type="button"
          className="admin-primary-btn"
          disabled={!vinValue.trim()}
          onClick={() => onConfirm(vinValue.trim())}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function EnterVinStep({ onCancel, onSkip, onConfirm }) {
  const [vinValue, setVinValue] = useState("");

  return (
    <div className="admin-form-card">
      <label className="admin-field">
        <span>VIN</span>
        <input
          autoFocus
          value={vinValue}
          onChange={(event) => setVinValue(event.target.value.toUpperCase())}
          placeholder="e.g. 1FAFP404X1F123456"
          maxLength={17}
        />
      </label>

      <div className="admin-form-actions">
        <button type="button" className="admin-secondary-btn" onClick={onCancel}>
          Back
        </button>
        <button type="button" className="admin-secondary-btn" onClick={onSkip}>
          Skip
        </button>
        <button
          type="button"
          className="admin-primary-btn"
          disabled={!vinValue.trim()}
          onClick={() => onConfirm(vinValue.trim())}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  year: new Date().getFullYear(),
  model: "",
  trim: "",
  mileage: "",
  transmission: "",
  exteriorColor: "",
  interiorColor: "",
  price: "",
  status: VEHICLE_STATUS.Draft,
  isFeatured: false,
  description: "",
};

function ManualForm({ initialVin, onCancel, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [vin, setVin] = useState(initialVin || "");

  const [manufacturers, setManufacturers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [manufacturerId, setManufacturerId] = useState("");
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [newManufacturer, setNewManufacturer] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [manufacturerData, typeData] = await Promise.all([
          getManufacturers(),
          getVehicleTypes(),
        ]);
        setManufacturers(manufacturerData || []);
        setVehicleTypes(typeData || []);
      } catch (err) {
        console.error("Failed to load lookup data:", err);
      }
    }

    loadLookups();
  }, []);

  function updateField(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "title" && !slugTouched) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  async function handleAddManufacturer() {
    if (!newManufacturer.trim()) return;

    try {
      const created = await createManufacturer(newManufacturer.trim());
      setManufacturers((current) => [...current, created]);
      setManufacturerId(String(created.id));
      setNewManufacturer("");
    } catch (err) {
      console.error("Failed to add manufacturer:", err);
    }
  }

  async function handleAddVehicleType() {
    if (!newVehicleType.trim()) return;

    try {
      const created = await createVehicleType(newVehicleType.trim());
      setVehicleTypes((current) => [...current, created]);
      setVehicleTypeId(String(created.id));
      setNewVehicleType("");
    } catch (err) {
      console.error("Failed to add vehicle type:", err);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!manufacturerId || !vehicleTypeId) {
      setError("Choose a manufacturer and vehicle type.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createVehicle({
        tenantId: 1,
        manufacturerId: Number(manufacturerId),
        vehicleTypeId: Number(vehicleTypeId),
        title: form.title,
        slug: form.slug || slugify(form.title),
        year: Number(form.year),
        model: form.model,
        trim: form.trim || null,
        vin: vin || null,
        mileage: form.mileage ? Number(form.mileage) : null,
        transmission: form.transmission || null,
        exteriorColor: form.exteriorColor || null,
        interiorColor: form.interiorColor || null,
        price: form.price ? Number(form.price) : null,
        status: Number(form.status),
        isFeatured: form.isFeatured,
        description: form.description || null,
      });

      onCreated();
    } catch (err) {
      console.error("Failed to create vehicle:", err);
      setError("Couldn't save this vehicle. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="admin-form-card admin-vehicle-form" onSubmit={handleSubmit}>
      {vin && (
        <p className="admin-field-hint">
          VIN carried over from the previous step: <strong>{vin}</strong>
        </p>
      )}

      <div className="admin-form-grid">
        <label className="admin-field admin-field--wide">
          <span>Title</span>
          <input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="1967 Shelby GT500"
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span>Slug</span>
          <input
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              updateField("slug", slugify(event.target.value));
            }}
            placeholder="1967-shelby-gt500"
          />
        </label>

        <label className="admin-field">
          <span>Manufacturer</span>
          <div className="admin-lookup-row">
            <select
              required
              value={manufacturerId}
              onChange={(event) => setManufacturerId(event.target.value)}
            >
              <option value="">Select…</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-lookup-add">
            <input
              value={newManufacturer}
              onChange={(event) => setNewManufacturer(event.target.value)}
              placeholder="Add new…"
            />
            <button type="button" onClick={handleAddManufacturer}>
              Add
            </button>
          </div>
        </label>

        <label className="admin-field">
          <span>Vehicle Type</span>
          <select
            required
            value={vehicleTypeId}
            onChange={(event) => setVehicleTypeId(event.target.value)}
          >
            <option value="">Select…</option>
            {vehicleTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div className="admin-lookup-add">
            <input
              value={newVehicleType}
              onChange={(event) => setNewVehicleType(event.target.value)}
              placeholder="Add new…"
            />
            <button type="button" onClick={handleAddVehicleType}>
              Add
            </button>
          </div>
        </label>

        <label className="admin-field">
          <span>Year</span>
          <input
            required
            type="number"
            value={form.year}
            onChange={(event) => updateField("year", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Model</span>
          <input
            required
            value={form.model}
            onChange={(event) => updateField("model", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Trim</span>
          <input
            value={form.trim}
            onChange={(event) => updateField("trim", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>VIN</span>
          <input
            value={vin}
            onChange={(event) => setVin(event.target.value.toUpperCase())}
            maxLength={17}
          />
        </label>

        <label className="admin-field">
          <span>Mileage</span>
          <input
            type="number"
            value={form.mileage}
            onChange={(event) => updateField("mileage", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Price (USD)</span>
          <input
            type="number"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Transmission</span>
          <input
            value={form.transmission}
            onChange={(event) => updateField("transmission", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Exterior Color</span>
          <input
            value={form.exteriorColor}
            onChange={(event) => updateField("exteriorColor", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Interior Color</span>
          <input
            value={form.interiorColor}
            onChange={(event) => updateField("interiorColor", event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            {VEHICLE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field admin-field--checkbox">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => updateField("isFeatured", event.target.checked)}
          />
          <span>Featured listing</span>
        </label>

        <label className="admin-field admin-field--wide">
          <span>Description</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        </label>
      </div>

      {error && <p className="admin-error-banner">{error}</p>}

      <div className="admin-form-actions">
        <button type="button" className="admin-secondary-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="admin-primary-btn" disabled={submitting}>
          {submitting ? "Saving…" : "Create Vehicle"}
        </button>
      </div>
    </form>
  );
}
