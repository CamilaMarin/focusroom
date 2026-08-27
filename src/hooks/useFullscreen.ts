import { useEffect, useState } from "react";

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const supported = typeof document !== "undefined" && !!document.documentElement.requestFullscreen;

  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function enter() {
    if (!supported) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fallback silencioso — el navegador puede negar el permiso
    }
  }

  async function exit() {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // no-op
      }
    }
  }

  return { isFullscreen, supported, enter, exit };
}
