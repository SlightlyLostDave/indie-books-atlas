"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  toggleVerifiedAction,
  clearNeedsReviewAction,
  setPermanentlyClosedAction,
  softDeleteStoreAction,
  restoreStoreAction,
} from "@/app/admin/(dashboard)/stores/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CloseIcon } from "@/components/ui/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusMark } from "@/components/admin/StatusMark";
import { formatSyncDate } from "@/lib/format";
import type { AdminStoreRow } from "@/lib/admin/types";

type ActionResult = { success: boolean; error?: string };

/** One action in the panel: what it does in a sentence, then the control. */
function ActionRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-start gap-2 border-b border-line py-3 last:border-b-0">{children}</div>;
}

/**
 * A confirm for a status change. Destructive ones carry the danger top rule,
 * the × mark and a solid danger confirm named for the action (DESIGN.md,
 * Do and don't); restorative ones the plate rule and the moss primary.
 * Alert-dialog semantics are kept: focus is trapped and Cancel comes first.
 */
function ConfirmAction({
  trigger,
  title,
  description,
  confirm,
  destructive,
  disabled,
  onConfirm,
}: {
  trigger: string;
  title: string;
  description: ReactNode;
  confirm: string;
  destructive: boolean;
  disabled: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant={destructive ? "destructive" : "outline"} size="sm" disabled={disabled}>
            {trigger}
          </Button>
        }
      />
      <AlertDialogContent tone={destructive ? "danger" : "default"}>
        <AlertDialogHeader>
          {destructive && (
            <AlertDialogMedia>
              <CloseIcon />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription render={<div />} className="flex flex-col gap-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive-solid" : "default"}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StoreStatusActions({ store }: { store: AdminStoreRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<ActionResult>,
    success: { title: string; description?: string },
    failure: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(success.title, success.description ? { description: success.description } : undefined);
        router.refresh();
      } else {
        toast.error(failure, { description: result.error ?? "No reason was given.", duration: 10000 });
      }
    });
  }

  const adminPath = `/admin/stores/${store.slug}`;

  return (
    <div className="flex flex-col gap-(--gap-section)">
      <section aria-labelledby="status-heading" className="border-t-2 border-ink pt-3">
        <h2 id="status-heading" className="font-display text-heading font-semibold text-ink">
          Status
        </h2>

        <div className="mt-2">
          <ActionRow>
            <div className="flex w-full items-center justify-between gap-3">
              <span id="verified-label" className="text-ui font-medium text-ink">
                Verified
              </span>
              <Switch
                aria-labelledby="verified-label"
                aria-describedby="verified-note"
                checked={store.is_verified}
                disabled={isPending}
                onCheckedChange={(checked) =>
                  run(
                    () => toggleVerifiedAction(store.slug, checked),
                    { title: checked ? "Marked verified" : "Marked unverified" },
                    "Couldn't change verification",
                  )
                }
              />
            </div>
            <p id="verified-note" className="text-meta text-ink-dim">
              Saves as soon as it&apos;s switched. Verification adds 20 to completeness.
            </p>
          </ActionRow>

          <ActionRow>
            {store.needs_review ? (
              <>
                <StatusMark status="review" className="gap-1.5 text-ui font-medium" />
                <p className="text-meta text-ink-dim">
                  The pipeline flagged this store for a person to check. Only the pipeline sets this flag; clear it
                  once the store is checked.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    run(
                      () => clearNeedsReviewAction(store.slug),
                      { title: "Review flag cleared" },
                      "Couldn't clear the review flag",
                    )
                  }
                >
                  Clear the review flag
                </Button>
              </>
            ) : (
              <p className="font-display text-ui text-ink-faint italic">No review flag.</p>
            )}
          </ActionRow>
        </div>
      </section>

      {/* The withdrawal zone, under the double rule (DESIGN.md, Shape). */}
      <section aria-labelledby="withdraw-heading" className="border-t-[3px] border-double border-ink-faint pt-3">
        <h2 id="withdraw-heading" className="font-display text-heading font-semibold text-ink">
          Withdraw
        </h2>
        <p className="mt-1 font-display text-ui text-ink-dim italic">Both ask before they change anything.</p>

        <div className="mt-2">
          <ActionRow>
            {store.is_permanently_closed ? (
              <>
                <StatusMark status="closed" className="gap-1.5 text-ui font-medium" />
                <p className="text-meta text-ink-dim">The public page says this store has closed.</p>
                <ConfirmAction
                  trigger="Unmark closed…"
                  title={`Unmark ${store.name} as closed?`}
                  description={
                    <>
                      <p>Its public page will stop saying it has closed.</p>
                      <p>
                        The pipeline&apos;s schema treats this flag as permanent once set, so unmark only to correct a
                        mistake.
                      </p>
                    </>
                  }
                  confirm="Unmark closed"
                  destructive={false}
                  disabled={isPending}
                  onConfirm={() =>
                    run(
                      () => setPermanentlyClosedAction(store.slug, { value: false }),
                      { title: "No longer marked closed" },
                      "Couldn't change the closed flag",
                    )
                  }
                />
              </>
            ) : (
              <>
                <p className="text-meta text-ink-dim">
                  For a store that has shut for good. Its page says so and the listing stays up as a record.
                </p>
                <ConfirmAction
                  trigger="Mark permanently closed…"
                  title={`Mark ${store.name} permanently closed?`}
                  description={
                    <>
                      <p>Its public page will say it has closed. The listing stays up as a record.</p>
                      <p>
                        Treat this as permanent. The pipeline never sets or clears this flag, and its schema says it
                        isn&apos;t unset once on.
                      </p>
                    </>
                  }
                  confirm="Mark permanently closed"
                  destructive
                  disabled={isPending}
                  onConfirm={() =>
                    run(
                      () => setPermanentlyClosedAction(store.slug, { value: true }),
                      { title: "Marked permanently closed" },
                      "Couldn't mark the store closed",
                    )
                  }
                />
              </>
            )}
          </ActionRow>

          <ActionRow>
            {store.is_deleted ? (
              <>
                <StatusMark status="deleted" className="gap-1.5 text-ui font-medium" />
                <p className="text-meta text-ink-dim">
                  {store.deleted_at ? (
                    <>
                      Deleted on <span className="font-mono tabular-nums">{formatSyncDate(store.deleted_at)}</span>.{" "}
                    </>
                  ) : null}
                  Hidden from the public atlas and from the stores list.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    run(() => restoreStoreAction(store.slug), { title: "Store restored" }, "Couldn't restore the store")
                  }
                >
                  Restore store
                </Button>
              </>
            ) : (
              <>
                <p className="text-meta text-ink-dim">
                  Takes the store off the public atlas. The record is kept and can be restored from this page.
                </p>
                <ConfirmAction
                  trigger="Delete store…"
                  title={`Delete ${store.name}?`}
                  description={
                    <>
                      <p>
                        It comes off the public atlas. Its page can take up to a day to go, when the page next
                        rebuilds.
                      </p>
                      <p>
                        This is a soft delete: the record is kept and can be restored here. Deleted stores don&apos;t
                        appear in the stores list, so keep this address:{" "}
                        <span className="font-mono text-ink">{adminPath}</span>
                      </p>
                    </>
                  }
                  confirm="Delete store"
                  destructive
                  disabled={isPending}
                  onConfirm={() =>
                    run(
                      () => softDeleteStoreAction(store.slug),
                      { title: "Store deleted", description: "It can be restored from this page." },
                      "Couldn't delete the store",
                    )
                  }
                />
              </>
            )}
          </ActionRow>
        </div>
      </section>
    </div>
  );
}
