import Link from "next/link";
import { PlannedSection } from "@/components/admin/PlannedSection";
import { linkClass } from "@/lib/styles";

export default function AdminSubmissionsPage() {
  return (
    <PlannedSection
      title="Submissions"
      lede="Corrections and missing stores sent in by readers."
      willDo={
        <>
          <p>
            A review queue for what arrives through the public form: corrections to an entry, reports that a store
            has closed, and stores the atlas is missing.
          </p>
          <p>
            Each one is read beside the entry it concerns, then accepted into the record or turned down with a
            reason. Every decision goes in the change log, and nothing changes a store until a person accepts it.
          </p>
        </>
      }
      waitingOn={
        <>
          <p>
            The <span className="font-mono text-ui">submissions</span> table&apos;s columns. The pipeline&apos;s
            schema notes describe the table but don&apos;t list its columns yet, so neither the form nor this queue
            can be written against it.
          </p>
          <p>
            Then the public form at{" "}
            <Link href="/submit" className={linkClass}>
              /submit
            </Link>
            , which collects a change today but doesn&apos;t send it.
          </p>
        </>
      }
      meanwhile={
        <p>
          Nothing can arrive, so there&apos;s nothing to miss. Corrections that reach you another way can be made on
          the store&apos;s page under{" "}
          <Link href="/admin/stores" className={linkClass}>
            Stores
          </Link>
          .
        </p>
      }
      placeholder="The review queue will sit here."
    />
  );
}
