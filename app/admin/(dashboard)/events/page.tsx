import { PlannedSection } from "@/components/admin/PlannedSection";

export default function AdminEventsPage() {
  return (
    <PlannedSection
      title="Events"
      lede="Book fairs and literary events, curated by hand."
      willDo={
        <>
          <p>
            Add and edit the events behind a public calendar: book fairs first, such as Word on the Street, Expozine
            and the Ottawa Small Press Book Fair, with Independent Bookstore Day as the yearly anchor.
          </p>
          <p>
            Each event has dates, a place and a link, and can be tied to a store. Events stay unpublished until
            they&apos;re checked here, including ones readers suggest.
          </p>
        </>
      }
      waitingOn={
        <>
          <p>
            The public <span className="font-mono text-ui">/events</span> calendar, which isn&apos;t built yet, and
            the <span className="font-mono text-ui">events</span> table&apos;s full column list. The schema notes
            confirm only the link to a store and the published flag.
          </p>
          <p>The table is empty, so the first job will be entering the seed list of fairs.</p>
        </>
      }
      meanwhile={<p>Nothing is published, so the public site shows no events and there&apos;s nothing to keep current.</p>}
      placeholder="The events list will sit here."
    />
  );
}
