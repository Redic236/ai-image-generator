/**
 * Ref-counted body scroll lock.
 *
 * Multiple overlays (Lightbox, modal, drawer, etc.) can now safely lock
 * body scroll independently — only the first lock captures the original
 * overflow value, and the original is only restored when the last lock
 * releases. Prevents the "two overlays cross mount/unmount → body
 * permanently set to hidden" bug.
 */

let lockCount = 0;
let originalOverflow = '';

export function lockBodyScroll(): void {
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

export function unlockBodyScroll(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    document.body.style.overflow = originalOverflow;
  }
}
