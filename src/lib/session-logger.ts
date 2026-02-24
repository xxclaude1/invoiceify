"use client";

import { useRef, useCallback, useEffect } from "react";

interface FieldChange {
  fieldName: string;
  fieldValue: string;
}

export function useSessionLogger() {
  const sessionIdRef = useRef<string | null>(null);
  const pendingFieldsRef = useRef<FieldChange[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingRef = useRef(false);

  // Create a session on first interaction
  const ensureSession = useCallback(async (documentType?: string | null) => {
    if (sessionIdRef.current || creatingRef.current) return sessionIdRef.current;
    creatingRef.current = true;

    try {
      const deviceInfo = {
        browser: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        language: navigator.language,
        platform: navigator.platform,
      };

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: documentType || undefined,
          deviceInfo,
          referralSource: document.referrer || undefined,
          pageUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.success) {
        sessionIdRef.current = data.sessionId;
      }
    } catch (e) {
      console.error("Failed to create session:", e);
    } finally {
      creatingRef.current = false;
    }

    return sessionIdRef.current;
  }, []);

  // Flush pending field logs to the server
  const flushFields = useCallback(async () => {
    if (!sessionIdRef.current || pendingFieldsRef.current.length === 0) return;

    const fields = [...pendingFieldsRef.current];
    pendingFieldsRef.current = [];

    try {
      await fetch("/api/sessions/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          fields,
        }),
      });
    } catch (e) {
      console.error("Failed to log fields:", e);
      // Re-add failed fields for retry
      pendingFieldsRef.current.push(...fields);
    }
  }, []);

  // Log a field change (debounced — flushes every 2 seconds)
  const logField = useCallback(
    (fieldName: string, fieldValue: string) => {
      pendingFieldsRef.current.push({ fieldName, fieldValue });

      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flushFields, 2000);
    },
    [flushFields]
  );

  // Update session with form snapshot
  const updateSession = useCallback(
    async (data: { documentType?: string | null; formSnapshot?: unknown; completed?: boolean; documentId?: string }) => {
      if (!sessionIdRef.current) return;

      try {
        await fetch("/api/sessions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            ...data,
          }),
        });
      } catch (e) {
        console.error("Failed to update session:", e);
      }
    },
    []
  );

  // Mark session as completed (called on download)
  const completeSession = useCallback(
    async (documentId?: string) => {
      // Flush any pending fields first
      await flushFields();
      await updateSession({ completed: true, documentId });
    },
    [flushFields, updateSession]
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      // Best-effort flush on unmount
      if (sessionIdRef.current && pendingFieldsRef.current.length > 0) {
        const fields = pendingFieldsRef.current;
        navigator.sendBeacon(
          "/api/sessions/log",
          JSON.stringify({ sessionId: sessionIdRef.current, fields })
        );
      }
    };
  }, []);

  return {
    ensureSession,
    logField,
    updateSession,
    completeSession,
    getSessionId: () => sessionIdRef.current,
  };
}
