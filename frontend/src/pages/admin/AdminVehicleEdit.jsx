import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVehicleById, updateVehicle, updateVehicleStatus } from "../../api/vehiclesApi";
import { getManufacturers, createManufacturer } from "../../api/manufacturersApi";
import { getVehicleTypes, createVehicleType } from "../../api/vehicleTypesApi";
import { VEHICLE_STATUS_OPTIONS } from "../../constants/vehicleStatus";
import VehiclePhotoUploadStep from "../../components/admin/VehiclePhotoUploadStep";
import EditorialTextField from "../../components/admin/EditorialTextField";

const TABS = [
  { key: "details", label: "Details" },
  { key: "photos", label: "Photos" },
  { key: "status", label: "Status" },
];

function readVin(vehicle) {
  // The raw Vehicle entity's VIN property can come back as "VIN", "vIN" or
  // "vin" depending on the JSON casing policy — accept whichever arrives.
  return vehicle.vin ?? vehicle.vIN ?? vehicle.VIN ?? "";
}

const EMPTY_FORM = {
  title: "",
  year: "",
  model: "",
  trim: "",
  mileage: "",
  transmission: "",
  exteriorColor: "",
  interiorColor: "",
  price: "",
  isFeatured: false,
  description: "",
  historyText: "",
  theCarText: "",
};

