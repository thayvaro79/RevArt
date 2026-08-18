import { useNavigate } from "react-router-dom";
import VehicleEntryChoices from "./VehicleEntryChoices";
import { CloseIcon } from "./icons";

export default function QuickAddSheet({ onClose }) {
  const navigate = useNavigate();

  function handleSelect(mode) {
    onClose();
    navigate("/admin/vehicles/new", { state: { mode } });
  }

  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <div
        className="quick-add-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Quick add vehicle"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="quick-add-sheet-header">
          <p className="quick-add-sheet-title">Add a Vehicle</p>
          <button
            type="button"
            className="quick-add-sheet-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <VehicleEntryChoices onSelect={handleSelect} />
      </div>
    </div>
  );
}
