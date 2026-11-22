"use client";

import ErrorEntry from "@/components/layout/ErrorEntry";

/** A route that failed to render, inside the root layout. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorEntry digest={error.digest} retry={retry} />;
}
