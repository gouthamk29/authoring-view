import { LogOut, Search, UserPen } from "lucide-react";
import { InputWithIcon } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import type { User } from "@/types/workspace";

type Navbar = {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  user: User;
};

export function Navbar({ searchValue, setSearchValue, user }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
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
                navigate(`/${user?._id}/profile`);
              }}
            >
              <UserPen />
              Profile
            </DropdownMenuItem>

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
  );
}
