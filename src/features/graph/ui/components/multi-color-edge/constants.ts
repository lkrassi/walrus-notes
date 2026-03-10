import { graphTheme } from '../../../lib/utils';

export const getEdgeColors = () => {
  const palette = graphTheme();

  return {
    STROKE: palette.edge,
    VALID: palette.success,
    INVALID: palette.danger,
    DELETE_BUTTON: palette.danger,
    DELETE_BUTTON_FILL: palette.surface,
  } as const;
};

export const NODE_DEFAULTS = {
  WIDTH: 160,
  HEIGHT: 80,
} as const;

export const EDGE_INTERACTION = {
  TRANSPARENT_STROKE_WIDTH: 20,
  DRAG_STROKE_WIDTH: 3,
  DELETE_BUTTON_RADIUS: 8,
  DELETE_BUTTON_STROKE_WIDTH: 2,
} as const;
