import axios from "axios";

const PRODUCTION_API_BASE_URL = "https://revart-api-79.azurewebsites.net/api";
const LOCAL_API_BASE_URL = "http://localhost:5146/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL);

// Admin auth uses an HttpOnly cookie, so every request (not just /auth/*)
// must carry credentials for protected admin endpoints to work.
axios.defaults.withCredentials = true;
