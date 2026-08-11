import axios from "axios";

const API_BASE_URL = "http://localhost:5146/api";

export async function getPageSections(pageName, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/PageSections/${pageName}?tenantId=${tenantId}`
  );

  return response.data;
}
