import { useEffect, useRef, useState } from 'react';
import type { Node } from 'reactflow';
import { useReactFlow } from 'reactflow';
import { graphTheme } from '../utils';

export type Arrow = {
  id: string;
  x: number;
  y: number;
  angle: number;
  dist: number;
  color: string;
};

interface UseOffscreenArrowsProps {
  nodes: Node[];
  minDistance?: number;
  maxArrows?: number;
  isMain?: boolean;
}

function intersectRect(
  cx: number,
  cy: number,
  dx: number,
  dy: number,
  width: number,
  height: number
) {
  const ts: number[] = [];

  if (dx !== 0) {
    const tLeft = (0 - cx) / dx;
    const tRight = (width - cx) / dx;
    ts.push(tLeft, tRight);
  }
  if (dy !== 0) {
    const tTop = (0 - cy) / dy;
    const tBottom = (height - cy) / dy;
    ts.push(tTop, tBottom);
  }

  const valid = ts.filter(t => t > 0).sort((a, b) => a - b);
  for (const t of valid) {
    const x = cx + dx * t;
    const y = cy + dy * t;
    if (x >= -1 && x <= width + 1 && y >= -1 && y <= height + 1) {
      return { x, y, t };
    }
  }
  return null;
}

function calculateArrowsForClusters(
  nodes: Node[],
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  cx: number,
  cy: number,
  minDistance: number
): Arrow[] {
  const arrows: Arrow[] = [];
  const clusters = new Map<string, { nodes: Node[]; color: string }>();
  const defaultColor = graphTheme().edge;

  for (const n of nodes) {
    const note = n.data?.note;
    const layoutId = note?.layoutId || 'default';
    const color =
      (n.data as { layoutColor?: string })?.layoutColor || defaultColor;

    if (!clusters.has(layoutId)) {
      clusters.set(layoutId, { nodes: [], color });
    }
    clusters.get(layoutId)!.nodes.push(n);
  }

  for (const [clusterId, cluster] of clusters.entries()) {
    if (cluster.nodes.length === 0) continue;

    let sumX = 0;
    let sumY = 0;
    let offscreenCount = 0;

    for (const n of cluster.nodes) {
      const nx = (n.position?.x ?? 0) * zoom + panX;
      const ny = (n.position?.y ?? 0) * zoom + panY;

      if (nx < 0 || nx > width || ny < 0 || ny > height) {
        sumX += n.position?.x ?? 0;
        sumY += n.position?.y ?? 0;
        offscreenCount++;
      }
    }

    if (offscreenCount > 0) {
      const clusterCenterX = sumX / offscreenCount;
      const clusterCenterY = sumY / offscreenCount;

      const screenCenterX = clusterCenterX * zoom + panX;
      const screenCenterY = clusterCenterY * zoom + panY;

      const dx = screenCenterX - cx;
      const dy = screenCenterY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < minDistance) continue;

      const intersection = intersectRect(cx, cy, dx, dy, width, height);
      if (!intersection) continue;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      arrows.push({
        id: clusterId,
        x: intersection.x,
        y: intersection.y,
        angle,
        dist,
        color: cluster.color,
      });
    }
  }

  return arrows;
}

function calculateArrowsForNodes(
  nodes: Node[],
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  cx: number,
  cy: number,
  minDistance: number,
  maxArrows: number
): Arrow[] {
  const arrows: Arrow[] = [];
  const defaultColor = graphTheme().edge;

  for (const n of nodes) {
    const nx = (n.position?.x ?? 0) * zoom + panX;
    const ny = (n.position?.y ?? 0) * zoom + panY;

    if (nx >= 0 && nx <= width && ny >= 0 && ny <= height) continue;

    const dx = nx - cx;
    const dy = ny - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < minDistance) continue;

    const intersection = intersectRect(cx, cy, dx, dy, width, height);
    if (!intersection) continue;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const color =
      (n.data as { layoutColor?: string })?.layoutColor || defaultColor;

    arrows.push({
      id: n.id,
      x: intersection.x,
      y: intersection.y,
      angle,
      dist,
      color,
    });
    if (arrows.length >= maxArrows) break;
  }

  return arrows;
}

export const useOffscreenArrows = ({
  nodes,
  minDistance = 50,
  maxArrows = 100,
  isMain = false,
}: UseOffscreenArrowsProps) => {
  const { getViewport } = useReactFlow();
  const rafRef = useRef<number | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      if (!mounted) return;
      const vp = getViewport();
      const wrapper = document.querySelector(
        '.react-flow'
      ) as HTMLElement | null;

      if (!wrapper || !vp) {
        setArrows([]);
      } else {
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;
        const zoom = vp.zoom ?? 1;
        const panX = vp.x ?? 0;
        const panY = vp.y ?? 0;
        const cx = width / 2;
        const cy = height / 2;

        const newArrows = isMain
          ? calculateArrowsForClusters(
              nodes,
              width,
              height,
              zoom,
              panX,
              panY,
              cx,
              cy,
              minDistance
            )
          : calculateArrowsForNodes(
              nodes,
              width,
              height,
              zoom,
              panX,
              panY,
              cx,
              cy,
              minDistance,
              maxArrows
            );

        setArrows(newArrows);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [getViewport, nodes, minDistance, maxArrows, isMain]);

  return { arrows };
};
