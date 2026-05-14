import type { WorkSpace } from "@/types/workspace";
import { useState } from "react";

export function useWorkspaceSearch(workspace: WorkSpace[]) {
  const [search, setSearch] = useState("");

  const filteredWorkspaces = workspace.filter((w) => {
    const query = search.toLowerCase();

    return (
      w.name.toLowerCase().includes(query) ||
      w.description.toLowerCase().includes(query)
    );
  });

  return {
    search,
    setSearch,
    filteredWorkspaces,
  };
}
