export const syncScroll = (a: HTMLElement | null, b: HTMLElement | null) => {
  if (!a || !b) {
    return () => {};
  }


  let syncingA = false;
  let syncingB = false;

  const handlerA = () => {
    if (syncingB) return;
    try {
      const denomA = a.scrollHeight - a.clientHeight || 1;
      const ratio = a.scrollTop / denomA;
      const newTop = Math.max(
        0,
        Math.floor(ratio * (b.scrollHeight - b.clientHeight))
      );
      syncingA = true;
      b.scrollTop = newTop;
      setTimeout(() => (syncingA = false), 20);
    } catch (_e) {}
  };

  const handlerB = () => {
    if (syncingA) return;
    try {
      const denomB = b.scrollHeight - b.clientHeight || 1;
      const ratio = b.scrollTop / denomB;
      const newTop = Math.max(
        0,
        Math.floor(ratio * (a.scrollHeight - a.clientHeight))
      );
      syncingB = true;
      a.scrollTop = newTop;
      setTimeout(() => (syncingB = false), 20);
    } catch (_e) {
    }
  };

  a.addEventListener('scroll', handlerA);
  b.addEventListener('scroll', handlerB);

  return () => {
    a.removeEventListener('scroll', handlerA);
    b.removeEventListener('scroll', handlerB);
  };
};

export default syncScroll;
