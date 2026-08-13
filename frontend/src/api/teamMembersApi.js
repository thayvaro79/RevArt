import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getTeamMembers(tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/TeamMembers?tenantId=${tenantId}`
  );

  return response.data;
}

export async function getTeamMemberBySlug(slug, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/TeamMembers/${slug}?tenantId=${tenantId}`
  );

  return response.data;
}
