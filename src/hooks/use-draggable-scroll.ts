import { useRef, useState, MouseEvent, useEffect } from "react";

export function useDraggableScroll<T extends HTMLElement>(options?: {
  scrollToEnd?: boolean;
}) {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: MouseEvent<T>) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent<T>) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    ref.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    if (options?.scrollToEnd && ref.current) {
      // Small timeout to ensure rendering is complete before measuring scrollWidth
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollLeft = ref.current.scrollWidth;
        }
      }, 0);
    }
  }, [options?.scrollToEnd]);

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    isDragging,
  };
}
