import { LoadingIcon } from "@/components/ui/icons";

/**
 * The admin while its layout checks the session. Compact and still: the
 * office's wordmark where the rail will be, and one status line. It keeps
 * the public plate skeleton (app/loading.tsx) out of the admin.
 */
export default function AdminLoading() {
  return (
    <div data-density="compact" className="min-h-dvh bg-bg px-(--gutter) pt-6 text-ui">
      <p className="font-display text-[1.0625rem] leading-tight font-bold text-ink">Indie Books Atlas</p>
      <p className="font-display text-[0.84375rem] text-ink-dim italic">Compilation office</p>
      <p role="status" className="mt-6 flex items-center gap-2 text-ui text-ink-dim">
        <LoadingIcon className="size-4 text-moss" />
        <span className="font-display italic">Checking your session…</span>
      </p>
    </div>
  );
}
