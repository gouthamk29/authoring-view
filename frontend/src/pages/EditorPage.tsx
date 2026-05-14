import { createContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import MainEditor from "@/components/MainEditor";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import type {
  WorkSpace,
  WorkspaceStore,
  LeafNode,
  TreeNode,
} from "@/types/workspace";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { WorkSpaceSidebar } from "@/components/EditorUI/EditorSideBar";
import { NavBar } from "@/components/EditorUI/EditorNavbar";

const EditorPage = () => {
  const { id: workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [acticeLeafNodeId, setActiveLeafId] = useState<string>("");
  const STORAGE_KEY = "workspaces";

  const { user } = useAuthProfile();

  useEffect(() => {
    //check user exists
    if (!workspaceId || !user?._id) return;
    //get data from localStorage
    try {
      const AllUserWorkspaces = JSON.parse(localStorage.getItem(STORAGE_KEY));
      const currUserWorkspaces = AllUserWorkspaces[user._id];
      const activeWorkspace: WorkSpace = currUserWorkspaces.workspaces.find(
        (x: WorkSpace) => x.id == workspaceId,
      );

      //set this to as working workspace
      setWorkspace(activeWorkspace);

      if (!acticeLeafNodeId) {
        const initalLeafNode = findInitalLeafNodeId(activeWorkspace);
        setActiveLeafId(initalLeafNode);
      }
    } catch (error) {
      console.error(error);
    }
  }, [workspaceId, user?._id]);

  function findInitalLeafNodeId(ws: WorkSpace) {
    const LeafNodeLen = ws?.leafNodes?.length;

    if (LeafNodeLen > 0) {
      return ws.leafNodes?.at(0)?.id;
    }

    const TreeNodesLen = ws.nodes.length;

    if (TreeNodesLen > 0) {
      for (let treeNode of ws.nodes) {
        const initialNode: LeafNode = FindInitialLeafNodeInTreeNode(treeNode);
        if (initialNode) return initialNode.id;
      }
    } else {
      return "empty";
    }
  }

  function FindInitialLeafNodeInTreeNode(node: TreeNode): LeafNode | null {
    if (node.leafNodes.length > 0) {
      return node.leafNodes.at(0);
    }

    for (let treeNode of node.nodes) {
      const initialNode: LeafNode = FindInitialLeafNodeInTreeNode(treeNode);
      if (initialNode) return initialNode;
    }
  }

  function addNode(name: string, parentId: string | null) {
    if (!workspace) return;

    let updatedWorkSpace: WorkSpace = { ...workspace };

    if (parentId === null) {
      const newNode: TreeNode = {
        id: crypto.randomUUID(),
        name,
        type: "node",
        nodes: [],
        leafNodes: [],
      };

      updatedWorkSpace = {
        ...updatedWorkSpace,
        nodes: [...(updatedWorkSpace.nodes || []), newNode],
      };
    } else {
      updatedWorkSpace = {
        ...updatedWorkSpace,
        nodes: Array.isArray(updatedWorkSpace.nodes)
          ? updatedWorkSpace.nodes.map((node) =>
              AddNodeToParentRecursive(node, parentId, name),
            )
          : [],
      };
    }

    saveWorkspace(updatedWorkSpace);
  }

  function AddNodeToParentRecursive(
    node: TreeNode,
    parentId: string,
    name: string,
  ): TreeNode {
    if (node.id === parentId) {
      const newNode: TreeNode = {
        id: crypto.randomUUID(),
        name,
        type: "node",
        nodes: [],
        leafNodes: [],
      };
      return {
        ...node,
        nodes: [...(node.nodes || []), newNode],
      };
    }

    return {
      ...node,
      nodes: Array.isArray(node.nodes)
        ? node.nodes.map((n) => AddNodeToParentRecursive(n, parentId, name))
        : [],
    };
  }

  function addLeafNode(name: string, parentId: string | null) {
    if (!workspace) return;

    let updatedWorkSpace: WorkSpace = { ...workspace };
    const newLeafNode: LeafNode = {
      id: crypto.randomUUID(),
      name,
      type: "leaf",
      created_at: Date.now(),
      last_used: null,
      data: null,
    };
    if (parentId === null) {
      updatedWorkSpace = {
        ...updatedWorkSpace,
        leafNodes: [...(updatedWorkSpace.leafNodes || []), newLeafNode],
      };
    } else {
      updatedWorkSpace = {
        ...updatedWorkSpace,
        nodes: Array.isArray(updatedWorkSpace.nodes)
          ? updatedWorkSpace.nodes.map((node) =>
              AddLeafNodeToParentRecursive(node, parentId, newLeafNode),
            )
          : [],
      };
    }

    setActiveLeafId(newLeafNode.id);
    saveWorkspace(updatedWorkSpace);
  }

  function AddLeafNodeToParentRecursive(
    node: TreeNode,
    parentId: string,
    leafNode: LeafNode,
  ): TreeNode {
    if (node.id === parentId) {
      return {
        ...node,
        leafNodes: [...(node.leafNodes || []), leafNode],
      };
    }

    return {
      ...node,
      nodes: Array.isArray(node.nodes)
        ? node.nodes.map((n) =>
            AddLeafNodeToParentRecursive(n, parentId, leafNode),
          )
        : [],
    };
  }

  function saveWorkspace(updatedWorkspace: WorkSpace) {
    if (!user) return;

    try {
      const store: WorkspaceStore = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}",
      );

      const workspaces = store[user._id]?.workspaces || [];
      const updatedWorkspaces = workspaces.map((w) =>
        w.id === updatedWorkspace.id ? updatedWorkspace : w,
      );

      store[user._id] = {
        workspaces: updatedWorkspaces,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      setWorkspace(updatedWorkspace);
    } catch (error) {
      console.error("Error saving workspace:", error);
    }
  }

  function updateLeafData(
    ws: WorkSpace,
    leafId: string,
    newData: any,
  ): WorkSpace {
    return {
      ...ws,
      leafNodes: Array.isArray(ws.leafNodes)
        ? ws.leafNodes.map((leaf) =>
            leaf.id === leafId ? { ...leaf, data: newData } : leaf,
          )
        : [],
      nodes: Array.isArray(ws.nodes)
        ? ws.nodes.map((node) => updateLeafDataInNode(node, leafId, newData))
        : [],
    };
  }

  function updateLeafDataInNode(
    node: TreeNode,
    leafId: string,
    newData: any,
  ): TreeNode {
    return {
      ...node,
      leafNodes: Array.isArray(node.leafNodes)
        ? node.leafNodes.map((leaf) =>
            leaf.id === leafId ? { ...leaf, data: newData } : leaf,
          )
        : [],
      nodes: Array.isArray(node.nodes)
        ? node.nodes.map((n) => updateLeafDataInNode(n, leafId, newData))
        : [],
    };
  }

  function handleDocumentChange(newDocument: any) {
    if (!workspace || !acticeLeafNodeId) return;

    const updatedWorkspace = updateLeafData(
      workspace,
      acticeLeafNodeId,
      newDocument,
    );
    saveWorkspace(updatedWorkspace);
  }

  const activeLeafData = useMemo(() => {
    if (!workspace || !acticeLeafNodeId) return null;
    return findLeafData(workspace, acticeLeafNodeId);
  }, [workspace, acticeLeafNodeId]);

  function findLeafData(ws: WorkSpace, leafId: string): any {
    if (!ws) return null;

    // Check root leaves
    if (Array.isArray(ws.leafNodes)) {
      const rootLeaf = ws.leafNodes.find((leaf) => leaf.id === leafId);
      if (rootLeaf) return rootLeaf.data;
    }

    // Check nested leaves
    if (Array.isArray(ws.nodes)) {
      for (const node of ws.nodes) {
        const data = findLeafDataInNode(node, leafId);
        if (data !== undefined) return data;
      }
    }

    return null;
  }

  function findLeafDataInNode(node: TreeNode, leafId: string): any {
    if (!node) return undefined;

    if (Array.isArray(node.leafNodes)) {
      const leaf = node.leafNodes.find((l) => l.id === leafId);
      if (leaf) return leaf.data;
    }

    if (Array.isArray(node.nodes)) {
      for (const childNode of node.nodes) {
        const data = findLeafDataInNode(childNode, leafId);
        if (data !== undefined) return data;
      }
    }

    return undefined;
  }

  function handleLeafClick(leafId: string) {
    setActiveLeafId(leafId);
  }

  function renameNode(nodeId: string, newName: string) {
    if (!workspace) return;

    const updatedWorkspace: WorkSpace = {
      ...workspace,
      nodes: workspace.nodes.map((node) =>
        renameNodeRecursive(node, nodeId, newName),
      ),
    };

    saveWorkspace(updatedWorkspace);
  }

  function renameNodeRecursive(
    node: TreeNode,
    nodeId: string,
    newName: string,
  ): TreeNode {
    if (node.id === nodeId) {
      return {
        ...node,
        name: newName,
      };
    }

    return {
      ...node,
      nodes: node.nodes.map((child) =>
        renameNodeRecursive(child, nodeId, newName),
      ),
    };
  }

  function deleteNode(nodeId: string) {
    if (!workspace) return;

    const updatedWorkspace: WorkSpace = {
      ...workspace,
      nodes: deleteNodeRecursive(workspace.nodes, nodeId),
    };

    saveWorkspace(updatedWorkspace);
  }

  function deleteNodeRecursive(nodes: TreeNode[], nodeId: string): TreeNode[] {
    return nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        nodes: deleteNodeRecursive(node.nodes, nodeId),
      }));
  }

  function renameLeaf(leafId: string, newName: string) {
    if (!workspace) return;

    const updatedWorkspace: WorkSpace = {
      ...workspace,

      // root leaf nodes
      leafNodes: workspace.leafNodes.map((leaf) =>
        leaf.id === leafId ? { ...leaf, name: newName } : leaf,
      ),

      // nested tree nodes
      nodes: workspace.nodes.map((node) =>
        renameLeafInTree(node, leafId, newName),
      ),
    };

    saveWorkspace(updatedWorkspace);
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

      nodes: node.nodes.map((child) =>
        renameLeafInTree(child, leafId, newName),
      ),
    };
  }

  function deleteLeaf(leafId: string) {
    if (!workspace) return;

    const updatedWorkspace: WorkSpace = {
      ...workspace,

      // root leaf nodes
      leafNodes: workspace.leafNodes.filter((leaf) => leaf.id !== leafId),

      // nested tree nodes
      nodes: workspace.nodes.map((node) => deleteLeafInTree(node, leafId)),
    };

    if (acticeLeafNodeId === leafId) {
      const nextLeafId = findInitalLeafNodeId(updatedWorkspace);
      setActiveLeafId(nextLeafId || "empty");
    }

    saveWorkspace(updatedWorkspace);
  }

  function deleteLeafInTree(node: TreeNode, leafId: string): TreeNode {
    return {
      ...node,

      leafNodes: node.leafNodes.filter((leaf) => leaf.id !== leafId),

      nodes: node.nodes.map((child) => deleteLeafInTree(child, leafId)),
    };
  }

  return (
    <div className="flex h-full min-h-dvh w-full flex-col">
      <div>
        <SidebarProvider>
          <WorkSpaceSidebar
            workspace={workspace}
            addNode={addNode}
            addLeaf={addLeafNode}
            onLeafClick={handleLeafClick}
            activeLeafId={acticeLeafNodeId}
            renameNode={renameNode}
            deleteNode={deleteNode}
            renameLeaf={renameLeaf}
            deleteLeaf={deleteLeaf}
          />
          <SidebarInset>
            <NavBar
              workSpace={workspace}
              user={user}
              onLeafClick={handleLeafClick}
              activeLeafId={acticeLeafNodeId}
            />
            {acticeLeafNodeId == "empty" && (
              <EmptyContentComponent addNote={addLeafNode} />
            )}
            {acticeLeafNodeId !== "empty" && (
              <MainEditor
                key={acticeLeafNodeId}
                document={activeLeafData}
                onChange={handleDocumentChange}
              />
            )}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default EditorPage;

function EmptyContentComponent({
  addNote,
}: {
  addNote: (name: string, parentId: string) => void;
}) {
  return (
    <div className="mx-10 flex min-h-80 items-center justify-between rounded-xl bg-gray-400/80">
      <div className="flex w-full justify-center">
        <h2 className="text-4xl">
          Welcome,
          <span
            onClick={() => {
              addNote("new Note", null);
            }}
            className="cursor-pointer underline hover:font-semibold"
          >
            Add a New Note
          </span>
        </h2>
      </div>
    </div>
  );
}
