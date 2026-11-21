import type { SpecialtyTag } from "@/lib/admin/types";

/**
 * Human-readable English labels for the `specialty_tags` vocabulary.
 * TODO: if `specialty_tags` is a live table with French labels, read from it.
 */
export const SPECIALTY_LABELS: Record<SpecialtyTag, string> = {
  used: "Used books",
  antiquarian: "Antiquarian",
  childrens: "Children's",
  francophone: "Francophone",
  indigenous: "Indigenous",
  lgbtq: "LGBTQ+",
  genre_fiction: "Genre fiction",
  academic: "Academic",
  art_design: "Art & design",
  multilingual: "Multilingual",
  comics_graphic: "Comics & graphic novels",
  mystery_crime: "Mystery & crime",
  sci_fi_fantasy: "Sci-fi & fantasy",
  travel: "Travel",
  religion_spirit: "Religion & spirituality",
  nature_outdoors: "Nature & outdoors",
  history: "History",
  feminist: "Feminist",
  zines: "Zines",
};

/** Label for a tag, falling back to a title-cased version of unknown tags. */
export function specialtyLabel(tag: string): string {
  if (tag in SPECIALTY_LABELS) {
    return SPECIALTY_LABELS[tag as SpecialtyTag];
  }
  const words = tag.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
