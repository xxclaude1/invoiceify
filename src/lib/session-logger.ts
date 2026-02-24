"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  collectFingerprint,
  generateFingerprintHash,
  collectReferralData,
  BehavioralTracker,
} from "./collector";

interface FieldChange {
  fieldName: string;
  fieldValue: string;
}

export function useSessionLogger() {
  const sessionIdRef = useRef<string | null>(null);
  const pendingFieldsRef = useRef<FieldChange[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingRef = useRef(false);
  const trackerRef = useRef<BehavioralTracker | null>(null);
  const behavioralTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize behavioral tracker on mount
  useEffect(() => {
    trackerRef.current = new BehavioralTracker();
    return () => {
      trackerRef.current?.destroy();
      trackerRef.current = null;
      if (behavioralTimerRef.current) clearInterval(behavioralTimerRef.current);
    };
  }, []);

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

      // Collect fingerprint and referral data
      const fingerprint = await collectFingerprint();
      const fingerprintHash = await generateFingerprintHash(fingerprint);
      const referralData = collectReferralData();

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: documentType || undefined,
          deviceInfo,
          referralSource: document.referrer || undefined,
          pageUrl: window.location.href,
          fingerprint,
          fingerprintHash,
          preferredLangs: navigator.languages.join(", "),
          ...referralData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        sessionIdRef.current = data.sessionId;

        // Start periodic behavioral snapshot uploads every 30s
        behavioralTimerRef.current = setInterval(() => {
          sendBehavioralSnapshot();
        }, 30000);
      }
    } catch (e) {
      console.error("Failed to create session:", e);
    } finally {
      creatingRef.current = false;
    }

    return sessionIdRef.current;
  }, []);

  // Send behavioral snapshot to server
  const sendBehavioralSnapshot = useCallback(async () => {
    if (!sessionIdRef.current || !trackerRef.current) return;
    const snapshot = trackerRef.current.getSnapshot();
    try {
      await fetch("/api/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          behavioral: {
            fieldTimings: snapshot.fieldTimings,
            editCounts: snapshot.editCounts,
            fieldOrder: snapshot.fieldOrder,
            pasteEvents: snapshot.pasteEvents,
            typingSpeeds: snapshot.typingSpeeds,
            scrollDepth: snapshot.scrollDepth,
            tabSwitches: snapshot.tabSwitches,
            rageClicks: snapshot.rageClicks,
            copyEvents: snapshot.copyEvents,
            rightClickEvents: snapshot.rightClickEvents,
            validationErrors: snapshot.validationErrors,
            duration: snapshot.duration,
            pageLoadTime: snapshot.pageLoadTime,
          },
          mouseHeatmap: snapshot.mouseHeatmap,
          clickMap: snapshot.clickMap,
        }),
      });
    } catch (e) {
      console.error("Failed to send behavioral data:", e);
    }
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
      // Send final behavioral snapshot
      await sendBehavioralSnapshot();
      await updateSession({ completed: true, documentId });
    },
    [flushFields, sendBehavioralSnapshot, updateSession]
  );

  // Field focus/blur/edit handlers for wizard integration
  const onFieldFocus = useCallback((fieldName: string) => {
    trackerRef.current?.onFieldFocus(fieldName);
  }, []);

  const onFieldBlur = useCallback((fieldName: string) => {
    trackerRef.current?.onFieldBlur(fieldName);
  }, []);

  const onFieldEdit = useCallback((fieldName: string) => {
    trackerRef.current?.onFieldEdit(fieldName);
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      if (behavioralTimerRef.current) clearInterval(behavioralTimerRef.current);

      // Best-effort flush on unmount
      if (sessionIdRef.current && pendingFieldsRef.current.length > 0) {
        const fields = pendingFieldsRef.current;
        navigator.sendBeacon(
          "/api/sessions/log",
          JSON.stringify({ sessionId: sessionIdRef.current, fields })
        );
      }

      // Best-effort behavioral flush on unmount
      if (sessionIdRef.current && trackerRef.current) {
        const snapshot = trackerRef.current.getSnapshot();
        navigator.sendBeacon(
          "/api/sessions",
          JSON.stringify({
            sessionId: sessionIdRef.current,
            behavioral: {
              fieldTimings: snapshot.fieldTimings,
              editCounts: snapshot.editCounts,
              fieldOrder: snapshot.fieldOrder,
              pasteEvents: snapshot.pasteEvents,
              typingSpeeds: snapshot.typingSpeeds,
              scrollDepth: snapshot.scrollDepth,
              tabSwitches: snapshot.tabSwitches,
              rageClicks: snapshot.rageClicks,
              copyEvents: snapshot.copyEvents,
              rightClickEvents: snapshot.rightClickEvents,
              validationErrors: snapshot.validationErrors,
              duration: snapshot.duration,
              pageLoadTime: snapshot.pageLoadTime,
            },
            mouseHeatmap: snapshot.mouseHeatmap,
            clickMap: snapshot.clickMap,
          })
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
    onFieldFocus,
    onFieldBlur,
    onFieldEdit,
  };
}
