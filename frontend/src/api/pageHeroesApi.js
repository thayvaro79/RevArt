import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

export async function getPageHero(pageKey, tenantId = 1) {
  const response = await axios.get(
    `${API_BASE_URL}/PageHeroes/${pageKey}?tenantId=${tenantId}`
  );

  return response.data;
}

export async function updatePageHero(pageKey, hero, tenantId = 1) {
  const response = await axios.put(`${API_BASE_URL}/PageHeroes/${pageKey}`, {
    tenantId,
    eyebrowText: hero.eyebrowText,
    title: hero.title,
    subtitle: hero.subtitle,
    buttonText: hero.buttonText,
    buttonUrl: hero.buttonUrl,
    imageUrl: hero.imageUrl,
  });

  return response.data;
}