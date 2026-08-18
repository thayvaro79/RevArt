import { ScanIcon, KeyboardIcon, PencilIcon } from "./icons";

const CHOICES = [
  {
    mode: "scan",
    icon: ScanIcon,
    title: "Scan VIN",
    description: "Use your camera to read the VIN plate, then confirm it.",
  },
  {
    mode: "enter",
    icon: KeyboardIcon,
    title: "Enter VIN",
    description: "Type in a VIN to start the listing pre-filled.",
  },
  {
    mode: "manual",
    icon: PencilIcon,
    title: "Add Manually",
    description: "Fill out the full vehicle listing yourself.",
  },
];

export default function VehicleEntryChoices({ onSelect }) {
  return (
    <div className="vehicle-entry-choices">
      {CHOICES.map(({ mode, icon: Icon, title, description }) => (
        <button
          key={mode}
          type="button"
          className="vehicle-entry-choice"
          onClick={() => onSelect(mode)}
        >
          <span className="vehicle-entry-choice-icon">
            <Icon />
          </span>
          <span className="vehicle-entry-choice-title">{title}</span>
          <span className="vehicle-entry-choice-description">
            {description}
          </span>
        </button>
      ))}
    </div>
  );
}
