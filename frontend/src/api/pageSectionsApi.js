import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getPageSections(pageName, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/PageSections/${pageName}?tenantId=${tenantId}`
  );

  return response.data;
}
