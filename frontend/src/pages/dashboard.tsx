import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { HamburgerIcon, LogOut, Menu, Plus, Search } from "lucide-react";
import { Input, InputWithIcon } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface User {
  _id: string;
  email: string;
}

interface Workspace {
  name: string;
  description: string;
}

const Dashboard = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setUserData] = useState<User | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  const [workspace, SetWorkspace] = useState<Workspace[]>([]);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div className="flex h-full min-h-dvh flex-col">
      <nav className="my-4 flex justify-between px-4">
        <div className="mx-2 flex-1">
          <InputWithIcon
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            icon={<Search size={20} />}
            placeholder="Search Workspace"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">UserProfile</Button>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <Separator className="my-2" />
      <main className="mx-4">
        <div>
          <h1 className="text-4xl">My WorkSpace</h1>
        </div>
        <div className="my-2 flex min-h-20 min-w-20 rounded-md border">
          {workspace.length < 1 && (
            <div className="flex w-full items-center justify-center">
              <CreateWorkspaceDialog setWorkSpace={SetWorkspace} />
            </div>
          )}

          {workspace.length > 0 && (
            <div className="w-full">
              <div className="flex flex-wrap gap-2 p-4">
                {workspace.map((w) => {
                  return (
                    <div className="flex min-h-20 w-full max-w-80 min-w-60 flex-col rounded-sm border px-2 py-3">
                      <div>
                        <Label className="font-extrabold">{w.name}</Label>
                      </div>
                      <div className="mx-1 text-right font-light text-gray-600">
                        {w.description}
                      </div>
                      <div className="flex justify-end">
                        <Button>View</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mx-2 my-4 flex justify-end">
                <CreateWorkspaceDialog setWorkSpace={SetWorkspace} />
              </div>
            </div>
          )}
        </div>
      </main>

      {data && (
        <div>
          <p>ID: {data._id}</p>
          <p>Email: {data.email}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

interface CreateWorkspaceDialogProps {
  setWorkSpace: React.Dispatch<React.SetStateAction<Workspace[]>>;
}

export function CreateWorkspaceDialog({
  setWorkSpace,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const workspace = {
      name,
      description,
    };

    console.log(workspace);

    setWorkSpace((w) => [...w, workspace]);

    setName("");
    setDescription("");
    setOpen(!open);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create a new Workspace
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add New Workspace</DialogTitle>
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

            <Button type="submit">Create Workspace</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
