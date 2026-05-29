import { create } from "zustand";
import type { WorkSpace, TreeNode } from "@/types/workspace";
import {
  getWorkspaceFromStorage,
  saveWorkspaceToStorage,
} from "./workspaceStorage";

type EditorStoreType = {
  activeDocument: any;

  setActiveDocument: (document: any) => void;

  loadDocument: (
    userId: string,
    workspaceId: string,
    activeLeafNodeId: string,
  ) => void;

  clearDocument: () => void;

  handleDocumentChange: (
    newDocument: any,
    userId: string,
    activeLeafNodeId: string,
    workspaceId: string,
  ) => void;
};

export const useEditorStore = create<EditorStoreType>((set) => ({
  activeDocument: null,

  setActiveDocument: (document) => {
    set({
      activeDocument: document,
    });
  },

  loadDocument: (userId, workspaceId, activeLeafNodeId) => {
    if (!userId || !workspaceId || activeLeafNodeId === "empty") {
      set({ activeDocument: null });
      return;
    }

    const workspace = getWorkspaceFromStorage(workspaceId, userId);

    if (!workspace) {
      set({ activeDocument: null });
      return;
    }

    const document = findLeafData(workspace, activeLeafNodeId);

    set({
      activeDocument: document,
    });
  },

  clearDocument: () => {
    set({
      activeDocument: null,
    });
  },

  handleDocumentChange: (
    newDocument,
    userId,
    activeLeafNodeId,
    workspaceId,
  ) => {
    if (!userId || !workspaceId) return;
    if (!activeLeafNodeId || activeLeafNodeId === "empty") return;

    const workspace = getWorkspaceFromStorage(workspaceId, userId);
    if (!workspace) return;

    const updatedWorkspace = updateLeafData(
      workspace,
      activeLeafNodeId,
      newDocument,
    );

    saveWorkspaceToStorage(userId, updatedWorkspace);

    // Only editorStore updates.
    // nodeStore.workSpace does not update here, so sidebar/navbar do not rerender.
    set({
      activeDocument: newDocument,
    });
  },
}));

function updateLeafData(
  workspace: WorkSpace,
  leafId: string,
  newData: any,
): WorkSpace {
  return {
    ...workspace,
    leafNodes: (workspace.leafNodes ?? []).map((leaf) =>
      leaf.id === leafId ? { ...leaf, data: newData } : leaf,
    ),
    nodes: (workspace.nodes ?? []).map((node) =>
      updateLeafDataInNode(node, leafId, newData),
    ),
  };
}

function updateLeafDataInNode(
  node: TreeNode,
  leafId: string,
  newData: any,
): TreeNode {
  return {
    ...node,
    leafNodes: (node.leafNodes ?? []).map((leaf) =>
      leaf.id === leafId ? { ...leaf, data: newData } : leaf,
    ),
    nodes: (node.nodes ?? []).map((child) =>
      updateLeafDataInNode(child, leafId, newData),
    ),
  };
}

function findLeafData(workspace: WorkSpace, leafId: string): any {
  const rootLeaf = workspace.leafNodes?.find((leaf) => leaf.id === leafId);
  if (rootLeaf) return rootLeaf.data;

  for (const node of workspace.nodes ?? []) {
    const data = findLeafDataInNode(node, leafId);
    if (data !== undefined) return data;
  }

  return null;
}

function findLeafDataInNode(node: TreeNode, leafId: string): any {
  const leaf = node.leafNodes?.find((currentLeaf) => currentLeaf.id === leafId);
  if (leaf) return leaf.data;

  for (const child of node.nodes ?? []) {
    const data = findLeafDataInNode(child, leafId);
    if (data !== undefined) return data;
  }

  return undefined;
}
