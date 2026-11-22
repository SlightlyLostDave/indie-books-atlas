"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const StoreLocationMap = dynamic(() => import("@/components/store/StoreLocationMap"), { ssr: false });

interface LazyStoreLocationMapProps {
  lat: number;
  lng: number;
  name: string;
}

/**
 * The location inset, with mapbox-gl (about 490 KB over the wire) fetched only
 * once the inset comes within 200px of the viewport. Loaded eagerly, its
 * script boot held the store page's LCP back by about 2-3 s on mobile; lazily,
 * the page paints first and the map follows. Until then the inset is an
 * empty bg-step field inside its neatline.
 */
export default function LazyStoreLocationMap(props: LazyStoreLocationMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full bg-bg-step">
      {near && <StoreLocationMap {...props} />}
    </div>
  );
}
