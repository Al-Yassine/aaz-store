import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousInlineScrollBehavior = html.style.scrollBehavior;
    const previousBodyInlineScrollBehavior = body.style.scrollBehavior;

    // Ensure route navigation jumps to top instantly (no animated scroll-to-top).
    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);

    const restoreTimeout = window.setTimeout(() => {
      html.style.scrollBehavior = previousInlineScrollBehavior;
      body.style.scrollBehavior = previousBodyInlineScrollBehavior;
    }, 120);

    return () => {
      window.clearTimeout(restoreTimeout);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
