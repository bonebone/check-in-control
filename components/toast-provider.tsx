"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type ToastContextValue = {
  showToast: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function FloatingNotice(props: {
  message: string;
  visible: boolean;
}) {
  return (
    <div className={`floating-notice ${props.visible ? "visible" : ""}`} aria-live="polite" aria-atomic="true">
      {props.message}
    </div>
  );
}

export function ToastProvider(props: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((nextMessage: string, durationMs = 1800) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setMessage(nextMessage);
    setVisible(true);
    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {props.children}
      <FloatingNotice message={message} visible={visible} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
