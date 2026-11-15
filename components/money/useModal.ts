import { useEffect, useRef, type RefObject } from 'react';

// Hộp thoại dạng tờ giấy kéo lên: khoá phần nền (inert), Escape để đóng, giữ phím Tab trong hộp thoại,
// trả focus về chỗ cũ khi đóng.
export function useModal(dialogRef: RefObject<HTMLElement | null>, onEscape: () => void) {
  const escape = useRef(onEscape);
  useEffect(() => { escape.current = onEscape; });
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shell = document.getElementById('money-panel')?.closest('section');
    const wasInert = shell?.inert ?? false;
    if (shell) shell.inert = true;
    dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled)')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); escape.current(); }
      if (event.key !== 'Tab') return;
      const nodes = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)') ?? [])];
      if (!nodes.length) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      if (shell) shell.inert = wasInert;
      if (previous?.isConnected) previous.focus();
    };
  }, [dialogRef]);
}
