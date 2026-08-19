import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getPageSections(pageName, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/PageSections/${pageName}?tenantId=${tenantId}`
  );

  return response.data;
}

export async function updatePageSection(
  pageName,
  sectionKey,
  section,
  tenantId = 1
) {
  const response = await axios.put(
    `${API_BASE_URL}/PageSections/${pageName}/${sectionKey}`,
    {
      tenantId,
      heading: section.heading,
      body: section.body,
      imageUrl: section.imageUrl,
    }
  );

  return response.data;
}
