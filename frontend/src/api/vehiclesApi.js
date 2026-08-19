import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getVehicles() {
  const response = await axios.get(`${API_BASE_URL}/Vehicles`);
  return response.data;
}

export async function getVehicleBySlug(slug) {
  const response = await axios.get(`${API_BASE_URL}/Vehicles/${slug}`);
  return response.data;
}

export async function getVehicleById(id) {
  const response = await axios.get(`${API_BASE_URL}/Vehicles/${id}`);
  return response.data;
}

export async function decodeVin(vin) {
  const response = await axios.get(
    `${API_BASE_URL}/Vehicles/decode-vin/${encodeURIComponent(vin)}`
  );
  return response.data;
}

export async function createVehicle(vehicle) {
  const response = await axios.post(`${API_BASE_URL}/Vehicles`, vehicle);
  return response.data;
}

export async function updateVehicle(id, vehicle) {
  const response = await axios.put(`${API_BASE_URL}/Vehicles/${id}`, vehicle);
  return response.data;
}

export async function deleteVehicle(id) {
  const response = await axios.delete(`${API_BASE_URL}/Vehicles/${id}`);
  return response.data;
}

export async function updateVehicleStatus(id, status) {
  const response = await axios.put(`${API_BASE_URL}/Vehicles/${id}/status`, {
    status,
  });
  return response.data;
}