import type { LeafNode, TreeNode, WorkSpace } from "@/types/workspace";
import { Sidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useState } from "react";
import { ChevronRight, LayersPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

/* =========================
   DELETE CONFIRM MODAL
========================= */

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

/* =========================
   SIDEBAR
========================= */

export function WorkSpaceSidebar({
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
    const random = Math.floor(Math.random() * 10000);
    addNode(`Collection:${random}`, null);
  }

  function handleAddLeafNode() {
    const random = Math.floor(Math.random() * 10000);
    addLeaf(`Leaf:${random}`, null);
  }

  return (
    <Sidebar>
      <div className="flex flex-col gap-2 p-2">
        <div className="rounded-md border px-4 py-1 text-center text-2xl font-semibold">
          {String(workspace?.name)}
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
    </Sidebar>
  );
}

/* =========================
   TREE VIEWER
========================= */

function TreeViewer(props: any) {
  return (
    <div className="flex flex-col gap-1">
      {props.workspace?.nodes?.map((node: TreeNode) => (
        <NodeItem key={node.id} {...props} node={node} depth={0} />
      ))}

      {props.workspace?.leafNodes?.map((leaf: LeafNode) => (
        <LeafItem key={leaf.id} {...props} leaf={leaf} depth={0} />
      ))}
    </div>
  );
}

/* =========================
   NODE ITEM
========================= */

function NodeItem({
  node,
  addLeaf,
  addNode,
  onLeafClick,
  activeLeafId,
  depth,
  renameNode,
  deleteNode,
  renameLeaf,
  deleteLeaf,
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node.name);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const hasChildren = node.nodes.length > 0 || node.leafNodes.length > 0;

  return (
    <div className="mt-1" style={{ marginLeft: `${depth * 1.25}rem` }}>
      <div
        onClick={() => hasChildren && setIsExpanded((p: boolean) => !p)}
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
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                renameNode(node.id, name);
                setEditing(false);
              }}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          ) : (
            <span className="truncate text-sm font-medium">{node.name}</span>
          )}
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
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
              addLeaf("New Note", node.id);
            }}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1">
          {node.nodes.map((child: TreeNode) => (
            <NodeItem
              key={child.id}
              {...arguments[0]}
              node={child}
              depth={depth + 1}
            />
          ))}

          {node.leafNodes.map((leaf: LeafNode) => (
            <LeafItem
              key={leaf.id}
              {...arguments[0]}
              leaf={leaf}
              depth={depth + 1}
            />
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

/* =========================
   LEAF ITEM
========================= */

function LeafItem({
  leaf,
  onLeafClick,
  activeLeafId,
  depth,
  renameLeaf,
  deleteLeaf,
}: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(leaf.name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="mt-1" style={{ marginLeft: `${depth * 1.25}rem` }}>
      <div
        className={cn(
          "flex items-center justify-between rounded-md border p-2",
          activeLeafId === leaf.id
            ? "bg-blue-700 text-white"
            : "bg-blue-200 hover:bg-blue-300",
        )}
      >
        <div
          className="flex-1 cursor-pointer"
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
              className="w-full rounded border px-2 py-1 text-sm"
            />
          ) : (
            <span className="truncate text-sm font-medium">{leaf.name}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Pencil size={15} onClick={() => setEditing(true)} />

          <Trash2
            size={15}
            className="text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
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
