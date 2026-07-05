import axios from "axios";

const API_BASE_URL = "https://revart-api-79.azurewebsites.net/api";

export async function getVehicles() {
  const response = await axios.get(`${API_BASE_URL}/Vehicles`);
  return response.data;
}

export async function getVehicleBySlug(slug) {
  const response = await axios.get(`${API_BASE_URL}/Vehicles/${slug}`);
  return response.data;
}