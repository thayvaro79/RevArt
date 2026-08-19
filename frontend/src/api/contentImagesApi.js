import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function uploadContentImage(file, folder, tenantId = 1) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("tenantId", tenantId);
  formData.append("folder", folder);

  const response = await axios.post(
    `${API_BASE_URL}/Images/upload-content`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
}
