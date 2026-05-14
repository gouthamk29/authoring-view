import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import MainEditor from "@/components/MainEditor";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTriggerWithIcon,
} from "@/components/ui/sidebar";
import { ChevronRight, LayersPlus, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  email: string;
}

interface WorkspaceStore {
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

interface LeafNode {
  id: string;
  name: string;
  data?: any;
  created_at?: number;
  last_used?: number;
  type: "leaf";
}

interface TreeNode {
  id: string;
  name: string;
  nodes: TreeNode[];
  leafNodes: LeafNode[];
  type: "node";
}

const EditorPage = () => {
  const { token, logout } = useAuth();
  const { id: workspaceId } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUserData] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState(null);
  const [acticeLeafNodeId, setActiveLeafId] = useState<string>("");
  const STORAGE_KEY = "workspaces";

  //use effect for authenticating user by using jwt token
  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);

        const res = await axios.get<User>("http://localhost:8000/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(res.data);
      } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      getUserData();
    }
  }, [token]);

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
      console.log("acticeWorkspace", activeWorkspace);

      //set this to as working workspace
      setWorkspace(activeWorkspace);

      if (!acticeLeafNodeId) {
        const initalLeafNode = findInitalLeafNodeId(activeWorkspace);
        setActiveLeafId(initalLeafNode);
        console.log("initialLeafNode", initalLeafNode);
      }
    } catch (error) {
      console.log(error);
    }
  }, [workspaceId, user?._id]);

  function findInitalLeafNodeId(ws: WorkSpace) {
    const LeafNodeLen = ws?.leafNodes?.length;
    console.log("LeafNode len", LeafNodeLen);
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
    console.log("propogated", workspace);
    if (!workspace) return;

    let updatedWorkSpace: WorkSpace = { ...workspace };
    console.log("Adding leaf", name, parentId);
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
    console.log("Leaf clicked:", leafId);
    setActiveLeafId(leafId);
  }

  console.log("initial node", acticeLeafNodeId);
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
          />
          <SidebarInset>
            <NavBar workspaceId={workspaceId} user={user} />
            {acticeLeafNodeId == "empty" && <div>Empty Nodes, add Node</div>}
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

function WorkSpaceSidebar({
  workspace,
  addNode,
  addLeaf,
  onLeafClick,
  activeLeafId,
}: {
  workspace: WorkSpace;
  addNode: (name: string, parentId: string | null) => void;
  addLeaf: (name: string, parentId: string | null) => void;
  onLeafClick: (leafId: string) => void;
  activeLeafId: string;
}) {
  function handleAddCollection() {
    let parentId = null;
    let random = Math.floor(Math.random() * 10000);
    addNode(`Collection:${String(random)}`, parentId);
  }

  function handleAddLeafNode() {
    console.log("clicked");
    let parentId = null;
    let random = Math.floor(Math.random() * 10000);
    console.log(parentId, random);
    addLeaf(`Leaf:${String(random)}`, parentId);
  }

  return (
    <Sidebar>
      <div className="m-2 flex flex-col">
        <div className="rounded-md border px-4 py-1 text-center text-2xl font-semibold">
          {String(workspace?.name)}
        </div>

        <div className="flex flex-1 border">
          <Button onClick={handleAddCollection}>Add Collection</Button>
          <Button onClick={handleAddLeafNode}>Add Note</Button>
        </div>

        <div>
          <div>
            <TreeViewer
              workspace={workspace}
              addNode={addNode}
              addLeaf={addLeaf}
              onLeafClick={onLeafClick}
              activeLeafId={activeLeafId}
            />
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

function TreeViewer({
  workspace,
  addNode,
  addLeaf,
  onLeafClick,
  activeLeafId,
}: {
  workspace: WorkSpace;
  addNode: (name: string, parentId: string | null) => void;
  addLeaf: (name: string, parentId: string | null) => void;
  onLeafClick: (leafId: string) => void;
  activeLeafId: string;
}) {
  return (
    <div className="m-1 border">
      {workspace?.nodes?.map((node) => (
        <NodeItem
          key={node.id}
          activeLeafId={activeLeafId}
          addNode={addNode}
          node={node}
          addLeaf={addLeaf}
          onLeafClick={onLeafClick}
          depth={0}
        />
      ))}
      {workspace?.leafNodes?.map((leaf) => (
        <LeafItem
          onLeafClick={onLeafClick}
          leaf={leaf}
          activeLeafId={activeLeafId}
          depth={0}
        />
      ))}
    </div>
  );
}

interface LeafNodeItemType {
  onLeafClick: (leafId: string) => void;
  leaf: LeafNode;
  activeLeafId: string;
  depth: number;
}

interface NodeItemType {
  node: TreeNode;
  addNode: (name: string, parentId: string | null) => void;
  addLeaf: (name: string, parentId: string | null) => void;
  activeLeafId: string;
  onLeafClick: (leafId: string) => void;
  depth: number;
}

function NodeItem({
  node,
  activeLeafId,
  addLeaf,
  addNode,
  onLeafClick,
  depth,
}: NodeItemType) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="mt-1 ml-1"
      style={{
        marginLeft: `${depth * 1.25}rem`,
      }}
    >
      <div className="flex items-center justify-between rounded-md border bg-green-200 p-2">
        <div className="flex items-center gap-1">
          {node.nodes.length + node.leafNodes.length > 0 ? (
            <div
              onClick={() => {
                setIsExpanded((ex) => !ex);
              }}
              className="cursor-pointer transition-transform duration-200"
              style={{
                transform: `rotate(${isExpanded ? 90 : 0}deg)`,
              }}
            >
              <ChevronRight size={16} />
            </div>
          ) : (
            <div className="w-4" />
          )}

          <span>{node.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <LayersPlus
            size={16}
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(true);
              addNode("New Collection", node.id);
            }}
          />

          <Plus
            size={16}
            className="cursor-pointer"
            onClick={() => {
              addLeaf("New Note", node.id);
              setIsExpanded(true);
            }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 flex flex-col">
          {node.nodes.map((childNode) => (
            <NodeItem
              key={childNode.id}
              node={childNode}
              activeLeafId={activeLeafId}
              addLeaf={addLeaf}
              addNode={addNode}
              onLeafClick={onLeafClick}
              depth={depth + 1}
            />
          ))}

          {node.leafNodes.map((leaf) => (
            <LeafItem
              key={leaf.id}
              leaf={leaf}
              activeLeafId={activeLeafId}
              onLeafClick={onLeafClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LeafItem({
  onLeafClick,
  leaf,
  activeLeafId,
  depth,
}: LeafNodeItemType) {
  return (
    <div
      className="mt-1 ml-1"
      style={{
        marginLeft: `${depth * 1.25}rem`,
      }}
    >
      <div
        onClick={() => onLeafClick(leaf.id)}
        className={cn(
          "flex cursor-pointer items-center rounded-md border bg-blue-200 p-2 transition-colors",
          activeLeafId === leaf.id && "border-green-500 bg-blue-700 text-white",
        )}
      >
        <span>{leaf.name}</span>
      </div>
    </div>
  );
}

function NavBar({ workspaceId, user }) {
  return (
    <nav className="flex">
      <div>
        <SidebarTriggerWithIcon className="rounded-full border">
          <Menu size={18} />
        </SidebarTriggerWithIcon>
      </div>
      <div> SideBar </div>
      <div>
        WorkSpaceid:{workspaceId} UserId:{user?._id}
      </div>
    </nav>
  );
}
