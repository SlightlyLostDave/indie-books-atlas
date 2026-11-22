import NoEntry from "@/components/layout/NoEntry";

/** A store slug with no entry: the copy is Dave's from Phase 3. */
export default function StoreNotFound() {
  return (
    <NoEntry
      crumb="Not in the atlas"
      title="We couldn't find that bookstore"
      primary={{ href: "/submit", label: "Suggest a store" }}
    >
      <p>
        It may have moved, closed, or not been verified yet. If you know a store that belongs here, tell us about
        it.
      </p>
    </NoEntry>
  );
}
