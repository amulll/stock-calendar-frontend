"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

let openModalCount = 0;
let originalBodyOverflow = "";
let originalBodyPaddingRight = "";

function lockBodyScroll() {
  const { body, documentElement } = document;

  if (openModalCount === 0) {
    originalBodyOverflow = body.style.overflow;
    originalBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  openModalCount += 1;
}

function unlockBodyScroll() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount !== 0) return;

  const { body } = document;
  body.style.overflow = originalBodyOverflow;
  body.style.paddingRight = originalBodyPaddingRight;
}

export default function ModalContainer({
  isOpen,
  onClose,
  children,
  contentClassName = "max-w-lg",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const container = containerRef.current;
    lockBodyScroll();

    if (container) container.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && container) {
        const focusables = container.querySelectorAll(FOCUSABLE_SELECTORS);
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockBodyScroll();
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`w-full ${contentClassName} focus:outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
