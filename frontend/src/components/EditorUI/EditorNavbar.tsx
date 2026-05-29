import { useAuth } from "@/context/AuthContext";
import type { LeafNode, TreeNode, WorkSpace } from "@/types/workspace";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { SidebarTriggerWithIcon } from "../ui/sidebar";
import { LayoutDashboard, LogOut, Menu, Search, UserPen } from "lucide-react";
import { InputWithIcon } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTheme } from "../theme-provider";
import { Switch } from "../ui/switch";
import { useNodeStore } from "@/store/nodeStore";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapekey } from "@/hooks/useEscapekey";

export function NavBar() {
  const workSpace = useNodeStore((state) => state.workSpace);
  const onLeafClick = useNodeStore((state) => state.handleLeafClick);

  const { user } = useAuthProfile();

  const [search, setSearch] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [checked, setChecked] = useState(isDark);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChecked(isDark);
  }, [isDark]);

  useClickOutside(searchRef, () => {
    setSearch("");
  });
  useEscapekey(() => {
    setSearch("");
  });

  if (!workSpace || !user) {
    return null;
  }

  function toggleTheme() {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setChecked(!isDark);
  }

  const filteredNodes = getAllLeafNodes(workSpace).filter((leaf) =>
    leaf.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <nav className="m-4 flex items-center rounded-md border px-4 py-2">
      <div className="m-2">
        <SidebarTriggerWithIcon>
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
            {filteredNodes.map((leaf) => (
              <div
                key={leaf.id}
                className="m-2 cursor-pointer rounded-sm border p-1"
                onClick={() => {
                  onLeafClick(leaf.id);
                  setSearch("");
                }}
              >
                {leaf.name}
              </div>
            ))}

            {filteredNodes.length === 0 && (
              <div className="m-2">Node not found</div>
            )}
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
                Dashboard
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex w-full items-center justify-between gap-2">
                  <span>Dark mode</span>
                  <Switch checked={checked} onCheckedChange={toggleTheme} />
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

function getAllLeafNodes(workspace: WorkSpace): LeafNode[] {
  const result: LeafNode[] = [];

  function traverse(nodes: TreeNode[] = []) {
    for (const node of nodes) {
      result.push(...(node.leafNodes ?? []));
      traverse(node.nodes ?? []);
    }
  }

  result.push(...(workspace.leafNodes ?? []));
  traverse(workspace.nodes ?? []);

  return result;
}
