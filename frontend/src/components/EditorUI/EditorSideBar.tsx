import type { LeafNode, TreeNode } from "@/types/workspace";
import { Sidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { ChevronRight, LayersPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNodeStore } from "@/store/nodeStore";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function WorkSpaceSidebar() {
  const workspaceName = useNodeStore(
    (state) => state.workSpace?.name ?? "Workspace",
  );

  const nodes = useNodeStore((state) => state.workSpace?.nodes ?? []);
  const leafNodes = useNodeStore((state) => state.workSpace?.leafNodes ?? []);

  const addNode = useNodeStore((state) => state.addNode);
  const addLeafNode = useNodeStore((state) => state.addLeafNode);

  function handleAddCollection() {
    const random = Math.floor(Math.random() * 10000);
    addNode(`Collection:${random}`, null);
  }

  function handleAddLeafNode() {
    const random = Math.floor(Math.random() * 10000);
    addLeafNode(`Leaf:${random}`, null);
  }

  return (
    <Sidebar>
      <div className="flex flex-col gap-2 p-2">
        <div className="rounded-md border px-4 py-1 text-center text-2xl font-semibold">
          {workspaceName}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAddCollection}
            className="flex-1 gap-2 bg-green-500 text-white hover:bg-green-600"
          >
            <LayersPlus size={16} />
            Add Collection
          </Button>

          <Button
            onClick={handleAddLeafNode}
            className="flex-1 gap-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus size={16} />
            Add Note
          </Button>
        </div>

        <TreeViewer nodes={nodes} leafNodes={leafNodes} />
      </div>
    </Sidebar>
  );
}

type TreeViewerProps = {
  nodes: TreeNode[];
  leafNodes: LeafNode[];
};

function TreeViewer({ nodes, leafNodes }: TreeViewerProps) {
  return (
    <div className="flex flex-col gap-1">
      {nodes.map((node) => (
        <NodeItem key={node.id} node={node} depth={0} />
      ))}

      {leafNodes.map((leaf) => (
        <LeafItem key={leaf.id} leaf={leaf} depth={0} />
      ))}
    </div>
  );
}

type NodeItemProps = {
  node: TreeNode;
  depth: number;
};

function NodeItem({ node, depth }: NodeItemProps) {
  const addNode = useNodeStore((state) => state.addNode);
  const addLeafNode = useNodeStore((state) => state.addLeafNode);
  const renameNode = useNodeStore((state) => state.renameNode);
  const deleteNode = useNodeStore((state) => state.deleteNode);

  const [isExpanded, setIsExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(node.name);
  }, [node.name]);

  const hasChildren =
    (node.nodes?.length ?? 0) > 0 || (node.leafNodes?.length ?? 0) > 0;

  function handleRename() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setName(node.name);
      setEditing(false);
      return;
    }

    if (trimmedName !== node.name) {
      renameNode(node.id, trimmedName);
    }

    setEditing(false);
  }

  return (
    <div className="mt-1" style={{ marginLeft: `${depth * 1.25}rem` }}>
      <div
        onClick={() => hasChildren && setIsExpanded((previous) => !previous)}
        className={cn(
          "flex cursor-pointer items-center justify-between rounded-md border p-2",
          "bg-green-200 hover:bg-green-300",
        )}
      >
        <div className="flex flex-1 items-center gap-2">
          {hasChildren && (
            <ChevronRight
              size={16}
              className={cn("transition-transform", isExpanded && "rotate-90")}
            />
          )}

          {editing ? (
            <input
              autoFocus
              value={name}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setName(event.target.value)}
              onBlur={handleRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleRename();
                }

                if (event.key === "Escape") {
                  setName(node.name);
                  setEditing(false);
                }
              }}
              className="w-full rounded border px-2 py-1 text-sm text-black"
            />
          ) : (
            <span className="truncate text-sm font-medium">{node.name}</span>
          )}
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Pencil size={15} onClick={() => setEditing(true)} />

          <Trash2
            size={15}
            className="text-red-500"
            onClick={() => setDeleteOpen(true)}
          />

          <LayersPlus
            size={15}
            onClick={() => {
              setIsExpanded(true);
              addNode("New Collection", node.id);
            }}
          />

          <Plus
            size={15}
            onClick={() => {
              setIsExpanded(true);
              addLeafNode("New Note", node.id);
            }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1">
          {(node.nodes ?? []).map((child) => (
            <NodeItem key={child.id} node={child} depth={depth + 1} />
          ))}

          {(node.leafNodes ?? []).map((leaf) => (
            <LeafItem key={leaf.id} leaf={leaf} depth={depth + 1} />
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Collection"
        description={`Delete "${node.name}" and all its children?`}
        onConfirm={() => {
          deleteNode(node.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
type LeafItemProps = {
  leaf: LeafNode;
  depth: number;
};

function LeafItem({ leaf, depth }: LeafItemProps) {
  const isActive = useNodeStore((state) => state.activeLeafNodeId === leaf.id);
  const handleLeafClick = useNodeStore((state) => state.handleLeafClick);
  const renameLeaf = useNodeStore((state) => state.renameLeaf);
  const deleteLeaf = useNodeStore((state) => state.deleteLeaf);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(leaf.name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setName(leaf.name);
  }, [leaf.name]);

  function handleRename() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setName(leaf.name);
      setEditing(false);
      return;
    }

    if (trimmedName !== leaf.name) {
      renameLeaf(leaf.id, trimmedName);
    }

    setEditing(false);
  }

  return (
    <div className="mt-1" style={{ marginLeft: `${depth * 1.25}rem` }}>
      <div
        className={cn(
          "flex items-center justify-between rounded-md border p-2",
          isActive ? "bg-blue-700 text-white" : "bg-blue-200 hover:bg-blue-300",
        )}
      >
        <div
          className="flex-1 cursor-pointer"
          onClick={() => handleLeafClick(leaf.id)}
        >
          {editing ? (
            <input
              autoFocus
              value={name}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setName(event.target.value)}
              onBlur={handleRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleRename();
                }

                if (event.key === "Escape") {
                  setName(leaf.name);
                  setEditing(false);
                }
              }}
              className="w-full rounded border px-2 py-1 text-sm text-black"
            />
          ) : (
            <span className="truncate text-sm font-medium">{leaf.name}</span>
          )}
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Pencil size={15} onClick={() => setEditing(true)} />

          <Trash2
            size={15}
            className="text-red-500"
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Note"
        description={`Delete "${leaf.name}"?`}
        onConfirm={() => {
          deleteLeaf(leaf.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
