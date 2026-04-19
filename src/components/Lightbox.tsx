import { useEffect, useState } from 'react';

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

/** Full-screen image viewer with click-to-toggle between fit-to-viewport and
 *  100% natural size. Esc or backdrop click closes. */
export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const [zoomed, setZoomed] = useState(false);

  // Esc key closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="放大查看"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-[fadeIn_200ms_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          zoomed
            ? 'h-full w-full overflow-auto'
            : 'flex h-full w-full items-center justify-center p-4'
        }
      >
        <img
          src={src}
          alt={alt}
          onClick={() => setZoomed((z) => !z)}
          className={
            zoomed
              ? 'max-w-none cursor-zoom-out'
              : 'max-h-[92vh] max-w-[92vw] cursor-zoom-in object-contain drop-shadow-2xl'
          }
        />
      </div>

      {/* Top-right close button */}
      <button
        onClick={onClose}
        aria-label="关闭"
        className="fixed right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Bottom hint */}
      <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] text-white/80 backdrop-blur-sm">
        点击图片 {zoomed ? '缩回' : '放大到原始尺寸'} · Esc 关闭
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
