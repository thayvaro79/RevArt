import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function createInquiry(inquiry) {
  const response = await axios.post(`${API_BASE_URL}/Inquiries`, inquiry);
  return response.data;
}