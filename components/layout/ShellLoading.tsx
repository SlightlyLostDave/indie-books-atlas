import PageShell from "@/components/layout/PageShell";
import { LoadingIcon } from "@/components/ui/icons";

/**
 * A content route while it loads: the page shell already in place (running
 * head, colophon), and in the entry's column a single status line where the
 * title will land. Content routes don't get the plate skeleton of
 * app/loading.tsx, which belongs to the map.
 */
export default function ShellLoading({ label }: { label: string }) {
  return (
    <PageShell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-(--gutter) pt-10 pb-16 md:pt-16">
        <p role="status" className="flex items-center gap-2 border-b-2 border-ink pb-3 text-ui text-ink-dim">
          <LoadingIcon className="size-4 text-moss" />
          <span className="font-display italic">{label}</span>
        </p>
      </main>
    </PageShell>
  );
}
