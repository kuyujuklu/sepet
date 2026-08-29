import { latlng_for_location } from "./static-data/data";

const SITE_URL = "https://sepet.md";
const API_SERV = process.env.API_SERV || "qrcodesapi";
const LOCALES = ["ru", "ro"];

// get-available-pubs is zone/distance filtered (confirmed: it returns an
// empty list for a coordinate outside delivery range), so there is no single
// call that returns every pub - querying from each of our 31 known town
// centers and deduping by url_name is the same approach the location picker
// already relies on for "which towns do we serve".
async function fetchPubsNear(lat, lng) {
  try {
    const res = await fetch(
      `http://${API_SERV}/api/client/get-available-pubs?lat=${lat}&lng=${lng}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.pubs ?? [];
  } catch (e) {
    return [];
  }
}

export default async function sitemap() {
  const coordsList = Object.values(latlng_for_location);
  const results = await Promise.all(
    coordsList.map(({ lat, lng }) => fetchPubsNear(lat, lng)),
  );

  const pubsByUrlName = new Map();
  for (const pubs of results) {
    for (const pub of pubs) {
      if (pub?.url_name && !pubsByUrlName.has(pub.url_name)) {
        pubsByUrlName.set(pub.url_name, pub);
      }
    }
  }

  const staticEntries = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const pubEntries = Array.from(pubsByUrlName.values()).flatMap((pub) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/pub/${pub.url_name}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    })),
  );

  return [...staticEntries, ...pubEntries];
}
