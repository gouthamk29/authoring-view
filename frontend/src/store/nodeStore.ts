import type {
  WorkSpace,
  WorkspaceStore,
  LeafNode,
  TreeNode,
} from "@/types/workspace";
import { create } from "zustand";

const STORAGE_KEY = "workspaces";

type NodeStoreType = {
  workSpace: WorkSpace | null;
  activeLeafNodeId: string;
  activeLeafData: any;
  userId: string | null;

  initWorkSpace: (workspaceId: string, userId: string) => void;
  saveWorkspace: (updatedWorkspace: WorkSpace) => void;

  setActiveLeafId: (leafId: string) => void;

  addNode: (name: string, parentId: string | null) => void;
  addLeafNode: (name: string, parentId: string | null) => void;

  handleDocumentChange: (newDocument: any) => void;
  handleLeafClick: (leafId: string) => void;

  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;

  renameLeaf: (leafId: string, newName: string) => void;
  deleteLeaf: (leafId: string) => void;
};

export const useNodeStore = create<NodeStoreType>((set, get) => ({
  workSpace: null,
  activeLeafNodeId: "",
  activeLeafData: null,
  userId: null,

  initWorkSpace: (workspaceId, userId) => {
    try {
      const store: WorkspaceStore = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );

      const activeWorkspace = store[userId]?.workspaces?.find(
        (w: WorkSpace) => w.id === workspaceId,
      );

      if (!activeWorkspace) return;

      const initialLeafId = findInitialLeafNodeId(activeWorkspace);

      set({
        userId,
        workSpace: activeWorkspace,
        activeLeafNodeId: initialLeafId || "empty",
        activeLeafData: findLeafData(activeWorkspace, initialLeafId || ""),
      });
    } catch (error) {
      console.error(error);
    }
  },

  saveWorkspace: (updatedWorkspace) => {
    try {
      const userId = get().userId;
      if (!userId) return;

      const store: WorkspaceStore = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );

      const workspaces = store[userId]?.workspaces || [];

      store[userId] = {
        workspaces: workspaces.map((w: WorkSpace) =>
          w.id === updatedWorkspace.id ? updatedWorkspace : w,
        ),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

      const activeLeafId = get().activeLeafNodeId;

      set({
        workSpace: updatedWorkspace,
        activeLeafData: findLeafData(updatedWorkspace, activeLeafId),
      });
    } catch (error) {
      console.error("Error saving workspace:", error);
    }
  },

  setActiveLeafId: (leafId) => {
    const ws = get().workSpace;

    set({
      activeLeafNodeId: leafId,
      activeLeafData: ws ? findLeafData(ws, leafId) : null,
    });
  },

  addNode: (name, parentId) => {
    const ws = get().workSpace;
    if (!ws) return;

    const newNode: TreeNode = {
      id: crypto.randomUUID(),
      name,
      type: "node",
      nodes: [],
      leafNodes: [],
    };

    const updatedWorkspace: WorkSpace =
      parentId === null
        ? {
            ...ws,
            nodes: [...(ws.nodes || []), newNode],
          }
        : {
            ...ws,
            nodes: ws.nodes.map((node) =>
              addNodeToParentRecursive(node, parentId, newNode),
            ),
          };

    get().saveWorkspace(updatedWorkspace);
  },

  addLeafNode: (name, parentId) => {
    const ws = get().workSpace;
    if (!ws) return;

    const newLeaf: LeafNode = {
      id: crypto.randomUUID(),
      name,
      type: "leaf",
      created_at: Date.now(),
      last_used: null,
      data: null,
    };

    const updatedWorkspace: WorkSpace =
      parentId === null
        ? {
            ...ws,
            leafNodes: [...(ws.leafNodes || []), newLeaf],
          }
        : {
            ...ws,
            nodes: ws.nodes.map((node) =>
              addLeafToParentRecursive(node, parentId, newLeaf),
            ),
          };

    set({
      activeLeafNodeId: newLeaf.id,
      activeLeafData: newLeaf.data,
    });

    get().saveWorkspace(updatedWorkspace);
  },

  handleDocumentChange: (newDocument) => {
    const ws = get().workSpace;
    const activeLeafId = get().activeLeafNodeId;

    if (!ws || !activeLeafId || activeLeafId === "empty") return;

    const updatedWorkspace = updateLeafData(ws, activeLeafId, newDocument);

    get().saveWorkspace(updatedWorkspace);
  },

  handleLeafClick: (leafId) => {
    get().setActiveLeafId(leafId);
  },

  renameNode: (nodeId, newName) => {
    const ws = get().workSpace;
    if (!ws) return;

    const updatedWorkspace: WorkSpace = {
      ...ws,
      nodes: ws.nodes.map((node) => renameNodeRecursive(node, nodeId, newName)),
    };

    get().saveWorkspace(updatedWorkspace);
  },

  deleteNode: (nodeId) => {
    const ws = get().workSpace;
    if (!ws) return;

    const updatedWorkspace: WorkSpace = {
      ...ws,
      nodes: deleteNodeRecursive(ws.nodes, nodeId),
    };

    get().saveWorkspace(updatedWorkspace);
  },

  renameLeaf: (leafId, newName) => {
    const ws = get().workSpace;
    if (!ws) return;

    const updatedWorkspace: WorkSpace = {
      ...ws,
      leafNodes: ws.leafNodes.map((leaf) =>
        leaf.id === leafId ? { ...leaf, name: newName } : leaf,
      ),
      nodes: ws.nodes.map((node) => renameLeafInTree(node, leafId, newName)),
    };

    get().saveWorkspace(updatedWorkspace);
  },

  deleteLeaf: (leafId) => {
    const ws = get().workSpace;
    if (!ws) return;

    const updatedWorkspace: WorkSpace = {
      ...ws,
      leafNodes: ws.leafNodes.filter((leaf) => leaf.id !== leafId),
      nodes: ws.nodes.map((node) => deleteLeafInTree(node, leafId)),
    };

    let nextActiveLeafId = get().activeLeafNodeId;

    if (nextActiveLeafId === leafId) {
      nextActiveLeafId = findInitialLeafNodeId(updatedWorkspace) || "empty";
    }

    set({
      activeLeafNodeId: nextActiveLeafId,
      activeLeafData: findLeafData(updatedWorkspace, nextActiveLeafId),
    });

    get().saveWorkspace(updatedWorkspace);
  },
}));

