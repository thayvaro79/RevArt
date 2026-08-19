import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function login(email, password) {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
}

export async function logout() {
  await axios.post(`${API_BASE_URL}/auth/logout`);
}

export async function getCurrentUser() {
  const response = await axios.get(`${API_BASE_URL}/auth/me`);
  return response.data;
}
