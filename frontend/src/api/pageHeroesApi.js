import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getPageHero(pageKey, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/PageHeroes/${pageKey}?tenantId=${tenantId}`
  );

  return response.data;
}