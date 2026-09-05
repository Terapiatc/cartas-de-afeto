/**
 * Absolute public URL of the site (no trailing slash).
 * Set VITE_SITE_URL in the hosting environment (e.g. https://cartas.exemplo.com.br)
 * so social previews can point at an absolute image URL.
 */
export const SITE_URL: string = (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(
  /\/+$/,
  "",
) ?? "";

/** Share image (preview of the envelopes page). Empty when SITE_URL is not configured. */
export const OG_IMAGE: string = SITE_URL ? `${SITE_URL}/og-cartas.jpg` : "";

export function socialImageMeta(): Array<{ property?: string; name?: string; content: string }> {
  if (!OG_IMAGE) return [];
  return [
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:image", content: OG_IMAGE },
  ];
}