function findInitialLeafNodeId(ws: WorkSpace): string | undefined {
  if (ws.leafNodes?.length > 0) {
    return ws.leafNodes[0].id;
  }

  for (const node of ws.nodes || []) {
    const leaf = findInitialLeafNodeInTree(node);
    if (leaf) return leaf.id;
  }

  return "empty";
}

function findInitialLeafNodeInTree(node: TreeNode): LeafNode | null {
  if (node.leafNodes?.length > 0) return node.leafNodes[0];

  for (const child of node.nodes || []) {
    const leaf = findInitialLeafNodeInTree(child);
    if (leaf) return leaf;
  }

  return null;
}

function addNodeToParentRecursive(
  node: TreeNode,
  parentId: string,
  newNode: TreeNode,
): TreeNode {
  if (node.id === parentId) {
    return {
      ...node,
      nodes: [...(node.nodes || []), newNode],
    };
  }

  return {
    ...node,
    nodes: node.nodes.map((child) =>
      addNodeToParentRecursive(child, parentId, newNode),
    ),
  };
}

function addLeafToParentRecursive(
  node: TreeNode,
  parentId: string,
  leaf: LeafNode,
): TreeNode {
  if (node.id === parentId) {
    return {
      ...node,
      leafNodes: [...(node.leafNodes || []), leaf],
    };
  }

  return {
    ...node,
    nodes: node.nodes.map((child) =>
      addLeafToParentRecursive(child, parentId, leaf),
    ),
  };
}

function updateLeafData(
  ws: WorkSpace,
  leafId: string,
  newData: any,
): WorkSpace {
  return {
    ...ws,
    leafNodes: ws.leafNodes.map((leaf) =>
      leaf.id === leafId ? { ...leaf, data: newData } : leaf,
    ),
    nodes: ws.nodes.map((node) => updateLeafDataInNode(node, leafId, newData)),
  };
}

function updateLeafDataInNode(
  node: TreeNode,
  leafId: string,
  newData: any,
): TreeNode {
  return {
    ...node,
    leafNodes: node.leafNodes.map((leaf) =>
      leaf.id === leafId ? { ...leaf, data: newData } : leaf,
    ),
    nodes: node.nodes.map((child) =>
      updateLeafDataInNode(child, leafId, newData),
    ),
  };
}

function findLeafData(ws: WorkSpace, leafId: string): any {
  const rootLeaf = ws.leafNodes?.find((leaf) => leaf.id === leafId);
  if (rootLeaf) return rootLeaf.data;

  for (const node of ws.nodes || []) {
    const data = findLeafDataInNode(node, leafId);
    if (data !== undefined) return data;
  }

  return null;
}

function findLeafDataInNode(node: TreeNode, leafId: string): any {
  const leaf = node.leafNodes?.find((l) => l.id === leafId);
  if (leaf) return leaf.data;

  for (const child of node.nodes || []) {
    const data = findLeafDataInNode(child, leafId);
    if (data !== undefined) return data;
  }

  return undefined;
}

function renameNodeRecursive(
  node: TreeNode,
  nodeId: string,
  newName: string,
): TreeNode {
  if (node.id === nodeId) {
    return { ...node, name: newName };
  }

  return {
    ...node,
    nodes: node.nodes.map((child) =>
      renameNodeRecursive(child, nodeId, newName),
    ),
  };
}

function deleteNodeRecursive(nodes: TreeNode[], nodeId: string): TreeNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      nodes: deleteNodeRecursive(node.nodes, nodeId),
    }));
}

function renameLeafInTree(
  node: TreeNode,
  leafId: string,
  newName: string,
): TreeNode {
  return {
    ...node,
    leafNodes: node.leafNodes.map((leaf) =>
      leaf.id === leafId ? { ...leaf, name: newName } : leaf,
    ),
    nodes: node.nodes.map((child) => renameLeafInTree(child, leafId, newName)),
  };
}

function deleteLeafInTree(node: TreeNode, leafId: string): TreeNode {
  return {
    ...node,
    leafNodes: node.leafNodes.filter((leaf) => leaf.id !== leafId),
    nodes: node.nodes.map((child) => deleteLeafInTree(child, leafId)),
  };
}
