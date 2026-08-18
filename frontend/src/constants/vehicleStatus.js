// Numeric values must match RevArt.Core.Enums.VehicleStatus on the backend,
// since the API deserializes vehicle status as an unadorned enum (number).
export const VEHICLE_STATUS = {
  Draft: 0,
  ComingSoon: 1,
  Available: 2,
  Sold: 3,
  Inactive: 4,
};

export const VEHICLE_STATUS_OPTIONS = [
  { value: VEHICLE_STATUS.Draft, label: "Draft" },
  { value: VEHICLE_STATUS.ComingSoon, label: "Coming Soon" },
  { value: VEHICLE_STATUS.Available, label: "Available" },
  { value: VEHICLE_STATUS.Sold, label: "Sold" },
  { value: VEHICLE_STATUS.Inactive, label: "Inactive" },
];
