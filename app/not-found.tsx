import NoEntry from "@/components/layout/NoEntry";

/**
 * Any other address with nothing behind it, instead of Next's stock white
 * 404, which ignores the theme (AUDIT F-NOTFOUND-1).
 */
export default function NotFound() {
  return (
    <NoEntry crumb="No such page" title="Nothing at this address" primary={{ href: "/", label: "Open Plate 1" }}>
      <p>The atlas has no page here. The link may be mistyped, or the page may have moved.</p>
    </NoEntry>
  );
}
