import { useEffect, useState } from "react";
import { MOBILE_BREAKPOINT } from "../constants/layoutConstants.js";

/**
 * True when the viewport is at or below the mobile breakpoint. Backed by
 * matchMedia so it updates live on resize/orientation change (e.g. devtools
 * responsive mode, or rotating a tablet), not just on initial mount.
 */
export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(mediaQueryList.matches);
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", handleChange);
      return () => mediaQueryList.removeEventListener("change", handleChange);
    }
    // Safari < 14 fallback
    mediaQueryList.addListener(handleChange);
    return () => mediaQueryList.removeListener(handleChange);
  }, [query]);

  return isMobile;
}
