export interface TreeNode<T = any> {
  id: string;
  title: string;
  children?: TreeNode<T>[];
  data?: T;
  type?: string;
}

export interface TreeRenderProps<T> {
  node: TreeNode<T>;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
}
