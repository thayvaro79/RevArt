import axios from "axios";

const API_BASE_URL = "http://localhost:5146/api";

export async function getPageHero(pageKey, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/PageHeroes/${pageKey}?tenantId=${tenantId}`
  );

  return response.data;
}