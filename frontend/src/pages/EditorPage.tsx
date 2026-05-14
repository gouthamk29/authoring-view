import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import MainEditor from "@/components/MainEditor";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTriggerWithIcon,
} from "@/components/ui/sidebar";
import {
  ChevronRight,
  LayersPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InputWithIcon } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type {
  User,
  WorkSpace,
  WorkspaceStore,
  LeafNode,
  TreeNode,
} from "@/types/workspace";
import { useAuthProfile } from "@/hooks/useAuthProfile";

const EditorPage = () => {
  const { logout } = useAuth();
  const { id: workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [acticeLeafNodeId, setActiveLeafId] = useState<string>("");
  const STORAGE_KEY = "workspaces";

  const { user, loading } = useAuthProfile();

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
  renameNode,
  deleteNode,
  renameLeaf,
  deleteLeaf,
}: {
  workspace: WorkSpace;
  addNode: (name: string, parentId: string | null) => void;
  addLeaf: (name: string, parentId: string | null) => void;
  onLeafClick: (leafId: string) => void;
  activeLeafId: string;
  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  renameLeaf: (nodeId: string, newName: string) => void;
  deleteLeaf: (nodeId: string) => void;
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
              renameNode={renameNode}
              deleteNode={deleteNode}
              renameLeaf={renameLeaf}
              deleteLeaf={deleteLeaf}
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
  renameNode,
  deleteNode,
  renameLeaf,
  deleteLeaf,
}: {
  workspace: WorkSpace;
  addNode: (name: string, parentId: string | null) => void;
  addLeaf: (name: string, parentId: string | null) => void;
  onLeafClick: (leafId: string) => void;
  activeLeafId: string;
  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  renameLeaf: (nodeId: string, newName: string) => void;
  deleteLeaf: (nodeId: string) => void;
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
          renameNode={renameNode}
          deleteNode={deleteNode}
          renameLeaf={renameLeaf}
          deleteLeaf={deleteLeaf}
        />
      ))}
      {workspace?.leafNodes?.map((leaf) => (
        <LeafItem
          onLeafClick={onLeafClick}
          leaf={leaf}
          activeLeafId={activeLeafId}
          depth={0}
          renameLeaf={renameLeaf}
          deleteLeaf={deleteLeaf}
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
  renameLeaf: (nodeId: string, newName: string) => void;
  deleteLeaf: (nodeId: string) => void;
}

interface NodeItemType {
  node: TreeNode;
  addNode: (name: string, parentId: string | null) => void;
  addLeaf: (name: string, parentId: string | null) => void;
  activeLeafId: string;
  onLeafClick: (leafId: string) => void;
  depth: number;
  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  renameLeaf: (nodeId: string, newName: string) => void;
  deleteLeaf: (nodeId: string) => void;
}
function NodeItem({
  node,
  activeLeafId,
  addLeaf,
  addNode,
  onLeafClick,
  depth,
  renameNode,
  deleteNode,
  renameLeaf,
  deleteLeaf,
}: NodeItemType) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.name);

  const hasChildren = node.nodes.length > 0 || node.leafNodes.length > 0;

  return (
    <div
      className="mt-1"
      style={{
        marginLeft: `${depth * 1.25}rem`,
      }}
    >
      <div
        onClick={() => {
          if (hasChildren) {
            setIsExpanded((prev) => !prev);
          }
        }}
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md border p-2 transition-colors",
          "bg-green-200 hover:bg-green-300",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            className="flex h-4 w-4 items-center justify-center transition-transform duration-200"
            style={{
              transform: `rotate(${isExpanded ? 90 : 0}deg)`,
            }}
          >
            {hasChildren && <ChevronRight size={16} />}
          </div>

          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  renameNode(node.id, name);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renameNode(node.id, name);
                    setEditing(false);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded border bg-white px-2 py-1 text-sm text-black outline-none"
              />
            ) : (
              <span className="truncate text-sm font-medium">{node.name}</span>
            )}
          </div>
        </div>

        <div
          className="ml-2 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil
            size={15}
            className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
            onClick={() => setEditing(true)}
          />

          <Trash2
            size={15}
            className="cursor-pointer text-red-500 opacity-70 transition-opacity hover:opacity-100"
            onClick={() => {
              const confirmDelete = confirm(
                `Delete "${node.name}" and all children?`,
              );

              if (confirmDelete) {
                deleteNode(node.id);
              }
            }}
          />

          <LayersPlus
            size={15}
            className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
            onClick={() => {
              setIsExpanded(true);
              addNode("New Collection", node.id);
            }}
          />

          <Plus
            size={15}
            className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
            onClick={() => {
              setIsExpanded(true);
              addLeaf("New Note", node.id);
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
              renameNode={renameNode}
              deleteNode={deleteNode}
              renameLeaf={renameLeaf}
              deleteLeaf={deleteLeaf}
            />
          ))}

          {node.leafNodes.map((leaf) => (
            <LeafItem
              key={leaf.id}
              leaf={leaf}
              activeLeafId={activeLeafId}
              onLeafClick={onLeafClick}
              depth={depth + 1}
              renameLeaf={renameLeaf}
              deleteLeaf={deleteLeaf}
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
  renameLeaf,
  deleteLeaf,
}: LeafNodeItemType) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(leaf.name);

  return (
    <div
      className="mt-1"
      style={{
        marginLeft: `${depth * 1.25}rem`,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-md border p-2 transition-colors",
          activeLeafId === leaf.id
            ? "border-green-500 bg-blue-700 text-white"
            : "bg-blue-200 hover:bg-blue-300",
        )}
      >
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => onLeafClick(leaf.id)}
        >
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                renameLeaf(leaf.id, name);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  renameLeaf(leaf.id, name);
                  setEditing(false);
                }
              }}
              className="w-full rounded border bg-white px-2 py-1 text-sm text-black outline-none"
            />
          ) : (
            <span className="truncate text-sm font-medium">{leaf.name}</span>
          )}
        </div>

        <div className="ml-2 flex items-center gap-2">
          <Pencil
            size={15}
            className="cursor-pointer opacity-70 transition-opacity hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
          />

          <Trash2
            size={15}
            className="cursor-pointer text-red-500 opacity-70 transition-opacity hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();

              const confirmDelete = confirm(`Delete "${leaf.name}"?`);

              if (confirmDelete) {
                deleteLeaf(leaf.id);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface NavBarType {
  workSpace: WorkSpace;
  user: User;
  onLeafClick: (leafId: string) => void;
  activeLeafId: string;
}

function NavBar({ workSpace, user, onLeafClick, activeLeafId }: NavBarType) {
  if (!workSpace || !user) return;

  const [search, setSearch] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const searchRef = useRef<HTMLDivElement>(null);

  function getAllLeafNodes(workspace: WorkSpace): LeafNode[] {
    const result: LeafNode[] = [];

    function traverse(nodes: TreeNode[]) {
      for (const node of nodes) {
        result.push(...node.leafNodes);

        traverse(node.nodes);
      }
    }

    result.push(...workspace.leafNodes);

    traverse(workspace.nodes);

    return result;
  }

  const filteredNodes = getAllLeafNodes(workSpace).filter((leaf) =>
    leaf.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearch("");
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearch("");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="m-4 flex items-center rounded-md border px-4 py-2">
      <div className="m-2">
        <SidebarTriggerWithIcon className="">
          <Menu size={18} />
        </SidebarTriggerWithIcon>
      </div>
      <div ref={searchRef} className="relative flex-1">
        <InputWithIcon
          icon={<Search size={20} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search workspace: ${workSpace.name}`}
        />

        {search.length > 0 && (
          <div className="bg-background absolute top-20 right-20 left-20 z-999 max-h-72 min-h-10 overflow-y-auto rounded-md border shadow-md">
            {filteredNodes.map((leaf) => {
              return (
                <div
                  className="m-2 cursor-pointer rounded-sm border p-1"
                  onClick={() => {
                    onLeafClick(leaf.id);
                    setSearch("");
                  }}
                >
                  {leaf.name}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="m-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="@shadcn"
                className="grayscale"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate(0);
                }}
              >
                <LogOut />
                LogOut
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/${user._id}/profile`);
                }}
              >
                <UserPen />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigate("/dashboard");
                }}
              >
                <LayoutDashboard />
                DashBoard
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
