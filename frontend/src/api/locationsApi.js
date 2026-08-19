import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getLocations(tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/Locations?tenantId=${tenantId}`
  );

  return response.data;
}

export async function getLocationBySlug(slug, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/Locations/${slug}?tenantId=${tenantId}`
  );

  return response.data;
}

export async function getLocationsAdmin(tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/Locations/admin?tenantId=${tenantId}`
  );

  return response.data;
}

export async function getLocationByIdAdmin(id, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/Locations/admin/${id}?tenantId=${tenantId}`
  );

  return response.data;
}

export async function createLocation(location) {
  const response = await axios.post(`${API_BASE_URL}/Locations`, location);
  return response.data;
}

export async function updateLocation(id, location) {
  const response = await axios.put(
    `${API_BASE_URL}/Locations/${id}`,
    location
  );
  return response.data;
}

export async function setLocationActive(id, isActive) {
  const response = await axios.put(`${API_BASE_URL}/Locations/${id}/active`, {
    isActive,
  });
  return response.data;
}
