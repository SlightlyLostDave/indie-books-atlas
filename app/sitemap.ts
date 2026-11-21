import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getStoreSlugs } from "@/lib/stores";

// Match the store pages' daily ISR window.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stores = await getStoreSlugs();

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...stores.map(({ slug, updated_at }) => ({
      url: `${SITE_URL}/stores/${slug}`,
      lastModified: updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
