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

export async function getTeamMembersAdmin(tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/TeamMembers/admin?tenantId=${tenantId}`
  );

  return response.data;
}

export async function getTeamMemberByIdAdmin(id, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/TeamMembers/admin/${id}?tenantId=${tenantId}`
  );

  return response.data;
}

export async function createTeamMember(member) {
  const response = await axios.post(`${API_BASE_URL}/TeamMembers`, member);
  return response.data;
}

export async function updateTeamMember(id, member) {
  const response = await axios.put(
    `${API_BASE_URL}/TeamMembers/${id}`,
    member
  );
  return response.data;
}

export async function setTeamMemberActive(id, isActive) {
  const response = await axios.put(
    `${API_BASE_URL}/TeamMembers/${id}/active`,
    { isActive }
  );
  return response.data;
}
