import { useEffect, useRef } from 'react';

// Accessibility helper for modal dialogs. Attach the returned ref to the modal
// content element (also give it role="dialog" aria-modal="true" tabIndex={-1}
// and an aria-label). It:
//   • closes the dialog on Escape (when onClose is provided),
//   • traps Tab focus inside the dialog,
//   • moves focus into the dialog on open (unless something inside is already
//     focused, e.g. an autoFocus input), and
//   • restores focus to the previously-focused element on close.
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// `active` gates the whole behavior. Pass the modal's open flag for panels that
// stay mounted while closed (so we don't trap Tab globally when hidden); leave
// it defaulted for modals that unmount when closed.
export function useDialog(onClose, active = true) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const prevActive = typeof document !== 'undefined' ? document.activeElement : null;
    const list = () => (node ? Array.from(node.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null || el === document.activeElement) : []);

    // Preserve an existing autoFocus; otherwise focus the first control (or the
    // container) so keyboard users start inside the dialog.
    if (node && !node.contains(document.activeElement)) {
      const f = list();
      (f[0] || node).focus?.();
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (onClose) { e.stopPropagation(); onClose(); }
        return;
      }
      if (e.key === 'Tab') {
        const f = list();
        if (!f.length) { e.preventDefault(); node?.focus?.(); return; }
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (node && !node.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      try { prevActive && prevActive.focus && prevActive.focus(); } catch {}
    };
  }, [onClose, active]);
  return ref;
}

export default useDialog;
