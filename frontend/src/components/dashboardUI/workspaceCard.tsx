import type { WorkSpace } from "@/types/workspace";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";

interface WorkspaceCardProps {
  workspace: WorkSpace;
  modifyWorkSpace: (
    workspaceId: string,
    name: string,
    description: string,
  ) => void;
}

export function WorkspaceCard({
  workspace,
  modifyWorkSpace,
}: WorkspaceCardProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-20 w-full max-w-80 min-w-60 flex-col rounded-sm border px-2 py-3">
      <div className="flex w-full justify-between">
        <div>
          <Label className="font-extrabold">{workspace.name}</Label>
        </div>

        <EditDialog workspace={workspace} modifyWorkSpace={modifyWorkSpace} />
      </div>

      <div className="mx-1 my-2 text-left font-light text-gray-600">
        {workspace.description}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            navigate(`/${workspace.id}/editor`);
          }}
        >
          View
        </Button>
      </div>
    </div>
  );
}

interface EditDialogProps {
  workspace: WorkSpace;
  modifyWorkSpace: (
    workspaceId: string,
    name: string,
    description: string,
  ) => void;
}

function EditDialog({ workspace, modifyWorkSpace }: EditDialogProps) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    modifyWorkSpace(workspace.id, name.trim(), description.trim());

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer">
          <Pencil size={18} />
        </button>
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>

            <Input
              id="workspace-name"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description</Label>

            <Textarea
              id="workspace-description"
              placeholder="Describe your workspace..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