export default function AdminVehicleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [manufacturerId, setManufacturerId] = useState("");
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [manufacturers, setManufacturers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [newManufacturer, setNewManufacturer] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const [statusValue, setStatusValue] = useState(0);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusSaved, setStatusSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const [vehicleData, manufacturerData, typeData] = await Promise.all([
          getVehicleById(id),
          getManufacturers(),
          getVehicleTypes(),
        ]);

        if (!active) return;

        setVehicle(vehicleData);
        setForm({
          title: vehicleData.title || "",
          year: vehicleData.year ?? "",
          model: vehicleData.model || "",
          trim: vehicleData.trim || "",
          mileage: vehicleData.mileage ?? "",
          transmission: vehicleData.transmission || "",
          exteriorColor: vehicleData.exteriorColor || "",
          interiorColor: vehicleData.interiorColor || "",
          price: vehicleData.price ?? "",
          isFeatured: Boolean(vehicleData.isFeatured),
          description: vehicleData.description || "",
          historyText: vehicleData.historyText || "",
          theCarText: vehicleData.theCarText || "",
        });
        setManufacturerId(String(vehicleData.manufacturerId || ""));
        setVehicleTypeId(String(vehicleData.vehicleTypeId || ""));
        setStatusValue(vehicleData.status ?? 0);
        setManufacturers(manufacturerData || []);
        setVehicleTypes(typeData || []);
        setLoadError(null);
      } catch (err) {
        console.error("Failed to load vehicle:", err);
        if (active) setLoadError("Couldn't load this vehicle.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
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

  async function handleSaveDetails(event) {
    event.preventDefault();

    if (!manufacturerId || !vehicleTypeId) {
      setSaveError("Choose a manufacturer and vehicle type.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSavedMessage(false);

    try {
      await updateVehicle(id, {
        manufacturerId: Number(manufacturerId),
        vehicleTypeId: Number(vehicleTypeId),
        title: form.title,
        slug: vehicle.slug,
        year: Number(form.year),
        model: form.model,
        trim: form.trim || null,
        mileage: form.mileage === "" ? null : Number(form.mileage),
        transmission: form.transmission || null,
        exteriorColor: form.exteriorColor || null,
        interiorColor: form.interiorColor || null,
        price: form.price === "" ? null : Number(form.price),
        status: statusValue,
        isFeatured: form.isFeatured,
        description: form.description || null,
        historyText: form.historyText || null,
        theCarText: form.theCarText || null,
      });

      setVehicle((current) => ({
        ...current,
        ...form,
        manufacturerId: Number(manufacturerId),
        vehicleTypeId: Number(vehicleTypeId),
      }));
      setSavedMessage(true);
    } catch (err) {
      console.error("Failed to save vehicle:", err);
      const message =
        err.response?.status === 400 && typeof err.response?.data === "string"
          ? err.response.data
          : "Couldn't save changes. Check the fields and try again.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveStatus() {
    setStatusSaving(true);
    setStatusError(null);
    setStatusSaved(false);

    try {
      await updateVehicleStatus(id, Number(statusValue));
      setStatusSaved(true);
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatusError("Couldn't update status. Try again.");
    } finally {
      setStatusSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-vehicle-edit">
        <p className="admin-empty-state">Loading vehicle…</p>
      </div>
    );
  }

  if (loadError || !vehicle) {
    return (
      <div className="admin-vehicle-edit">
        <p className="admin-error-banner">{loadError || "Vehicle not found."}</p>
        <button type="button" className="admin-secondary-btn" onClick={() => navigate("/admin/vehicles")}>
          ‹ Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="admin-vehicle-edit">
      <div className="admin-page-heading">
        <h1>Edit Vehicle</h1>
        <p>
          {vehicle.year} {form.title || vehicle.model}
        </p>
      </div>

      <div className="admin-vehicle-edit-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-vehicle-edit-tab${
              activeTab === tab.key ? " admin-vehicle-edit-tab-active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" && (
        <form className="admin-form-card admin-vehicle-form" onSubmit={handleSaveDetails}>
          <div className="admin-vehicle-edit-identity">
            <span className="admin-vehicle-edit-identity-vin">
              VIN {readVin(vehicle) || "— none on file —"} (read-only — delete and
              recreate this Draft if the VIN was entered incorrectly)
            </span>
          </div>

          <div className="admin-form-grid">
            <label className="admin-field admin-field--wide">
              <span>Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
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

            <EditorialTextField
              label="THE CAR"
              intent="TheCar"
              value={form.theCarText}
              onChange={(value) => updateField("theCarText", value)}
              placeholder="Configuration, ownership, condition, specification, provenance, notable equipment, driving character…"
              vehicleContext={{
                manufacturerName:
                  manufacturers.find((m) => String(m.id) === manufacturerId)?.name || null,
                model: form.model || null,
                trim: form.trim || null,
                year: form.year ? Number(form.year) : null,
                mileage: form.mileage ? Number(form.mileage) : null,
                transmission: form.transmission || null,
                exteriorColor: form.exteriorColor || null,
                interiorColor: form.interiorColor || null,
                vin: readVin(vehicle) || null,
              }}
            />

            <EditorialTextField
              label="HISTORY"
              intent="History"
              value={form.historyText}
              onChange={(value) => updateField("historyText", value)}
              placeholder="Model introduction, historical significance, production context, engineering background, notable variants, collector relevance…"
              vehicleContext={{
                manufacturerName:
                  manufacturers.find((m) => String(m.id) === manufacturerId)?.name || null,
                model: form.model || null,
                trim: form.trim || null,
                year: form.year ? Number(form.year) : null,
                mileage: form.mileage ? Number(form.mileage) : null,
                transmission: form.transmission || null,
                exteriorColor: form.exteriorColor || null,
                interiorColor: form.interiorColor || null,
                vin: readVin(vehicle) || null,
              }}
            />
          </div>

          {saveError && <p className="admin-error-banner">{saveError}</p>}

          <div className="admin-vehicle-edit-save-row">
            <button type="submit" className="admin-primary-btn" disabled={saving}>
              {saving ? "Saving…" : "Save Details"}
            </button>
            {savedMessage && !saving && (
              <span className="admin-vehicle-edit-saved-msg">Saved ✓</span>
            )}
          </div>
        </form>
      )}

      {activeTab === "photos" && (
        <VehiclePhotoUploadStep
          vehicleId={Number(id)}
          onDone={() => navigate("/admin/vehicles")}
        />
      )}

      {activeTab === "status" && (
        <div className="admin-form-card">
          <label className="admin-field admin-field--wide">
            <span>Status</span>
            <select
              value={statusValue}
              onChange={(event) => {
                setStatusValue(Number(event.target.value));
                setStatusSaved(false);
              }}
            >
              {VEHICLE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {statusError && <p className="admin-error-banner">{statusError}</p>}

          <div className="admin-vehicle-edit-save-row">
            <button
              type="button"
              className="admin-primary-btn"
              disabled={statusSaving}
              onClick={handleSaveStatus}
            >
              {statusSaving ? "Saving…" : "Save Status"}
            </button>
            {statusSaved && !statusSaving && (
              <span className="admin-vehicle-edit-saved-msg">Saved ✓</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
