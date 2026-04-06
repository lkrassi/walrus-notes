import { Background } from 'reactflow';
import { graphTheme } from '../../lib/utils';

export const GraphBackground = () => {
  const palette = graphTheme();

  return (
    <>
      <Background gap={22} size={1} color={palette.edge} />
      <Background gap={110} size={1.6} color={palette.edge} />
    </>
  );
};
