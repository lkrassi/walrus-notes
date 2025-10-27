import { MiniMap } from 'reactflow';
import { generateColorFromId } from '../../model/utils/graphUtils';

export const GraphMiniMap = () => {
  return (
    <MiniMap
      nodeColor={node => generateColorFromId(node.id)}
      maskColor='rgba(0, 0, 0, 0.1)'
      nodeStrokeColor='#000'
      nodeBorderRadius={2}
      nodeStrokeWidth={1}
      maskStrokeColor='rgba(0, 0, 0, 0.5)'
      maskStrokeWidth={2}
      position='bottom-right'
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid #e5e7eb',
      }}
    />
  );
};
