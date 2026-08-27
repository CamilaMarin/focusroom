import { useEffect, useState } from "react";
import type { FocusSession } from "../lib/types";

const STORAGE_KEY = "focusroom-sesiones";

export function useSessions() {
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FocusSession[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Si falla la persistencia (ej. modo privado sin cuota), la app
      // sigue siendo usable — solo no se guarda el historial.
    }
  }, [sessions]);

  function addSession(session: FocusSession) {
    setSessions((prev) => [...prev, session]);
  }

  return { sessions, addSession };
}
