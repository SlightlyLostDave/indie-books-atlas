"use client";

import { useTransition } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AdminStoreRow } from "@/lib/admin/types";

export function StoreStatusActions({ store }: { store: AdminStoreRow }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ success: boolean; error?: string }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(successMessage);
        router.refresh();
      } else {
        toast.error(result.error ?? "Action failed");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-line bg-bg-raised p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-dim">
          Verified
        </span>
        <Switch
          checked={store.is_verified}
          disabled={isPending}
          onCheckedChange={(checked) =>
            run(
              () => toggleVerifiedAction(store.slug, checked),
              checked ? "Marked verified" : "Marked unverified",
            )
          }
        />
      </div>

      {store.needs_review && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => clearNeedsReviewAction(store.slug), "Cleared needs-review")}
        >
          Clear needs-review flag
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="destructive" size="sm" disabled={isPending}>
              {store.is_permanently_closed
                ? "Unmark permanently closed"
                : "Mark permanently closed"}
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {store.is_permanently_closed
                ? "Unmark this store as permanently closed?"
                : "Mark this store as permanently closed?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This is a human-only flag the pipeline never touches. It will
              stay this way until an admin changes it again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                run(
                  () =>
                    setPermanentlyClosedAction(store.slug, {
                      value: !store.is_permanently_closed,
                    }),
                  "Updated",
                )
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {store.is_deleted ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => restoreStoreAction(store.slug), "Store restored")}
        >
          Restore store
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm" disabled={isPending}>
                Delete store
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this store?</AlertDialogTitle>
              <AlertDialogDescription>
                This is a soft delete — the store is hidden from the public
                map but can be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => run(() => softDeleteStoreAction(store.slug), "Store deleted")}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
