import { useEffect, useState } from 'react';

export const useViewportTracking = () => {
  const [viewportTick, setViewportTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    const tryBump = () => {
      if (!mounted) return;
      setViewportTick(t => t + 1);
    };

    const viewportSelector = '.react-flow__viewport';
    const nodesSelector = '.react-flow__nodes';

    const observers: MutationObserver[] = [];

    const observeEl = (el: Element | null, opts: MutationObserverInit) => {
      if (!el) return;
      const mo = new MutationObserver(() => {
        tryBump();
      });
      mo.observe(el, opts);
      observers.push(mo);
    };

    const viewportEl = document.querySelector(viewportSelector);
    const nodesEl = document.querySelector(nodesSelector);

    observeEl(viewportEl, { attributes: true, attributeFilter: ['style'] });

    observeEl(nodesEl, {
      attributes: true,
      attributeFilter: ['style', 'transform'],
      childList: true,
      subtree: true,
    });

    if (!nodesEl) {
      const bodyMo = new MutationObserver(() => {
        if (document.querySelector(nodesSelector)) {
          tryBump();
        }
      });
      bodyMo.observe(document.body, { childList: true, subtree: true });
      observers.push(bodyMo);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        tryBump();
      });
    });

    return () => {
      mounted = false;
      observers.forEach(o => o.disconnect());
    };
  }, []);

  return viewportTick;
};
