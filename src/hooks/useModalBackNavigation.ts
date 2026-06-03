import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A hook that pushes a dummy state to browser history when a modal opens,
 * allowing the browser's back button to close the modal instead of navigating away.
 *
 * @param isOpen Whether the modal is currently open.
 * @param onClose Callback to close the modal.
 */
export function useModalBackNavigation(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const location = useLocation();
  const currentPathnameRef = useRef(location.pathname);
  currentPathnameRef.current = location.pathname;

  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const stateId = 'modal-' + Math.random().toString(36).substring(2, 9);
    window.history.pushState({ modalStateId: stateId }, '');
    isPopStateRef.current = false;

    const handlePopState = (event: PopStateEvent) => {
      // If the current history state doesn't match our stateId, it means this modal's state was popped.
      if (event.state?.modalStateId !== stateId) {
        isPopStateRef.current = true;
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    const initialPathname = currentPathnameRef.current;

    return () => {
      window.removeEventListener('popstate', handlePopState);

      // If the modal is closing (isOpen becomes false) and it wasn't triggered by a popstate event,
      // and we are still on the same page (pathname hasn't changed), we must pop the history state
      // that we pushed, so it doesn't linger in the history stack.
      if (
        !isPopStateRef.current &&
        currentPathnameRef.current === initialPathname &&
        window.location.pathname === initialPathname
      ) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
