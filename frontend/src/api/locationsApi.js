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
