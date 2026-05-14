export interface User {
  _id: string;
  email: string;
  name: string;
  profileUrl?: string;
}

export interface WorkspaceStore {
  [userId: string]: {
    workspaces: WorkSpace[];
  };
}

export interface WorkSpace {
  id: string;
  name: string;
  description: string;
  leafNodes: LeafNode[];
  nodes: TreeNode[];
  created_at: number;
}

export interface LeafNode {
  id: string;
  name: string;
  data?: any;
  created_at?: number;
  last_used?: number;
  type: "leaf";
}

export interface TreeNode {
  id: string;
  name: string;
  nodes: TreeNode[];
  leafNodes: LeafNode[];
  type: "node";
}
