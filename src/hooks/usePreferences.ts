import { useEffect, useState } from "react";
import { defaultPreferences, type Preferences } from "../lib/types";

const STORAGE_KEY = "focusroom-preferencias";

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // no bloquear la app si falla
    }
  }, [preferences]);

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  return { preferences, updatePreference };
}
