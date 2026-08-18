import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getManufacturers() {
  const response = await axios.get(`${API_BASE_URL}/Manufacturers`);
  return response.data;
}

export async function createManufacturer(name) {
  const response = await axios.post(`${API_BASE_URL}/Manufacturers`, { name });
  return response.data;
}
