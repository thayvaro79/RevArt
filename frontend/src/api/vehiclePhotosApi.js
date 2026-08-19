import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function uploadVehiclePhoto(
  file,
  { tenantId = 1, vehicleId, category, sortOrder, isCover = false },
  onUploadProgress
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tenantId", tenantId);
  formData.append("vehicleId", vehicleId);
  formData.append("category", category);
  formData.append("sortOrder", sortOrder);
  formData.append("isCover", isCover);

  const response = await axios.post(`${API_BASE_URL}/Images/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });

  return response.data;
}

export async function getVehiclePhotos(vehicleId) {
  const response = await axios.get(`${API_BASE_URL}/Vehicles/${vehicleId}/photos`);
  return response.data;
}

export async function setVehiclePhotoCover(photoId) {
  const response = await axios.put(`${API_BASE_URL}/Images/${photoId}/cover`);
  return response.data;
}

export async function setVehiclePhotoCategory(photoId, category) {
  const response = await axios.put(`${API_BASE_URL}/Images/${photoId}/category`, {
    category,
  });
  return response.data;
}

export async function deleteVehiclePhoto(photoId) {
  await axios.delete(`${API_BASE_URL}/Images/${photoId}`);
}
