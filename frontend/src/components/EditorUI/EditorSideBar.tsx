import type { LeafNode, TreeNode, WorkSpace } from "@/types/workspace";
import { Sidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { useState } from "react";
import { ChevronRight, LayersPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    let parentId = null;
    let random = Math.floor(Math.random() * 10000);
    addNode(`Collection:${String(random)}`, parentId);
  }

  function handleAddLeafNode() {
    let parentId = null;
    let random = Math.floor(Math.random() * 10000);

    addLeaf(`Leaf:${String(random)}`, parentId);
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
    <div className="flex flex-col gap-1">
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
          {hasChildren && (
            <div
              className="flex h-4 w-4 items-center justify-center transition-transform duration-200"
              style={{
                transform: `rotate(${isExpanded ? 90 : 0}deg)`,
              }}
            >
              <ChevronRight size={16} />
            </div>
          )}

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
