import { Background } from 'reactflow';
import { graphTheme } from '../../lib/utils';

export const GraphBackground = () => {
  const palette = graphTheme();

  return <Background gap={20} size={1} color={palette.edge} />;
};
