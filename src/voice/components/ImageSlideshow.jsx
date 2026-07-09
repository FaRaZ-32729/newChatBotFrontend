import { useEffect, useRef, useState } from 'react';
import { resolveAssetUrl } from '../../utils/mapChatbot';

/** Slideshow — clean fullscreen images only, no PDF/page labels */
export default function ImageSlideshow({ slides = [], currentIndex = 0 }) {
  const [active, setActive] = useState(0);
  const slidesKeyRef = useRef('');
  const lastIndexRef = useRef(0);

  useEffect(() => {
    if (!slides.length) return;
    const idx = Math.min(Math.max(0, currentIndex), slides.length - 1);
    if (idx !== lastIndexRef.current) {
      lastIndexRef.current = idx;
      setActive(idx);
    }
  }, [currentIndex, slides.length]);

  useEffect(() => {
    const key = slides.map((s) => s.id ?? s.url).join('|');
    if (!slides.length || key === slidesKeyRef.current) return;
    slidesKeyRef.current = key;
    lastIndexRef.current = 0;
    setActive(0);
  }, [slides]);

  if (!slides.length) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col pointer-events-none"
      style={{
        paddingTop: 'max(8px, env(safe-area-inset-top))',
        paddingRight: 'max(8px, env(safe-area-inset-right))',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(8px, env(safe-area-inset-left))',
      }}
    >
      <div className="flex flex-1 min-h-0 w-full flex-col items-center justify-center">
        <div className="relative w-full flex-1 min-h-0 max-h-[calc(100dvh-32px)] rounded-lg sm:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/15 bg-black/50">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
            style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
          >
            {slides.map((slide, i) => {
              const url = resolveAssetUrl(slide.url);
              return (
                <div
                  key={slide.id ?? i}
                  className="flex h-full w-full shrink-0 items-center justify-center p-1 sm:p-3 md:p-4"
                >
                  <img
                    src={url}
                    alt=""
                    className="max-h-[calc(100dvh-48px)] max-w-[min(96vw,100%)] w-auto h-auto object-contain"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex shrink-0 gap-1.5 sm:gap-2 py-2">
            {slides.map((s, i) => (
              <span
                key={s.id ?? i}
                className={`rounded-full transition-all duration-300 ${
                  i === active ? 'h-1.5 w-6 sm:w-8 bg-white' : 'h-1.5 w-1.5 bg-white/35'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
