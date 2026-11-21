"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StoresFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search name or city…"
        defaultValue={searchParams.get("search") ?? ""}
        className="max-w-xs"
        onChange={(e) => setParam("search", e.target.value)}
      />
      <Select
        value={searchParams.get("verified") ?? "all"}
        onValueChange={(v) => setParam("verified", v === "all" || !v ? "" : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Verification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stores</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="unverified">Unverified</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("needsReview") === "true" ? "true" : "all"}
        onValueChange={(v) => setParam("needsReview", v === "true" ? "true" : "")}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Needs review" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="true">Needs review only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
