import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getVehicleTypes() {
  const response = await axios.get(`${API_BASE_URL}/VehicleTypes`);
  return response.data;
}

export async function createVehicleType(name) {
  const response = await axios.post(`${API_BASE_URL}/VehicleTypes`, { name });
  return response.data;
}
