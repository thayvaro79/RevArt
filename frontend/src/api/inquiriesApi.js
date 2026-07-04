import axios from "axios";

const API_BASE_URL = "http://localhost:5146/api";

export async function createInquiry(inquiry) {
  const response = await axios.post(`${API_BASE_URL}/Inquiries`, inquiry);
  return response.data;
}