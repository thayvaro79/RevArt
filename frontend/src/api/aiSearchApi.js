import { API_BASE_URL } from "./apiConfig";

export async function searchVehicles(query, tenantId = 1) {
  const response = await fetch(
    `${API_BASE_URL}/AiSearch?tenantId=${tenantId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `AI vehicle search failed: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}