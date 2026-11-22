/** 45.5203 → 45°31′13″ (degrees, minutes, whole seconds). */
function dms(value: number): string {
  const abs = Math.abs(value);
  let deg = Math.floor(abs);
  let min = Math.floor((abs - deg) * 60);
  let sec = Math.round(((abs - deg) * 60 - min) * 60);
  if (sec === 60) {
    sec = 0;
    min += 1;
  }
  if (min === 60) {
    min = 0;
    deg += 1;
  }
  return `${deg}°${String(min).padStart(2, "0")}′${String(sec).padStart(2, "0")}″`;
}

/** Coordinates as an atlas prints them: "45°31′13″N 73°34′40″W". */
export function formatCoordinates(lat: number, lng: number): string {
  return `${dms(lat)}${lat >= 0 ? "N" : "S"} ${dms(lng)}${lng >= 0 ? "E" : "W"}`;
}

export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
