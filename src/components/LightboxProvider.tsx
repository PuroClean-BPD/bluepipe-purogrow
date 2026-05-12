import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxItem {
  src: string;
  alt: string;
}

interface LightboxProviderProps {
  children: ReactNode;
  /** Skip images matching this CSS selector (in addition to those marked data-lightbox="false") */
  excludeSelector?: string;
}

/**
 * Wraps a page/section and turns every <img> inside it into a clickable lightbox image.
 * - Auto-discovers current and future images via MutationObserver
 * - Adds hover zoom + pointer cursor + "Click to expand" tooltip
 * - Modal supports: X close, click-outside close, ESC, ←/→ arrow navigation
 *
 * Opt-out per image: <img data-lightbox="false" />
 */
const LightboxProvider = ({ children, excludeSelector }: LightboxProviderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isEligible = useCallback(
    (img: HTMLImageElement) => {
      if (img.dataset.lightbox === "false") return false;
      if (img.closest("[data-lightbox-ignore]")) return false;
      if (excludeSelector && img.matches(excludeSelector)) return false;
      return true;
    },
    [excludeSelector]
  );

  // Enhance all current images and observe future additions
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const enhance = (img: HTMLImageElement) => {
      if (!isEligible(img)) return;
      if (img.dataset.lightboxReady === "1") return;
      img.dataset.lightboxReady = "1";
      img.classList.add("lightbox-img");
      img.setAttribute("title", img.getAttribute("title") || "Click to expand");
    };

    root.querySelectorAll("img").forEach((img) => enhance(img as HTMLImageElement));

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.tagName === "IMG") enhance(node as HTMLImageElement);
          node.querySelectorAll?.("img").forEach((img) => enhance(img as HTMLImageElement));
        });
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isEligible]);

  // Delegated click handler
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const img = target.closest("img") as HTMLImageElement | null;
      if (!img || !root.contains(img)) return;
      if (!isEligible(img)) return;

      const all = Array.from(root.querySelectorAll("img")).filter((i) =>
        isEligible(i as HTMLImageElement)
      ) as HTMLImageElement[];
      const list: LightboxItem[] = all.map((i) => ({
        src: i.currentSrc || i.src,
        alt: i.alt || "",
      }));
      const idx = all.indexOf(img);
      if (idx === -1) return;
      e.preventDefault();
      setItems(list);
      setActiveIndex(idx);
    };
    root.addEventListener("click", handler);
    return () => root.removeEventListener("click", handler);
  }, [isEligible]);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () =>
      setActiveIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length]
  );

  // Keyboard
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex, close, next, prev]);

  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div ref={containerRef}>{children}</div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-8"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            {/* Close */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close preview"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur"
            >
              <X size={22} />
            </button>

            {/* Prev */}
            {items.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            {/* Next */}
            {items.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur"
              >
                <ChevronRight size={26} />
              </button>
            )}

            <motion.figure
              key={active.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={active.src}
                alt={active.alt}
                className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                data-lightbox="false"
              />
              {(active.alt || items.length > 1) && (
                <figcaption className="mt-3 flex items-center gap-3 text-white/80 text-xs sm:text-sm">
                  {active.alt && <span className="line-clamp-1 max-w-[70vw]">{active.alt}</span>}
                  {items.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 font-mono text-[11px]">
                      {(activeIndex ?? 0) + 1} / {items.length}
                    </span>
                  )}
                </figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LightboxProvider;
