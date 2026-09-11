import { useEffect, useRef, useState } from "react";
import { applyDomLocalization } from "../../../utils/localization/localizationUtils.js";

const PORTAL_LANGUAGE_STORAGE_KEY = "labamu-portal-language";

// Customer Portal's own EN/ID language state — deliberately independent of
// the main app's `labamu-language` setting (the portal is a public-facing
// surface with no locale context of its own, see App.jsx's early-return
// comment for /portal routes). Scoped to `rootRef` rather than
// document.body so it only ever translates this page's own content, and the
// app-wide localization effect in App.jsx explicitly skips /portal routes so
// the two never fight over the same DOM.
export const usePortalLanguage = (rootRef) => {
  const isApplyingRef = useRef(false);
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(PORTAL_LANGUAGE_STORAGE_KEY);
    return stored === "id" ? "id" : "en";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PORTAL_LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    const rootNode = rootRef.current;
    if (!rootNode || typeof MutationObserver === "undefined") return undefined;

    const runLocalization = () => {
      if (isApplyingRef.current) return;
      isApplyingRef.current = true;
      try {
        applyDomLocalization(rootNode, language);
      } finally {
        isApplyingRef.current = false;
      }
    };

    runLocalization();

    const observer = new MutationObserver(() => runLocalization());
    observer.observe(rootNode, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [rootRef, language]);

  return [language, setLanguage];
};
