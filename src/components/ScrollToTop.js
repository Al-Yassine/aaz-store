import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const html = document.documentElement;
    const previousInlineScrollBehavior = html.style.scrollBehavior;

    // Ensure route navigation jumps to top instantly (no animated scroll-to-top).
    html.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    requestAnimationFrame(() => {
      html.style.scrollBehavior = previousInlineScrollBehavior;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
