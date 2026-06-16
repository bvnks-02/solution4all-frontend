import { useEffect } from 'react';

/**
 * useScrollReveal
 * Observes all elements with class "reveal-item" within the document.
 * When they enter the viewport (threshold 0.15), adds "is-visible"
 * which triggers the CSS transition defined in globals.css.
 *
 * Uses a MutationObserver to catch dynamically added elements,
 * so async-loaded content (e.g. product grids) is also revealed.
 *
 * Call this hook ONCE in App.jsx or a top-level layout component.
 */
export function useScrollReveal() {
  useEffect(() => {
    // If user prefers reduced motion, make everything visible immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const makeVisible = () => {
        document.querySelectorAll('.reveal-item').forEach((el) => {
          el.classList.add('is-visible');
        });
      };
      makeVisible();
      // Also make visible any future dynamically-added items
      const mo = new MutationObserver(makeVisible);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    // Observe all current and future .reveal-item elements
    const observeAll = () => {
      document.querySelectorAll('.reveal-item').forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          observer.observe(el);
        }
      });
    };

    observeAll();

    // Re-observe when new elements are added to the DOM
    const mo = new MutationObserver(() => {
      observeAll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
    };
  }, []);
}