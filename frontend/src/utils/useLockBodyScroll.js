import { useEffect } from "react";

export function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;

    // Calculate scrollbar width
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    // Prevent layout shift
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      const top = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      // Restore scroll position
      window.scrollTo(0, parseInt(top || "0") * -1);
    };
  }, [isLocked]);
}
