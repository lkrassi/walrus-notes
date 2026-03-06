interface CaretPosition {
  left: number;
  top: number;
  height: number;
}

interface SelectionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const COPY_STYLE_PROPS = [
  'boxSizing',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'textIndent',
  'textDecoration',
  'textAlign',
  'whiteSpace',
  'wordBreak',
  'wordSpacing',
  'wordWrap',
  'tabSize',
  'MozTabSize',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
] as const;

const createMirror = (textarea: HTMLTextAreaElement) => {
  const computed = window.getComputedStyle(textarea);
  const mirror = document.createElement('div');

  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.pointerEvents = 'none';
  mirror.style.left = '-10000px';
  mirror.style.top = '0';
  mirror.style.overflow = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.wordWrap = 'break-word';

  const mirrorStyle = mirror.style as unknown as Record<string, string>;
  const computedStyle = computed as unknown as Record<string, string>;
  for (const prop of COPY_STYLE_PROPS) {
    mirrorStyle[prop] = computedStyle[prop];
  }

  mirror.style.width = `${textarea.clientWidth}px`;

  document.body.appendChild(mirror);

  return {
    mirror,
    cleanup: () => {
      if (mirror.parentNode) {
        mirror.parentNode.removeChild(mirror);
      }
    },
  };
};

const getLineHeight = (textarea: HTMLTextAreaElement) => {
  const computed = window.getComputedStyle(textarea);
  const parsed = Number.parseFloat(computed.lineHeight || '');
  return Number.isFinite(parsed) ? parsed : 24;
};

const clampToVisible = (
  textarea: HTMLTextAreaElement,
  point: { left: number; top: number; width?: number; height: number }
) => {
  const visibleLeft = 0;
  const visibleTop = 0;
  const visibleRight = textarea.clientWidth;
  const visibleBottom = textarea.clientHeight;

  const width = point.width ?? 0;
  const right = point.left + width;
  const bottom = point.top + point.height;

  if (right < visibleLeft || point.left > visibleRight) {
    return null;
  }

  if (bottom < visibleTop || point.top > visibleBottom) {
    return null;
  }

  return point;
};

export const getCaretOverlayPosition = (
  textarea: HTMLTextAreaElement,
  index: number
): CaretPosition | null => {
  const maxIndex = textarea.value.length;
  const safeIndex = Math.max(0, Math.min(index, maxIndex));

  const { mirror, cleanup } = createMirror(textarea);

  try {
    const before = textarea.value.slice(0, safeIndex);
    const after = textarea.value.slice(safeIndex);

    const beforeNode = document.createTextNode(before);
    const marker = document.createElement('span');
    marker.textContent = '\u200b';
    const afterNode = document.createTextNode(after);

    mirror.appendChild(beforeNode);
    mirror.appendChild(marker);
    mirror.appendChild(afterNode);

    const mirrorRect = mirror.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    const left = markerRect.left - mirrorRect.left - textarea.scrollLeft;
    const top = markerRect.top - mirrorRect.top - textarea.scrollTop;
    const height = getLineHeight(textarea);

    const visible = clampToVisible(textarea, { left, top, height });
    if (!visible) {
      return null;
    }

    return {
      left: visible.left,
      top: visible.top,
      height,
    };
  } finally {
    cleanup();
  }
};

export const getSelectionOverlayRects = (
  textarea: HTMLTextAreaElement,
  selectionStart: number,
  selectionEnd: number,
  maxRects: number = 50
): SelectionRect[] => {
  if (selectionStart === selectionEnd) {
    return [];
  }

  const min = Math.max(0, Math.min(selectionStart, selectionEnd));
  const max = Math.min(
    textarea.value.length,
    Math.max(selectionStart, selectionEnd)
  );

  const { mirror, cleanup } = createMirror(textarea);

  try {
    const before = textarea.value.slice(0, min);
    const selected = textarea.value.slice(min, max);
    const after = textarea.value.slice(max);

    const beforeNode = document.createTextNode(before);
    const selectedSpan = document.createElement('span');
    selectedSpan.textContent = selected.length > 0 ? selected : '\u200b';
    const afterNode = document.createTextNode(after);

    mirror.appendChild(beforeNode);
    mirror.appendChild(selectedSpan);
    mirror.appendChild(afterNode);

    const mirrorRect = mirror.getBoundingClientRect();
    const rects = Array.from(selectedSpan.getClientRects());

    const normalized = rects
      .map(rect => {
        const left = rect.left - mirrorRect.left - textarea.scrollLeft;
        const top = rect.top - mirrorRect.top - textarea.scrollTop;
        const width = rect.width;
        const height = rect.height || getLineHeight(textarea);

        return clampToVisible(textarea, { left, top, width, height });
      })
      .filter((rect): rect is SelectionRect => !!rect)
      .slice(0, maxRects)
      .map(rect => ({
        left: rect.left,
        top: rect.top,
        width: Math.max(0, rect.width),
        height: rect.height,
      }));

    return normalized;
  } finally {
    cleanup();
  }
};
