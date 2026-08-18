import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function createInquiry(inquiry) {
  const response = await axios.post(`${API_BASE_URL}/Inquiries`, inquiry);
  return response.data;
}

export async function getInquiries() {
  const response = await axios.get(`${API_BASE_URL}/Inquiries`);
  return response.data;
}

export async function updateInquiryStatus(id, status) {
  const response = await axios.put(`${API_BASE_URL}/Inquiries/${id}/status`, {
    status,
  });
  return response.data;
}