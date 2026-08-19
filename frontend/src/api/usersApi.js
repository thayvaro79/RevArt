import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getUsers() {
  const response = await axios.get(`${API_BASE_URL}/Users`);
  return response.data;
}

export async function getUser(id) {
  const response = await axios.get(`${API_BASE_URL}/Users/${id}`);
  return response.data;
}

export async function createUser(payload) {
  const response = await axios.post(`${API_BASE_URL}/Users`, payload);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await axios.put(`${API_BASE_URL}/Users/${id}`, payload);
  return response.data;
}

export async function setUserActive(id, isActive) {
  const response = await axios.put(`${API_BASE_URL}/Users/${id}/active`, {
    isActive,
  });
  return response.data;
}
