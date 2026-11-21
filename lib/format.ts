const PROVINCE_NAMES: Record<string, string> = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
};

/** "ON" → "Ontario". Unknown values pass through unchanged. */
export function provinceName(code: string | null): string | null {
  if (!code) return null;
  return PROVINCE_NAMES[code.toUpperCase()] ?? code;
}

/** "+17055551234" (E.164, as the pipeline stores it) → "(705) 555-1234". */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return phone;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

/** "https://www.example.com/shop/" → "example.com/shop". */
export function displayUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const path = pathname === "/" ? "" : pathname.replace(/\/$/, "");
    return `${hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}

const SYNC_DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "long",
  timeZone: "America/Toronto",
});

/** A sync timestamp → "November 17, 2026" (Eastern time). */
export function formatSyncDate(date: Date | string): string {
  return SYNC_DATE_FORMAT.format(typeof date === "string" ? new Date(date) : date);
}
